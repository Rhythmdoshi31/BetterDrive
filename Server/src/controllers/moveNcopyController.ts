import { Request, Response } from "express";
import { getDriveClient } from "../lib/googleDriveClient";
import { JWTPayload } from "../types";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

  // Need to send fileId(Params), operationType(copy,move), oldParents, newParents in query...

export default async (req: Request, res: Response) => {
  try {
    console.log("this chamkaradar");
    const fileId: string = req.params.fileId;
    const operationType: string = req.query.operationType as string || "move";

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

    const oldParent: string = (req.query.oldParent as string)
    const newParent: string = (req.query.newParent as string) || "root";

    let response;

    if (operationType === "copy") {
      response = await drive.files.copy({
        fileId,
        requestBody: { parents: [newParent] },
        fields: "id, name, mimeType, parents",
      });
    } else if (operationType === "move") {
      if (!oldParent) {
        return res
          .status(400)
          .json({ error: "oldParent is required for move operation" });
      }

      response = await drive.files.update({
        fileId,
        addParents: newParent,
        removeParents: oldParent,
        fields: "id, name, mimeType, parents",
      });
    } else {
      return res.status(400).json({ error: "Invalid operationType" });
    }

    res.json({
      success: true,
      file: response.data,
    });
  } catch (err: any) {
    console.error("Upload error:", err.message);
    res.status(500).json({ error: "Upload failed", details: err.message });
  }
};
