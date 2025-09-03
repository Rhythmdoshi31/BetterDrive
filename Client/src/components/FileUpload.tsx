import React, { useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FaCloudUploadAlt,
  FaTimes,
  FaFile,
  FaFileImage,
  FaFileVideo,
  FaFileAudio,
  FaFileArchive,
  FaTrash,
  FaCheckCircle,
  FaExclamationTriangle
} from 'react-icons/fa';
import axios from 'axios';

interface UploadFile {
  id: string;
  file: File;
  preview?: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete?: (files: File[]) => void;
}

const FileUploadModal: React.FC<FileUploadModalProps> = ({
  isOpen,
  onClose,
  onUploadComplete
}) => {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Configuration
  const maxFileSize = 500; // 500MB
  const maxFiles = 10;
  const acceptedTypes = [
    'image/*', 
    'video/*',
    'audio/*',
    '.pdf', '.doc', '.docx', '.txt', '.rtf',
    '.zip', '.rar', '.7z', '.tar.gz'
  ];

  // Helper functions
  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    if (mb >= 1000) {
      const gb = mb / 1024;
      return `${gb.toFixed(1)} GB`;
    }
    if (mb >= 1) return `${mb.toFixed(1)} MB`;
    const kb = bytes / 1024;
    return `${kb.toFixed(1)} KB`;
  };

  const getFileIcon = (file: File) => {
    const type = file.type.toLowerCase();
    const name = file.name.toLowerCase();
    
    if (type.startsWith('image/')) return FaFileImage;
    if (type.startsWith('video/') || name.endsWith('.mov') || name.endsWith('.avi')) return FaFileVideo;
    if (type.startsWith('audio/')) return FaFileAudio;
    if (name.match(/\.(zip|rar|7z|tar|gz)$/)) return FaFileArchive;
    return FaFile;
  };

  const getFileIconColor = (file: File) => {
    const type = file.type.toLowerCase();
    const name = file.name.toLowerCase();
    
    if (type.startsWith('image/')) return 'text-blue-400';
    if (type.startsWith('video/') || name.endsWith('.mov') || name.endsWith('.avi')) return 'text-red-400';
    if (type.startsWith('audio/')) return 'text-green-400';
    if (name.match(/\.(zip|rar|7z|tar|gz)$/)) return 'text-purple-400';
    return 'text-gray-400';
  };

  // File validation
  const validateFile = (file: File): string | null => {
    // Size validation
    if (file.size > maxFileSize * 1024 * 1024) {
      return `File size must be less than ${maxFileSize}MB (current: ${formatFileSize(file.size)})`;
    }
    
    // Type validation
    const fileType = file.type.toLowerCase();
    const fileName = file.name.toLowerCase();
    
    const isValidImage = fileType.startsWith('image/');
    const isValidVideo = fileType.startsWith('video/') || fileName.match(/\.(mov|avi|mkv|wmv|flv|webm|m4v|3gp)$/);
    const isValidAudio = fileType.startsWith('audio/') || fileName.match(/\.(mp3|wav|aac|flac|ogg)$/);
    const isValidDoc = fileType.includes('pdf') || fileName.match(/\.(pdf|doc|docx|txt|rtf)$/);
    const isValidArchive = fileName.match(/\.(zip|rar|7z|tar|gz)$/);
    
    if (!(isValidImage || isValidVideo || isValidAudio || isValidDoc || isValidArchive)) {
      return 'Invalid file type. Supports: Images, Videos (MOV, MP4, AVI), Documents, Audio, Archives';
    }
    
    return null;
  };

  // Process selected files
  const processFiles = useCallback((fileList: FileList | File[]) => {
    const fileArray = Array.from(fileList);
    
    if (files.length + fileArray.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }

    fileArray.forEach(file => {
      const error = validateFile(file);
      const id = `${Date.now()}-${Math.random()}`;
      
      const uploadFile: UploadFile = {
        id,
        file,
        progress: 0,
        status: error ? 'error' : 'pending',
        error: error ? String(error) : undefined
      };

      // Create preview for images
      if (file.type.startsWith('image/') && file.size < 10 * 1024 * 1024) { // Only preview images under 10MB
        const reader = new FileReader();
        reader.onload = (e) => {
          setFiles(prev => prev.map(f => 
            f.id === id ? { ...f, preview: e.target?.result as string } : f
          ));
        };
        reader.readAsDataURL(file);
      }

      setFiles(prev => [...prev, uploadFile]);
    });
  }, [files.length]);

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  };

  // Remove file from list
  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  // Upload files to backend
  const uploadFiles = async () => {
    const validFiles = files.filter(f => f.status !== 'error');
    if (validFiles.length === 0) return;

    setIsUploading(true);

    try {
      for (const uploadFile of validFiles) {
        setFiles(prev => prev.map(f => 
          f.id === uploadFile.id ? { ...f, status: 'uploading', progress: 0 } : f
        ));

        const formData = new FormData();
        formData.append('file', uploadFile.file);

        const response = await axios.post('/api/google/upload', formData, {
          timeout: 15 * 60 * 1000, // 15 minutes timeout for large files
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setFiles(prev => prev.map(f => 
                f.id === uploadFile.id ? { ...f, progress } : f
              ));
            }
          }
        });

        setFiles(prev => prev.map(f => 
          f.id === uploadFile.id ? { ...f, status: 'success', progress: 100 } : f
        ));
      }

      // Success callback
      const successfulFiles = files
        .filter(f => f.status === 'success')
        .map(f => f.file);
      
      if (successfulFiles.length > 0 && onUploadComplete) {
        onUploadComplete(successfulFiles);
      }

      // Auto close after 2 seconds
      setTimeout(() => {
        handleClose();
      }, 2000);

    } catch (error: any) {
      console.error('Upload failed:', error);
      
      let errorMessage = 'Upload failed';
      
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Upload timeout - file too large or connection slow';
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data.message || error.response.data.error || 'Invalid file';
      } else if (error.response?.status === 413) {
        errorMessage = 'File too large for server';
      } else if (error.response?.status === 401) {
        errorMessage = 'Authentication required';
      }
      
      // Mark current uploading file as failed
      setFiles(prev => prev.map(f => 
        f.status === 'uploading' ? { ...f, status: 'error', error: errorMessage } : f
      ));
    } finally {
      setIsUploading(false);
    }
  };

  // Close modal and reset
  const handleClose = () => {
    if (!isUploading) {
      setFiles([]);
      onClose();
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="upload-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <motion.div
        key="upload-modal"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl max-h-[90vh] bg-neutral-900 rounded-2xl shadow-2xl z-[9999] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-700">
          <div>
            <h2 className="text-xl font-semibold text-white">Upload Files to Drive</h2>
            <p className="text-sm text-gray-400 mt-1">
              Drag files here or click to browse • Max {maxFiles} files, {maxFileSize}MB each
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={isUploading}
            className="p-2 hover:bg-neutral-700 rounded-lg transition-colors disabled:opacity-50"
          >
            <FaTimes size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* Drag & Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`
              border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 mb-6
              ${isDragOver 
                ? 'border-green-500 bg-green-500/10' 
                : 'border-neutral-600 hover:border-neutral-500 hover:bg-neutral-800/50'
              }
            `}
          >
            <FaCloudUploadAlt size={48} className={`mx-auto mb-4 ${isDragOver ? 'text-green-400' : 'text-gray-400'}`} />
            <p className="text-lg text-white mb-2">
              {isDragOver ? 'Drop files here' : 'Drag & drop files here'}
            </p>
            <p className="text-sm text-gray-400 mb-4">
              or <span className="text-green-400 font-medium">browse from device</span>
            </p>
            <p className="text-xs text-gray-500">
              Supports: Images, Videos (MOV, MP4, AVI), Documents, Audio, Archives
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Maximum file size: {maxFileSize}MB • Large files may take longer to upload
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedTypes.join(',')}
            onChange={handleFileInputChange}
            className="hidden"
          />

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center justify-between">
                Selected Files ({files.length})
                <span className="text-xs text-gray-500">
                  {files.filter(f => f.status === 'success').length} uploaded
                </span>
              </h3>
              
              {files.map((file) => {
                const IconComponent = getFileIcon(file.file);
                const iconColor = getFileIconColor(file.file);
                
                return (
                  <div key={file.id} className="flex items-center gap-3 p-4 bg-neutral-800 rounded-lg">
                    {/* File Icon/Preview */}
                    <div className="flex-shrink-0">
                      {file.preview ? (
                        <img 
                          src={file.preview} 
                          alt="Preview" 
                          className="w-12 h-12 object-cover rounded"
                        />
                      ) : (
                        <IconComponent size={24} className={iconColor} />
                      )}
                    </div>

                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {file.file.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatFileSize(file.file.size)} • {file.file.type || 'Unknown type'}
                      </p>
                      
                      {/* Progress Bar */}
                      {file.status === 'uploading' && (
                        <div className="mt-2">
                          <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span>Uploading...</span>
                            <span>{file.progress}%</span>
                          </div>
                          <div className="w-full bg-neutral-700 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${file.progress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Error Message */}
                      {file.error && (
                        <p className="text-xs text-red-400 mt-2 flex items-center gap-1">
                          <FaExclamationTriangle size={12} />
                          {file.error}
                        </p>
                      )}

                      {/* Success Message */}
                      {file.status === 'success' && (
                        <p className="text-xs text-green-400 mt-2 flex items-center gap-1">
                          <FaCheckCircle size={12} />
                          Upload completed successfully
                        </p>
                      )}
                    </div>

                    {/* Status/Action */}
                    <div className="flex-shrink-0">
                      {file.status === 'success' && (
                        <FaCheckCircle size={20} className="text-green-500" />
                      )}
                      {file.status === 'error' && (
                        <FaExclamationTriangle size={20} className="text-red-500" />
                      )}
                      {file.status === 'uploading' && (
                        <div className="animate-spin w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full" />
                      )}
                      {file.status === 'pending' && (
                        <button
                          onClick={() => removeFile(file.id)}
                          className="p-1 hover:bg-neutral-700 rounded transition-colors"
                        >
                          <FaTrash size={16} className="text-gray-400 hover:text-red-400" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-neutral-700">
          <div className="text-sm text-gray-400">
            {files.length > 0 ? (
              <>
                {files.length} file{files.length !== 1 ? 's' : ''} selected
                {files.filter(f => f.status === 'success').length > 0 && (
                  <span className="text-green-400 ml-2">
                    • {files.filter(f => f.status === 'success').length} uploaded
                  </span>
                )}
                {files.filter(f => f.status === 'error').length > 0 && (
                  <span className="text-red-400 ml-2">
                    • {files.filter(f => f.status === 'error').length} failed
                  </span>
                )}
              </>
            ) : (
              'No files selected'
            )}
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              disabled={isUploading}
            >
              {isUploading ? 'Uploading...' : 'Cancel'}
            </button>
            <button
              onClick={uploadFiles}
              disabled={files.length === 0 || isUploading || files.every(f => f.status === 'error')}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:text-gray-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              {isUploading && (
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              )}
              {isUploading ? 'Uploading...' : `Upload ${files.filter(f => f.status !== 'error').length} Files`}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

export default FileUploadModal;
 