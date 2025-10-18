import { Request, Response } from "express";
import { redisClient } from "../lib/redis";

export default async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, fileId } = req.params;
    const cacheKey = `thumb_${userId}_${fileId}`;

    const base64Data = await redisClient.get(cacheKey);

    if (base64Data && typeof base64Data === "string") {
      const imageBuffer = Buffer.from(base64Data, "base64");

      // Detect content type
      let contentType = "image/jpeg";

      if (imageBuffer[0] === 0xff && imageBuffer[1] === 0xd8) {
        contentType = "image/jpeg";
      } else if (imageBuffer[0] === 0x89 && imageBuffer[1] === 0x50) {
        contentType = "image/png";
      } else if (imageBuffer[0] === 0x47 && imageBuffer[1] === 0x49) {
        contentType = "image/gif";
      }

      console.log("🎯 Detected content type:", contentType);
      console.log("🔍 Restored buffer first bytes:", imageBuffer.slice(0, 10));

      // ✅ ADD CORS HEADERS HERE
      res.set({
        // CORS headers
        'Access-Control-Allow-Origin': req.headers.origin || '*',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        
        // Image headers
        "Content-Type": contentType,
        'Content-Length': imageBuffer.length.toString(),
        "Cache-Control": "public, max-age=604800", // 7 days
      });

      console.log(imageBuffer.length);
      console.log("buffer utha liya gaya hai");
      
      res.send(imageBuffer);
    } else {
      // ✅ ADD CORS HEADERS FOR ERROR RESPONSES TOO
      res.set({
        'Access-Control-Allow-Origin': req.headers.origin || '*',
        'Access-Control-Allow-Credentials': 'true',
      });
      res.status(404).json({ error: "Thumbnail not found" });
    }
  } catch (error: unknown) {
    console.error("Thumbnail serving error:", error);
    // ✅ ADD CORS HEADERS FOR ERROR RESPONSES
    res.set({
      'Access-Control-Allow-Origin': req.headers.origin || '*',
      'Access-Control-Allow-Credentials': 'true',
    });
    res.status(500).json({ error: "Failed to serve thumbnail" });
  }
};
