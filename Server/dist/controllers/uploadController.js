"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stream_1 = require("stream");
const googleDriveClient_1 = require("../lib/googleDriveClient");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
exports.default = async (req, res) => {
    try {
        console.log("this chamkaradar");
        if (!req.file)
            return res.status(400).json({ error: "No file uploaded" });
        const userPayload = req.user;
        if (!userPayload) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const user = await prisma.user.findUnique({
            where: { id: userPayload.userId },
        });
        if (!user || !user.googleRefreshToken) {
            return res.status(401).json({ error: "No refresh token found" });
        }
        const drive = (0, googleDriveClient_1.getDriveClient)(user.googleRefreshToken);
        const folderId = req.body.folderId || undefined;
        // Since drive needs file as stream..
        const bufferStream = new stream_1.PassThrough();
        bufferStream.end(req.file.buffer);
        const fileMetadata = {
            name: req.file.originalname,
            mimeType: req.file.mimetype,
            ...(folderId && { parents: [folderId] }),
        };
        const fileSize = req.file.size;
        const response = await drive.files.create({
            requestBody: fileMetadata,
            media: {
                mimeType: req.file.mimetype,
                body: bufferStream,
            },
            fields: "id, name, mimeType, parents, webViewLink, webContentLink",
        });
        res.json({
            success: true,
            file: response.data,
        });
    }
    catch (err) {
        console.error("Upload error:", err.message);
        res.status(500).json({ error: "Upload failed", details: err.message });
    }
};
//# sourceMappingURL=uploadController.js.map