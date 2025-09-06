import { Request, Response } from "express";
import { redisClient } from "../lib/redis";
import { getDriveClient } from "../lib/googleDriveClient";
import prisma from "../lib/db";
import { JWTPayload } from "../types";

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  thumbnailLink?: string;
  modifiedTime: string;
  size: string;
  webViewLink: string;
  starred: boolean;
}

interface DashboardResponse {
  top3: DriveFile[];
  top7Previews: DriveFile[];
  allFiles: DriveFile[];
  totalCount: number;
  hasNextPage: boolean;
  nextPageToken?: string;
}

export default async (req: Request, res: Response): Promise<void> => {
  try {
    const userPayload = (req as Request & { user?: JWTPayload }).user;

    if (!userPayload) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    // Get user and refresh token
    const user = await prisma.user.findUnique({
      where: { id: userPayload.userId },
    });

    if (!user || !user.googleRefreshToken) {
      res.status(401).json({ error: "No refresh token found" });
      return;
    }

    const drive = getDriveClient(user.googleRefreshToken);

    // Get pagination parameters from query
    const limit = parseInt(req.query.limit as string) || 35;
    const pageToken = req.query.pageToken as string | undefined;

    // Handle first request (dashboard data + pagination)
    if (!pageToken) {
      // For initial request, check cache for dashboard data
      const cachedDashboardData: string | null = await redisClient.get(
        `dashboard_data_${userPayload.userId}`
      );

      let dashboardData: any;

      if (cachedDashboardData) {
        dashboardData = JSON.parse(cachedDashboardData);
        console.log("cached dashboard data was sent");
      } else {
        // Fetch initial dashboard data (top3, top7Previews)
        const dashboardResponse = await drive.files.list({
          q: "'root' in parents and trashed = false",
          orderBy: "modifiedTime desc",
          pageSize: 50, // Get more for dashboard processing
          fields: "files(id, name, mimeType, thumbnailLink, modifiedTime, webViewLink, size)",
        });

        const allDashboardFiles = dashboardResponse.data.files as DriveFile[];

        // Process files for dashboard
        const folders = allDashboardFiles.filter(
          (f) => f.mimeType === "application/vnd.google-apps.folder"
        );
        const previewableFiles = allDashboardFiles.filter(
          (f) =>
            f.thumbnailLink && f.mimeType !== "application/vnd.google-apps.folder"
        );
        const nonPreviewFiles = allDashboardFiles.filter(
          (f) =>
            !f.thumbnailLink && f.mimeType !== "application/vnd.google-apps.folder"
        );

        const top3 = [...folders.slice(0, 3)];
        if (top3.length < 3) {
          top3.push(...nonPreviewFiles.slice(0, 3 - top3.length));
        }

        const top7Previews = previewableFiles.slice(0, 7);

        dashboardData = { top3, top7Previews };

        // Cache dashboard data for 1 hour
        await redisClient.setEx(
          `dashboard_data_${userPayload.userId}`,
          3600,
          JSON.stringify(dashboardData)
        );

        // Cache thumbnails
        for (const file of top7Previews) {
          await cacheImageIfNeeded(file, userPayload.userId);
        }

        for (const folder of top3.filter((f) => f.thumbnailLink)) {
          await cacheImageIfNeeded(folder, userPayload.userId);
        }
      }

      // Now fetch paginated files
      const paginatedResponse = await drive.files.list({
        q: "'root' in parents and trashed = false",
        orderBy: "modifiedTime desc",
        pageSize: limit,
        fields: "nextPageToken, files(id, name, mimeType, thumbnailLink, modifiedTime, webViewLink, size, starred)",
      });

      const allFiles = paginatedResponse.data.files as DriveFile[];
      const nextPageToken = paginatedResponse.data.nextPageToken;

      const response: DashboardResponse = {
        top3: dashboardData.top3,
        top7Previews: dashboardData.top7Previews,
        allFiles,
        totalCount: allFiles.length,
        hasNextPage: !!nextPageToken,
        nextPageToken: nextPageToken || undefined,
      };

      res.json(response);
    } else {
      // Handle pagination requests (only allFiles)
      const paginatedResponse = await drive.files.list({
        q: "'root' in parents and trashed = false",
        orderBy: "modifiedTime desc",
        pageSize: limit,
        pageToken: pageToken,
        fields: "nextPageToken, files(id, name, mimeType, thumbnailLink, modifiedTime, webViewLink, size, starred)",
      });

      const allFiles = paginatedResponse.data.files as DriveFile[];
      const nextPageToken = paginatedResponse.data.nextPageToken;

      const response: DashboardResponse = {
        top3: [], // Empty for pagination requests
        top7Previews: [], // Empty for pagination requests
        allFiles,
        totalCount: allFiles.length,
        hasNextPage: !!nextPageToken,
        nextPageToken: nextPageToken || undefined,
      };

      res.json(response);
    }
  } catch (error: unknown) {
    console.error("Dashboard API Error:", error);
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
};

const cacheImageIfNeeded = async (file: DriveFile, userId: string): Promise<void> => {
  if (!file.thumbnailLink) return;

  const cacheKey = `thumb_${userId}_${file.id}`;

  const cached: number = await redisClient.exists(cacheKey);
  if (!cached) {
    try {
      const response = await fetch(file.thumbnailLink);
      const imageBuffer: Buffer = Buffer.from(await response.arrayBuffer());

      console.log('📸 Original image buffer first bytes:', imageBuffer.slice(0, 10));

      // ✅ Store as Base64 to prevent corruption
      const base64Data = imageBuffer.toString('base64');
      await redisClient.set(cacheKey, base64Data, { EX: 86400 });

      console.log(`✅ Cached thumbnail for: ${file.name}`);
    } catch (error: unknown) {
      console.log(`❌ Failed to cache thumbnail for: ${file.name}`);
    }
  }

  // Replace with our cached URL
  file.thumbnailLink = `${process.env.BACKEND_URL}/api/google/thumbnail/${userId}/${file.id}`;
};
