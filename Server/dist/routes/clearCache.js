"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("../lib/redis");
exports.default = async (req, res) => {
    try {
        const userPayload = req.user;
        if (!userPayload) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        // Clear dashboard cache
        await redis_1.redisClient.del(`dashboard_data_${userPayload.userId}`);
        res.json({
            message: "Dashboard cache cleared successfully",
            userId: userPayload.userId
        });
    }
    catch (error) {
        console.error("Clear cache error:", error);
        res.status(500).json({ error: "Failed to clear cache" });
    }
};
//# sourceMappingURL=clearCache.js.map