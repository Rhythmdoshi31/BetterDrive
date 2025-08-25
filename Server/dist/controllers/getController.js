"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const googleDriveClient_1 = require("../lib/googleDriveClient");
const prisma = new client_1.PrismaClient();
exports.default = async (req, res) => {
    try {
        // Cast req to access user (added by middleware)
        console.log("this rann");
        const userPayload = req.user;
        if (!userPayload) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        // Get user and refresh token
        const user = await prisma.user.findUnique({
            where: { id: userPayload.userId }
        });
        if (!user || !user.googleRefreshToken) {
            return res.status(401).json({ error: "No refresh token found" });
        }
        const drive = (0, googleDriveClient_1.getDriveClient)(user.googleRefreshToken);
        const parentId = req.query.parentId || 'root';
        const type = req.query.type || 'all';
        const starred = req.query.starred || 'false';
        let q = `'${parentId}' in parents`;
        if (req.query.trashed === 'true')
            q += ' and trashed = true';
        else
            q += ' and trashed = false';
        if (type === 'folders')
            q += " and mimeType = 'application/vnd.google-apps.folder'";
        else if (type === 'files')
            q += " and mimeType != 'application/vnd.google-apps.folder'";
        if (starred === "true")
            q += " and starred = true";
        const response = await drive.files.list({
            pageSize: 50,
            fields: 'files(id, name, size, mimeType, modifiedTime, webViewLink)',
            q,
        });
        res.json({ files: response.data.files });
    }
    catch (error) {
        console.error("Drive API error:", error);
        res.status(500).json({ error: "Failed to fetch files" });
    }
};
//# sourceMappingURL=getController.js.map