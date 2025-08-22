"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDriveClient = getDriveClient;
const googleapis_1 = require("googleapis");
function getDriveClient(refreshToken) {
    const oauth2Client = new googleapis_1.google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_REDIRECT_URI);
    oauth2Client.setCredentials({ refresh_token: refreshToken });
    return googleapis_1.google.drive({ version: "v3", auth: oauth2Client });
}
//# sourceMappingURL=googleDriveClient.js.map