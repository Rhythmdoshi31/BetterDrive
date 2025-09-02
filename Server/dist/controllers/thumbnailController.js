"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("../lib/redis");
exports.default = async (req, res) => {
    try {
        const { userId, fileId } = req.params;
        const cacheKey = `thumb_${userId}_${fileId}`;
        // Buffer storage of image is getting corrupted in redis..
        // So we have to store it in base 64..
        const base64Data = await redis_1.redisClient.get(cacheKey);
        if (base64Data && typeof base64Data === "string") {
            const imageBuffer = Buffer.from(base64Data, "base64");
            // Detect content type from restored buffer
            let contentType = "image/jpeg"; // default
            if (imageBuffer[0] === 0xff && imageBuffer[1] === 0xd8) {
                contentType = "image/jpeg";
            }
            else if (imageBuffer[0] === 0x89 && imageBuffer[1] === 0x50) {
                contentType = "image/png";
            }
            else if (imageBuffer[0] === 0x47 && imageBuffer[1] === 0x49) {
                contentType = "image/gif";
            }
            console.log("🎯 Detected content type:", contentType);
            console.log("🔍 Restored buffer first bytes:", imageBuffer.slice(0, 10));
            console.log("🎯 Detected content type:", contentType);
            console.log("🔍 First few bytes:", imageBuffer.slice(0, 10));
            res.set({
                "Content-Type": contentType,
                'Content-Length': imageBuffer.length.toString(),
                "Cache-Control": "public, max-age=86400",
            });
            console.log(imageBuffer.length);
            console.log("buffer utha liya gaya hai");
            res.send(imageBuffer);
        }
        else {
            res.status(404).json({ error: "Thumbnail not found" });
        }
    }
    catch (error) {
        console.error("Thumbnail serving error:", error);
        res.status(500).json({ error: "Failed to serve thumbnail" });
    }
};
//# sourceMappingURL=thumbnailController.js.map