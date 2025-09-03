"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const auth_1 = require("../middleware/auth");
const getController_1 = __importDefault(require("../controllers/getController"));
const uploadController_1 = __importDefault(require("../controllers/uploadController"));
const deleteController_1 = __importDefault(require("../controllers/deleteController"));
const restoreController_1 = __importDefault(require("../controllers/restoreController"));
const createFolderController_1 = __importDefault(require("../controllers/createFolderController"));
const renameController_1 = __importDefault(require("../controllers/renameController"));
const moveNcopyController_1 = __importDefault(require("../controllers/moveNcopyController"));
const downloadController_1 = __importDefault(require("../controllers/downloadController"));
const starController_1 = __importDefault(require("../controllers/starController"));
const searchController_1 = __importDefault(require("../controllers/searchController"));
const storageController_1 = __importDefault(require("../controllers/storageController"));
const dashboardController_1 = __importDefault(require("../controllers/dashboardController"));
const thumbnailController_1 = __importDefault(require("../controllers/thumbnailController"));
const redis_1 = require("../lib/redis");
const multer_2 = require("../middleware/multer");
const router = express_1.default.Router();
// Get files from Google Drive
router.get('/files', auth_1.verifyToken, getController_1.default);
// This sends dashboard content & stored them in Redis with previews as urls of another route..
router.get('/dashboard/files', auth_1.verifyToken, dashboardController_1.default);
// This gets the image buffer from Redis and sends it as jpeg in response
router.get("/thumbnail/:userId/:fileId", thumbnailController_1.default);
router.get('/storage', auth_1.verifyToken, storageController_1.default);
// Search files in Google Drive
router.get('/files/search', auth_1.verifyToken, searchController_1.default);
// Put files to Google Drive
// FolderId will be in query params.. (?folderId=abcd)
router.post('/upload', auth_1.verifyToken, (req, res, next) => {
    multer_2.upload.single('file')(req, res, (err) => {
        if (err instanceof multer_1.default.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    error: 'File too large',
                    message: 'File size cannot exceed 500MB'
                });
            }
            return res.status(400).json({ error: err.message });
        }
        else if (err) {
            return res.status(400).json({ error: err.message });
        }
        next(); // Continue to your upload handler
    });
}, uploadController_1.default);
// Download files from Google drive
router.get("/download/:fileId", auth_1.verifyToken, downloadController_1.default);
// Create folders in Google Drive
// FolderId will be in query params.. (?folderId=abcd)
router.post("/folders", auth_1.verifyToken, createFolderController_1.default);
router.patch("/rename/:id", auth_1.verifyToken, renameController_1.default);
// Move/Copy folders in Google drive
router.patch("/move/:fileId", auth_1.verifyToken, moveNcopyController_1.default);
// Mark a file as starred in Google Drive
router.patch("/files/star/:fileId", auth_1.verifyToken, starController_1.default);
// Delete files from Google Drive
router.patch('/files/delete/:fileId', auth_1.verifyToken, deleteController_1.default);
// Restore files from Bin
router.patch('/files/restore/:fileId', auth_1.verifyToken, restoreController_1.default);
// Add this route temporarily to your google routes
router.get('/debug/clear-file-cache/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const cacheKey = `dashboard_files_${userId}`;
        await redis_1.redisClient.del(cacheKey);
        res.json({ message: 'File cache cleared successfully' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=google.js.map