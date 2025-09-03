import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { FolderPlusIcon, XIcon } from '@phosphor-icons/react';
import axios from 'axios';

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFolderCreated?: (folderName: string) => void;
}

const CreateFolderModal: React.FC<CreateFolderModalProps> = ({
  isOpen,
  onClose,
  onFolderCreated
}) => {
  const [folderName, setFolderName] = useState('');
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setFolderName('');
      setError('');
      setIsCreating(false);
      // Focus input after a short delay
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    }
  }, [isOpen]);

  // Validate folder name
  const validateName = (name: string): boolean => {
    if (!name || name.trim() === '') {
      setError('Folder name cannot be empty');
      return false;
    }
    if (name.length > 100) {
      setError('Folder name is too long');
      return false;
    }
    if (/[<>:"/\\|?*]/.test(name)) {
      setError('Folder name contains invalid characters');
      return false;
    }
    setError('');
    return true;
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCreate();
    }
    if (e.key === 'Escape') {
      onClose();
    }
  };

  // Create folder
  const handleCreate = async () => {
    if (!validateName(folderName)) return;
    
    setIsCreating(true);
    try {
      const response = await axios.post('/api/google/folders', {
        name: folderName.trim()
      });

      if (response.data.success) {
        console.log('Folder created successfully:', response.data);
        onFolderCreated?.(folderName.trim());
        onClose();
      }
    } catch (error: any) {
      console.error('Error creating folder:', error);
      if (error.response?.status === 400) {
        setError(error.response.data.message || 'Failed to create folder');
      } else {
        setError('Failed to create folder. Please try again.');
      }
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="folder-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998] flex items-center justify-center"
        onClick={onClose}
      >
        {/* Modal */}
        <motion.div
          key="folder-modal"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.2 }}
          className="bg-neutral-900/95 backdrop-blur-md border border-neutral-600/50 rounded-2xl shadow-2xl w-full max-w-md mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-neutral-700/50">
            <div className="flex items-center gap-3">
              <FolderPlusIcon size={24} className="text-blue-500" />
              <h2 className="text-xl font-semibold text-white">Create New Folder</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-700 rounded-lg transition-colors"
            >
              <XIcon size={20} className="text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="folderName" className="block text-sm font-medium text-gray-300 mb-2">
                  Folder Name
                </label>
                <input
                  ref={inputRef}
                  id="folderName"
                  type="text"
                  value={folderName}
                  onChange={(e) => {
                    setFolderName(e.target.value);
                    if (error) setError(''); // Clear error on typing
                  }}
                  onKeyDown={handleKeyPress}
                  placeholder="Enter folder name"
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  disabled={isCreating}
                />
                {error && (
                  <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                    {error}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-neutral-700/50">
            <button
              onClick={onClose}
              disabled={isCreating}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={isCreating || !folderName.trim() || !!error}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              {isCreating && (
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              )}
              {isCreating ? 'Creating...' : 'Create Folder'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

export default CreateFolderModal;
