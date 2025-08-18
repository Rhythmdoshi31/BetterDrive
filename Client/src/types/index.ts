export interface DriveFile {
  id: string;
  name: string;
  size?: string;
  mimeType: string;
  modifiedTime: string;
}

export interface FilesResponse {
  files: DriveFile[];
}
