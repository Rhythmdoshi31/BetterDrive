import express, { Router } from 'express';
import multer from "multer";
import { verifyToken } from '../middleware/auth';
import getController from '../controllers/getController';
import uploadController from '../controllers/uploadController';
import deleteController from '../controllers/deleteController';
import restoreController from '../controllers/restoreController';
import createFolderController from '../controllers/createFolderController';
import renameController from '../controllers/renameController';
import moveNcopyController from '../controllers/moveNcopyController';
import downloadController from '../controllers/downloadController';

const router: Router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

// Get files from Google Drive
router.get('/files', verifyToken, getController);

// Put files to Google Drive
// FolderId will be in query params.. (?folderId=abcd)
router.post("/upload", verifyToken, upload.single("file"), uploadController);

// Download files from Google drive
router.get("/download/:fileId", verifyToken, downloadController)

// Create folders in Google Drive
// FolderId will be in query params.. (?folderId=abcd)
router.post("/folders", verifyToken, createFolderController);

router.patch("/rename/:id", verifyToken, renameController);

// Move/Copy folders in Google drive
router.patch("/move/:fileId", verifyToken, moveNcopyController);


// Delete files from Google Drive
router.patch('/files/delete/:fileId', verifyToken, deleteController);

// Restore files from Bin
router.patch('/files/restore/:fileId', verifyToken, restoreController);

export default router;
