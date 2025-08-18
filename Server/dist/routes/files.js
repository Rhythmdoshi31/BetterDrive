"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const googleapis_1 = require("googleapis");
const client_1 = require("@prisma/client"); // Or your custom path/alias
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
router.get('/files', auth_1.verifyToken, async (req, res) => {
    try {
        const userPayload = req.user;
        if (!userPayload) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const user = await prisma.user.findUnique({
            where: { id: userPayload.userId }
        });
        if (!user || !user.googleRefreshToken) {
            return res.status(401).json({ error: "No refresh token found. Please re-authenticate." });
        }
        // Decrypt refresh token if encrypted (skip if not using encryption)
        let refreshToken = user.googleRefreshToken;
        // Example decryption - adjust based on your storage method
        // if (encrypted) refreshToken = await decryptFunction(refreshToken);
        const oauth2Client = new googleapis_1.google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, "http://localhost:3000/auth/google/callback");
        oauth2Client.setCredentials({ refresh_token: refreshToken });
        const { credentials } = await oauth2Client.refreshAccessToken();
        oauth2Client.setCredentials(credentials);
        const drive = googleapis_1.google.drive({ version: 'v3', auth: oauth2Client });
        const response = await drive.files.list({
            pageSize: 20,
            fields: 'files(id, name, size, mimeType, modifiedTime)',
        });
        res.json({ files: response.data.files || [] });
    }
    catch (error) {
        console.error("Drive metadata error:", error);
        res.status(500).json({ error: "Failed to fetch metadata", details: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=files.js.map