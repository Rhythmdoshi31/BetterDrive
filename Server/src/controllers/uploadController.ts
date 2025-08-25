import { Request, Response } from "express";
import multer from "multer"; // This imports the types
import { PassThrough } from "stream";
import { getDriveClient } from "../lib/googleDriveClient";
import { JWTPayload } from "../types";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

export default async (req: MulterRequest, res: Response) => {
  try {
    console.log("this chamkaradar");
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const userPayload = (req as MulterRequest & { user?: JWTPayload }).user;

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

    const folderId = (req.query.folderId as string) || undefined;

    // Since drive needs file as stream..
    const bufferStream = new PassThrough();
    bufferStream.end(req.file.buffer);

    const fileMetadata = {
      name: req.file.originalname,
      mimeType: req.file.mimetype,
      ...(folderId && { parents: [folderId] }),
    };

    const fileSize = req.file.size;

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: {
        mimeType: req.file.mimetype,
        body: bufferStream,
      },
      fields: "id, name, mimeType, parents, webViewLink, webContentLink",
    });

    res.json({
      success: true,
      file: response.data,
    });
  } catch (err: any) {
    console.error("Upload error:", err.message);
    res.status(500).json({ error: "Upload failed", details: err.message });
  }
};
