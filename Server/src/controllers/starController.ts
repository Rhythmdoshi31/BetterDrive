import { Request, Response } from "express";
import { getDriveClient } from "../lib/googleDriveClient";
import { JWTPayload } from "../types";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async (req: Request, res: Response) => {
  try {
    console.log("this chamkaradar");
    const fileId = req.params.fileId;
    const starParams = req.query.star as string | undefined;

    if (starParams !== "true" && starParams !== "false") {
      return res.status(400).json({ error: "star must be 'true' or 'false'" });
    }

    const star = starParams === "true";

    if (!fileId) return res.status(400).json({ error: "File ID Required" });

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

    const updatedFileData = await drive.files.update({
      fileId,
      requestBody: { starred: star },
      fields: "id, name, starred",
    });

    res.json({
      success: true,
      file: updatedFileData.data,
    });
  } catch (err: any) {
    console.error("Upload error:", err.message);
    res.status(500).json({ error: "Upload failed", details: err.message });
  }
};
