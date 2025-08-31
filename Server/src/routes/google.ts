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
import starController from '../controllers/starController';
import searchController from '../controllers/searchController';
import storageController from '../controllers/storageController';
import dashboardController from '../controllers/dashboardController';
import thumbnailController from '../controllers/thumbnailController';

const router: Router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

// Get files from Google Drive
router.get('/files', verifyToken, getController);

// This sends dashboard content & stored them in Redis with previews as urls of another route..
router.get('/dashboard/files', verifyToken, dashboardController);

// This gets the image buffer from Redis and sends it as jpeg in response
router.get("/dashboard/:userId/:fileId", thumbnailController);

router.get('/storage', verifyToken, storageController);

// Search files in Google Drive
router.get('/files/search', verifyToken, searchController);

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

// Mark a file as starred in Google Drive
router.post("/files/star/:fileId", verifyToken, starController);

// Delete files from Google Drive
router.patch('/files/delete/:fileId', verifyToken, deleteController);

// Restore files from Bin
router.patch('/files/restore/:fileId', verifyToken, restoreController);

export default router;
