import { Request, Response} from 'express';
import { JWTPayload } from '../types';
import { PrismaClient } from '@prisma/client';
import { getDriveClient } from '../lib/googleDriveClient'

const prisma = new PrismaClient();

export default async (req: Request, res: Response) => {
  try {
    // Cast req to access user (added by middleware)
    
    console.log("this rann");
    const userPayload = (req as Request & { user?: JWTPayload }).user;

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

    const drive = getDriveClient(user.googleRefreshToken);

    const parentId = req.query.parentId as string || 'root';
    const type = req.query.type as string || 'all';
    
    let q = `'${parentId}' in parents`;
    if (req.query.trashed === 'true') q += ' and trashed = true';
    else q += ' and trashed = false'
    
    if (type === 'folders') q += " and mimeType = 'application/vnd.google-apps.folder'";
    else if (type === 'files') q += " and mimeType != 'application/vnd.google-apps.folder'";

    const response = await drive.files.list({
      pageSize: 50,
      fields: 'files(id, name, size, mimeType, modifiedTime, webViewLink)',
      q,
    });
    res.json({ files: response.data.files });

  } catch (error) {
    console.error("Drive API error:", error);
    res.status(500).json({ error: "Failed to fetch files" });
  }
}