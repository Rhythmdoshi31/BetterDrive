import { Request, Response } from "express";
import { getDriveClient } from "../lib/googleDriveClient";
import { JWTPayload } from "../types";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async (req: Request, res: Response) => {
  try {
    console.log("this chamkaradar");
    const folderId = req.query.folderId as string || undefined;

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

    const folderMetadata = {
      name: req.body.name,
      mimeType: "application/vnd.google-apps.folder",
      parents: folderId ? [folderId as string] : undefined,
    };

    const response = await drive.files.create({
      requestBody: folderMetadata,
      fields: "id, name, mimeType, parents, webViewLink",
    });

    res.json({
      success: true,
      folder: response.data,
    });
  } catch (err: any) {
    console.error("Upload error:", err.message);
    res.status(500).json({ error: "Upload failed", details: err.message });
  }
};
