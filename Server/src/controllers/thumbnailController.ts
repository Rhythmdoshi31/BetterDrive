// controllers/thumbnailController.ts
import { Request, Response } from "express";
import { redisClient } from "../lib/redis";

export default async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, fileId } = req.params;
    const cacheKey = `thumb_${userId}_${fileId}`;
    
    const imageBuffer = await redisClient.get(Buffer.from(cacheKey));
    
    if (imageBuffer) {
      res.set({
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=86400'
      });
    console.log("buffer utha liya gaya hai")
      res.send(imageBuffer);
    } else {
      res.status(404).json({ error: 'Thumbnail not found' });
    }
  } catch (error: unknown) {
    console.error('Thumbnail serving error:', error);
    res.status(500).json({ error: 'Failed to serve thumbnail' });
  }
};
