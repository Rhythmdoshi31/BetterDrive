"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("../lib/redis");
const googleDriveClient_1 = require("../lib/googleDriveClient");
const db_1 = __importDefault(require("../lib/db"));
exports.default = async (req, res) => {
    try {
        const userPayload = req.user;
        if (!userPayload) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        // Get user and refresh token
        const user = await db_1.default.user.findUnique({
            where: { id: userPayload.userId },
        });
        if (!user || !user.googleRefreshToken) {
            res.status(401).json({ error: "No refresh token found" });
            return;
        }
        const drive = (0, googleDriveClient_1.getDriveClient)(user.googleRefreshToken);
        // Get pagination parameters from query
        const limit = parseInt(req.query.limit) || 35;
        const pageToken = req.query.pageToken;
        // Handle first request (dashboard data + pagination)
        if (!pageToken) {
            // For initial request, check cache for dashboard data
            const cachedDashboardData = await redis_1.redisClient.get(`dashboard_data_${userPayload.userId}`);
            let dashboardData;
            if (cachedDashboardData) {
                dashboardData = JSON.parse(cachedDashboardData);
                console.log("cached dashboard data was sent");
            }
            else {
                // Fetch initial dashboard data (top3, top7Previews)
                const dashboardResponse = await drive.files.list({
                    q: "trashed = false",
                    orderBy: "modifiedTime desc",
                    pageSize: 50, // Get more for dashboard processing
                    fields: "files(id, name, mimeType, thumbnailLink, modifiedTime, webViewLink, size)",
                });
                const allDashboardFiles = dashboardResponse.data.files;
                // Process files for dashboard
                const folders = allDashboardFiles.filter((f) => f.mimeType === "application/vnd.google-apps.folder");
                const previewableFiles = allDashboardFiles.filter((f) => f.thumbnailLink && f.mimeType !== "application/vnd.google-apps.folder");
                const nonPreviewFiles = allDashboardFiles.filter((f) => !f.thumbnailLink && f.mimeType !== "application/vnd.google-apps.folder");
                const top3 = [...folders.slice(0, 3)];
                if (top3.length < 3) {
                    top3.push(...nonPreviewFiles.slice(0, 3 - top3.length));
                }
                const top7Previews = previewableFiles.slice(0, 7);
                dashboardData = { top3, top7Previews };
                // Cache dashboard data for 1 hour
                await redis_1.redisClient.setEx(`dashboard_data_${userPayload.userId}`, 3600, JSON.stringify(dashboardData));
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
                q: "trashed = false",
                orderBy: "modifiedTime desc",
                pageSize: limit,
                fields: "nextPageToken, files(id, name, mimeType, thumbnailLink, modifiedTime, webViewLink, size, starred)",
            });
            const allFiles = paginatedResponse.data.files;
            const nextPageToken = paginatedResponse.data.nextPageToken;
            const response = {
                top3: dashboardData.top3,
                top7Previews: dashboardData.top7Previews,
                allFiles,
                totalCount: allFiles.length,
                hasNextPage: !!nextPageToken,
                nextPageToken: nextPageToken || undefined,
            };
            res.json(response);
        }
        else {
            // Handle pagination requests (only allFiles)
            const paginatedResponse = await drive.files.list({
                q: "trashed = false",
                orderBy: "modifiedTime desc",
                pageSize: limit,
                pageToken: pageToken,
                fields: "nextPageToken, files(id, name, mimeType, thumbnailLink, modifiedTime, webViewLink, size, starred)",
            });
            const allFiles = paginatedResponse.data.files;
            const nextPageToken = paginatedResponse.data.nextPageToken;
            const response = {
                top3: [], // Empty for pagination requests
                top7Previews: [], // Empty for pagination requests
                allFiles,
                totalCount: allFiles.length,
                hasNextPage: !!nextPageToken,
                nextPageToken: nextPageToken || undefined,
            };
            res.json(response);
        }
    }
    catch (error) {
        console.error("Dashboard API Error:", error);
        res.status(500).json({ error: "Failed to fetch dashboard data" });
    }
};
const cacheImageIfNeeded = async (file, userId) => {
    if (!file.thumbnailLink)
        return;
    const cacheKey = `thumb_${userId}_${file.id}`;
    const cached = await redis_1.redisClient.exists(cacheKey);
    if (!cached) {
        try {
            const response = await fetch(file.thumbnailLink);
            const imageBuffer = Buffer.from(await response.arrayBuffer());
            console.log('📸 Original image buffer first bytes:', imageBuffer.slice(0, 10));
            // ✅ Store as Base64 to prevent corruption
            const base64Data = imageBuffer.toString('base64');
            await redis_1.redisClient.set(cacheKey, base64Data, { EX: 86400 });
            console.log(`✅ Cached thumbnail for: ${file.name}`);
        }
        catch (error) {
            console.log(`❌ Failed to cache thumbnail for: ${file.name}`);
        }
    }
    // Replace with our cached URL
    file.thumbnailLink = `${process.env.BACKEND_URL}/api/google/thumbnail/${userId}/${file.id}`;
};
//# sourceMappingURL=dashboardController.js.map