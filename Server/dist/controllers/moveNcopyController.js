"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const googleDriveClient_1 = require("../lib/googleDriveClient");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Need to send fileId(Params), operationType(copy,move), oldParents, newParents in query...
exports.default = async (req, res) => {
    try {
        console.log("this chamkaradar");
        const fileId = req.params.fileId;
        const operationType = req.query.operationType || "move";
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
        const oldParent = req.query.oldParent;
        const newParent = req.query.newParent || "root";
        let response;
        if (operationType === "copy") {
            response = await drive.files.copy({
                fileId,
                requestBody: { parents: [newParent] },
                fields: "id, name, mimeType, parents",
            });
        }
        else if (operationType === "move") {
            if (!oldParent) {
                return res
                    .status(400)
                    .json({ error: "oldParent is required for move operation" });
            }
            response = await drive.files.update({
                fileId,
                addParents: newParent,
                removeParents: oldParent,
                fields: "id, name, mimeType, parents",
            });
        }
        else {
            return res.status(400).json({ error: "Invalid operationType" });
        }
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
//# sourceMappingURL=moveNcopyController.js.map