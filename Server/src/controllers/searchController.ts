import { Request, Response } from "express";
import { getDriveClient } from "../lib/googleDriveClient";
import { JWTPayload } from "../types";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async (req: Request, res: Response) => {
  try {
    console.log("this chamkaradar");
    const q = req.query.q as string;

    if (!q) return res.status(400).json({ error: "Search query required" });

    const userPayload = (req as Request & { user?: JWTPayload }).user;

    if (!userPayload) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userPayload.userId },
    });

    if (!user || !user.googleRefreshToken) {
      return res.status(401).json({ error: "No refresh token found" });
    }

    const drive = getDriveClient(user.googleRefreshToken);

    const updatedFileData = await drive.files.list({
      q: `name contains '${q}' and trashed = false`,
      fields: "files(id, name, mimeType, starred, modifiedTime, owners)",
      pageSize: 20,
    });

    return res.json({
      success: true,
      files: updatedFileData.data.files,
    });
  } catch (err: any) {
    console.error("Upload error:", err.message);
    res.status(500).json({ error: "Upload failed", details: err.message });
  }
};
