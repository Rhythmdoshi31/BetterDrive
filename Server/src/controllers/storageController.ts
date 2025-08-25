import { Request, Response } from "express";
import { getDriveClient } from "../lib/googleDriveClient";
import { JWTPayload } from "../types";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async (req: Request, res: Response) => {
  try {
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

    const about = await drive.about.get({
      fields: "storageQuota",
    });

    const quota = about.data.storageQuota;

    res.json({
      success: true,
      storage: {
        used: quota?.usage,         // total usage in bytes
        usedInDrive: quota?.usageInDrive, 
        usedInTrash: quota?.usageInDriveTrash,
        limit: quota?.limit,        // total quota in bytes
      },
    });
  } catch (err: any) {
    console.error("Storage fetch error:", err.message);
    res.status(500).json({ error: "Failed to fetch storage", details: err.message });
  }
};
