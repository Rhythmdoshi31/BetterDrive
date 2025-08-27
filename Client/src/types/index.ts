export interface DriveFile {
  id: string;
  name: string;
  size?: string;
  mimeType: string;
  modifiedTime: string;
  hasThumbnail: boolean;
  thumbnailLink?: string;
}

export interface FilesResponse {
  files: DriveFile[];
}
