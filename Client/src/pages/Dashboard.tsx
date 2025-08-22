import React, { useEffect, useState } from 'react';
import axios from 'axios';
import type { AxiosResponse } from 'axios';
import type { DriveFile, FilesResponse } from '../types';

// Configure axios to include credentials (cookies) and point to backend
axios.defaults.withCredentials = true;
axios.defaults.baseURL = 'http://localhost:3000'; // Backend URL

const Dashboard: React.FC = () => {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // The type (folders|files|all) and parentId and trashed (for bin) has to be passed in params..
  useEffect(() => {
    const fetchFiles = async (): Promise<void> => {
      try {
        const response: AxiosResponse<FilesResponse> = await axios.get('/api/google/files?type=all&parentId=root&trashed=false');
        // const response: AxiosResponse<FilesResponse> = await axios.patch('/api/google/files/delete/1aQZdTMNa0M9SB5uM4iXrL1g4c5GTcnon?permanent=true');
        // const response: AxiosResponse<FilesResponse> = await axios.patch('/api/google/files/restore/1ELGmFQZgngOufPBcdyQ-LVersZ5VnoC7');
        setFiles(response.data.files || []);
      } catch (error: unknown) {
        console.error('Error fetching files:', error);
        setError('Failed to fetch files');
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          window.location.href = '/'; // Redirect to signin if unauthorized
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchFiles();
  }, []);
  
  console.log("files" , files);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      setUploading(true);
      const response = await axios.post('/api/google/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log('Upload success:', response.data);

      // Refresh files list after upload
      const filesResponse: AxiosResponse<FilesResponse> = await axios.get('/api/google/files');
      setFiles(filesResponse.data.files || []);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed');
    } finally {
      setUploading(false);
      setSelectedFile(null);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <div>
        <h3>Your Drive Files</h3>
        {files.map((file: DriveFile) => (
          <div key={file.id}>
            <h4>{file.name}</h4>
            <p>Size: {file.size} bytes</p>
            <p>Modified: {new Date(file.modifiedTime).toLocaleDateString()}</p>
          </div>
        ))}
      </div>

      <hr />

      <div>
        <h3>Upload a File</h3>
        <input type="file" onChange={handleFileChange} />
        <button onClick={handleUpload} disabled={!selectedFile || uploading}>
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
