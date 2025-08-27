import React, { useEffect, useState } from "react";
import axios from "axios";
import type { AxiosResponse } from "axios";
import type { DriveFile, FilesResponse } from "../types";
import { NavbarLogo } from "../components/ui/resizable-navbar";
import Toggle from "../components/toggleDarkMode";
import SearchComponent from "../components/ui/SearchBar";

interface StorageQuota {
  used: number;
  usedInDrive: number;
  usedInTrash: number;
  limit: number;
}

// Configure axios to include credentials (cookies) and point to backend
axios.defaults.withCredentials = true;
axios.defaults.baseURL = "http://localhost:3000"; // Backend URL

const Dashboard: React.FC = () => {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [storage, setStorage] = useState<StorageQuota | null>(null);
  // The type (folders|files|all) and parentId and trashed (for bin) has to be passed in params and also (&starred=true)..
  useEffect(() => {
    const fetchFiles = async (): Promise<void> => {
      try {
        const response: AxiosResponse<FilesResponse> = await axios.get(
          "/api/google/files?type=all&parentId=root&trashed=false"
        );
        const response2: AxiosResponse = await axios.get("/api/google/storage");
        // const response: AxiosResponse<FilesResponse> = await axios.patch('/api/google/files/delete/1aQZdTMNa0M9SB5uM4iXrL1g4c5GTcnon?permanent=true');
        // const response: AxiosResponse<FilesResponse> = await axios.patch('/api/google/files/restore/1ELGmFQZgngOufPBcdyQ-LVersZ5VnoC7');
        // const response: AxiosResponse<FilesResponse> = await axios.post('/api/google/files/folders');
        // const response: AxiosResponse<FilesResponse> = await axios.get("/api/google/download/1f55SDjTO4I0XfmBdRnJkJ5gskrZuSb6g");
        // const response: AxiosResponse<FilesResponse> = await axios.post("/api/google/files/star/16SkGWlaX9U_KhuF-MYxjShW-pHTGM8ix");
        // const response: AxiosResponse<FilesResponse> = await axios.get("/api/google/files/search?q=t");
        setFiles(response.data.files || []);
        setStorage(response2.data.storage);
      } catch (error: unknown) {
        console.error("Error fetching files:", error);
        setError("Failed to fetch files");
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          window.location.href = "/"; // Redirect to signin if unauthorized
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, []);

  console.log("files", files);
  console.log("storage", storage);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      setUploading(true);
      const response = await axios.post("/api/google/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("Upload success:", response.data);

      // Refresh files list after upload
      const filesResponse: AxiosResponse<FilesResponse> = await axios.get(
        "/api/google/files"
      );
      setFiles(filesResponse.data.files || []);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed");
    } finally {
      setUploading(false);
      setSelectedFile(null);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const handleSearch = (query: string) => {
    console.log("Search query:", query);
    // Implement your search logic here
  };

  return (
    <div className="font-fkGrotesk">
      <div className="h-16 w-full flex items-center justify-between px-12 dark:bg-black ">
        <div className="flex">
          <NavbarLogo />
        <div className="px-4">
          <SearchComponent
            placeholder="Search your Google Drive files..."
            onSearch={handleSearch}
            className="mx-auto"
          />
        </div>
        </div>
        <Toggle />
      </div>
      <div className="bg-black text-white">
        <h3>Your Drive Files</h3>
        {files.map((file: DriveFile) => (
          <div key={file.id}>
            <h4>{file.name}</h4>
            <p>Size: {file.size} bytes</p>
            <p>Modified: {new Date(file.modifiedTime).toLocaleDateString()}</p>
            {file.hasThumbnail && file.thumbnailLink ? (
              <img src={file.thumbnailLink} alt={file.name} />
            ) : (
              <h1>{file.name} - Thumbnail not available</h1>
            )}
          </div>
        ))}
      </div>

      <hr />

      <div>
        <h3>Upload a File</h3>
        <input type="file" onChange={handleFileChange} />
        <button onClick={handleUpload} disabled={!selectedFile || uploading}>
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </div>
      {storage && (
        <div style={{ marginBottom: "20px" }}>
          <progress
            value={storage.used}
            max={storage.limit}
            style={{ width: "100%" }}
          />
          <p>
            {(storage.used / 1024 ** 3).toFixed(2)} GB of{" "}
            {(storage.limit / 1024 ** 3).toFixed(2)} GB used
          </p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
