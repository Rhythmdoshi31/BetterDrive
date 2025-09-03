"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
// Configure multer with size and type limits
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(), // Keep files in memory as buffer
    limits: {
        fileSize: 500 * 1024 * 1024, // 500MB limit
        fieldSize: 500 * 1024 * 1024, // Field size limit
    },
    fileFilter: (req, file, cb) => {
        // Allow all common file types including videos
        const allowedTypes = /jpeg|jpg|png|gif|bmp|webp|svg|pdf|doc|docx|txt|rtf|zip|rar|7z|tar|gz|mp4|mov|avi|mkv|wmv|flv|webm|m4v|3gp|mp3|wav|aac|flac|ogg/;
        const mimeType = allowedTypes.test(file.mimetype.toLowerCase());
        const extName = allowedTypes.test((file.originalname.toLowerCase().split('.').pop() || ''));
        if (mimeType || extName) {
            return cb(null, true);
        }
        else {
            cb(new Error('Invalid file type. Supports: Images, Videos (MOV, MP4, AVI), Documents, Audio, Archives'));
        }
    }
});
exports.upload = upload;
//# sourceMappingURL=multer.js.map