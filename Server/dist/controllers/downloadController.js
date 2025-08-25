"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const googleDriveClient_1 = require("../lib/googleDriveClient");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
exports.default = async (req, res) => {
    try {
        console.log("this chamkaradar");
        const fileId = req.params.fileId;
        if (!fileId)
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
        // First, get file metadata
        const fileMeta = await drive.files.get({
            fileId,
            fields: "id, name, mimeType",
        });
        const mimeType = fileMeta.data.mimeType || "application/octet-stream";
        const fileName = fileMeta.data.name || "downloaded_file";
        // Set headers so browser knows it’s a download
        res.setHeader("Content-Type", mimeType);
        res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
        // For binary files (non-Google Docs)
        if (!mimeType.startsWith("application/vnd.google-apps")) {
            const driveRes = await drive.files.get({ fileId, alt: "media" }, { responseType: "stream" });
            driveRes.data.pipe(res);
        }
        else {
            // For Google Docs/Sheets/Slides → need export
            let exportMime = "application/pdf"; // default
            if (mimeType === "application/vnd.google-apps.document") {
                exportMime = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"; // .docx
            }
            else if (mimeType === "application/vnd.google-apps.spreadsheet") {
                exportMime = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"; // .xlsx
            }
            else if (mimeType === "application/vnd.google-apps.presentation") {
                exportMime = "application/vnd.openxmlformats-officedocument.presentationml.presentation"; // .pptx
            }
            const exportRes = await drive.files.export({ fileId, mimeType: exportMime }, { responseType: "stream" });
            exportRes.data.pipe(res);
        }
    }
    catch (err) {
        console.error("Upload error:", err.message);
        res.status(500).json({ error: "Upload failed", details: err.message });
    }
};
//# sourceMappingURL=downloadController.js.map