"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const googleDriveClient_1 = require("../lib/googleDriveClient");
const prisma = new client_1.PrismaClient();
exports.default = async (req, res) => {
    try {
        console.log("Files API called");
        const userPayload = req.user;
        if (!userPayload) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const user = await prisma.user.findUnique({
            where: { id: userPayload.userId }
        });
        if (!user || !user.googleRefreshToken) {
            return res.status(401).json({ error: "No refresh token found" });
        }
        const drive = (0, googleDriveClient_1.getDriveClient)(user.googleRefreshToken);
        // Get parameters
        const filter = req.query.filter;
        const folderId = req.query.folderId; // folder navigation
        const limit = parseInt(req.query.limit) || 35;
        const pageToken = req.query.pageToken;
        console.log('Received folderId:', folderId); // Debug log
        // Build query based on filter and folder
        let query = "trashed = false";
        if (folderId) {
            // FIXED: Show files inside specific folder with correct syntax
            query = `'${folderId}' in parents and trashed = false`;
            console.log('Using folder query:', query); // Debug log
        }
        else {
            // Root level files
            switch (filter) {
                case 'starred':
                    query = "starred = true and trashed = false";
                    break;
                case 'recent':
                    query = "trashed = false";
                    break;
                case 'trashed':
                    query = "trashed = true";
                    break;
                default:
                    query = "trashed = false";
            }
        }
        console.log("Final query:", query);
        // Fetch files from Google Drive
        const response = await drive.files.list({
            q: query,
            pageSize: limit,
            pageToken: pageToken,
            orderBy: 'modifiedTime desc',
            fields: 'nextPageToken, files(id, name, size, mimeType, modifiedTime, webViewLink, thumbnailLink, starred, parents)',
        });
        const allFiles = response.data.files || [];
        const nextPageToken = response.data.nextPageToken;
        // Remove duplicates
        const uniqueFiles = allFiles.filter((file, index, self) => index === self.findIndex(f => f.id === file.id));
        console.log(`Found ${uniqueFiles.length} files in folder`);
        // Get current folder metadata and build breadcrumb path
        let currentFolder = null;
        let breadcrumbPath = [];
        if (folderId) {
            try {
                console.log('Fetching folder metadata for:', folderId);
                // Get current folder info
                const folderResponse = await drive.files.get({
                    fileId: folderId,
                    fields: 'id, name, parents'
                });
                currentFolder = folderResponse.data;
                console.log('Current folder:', currentFolder);
                // Build breadcrumb path by traversing parents
                if (currentFolder.parents && currentFolder.parents.length > 0) {
                    // FIXED: Handle undefined parentId properly
                    let parentId = currentFolder.parents[0];
                    const pathIds = [];
                    // Traverse up to root to build full path
                    while (parentId && pathIds.length < 10) { // Prevent infinite loop
                        try {
                            const parentResponse = await drive.files.get({
                                fileId: parentId,
                                fields: 'id, name, parents'
                            });
                            const parentFolder = parentResponse.data;
                            breadcrumbPath.unshift(parentFolder); // Add to beginning of array
                            // FIXED: Safely get next parent ID
                            parentId = parentFolder.parents?.[0]; // Use optional chaining
                            // Prevent loops
                            if (parentId && pathIds.includes(parentId))
                                break;
                            if (parentId)
                                pathIds.push(parentId);
                        }
                        catch (error) {
                            console.error('Error fetching parent folder:', error);
                            break; // Stop if we can't fetch parent
                        }
                    }
                }
            }
            catch (error) {
                console.error("Error fetching folder metadata:", error);
                // Don't fail the whole request, just continue without folder metadata
                currentFolder = { id: folderId, name: 'Unknown Folder' };
            }
        }
        console.log(`Found ${uniqueFiles.length} unique files in folder: ${currentFolder?.name || 'Root'}`);
        console.log('Breadcrumb path:', breadcrumbPath.map(f => f.name));
        res.json({
            allFiles: uniqueFiles,
            totalCount: uniqueFiles.length,
            hasNextPage: !!nextPageToken,
            nextPageToken: nextPageToken || undefined,
            // Folder navigation metadata
            currentFolder: currentFolder,
            breadcrumbPath: breadcrumbPath
        });
    }
    catch (error) {
        console.error("Drive API error:", error);
        res.status(500).json({ error: "Failed to fetch files" });
    }
};
//# sourceMappingURL=getController.js.map