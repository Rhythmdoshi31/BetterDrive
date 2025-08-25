import { Request, Response } from "express";
import { getDriveClient } from "../lib/googleDriveClient";
import { JWTPayload } from "../types";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Need fileId (params) && oldName and NewName as query..

export default async (req: Request, res: Response) => {
  try {
    console.log("this chamkaradar");
    const fileId = req.params.fileId;
    if (!fileId) return res.status(400).json({ error: "No file uploaded" });
    
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

    const oldName : string = req.query.oldName as string;
    const newName : string = req.query.newName as string;

    if (!oldName || !newName) return res.status(401).json({error: "oldName and newName required"})
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
  } catch (err: any) {
    console.error("Upload error:", err.message);
    res.status(500).json({ error: "Upload failed", details: err.message });
  }
};
