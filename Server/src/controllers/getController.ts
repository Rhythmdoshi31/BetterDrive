import { Request, Response } from 'express';
import { JWTPayload } from '../types';
import { PrismaClient } from '@prisma/client';
import { getDriveClient } from '../lib/googleDriveClient';

const prisma = new PrismaClient();

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  thumbnailLink?: string;
  modifiedTime: string;
  size: string;
  webViewLink: string;
  starred: boolean;
  parents?: string[];
}

interface FolderMetadata {
  id: string;
  name: string;
  parents?: string[];
}

export default async (req: Request, res: Response) => {
  try {
    console.log("Files API called");
    const userPayload = (req as Request & { user?: JWTPayload }).user;

    if (!userPayload) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userPayload.userId }
    });

    if (!user || !user.googleRefreshToken) {
      return res.status(401).json({ error: "No refresh token found" });
    }

    const drive = getDriveClient(user.googleRefreshToken);

    // Get parameters
    const filter = req.query.filter as string;
    const folderId = req.query.folderId as string; // folder navigation
    const limit = parseInt(req.query.limit as string) || 35;
    const pageToken = req.query.pageToken as string | undefined;

    console.log('Received folderId:', folderId); // Debug log

    // Build query based on filter and folder
    let query = "trashed = false";
    
    if (folderId) {
      // FIXED: Show files inside specific folder with correct syntax
      query = `'${folderId}' in parents and trashed = false`;
      console.log('Using folder query:', query); // Debug log
    } else {
      // Root level files
      switch (filter) {
        case 'starred':
          query = "starred = true and trashed = false";
          break;
        case 'recent':
          query = "trashed = false";
          break;
        case 'trashed':
          query = "trashed = true";
          break;
        default:
          query = "trashed = false";
      }
    }

    console.log("Final query:", query);

    // Fetch files from Google Drive
    const response = await drive.files.list({
      q: query,
      pageSize: limit,
      pageToken: pageToken,
      orderBy: 'modifiedTime desc',
      fields: 'nextPageToken, files(id, name, size, mimeType, modifiedTime, webViewLink, thumbnailLink, starred, parents)',
    });

    const allFiles = response.data.files as DriveFile[] || [];
    const nextPageToken = response.data.nextPageToken;

    // Remove duplicates
    const uniqueFiles = allFiles.filter((file, index, self) => 
      index === self.findIndex(f => f.id === file.id)
    );

    console.log(`Found ${uniqueFiles.length} files in folder`);

    // Get current folder metadata and build breadcrumb path
    let currentFolder: FolderMetadata | null = null;
    let breadcrumbPath: FolderMetadata[] = [];

    if (folderId) {
      try {
        console.log('Fetching folder metadata for:', folderId);
        
        // Get current folder info
        const folderResponse = await drive.files.get({
          fileId: folderId,
          fields: 'id, name, parents'
        });

        currentFolder = folderResponse.data as FolderMetadata;
        console.log('Current folder:', currentFolder);

        // Build breadcrumb path by traversing parents
        if (currentFolder.parents && currentFolder.parents.length > 0) {
          // FIXED: Handle undefined parentId properly
          let parentId: string | undefined = currentFolder.parents[0];
          const pathIds: string[] = [];

          // Traverse up to root to build full path
          while (parentId && pathIds.length < 10) { // Prevent infinite loop
            try {
              const parentResponse = await drive.files.get({
                fileId: parentId,
                fields: 'id, name, parents'
              });
              
              const parentFolder = parentResponse.data as FolderMetadata;
              breadcrumbPath.unshift(parentFolder); // Add to beginning of array
              
              // FIXED: Safely get next parent ID
              parentId = parentFolder.parents?.[0]; // Use optional chaining
              
              // Prevent loops
              if (parentId && pathIds.includes(parentId)) break;
              if (parentId) pathIds.push(parentId);
              
            } catch (error) {
              console.error('Error fetching parent folder:', error);
              break; // Stop if we can't fetch parent
            }
          }
        }
      } catch (error) {
        console.error("Error fetching folder metadata:", error);
        // Don't fail the whole request, just continue without folder metadata
        currentFolder = { id: folderId, name: 'Unknown Folder' };
      }
    }

    console.log(`Found ${uniqueFiles.length} unique files in folder: ${currentFolder?.name || 'Root'}`);
    console.log('Breadcrumb path:', breadcrumbPath.map(f => f.name));

    res.json({
      allFiles: uniqueFiles,
      totalCount: uniqueFiles.length,
      hasNextPage: !!nextPageToken,
      nextPageToken: nextPageToken || undefined,
      // Folder navigation metadata
      currentFolder: currentFolder,
      breadcrumbPath: breadcrumbPath
    });

  } catch (error) {
    console.error("Drive API error:", error);
    res.status(500).json({ error: "Failed to fetch files" });
  }
}
