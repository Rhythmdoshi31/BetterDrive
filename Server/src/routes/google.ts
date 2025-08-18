import express, { Request, Response, Router } from 'express';
import { google } from 'googleapis';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '../middleware/auth';
import { JWTPayload } from '../types';

const router: Router = express.Router();
const prisma = new PrismaClient();


// Get files from Google Drive
router.get('/files', verifyToken, async (req: Request, res: Response) => {
  try {
    // Cast req to access user (added by middleware)
    
    console.log("this rann");
    const userPayload = (req as Request & { user?: JWTPayload }).user;

    if (!userPayload) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    console.log(userPayload)
    // Get user and refresh token
    const user = await prisma.user.findUnique({
      where: { id: userPayload.userId }
    });

    if (!user || !user.googleRefreshToken) {
      return res.status(401).json({ error: "No refresh token found" });
    }

    // Set up OAuth2 client with refresh token
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      "http://localhost:3000/auth/google/callback"  // Adjust port if needed
    );

    // Set refresh token (decrypt if needed)
    oauth2Client.setCredentials({
      refresh_token: user.googleRefreshToken, // You might need to decrypt this
    });
    

    // Refresh access token if needed
    await oauth2Client.refreshAccessToken();
    const { credentials } = await oauth2Client.refreshAccessToken();
console.log("Granted scopes:", credentials.scope);  // 👈 log scopes here

oauth2Client.setCredentials(credentials);

    // Use Drive API
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    const response = await drive.files.list({
      pageSize: 20,
      fields: 'files(id, name, size, mimeType, modifiedTime)',
      q: "mimeType != 'application/vnd.google-apps.folder' and trashed = false"
    });
    console.log("files", response.data.files)
    res.json({ files: response.data.files });

  } catch (error) {
    console.error("Drive API error:", error);
    res.status(500).json({ error: "Failed to fetch files" });
  }
});

export default router;
