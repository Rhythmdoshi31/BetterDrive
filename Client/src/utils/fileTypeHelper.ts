import { 
  FilePdfIcon, 
  FileImageIcon, 
  FileVideoIcon,
  FileAudioIcon,
  FileTextIcon,
  FileZipIcon,
  FileIcon,
  FolderIcon
} from "@phosphor-icons/react";

export const getFileTypeStyle = (mimeType: string) => {
  // PDF Files
  if (mimeType === 'application/pdf') {
    return {
      stripColor: '#DC2626', // Red
      iconColor: '#DC2626',
      IconComponent: FilePdfIcon
    };
  }
  
  // Image Files
  if (mimeType.startsWith('image/')) {
    return {
      stripColor: '#16A34A', // Green
      iconColor: '#16A34A',
      IconComponent: FileImageIcon
    };
  }
  
  // Video Files
  if (mimeType.startsWith('video/')) {
    return {
      stripColor: '#2563EB', // Blue
      iconColor: '#2563EB',
      IconComponent: FileVideoIcon
    };
  }
  
  // Audio Files
  if (mimeType.startsWith('audio/')) {
    return {
      stripColor: '#7C3AED', // Purple
      iconColor: '#7C3AED',
      IconComponent: FileAudioIcon
    };
  }
  
  // Text/Document Files
  if (mimeType.includes('text') || mimeType.includes('document')) {
    return {
      stripColor: '#0891B2', // Cyan
      iconColor: '#0891B2',
      IconComponent: FileTextIcon
    };
  }
  
  // Archive Files
  if (mimeType.includes('zip') || mimeType.includes('compressed')) {
    return {
      stripColor: '#EA580C', // Orange
      iconColor: '#EA580C',
      IconComponent: FileZipIcon
    };
  }
  
  // Folders
  if (mimeType === 'application/vnd.google-apps.folder') {
    return {
      stripColor: '#0EA5E9', // Sky Blue
      iconColor: '#0EA5E9',
      IconComponent: FolderIcon
    };
  }
  
  // Default/Unknown
  return {
    stripColor: '#6B7280', // Gray
    iconColor: '#6B7280',
    IconComponent: FileIcon
  };
};
