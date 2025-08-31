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
}

interface DashboardResponse {
  top3: DriveFile[];
  top7Previews: DriveFile[];
  allFiles: DriveFile[];
  totalCount: number;
}

export default async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Check cached metadata
    console.log("this rann");
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

    const cachedFileData: string | null = await redisClient.get(
      `dashboard_files_${userPayload.userId}`
    );
    let allFiles: DriveFile[];

    if (cachedFileData) {
      allFiles = JSON.parse(cachedFileData) as DriveFile[];
      console.log("cached files were sent");
    } else {
      // Fetch from Google Drive API
      const response = await drive.files.list({
        q: "trashed = false",
        orderBy: "modifiedTime desc",
        pageSize: 50,
        fields: "files(id, name, mimeType, thumbnailLink, modifiedTime, webViewLink, size)",
      });

      allFiles = response.data.files as DriveFile[];

      // Cached for 1 hour
      await redisClient.setEx(
        `dashboard_files_${userPayload.userId}`,
        3600,
        JSON.stringify(allFiles)
      );
    }

    // Process files
    const folders = allFiles.filter(
      (f) => f.mimeType === "application/vnd.google-apps.folder"
    );
    const previewableFiles = allFiles.filter(
      (f) =>
        f.thumbnailLink && f.mimeType !== "application/vnd.google-apps.folder"
    );
    const nonPreviewFiles = allFiles.filter(
      (f) =>
        !f.thumbnailLink && f.mimeType !== "application/vnd.google-apps.folder"
    );

    const top3 = [...folders.slice(0, 3)];
    if (top3.length < 3) {
      top3.push(...nonPreviewFiles.slice(0, 3 - top3.length));
    }

    const top7Previews = previewableFiles.slice(0, 7);

    // Cache thumbnails
    for (const file of top7Previews) {
      await cacheImageIfNeeded(file, userPayload.userId);
    }

    for (const folder of top3.filter((f) => f.thumbnailLink)) {
      await cacheImageIfNeeded(folder, userPayload.userId);
    }

    const response: DashboardResponse = {
      top3,
      top7Previews,
      allFiles,
      totalCount: allFiles.length,
    };

    res.json(response);
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

      // Cached for 24 hours
      await redisClient.setEx(cacheKey, 86400, imageBuffer);

      console.log(`✅ Cached thumbnail for: ${file.name}`);
    } catch (error: unknown) {
      console.log(`❌ Failed to cache thumbnail for: ${file.name}`);
    }
  }

  // Replace with our cached URL
  file.thumbnailLink = `/api/thumbnails/${userId}/${file.id}`;
};
