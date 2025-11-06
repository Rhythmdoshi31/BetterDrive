// This is for the 6 dots Modal

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { DotsSixIcon, UploadIcon, FolderPlusIcon, InfoIcon } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "motion/react";
import { useFloating, offset, flip, shift, autoUpdate } from "@floating-ui/react";

interface ActionsDropdownProps {
  onUploadFiles?: () => void;
  onCreateFolder?: () => void;
  onSettings?: () => void;
}

const ActionsDropdown: React.FC<ActionsDropdownProps> = ({
  onUploadFiles,
  onCreateFolder,
  onSettings,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const { x, y, strategy, refs } = useFloating({
    placement: "bottom-start",
    middleware: [offset(8), flip(), shift()],
    whileElementsMounted: autoUpdate,
  });

  const isHTMLElement = (element: any): element is HTMLElement => {
    return element && typeof element === "object" && "contains" in element;
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation(); // By this the event doesn't travel up to the parents (no event bubbling)

    if (isOpen) { // For Closing the dropdown
      setIsOpen(false);
      return;
    }
    
    refs.setReference(e.currentTarget as HTMLElement);
    setIsOpen(true);
  };

  const closeDropdown = () => setIsOpen(false);

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
        closeDropdown();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, refs]);

  return (
    <>
      <button onClick={handleToggle} className="p-2 hover:bg-neutral-700 rounded-lg transition-colors duration-200">
        <DotsSixIcon size={32} className="text-white" />
      </button>

      {isOpen &&
        createPortal(
          <AnimatePresence>
            <motion.div
              key="actions-dropdown-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-transparent z-[9997]"
              onClick={closeDropdown}
            />

            <motion.div
              key="actions-dropdown"
              ref={refs.setFloating}
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15 }}
              className="w-56 bg-neutral-900/95 backdrop-blur-md border border-neutral-600/50 rounded-xl shadow-2xl z-[9999]"
              style={{ position: strategy, top: y ?? 0, left: x ?? 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-2 space-y-1">
                {onUploadFiles && (
                  <button
                    onClick={() => {
                      onUploadFiles();
                      closeDropdown();
                    }}
                    className="w-full flex items-center gap-3 p-3 hover:bg-neutral-800/50 rounded-lg transition-colors"
                  >
                    <UploadIcon size={18} className="text-green-500" />
                    <span className="text-sm text-gray-200 font-medium">Upload Files</span>
                  </button>
                )}

                {onCreateFolder && (
                  <button
                    onClick={() => {
                      onCreateFolder();
                      closeDropdown();
                    }}
                    className="w-full flex items-center gap-3 p-3 hover:bg-neutral-800/50 rounded-lg transition-colors"
                  >
                    <FolderPlusIcon size={18} className="text-blue-500" />
                    <span className="text-sm text-gray-200 font-medium">New Folder</span>
                  </button>
                )}

                {onSettings && (
                  <>
                    <div className="h-px bg-neutral-700/50 my-2"></div>
                    <button
                      onClick={() => {
                        onSettings();
                        closeDropdown();
                      }}
                      className="w-full flex items-center gap-3 p-3 hover:bg-neutral-800/50 rounded-lg transition-colors"
                    >
                      <InfoIcon size={18} className="text-gray-400" />
                      <span className="text-sm text-gray-200 font-medium">Settings</span>
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </AnimatePresence>,
          document.body
        )}
    </>
  );
};

export default ActionsDropdown;
