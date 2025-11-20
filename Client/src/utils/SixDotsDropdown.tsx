import React from "react";
import { AnimatePresence, motion } from "motion/react";
import { createPortal } from "react-dom";
import {
  InfoIcon,
  FolderPlusIcon,
  UploadIcon,
} from "@phosphor-icons/react";

interface SixDotsDropdownProps {
  isOpen: boolean;
  floatingRef: (node: HTMLElement | null) => void;
  strategy: any;
  x: number | null;
  y: number | null;
  onClickOutside: () => void;
  onUploadFiles: () => void;
  onCreateFolder: () => void;
  onSettings?: () => void;
  closeDropdown: () => void;
}

const SixDotsDropdown: React.FC<SixDotsDropdownProps> = ({
  isOpen,
  floatingRef,
  strategy,
  x,
  y,
  onClickOutside,
  onUploadFiles,
  onCreateFolder,
  onSettings,
  closeDropdown,
}) => {
  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        key="header-dropdown-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-transparent z-[9997]"
        onClick={onClickOutside}
      />
      <motion.div
        key="header-dropdown"
        ref={floatingRef}
        initial={{ opacity: 0, scale: 0.95, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        transition={{ duration: 0.15 }}
        className="w-56 bg-neutral-900/95 backdrop-blur-md border border-neutral-600/50 rounded-xl shadow-2xl z-[9999]"
        style={{
          position: strategy,
          top: y ?? 0,
          left: x ?? 0,
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className="p-2 space-y-1">
          <button
            onClick={onUploadFiles}
            className="w-full flex items-center gap-3 p-3 hover:bg-neutral-800/50 rounded-lg transition-colors duration-200"
          >
            <UploadIcon size={18} className="text-green-500 flex-shrink-0" />
            <span className="text-sm text-gray-200 font-medium">
              Upload Files
            </span>
          </button>
          
          <button
            onClick={onCreateFolder}
            className="w-full flex items-center gap-3 p-3 hover:bg-neutral-800/50 rounded-lg transition-colors duration-200"
          >
            <FolderPlusIcon size={18} className="text-blue-500 flex-shrink-0" />
            <span className="text-sm text-gray-200 font-medium">
              New Folder
            </span>
          </button>

          <div className="h-px bg-neutral-700/50 my-2"></div>

          <button
            onClick={onSettings ? onSettings : closeDropdown}
            className="w-full flex items-center gap-3 p-3 hover:bg-neutral-800/50 rounded-lg transition-colors duration-200"
          >
            <InfoIcon size={18} className="text-gray-400 flex-shrink-0" />
            <span className="text-sm text-gray-200 font-medium">
              Settings
            </span>
          </button>
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

export default SixDotsDropdown;
