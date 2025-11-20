// Create: components/FilePreviewModal.tsx
import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { XIcon } from "@phosphor-icons/react";
import type { DriveFile } from "../types";

interface FilePreviewModalProps {
  isOpen: boolean;
  file: DriveFile | null;
  onClose: () => void;
}

const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  isOpen,
  file,
  onClose,
}) => {
  if (!isOpen || !file) return null;

  // Extract file ID from webViewLink
  const getFileId = (webViewLink: string) => {
    const match = webViewLink.match(/\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : null;
  };

  const fileId = getFileId(file.webViewLink);
  const previewUrl = fileId
    ? `https://drive.google.com/file/d/${fileId}/preview`
    : null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center p-4"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gray-200 dark:bg-neutral-900 rounded-lg shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {file.name}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <XIcon size={20} className="text-gray-600" />
                </button>
              </div>

              {/* Preview Content */}
              <div className="flex-1 p-4">
                {previewUrl ? (
                  <iframe
                    src={previewUrl}
                    className="w-full h-full border-none rounded-lg"
                    title={`Preview of ${file.name}`}
                    allow="autoplay; fullscreen; encrypted-media"
                    referrerPolicy="strict-origin-when-cross-origin"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <p className="text-gray-500 mb-4">
                        Preview not available for this file type
                      </p>
                      <button
                        onClick={() => window.open(file.webViewLink, "_blank")}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Open in Google Drive
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default FilePreviewModal;
