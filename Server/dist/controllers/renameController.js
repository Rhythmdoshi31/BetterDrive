"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const googleDriveClient_1 = require("../lib/googleDriveClient");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Need fileId (params) && oldName and NewName as query..
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
        const oldName = req.query.oldName;
        const newName = req.query.newName;
        if (!oldName || !newName)
            return res.status(401).json({ error: "oldName and newName required" });
        const finalNameWithExtension = buildNewName(oldName, newName);
        const response = await drive.files.update({
            fileId: fileId,
            requestBody: {
                name: finalNameWithExtension,
            },
            fields: "id, name, mimeType, parents",
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
//# sourceMappingURL=renameController.js.map