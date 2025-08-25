"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const googleDriveClient_1 = require("../lib/googleDriveClient");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
exports.default = async (req, res) => {
    try {
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
        const about = await drive.about.get({
            fields: "storageQuota",
        });
        const quota = about.data.storageQuota;
        res.json({
            success: true,
            storage: {
                used: quota?.usage, // total usage in bytes
                usedInDrive: quota?.usageInDrive,
                usedInTrash: quota?.usageInDriveTrash,
                limit: quota?.limit, // total quota in bytes
            },
        });
    }
    catch (err) {
        console.error("Storage fetch error:", err.message);
        res.status(500).json({ error: "Failed to fetch storage", details: err.message });
    }
};
//# sourceMappingURL=storageController.js.map