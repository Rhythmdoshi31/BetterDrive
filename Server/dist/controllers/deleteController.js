"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const googleDriveClient_1 = require("../lib/googleDriveClient");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
exports.default = async (req, res) => {
    try {
        console.log("this chamkaradar");
        const fileId = req.params.fileId;
        const permanent = req.query.permanent === 'true';
        if (!fileId)
            return res.status(400).json({ error: 'File ID Required' });
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
        if (permanent)
            await drive.files.delete({ fileId });
        else
            await drive.files.update({ fileId, requestBody: { trashed: true } });
    }
    catch (err) {
        console.error("Upload error:", err.message);
        res.status(500).json({ error: "Upload failed", details: err.message });
    }
};
//# sourceMappingURL=deleteController.js.map