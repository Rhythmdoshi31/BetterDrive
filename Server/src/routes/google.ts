import express, { Router } from 'express';
import multer from "multer";
import { verifyToken } from '../middleware/auth';
import getController from '../controllers/getController';
import uploadController from '../controllers/uploadController';
import deleteController from '../controllers/deleteController';
import restoreController from '../controllers/restoreController';

const router: Router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

// Get files from Google Drive
router.get('/files', verifyToken, getController);

// Put files to Google Drive
router.post("/upload", verifyToken, upload.single("file"), uploadController);

// Delete files from Google Drive
router.patch('/files/delete/:fileId', verifyToken, deleteController);

// Restore files from Bin
router.patch('/files/restore/:fileId', verifyToken, restoreController);

export default router;
