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
const router = express_1.default.Router();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
// Get files from Google Drive
router.get('/files', auth_1.verifyToken, getController_1.default);
// Put files to Google Drive
// FolderId will be in query params.. (?folderId=abcd)
router.post("/upload", auth_1.verifyToken, upload.single("file"), uploadController_1.default);
// Download files from Google drive
router.get("/download/:fileId", auth_1.verifyToken, downloadController_1.default);
// Create folders in Google Drive
// FolderId will be in query params.. (?folderId=abcd)
router.post("/folders", auth_1.verifyToken, createFolderController_1.default);
router.patch("/rename/:id", auth_1.verifyToken, renameController_1.default);
// Move/Copy folders in Google drive
router.patch("/move/:fileId", auth_1.verifyToken, moveNcopyController_1.default);
// Mark a file as starred in Google Drive
router.post("/files/star/:fileId", auth_1.verifyToken, starController_1.default);
// Delete files from Google Drive
router.patch('/files/delete/:fileId', auth_1.verifyToken, deleteController_1.default);
// Restore files from Bin
router.patch('/files/restore/:fileId', auth_1.verifyToken, restoreController_1.default);
exports.default = router;
//# sourceMappingURL=google.js.map