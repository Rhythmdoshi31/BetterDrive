// This is for the 3 dots Modal

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { DotsThreeVerticalIcon, InfoIcon, StarIcon, TrashIcon, ArrowCounterClockwiseIcon, XIcon } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "motion/react";
import { useFloating, offset, flip, shift, autoUpdate } from "@floating-ui/react";
import type { DriveFile } from "../types";

interface FileActionsPopupProps {
  file: DriveFile;
  isTrashView?: boolean;
  onPreview?: (file: DriveFile) => void;
  onStar?: (fileId: string, currentStarred: boolean) => void;
  onDelete?: (fileId: string) => void;
  onRestore?: (fileId: string) => void;
  onFileInfo?: (file: DriveFile) => void;
  starringFile?: string | null;
  deletingFile?: string | null;
}

const FileActionsPopup: React.FC<FileActionsPopupProps> = ({
  file,
  isTrashView = false,
  onPreview,
  onStar,
  onDelete,
  onRestore,
  onFileInfo,
  starringFile = null,
  deletingFile = null,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const { x, y, strategy, refs } = useFloating({
    placement: "bottom-end",
    middleware: [offset(8), flip(), shift()],
    whileElementsMounted: autoUpdate,
  });

  const isHTMLElement = (element: any): element is HTMLElement => {
    return element && typeof element === "object" && "contains" in element;
  };

  const handleDotsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOpen) {
      setIsOpen(false);
      return;
    }
    refs.setReference(e.currentTarget as HTMLElement);
    setIsOpen(true);
  };

  const closePopup = () => setIsOpen(false);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        isOpen &&
        refs.floating.current &&
        isHTMLElement(refs.floating.current) &&
        !refs.floating.current.contains(target) &&
        refs.reference.current &&
        isHTMLElement(refs.reference.current) &&
        !refs.reference.current.contains(target)
      ) {
        closePopup();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, refs]);

  const isFolder = file.mimeType === "application/vnd.google-apps.folder";

  return (
    <>
      <button
        onClick={handleDotsClick}
        className="p-2 hover:bg-neutral-700 rounded-full transition-colors"
      >
        <DotsThreeVerticalIcon size={16} className="text-gray-400" />
      </button>

      {isOpen &&
        createPortal(
          <AnimatePresence>
            <motion.div
              key="file-popup-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-xxs z-[9998]"
              onClick={closePopup}
            />

            <motion.div
              key={`file-popup-${file.id}`}
              ref={refs.setFloating}
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15 }}
              className="w-64 bg-neutral-900/95 backdrop-blur-md border border-neutral-600/50 rounded-xl shadow-2xl z-[9999]"
              style={{ position: strategy, top: y ?? 0, left: x ?? 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-4 border-b border-neutral-700/50">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-white truncate pr-2 text-sm">
                    {file.name.length > 20 ? file.name.slice(0, 20) + "..." : file.name}
                  </h3>
                  <button
                    onClick={closePopup}
                    className="p-1.5 hover:bg-neutral-700/50 rounded-lg transition-colors"
                  >
                    <XIcon size={14} className="text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                {/* File Info */}
                <div className="space-y-2.5 text-sm text-gray-300">
                  <div>
                    Size: <span className="text-white font-medium">{file.size || "--"}</span>
                  </div>
                  <div>
                    Modified: <span className="text-white font-medium">{file.modifiedTime || "--"}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="border-t border-neutral-700/50 pt-3 space-y-1">
                  {/* Preview - only for non-folders */}
                  {!isFolder && onPreview && (
                    <button
                      onClick={() => {
                        onPreview(file);
                        closePopup();
                      }}
                      className="w-full flex items-center gap-3 p-3 hover:bg-neutral-800/50 rounded-lg transition-colors"
                    >
                      <InfoIcon size={18} className="text-blue-400" />
                      <span className="text-sm text-gray-200 font-medium">Preview</span>
                    </button>
                  )}

                  {/* Star - not in trash */}
                  {!isTrashView && onStar && (
                    <button
                      onClick={() => {
                        onStar(file.id, file.starred);
                        closePopup();
                      }}
                      disabled={starringFile === file.id}
                      className="w-full flex items-center gap-3 p-3 hover:bg-neutral-800/50 rounded-lg transition-colors"
                    >
                      {starringFile === file.id ? (
                        <div className="animate-spin w-4 h-4 border border-yellow-500 border-t-transparent rounded-full" />
                      ) : (
                        <StarIcon
                          size={18}
                          weight={file.starred ? "fill" : "regular"}
                          className={file.starred ? "text-yellow-500" : "text-gray-400"}
                        />
                      )}
                      <span className="text-sm text-gray-200 font-medium">
                        {file.starred ? "Remove from starred" : "Add to starred"}
                      </span>
                    </button>
                  )}

                  {/* Delete/Restore */}
                  {isTrashView && onRestore ? (
                    <button
                      onClick={() => {
                        onRestore(file.id);
                        closePopup();
                      }}
                      disabled={deletingFile === file.id}
                      className="w-full flex items-center gap-3 p-3 hover:bg-neutral-800/50 rounded-lg transition-colors"
                    >
                      {deletingFile === file.id ? (
                        <div className="animate-spin w-4 h-4 border border-green-500 border-t-transparent rounded-full" />
                      ) : (
                        <ArrowCounterClockwiseIcon size={18} className="text-green-500" />
                      )}
                      <span className="text-sm text-gray-200 font-medium">Restore file</span>
                    </button>
                  ) : (
                    onDelete && (
                      <button
                        onClick={() => {
                          onDelete(file.id);
                          closePopup();
                        }}
                        disabled={deletingFile === file.id}
                        className="w-full flex items-center gap-3 p-3 hover:bg-neutral-800/50 rounded-lg transition-colors"
                      >
                        {deletingFile === file.id ? (
                          <div className="animate-spin w-4 h-4 border border-red-500 border-t-transparent rounded-full" />
                        ) : (
                          <TrashIcon size={18} className="text-red-500" />
                        )}
                        <span className="text-sm text-gray-200 font-medium">Move to trash</span>
                      </button>
                    )
                  )}

                  {/* File Info */}
                  {onFileInfo && (
                    <button
                      onClick={() => {
                        onFileInfo(file);
                        closePopup();
                      }}
                      className="w-full flex items-center gap-3 p-3 hover:bg-neutral-800/50 rounded-lg transition-colors"
                    >
                      <InfoIcon size={18} className="text-gray-400" />
                      <span className="text-sm text-gray-200 font-medium">File info</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>,
          document.body
        )}
    </>
  );
};

export default FileActionsPopup;
