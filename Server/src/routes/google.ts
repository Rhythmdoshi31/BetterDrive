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
import { redisClient } from '../lib/redis';

import { upload } from '../middleware/multer';

const router: Router = express.Router();

// Get files from Google Drive
router.get('/files', verifyToken, getController);

// This sends dashboard content & stored them in Redis with previews as urls of another route..
router.get('/dashboard/files', verifyToken, dashboardController);

// This gets the image buffer from Redis and sends it as jpeg in response
router.get("/thumbnail/:userId/:fileId", thumbnailController);

router.get('/storage', verifyToken, storageController);

// Search files in Google Drive
router.get('/files/search', verifyToken, searchController);

// Put files to Google Drive
// FolderId will be in query params.. (?folderId=abcd)

router.post('/upload', verifyToken, (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ 
          error: 'File too large', 
          message: 'File size cannot exceed 500MB' 
        });
      }
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }
    next(); // Continue to your upload handler
  });
}, uploadController);

// Download files from Google drive
router.get("/download/:fileId", verifyToken, downloadController)

// Create folders in Google Drive
// FolderId will be in query params.. (?folderId=abcd)
router.post("/folders", verifyToken, createFolderController);

router.patch("/rename/:id", verifyToken, renameController);

// Move/Copy folders in Google drive
router.patch("/move/:fileId", verifyToken, moveNcopyController);

// Mark a file as starred in Google Drive
router.patch("/files/star/:fileId", verifyToken, starController);

// Delete files from Google Drive
router.patch('/files/delete/:fileId', verifyToken, deleteController);

// Restore files from Bin
router.patch('/files/restore/:fileId', verifyToken, restoreController);

// Add this route temporarily to your google routes
router.get('/debug/clear-file-cache/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const cacheKey = `dashboard_files_${userId}`;
    
    await redisClient.del(cacheKey);
    
    res.json({ message: 'File cache cleared successfully' });
  } catch (error:any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
