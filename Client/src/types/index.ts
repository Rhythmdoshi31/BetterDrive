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


export interface User {
  name: string;
  email: string;
  image: string;
  isAuthenticated: boolean;
}

export interface DashboardResponse {
  top3: DriveFile[];
  top7Previews: DriveFile[];
  allFiles: DriveFile[];
  totalCount: number;
  hasNextPage: boolean;
  nextPageToken?: string;
}