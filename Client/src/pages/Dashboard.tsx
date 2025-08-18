import React, { useEffect, useState } from 'react';
import axios from 'axios';
import type { AxiosResponse } from 'axios';
import type { DriveFile, FilesResponse } from '../types';  // Assuming you have this types file

// Configure axios to include credentials (cookies) and point to backend
axios.defaults.withCredentials = true;
axios.defaults.baseURL = 'http://localhost:3000';  // Backend URL

const Dashboard: React.FC = () => {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchFiles = async (): Promise<void> => {
      try {
        const response: AxiosResponse<FilesResponse> = await axios.get('/api/google/files');
        console.log(response)
        setFiles(response.data.files || []);
        console.log("files", files);
      } catch (error: unknown) {
        console.error('Error fetching files:', error);
        setError('Failed to fetch files');
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          window.location.href = '/';  // Redirect to signin if unauthorized
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchFiles();
  }, []);

  

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <div>
        {files.map((file: DriveFile) => (
          <div key={file.id}>
            <h4>{file.name}</h4>
            <p>Size: {file.size} bytes</p>
            <p>Modified: {new Date(file.modifiedTime).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
