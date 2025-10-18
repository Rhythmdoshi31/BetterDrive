import { Request, Response } from "express";
import { redisClient } from "../lib/redis";
import { JWTPayload } from "../types";

export default async (req: Request, res: Response): Promise<void> => {
  try {
    const userPayload = (req as Request & { user?: JWTPayload }).user;

    if (!userPayload) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    // Clear dashboard cache
    await redisClient.del(`dashboard_data_${userPayload.userId}`);

    res.json({ 
      message: "Dashboard cache cleared successfully",
      userId: userPayload.userId 
    });
  } catch (error) {
    console.error("Clear cache error:", error);
    res.status(500).json({ error: "Failed to clear cache" });
  }
};
