import React, { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import { createPortal } from "react-dom";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import type { AxiosResponse } from "axios";
import type { DriveFile } from "../types";
import { getFileTypeStyle } from "../utils/fileTypeHelper";
import HorizontalStorageBar from "./StorageBar";
import FilePreviewModal from "./FilePreviewModal";
import {
  DotsSixIcon,
  StarIcon,
  DotsThreeVerticalIcon,
  XIcon,
  InfoIcon,
  ClockIcon,
  HardDriveIcon,
  TrashIcon,
  ArrowCounterClockwiseIcon,
  FolderPlusIcon,
  UploadIcon,
  FolderIcon,
  CaretRightIcon,
  HouseIcon,
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "motion/react";
import {
  useFloating,
  offset,
  flip,
  shift,
  autoUpdate,
} from "@floating-ui/react";
import FileUpload from "./FileUpload";
import CreateFolderModal from "./CreateFolderModal";

// Extended interfaces for folder navigation
interface FolderMetadata {
  id: string;
  name: string;
  parents?: string[];
}

interface StorageQuota {
  used: number;
  usedInDrive: number;
  usedInTrash: number;
  limit: number;
}

interface FileListViewProps {
  title: string;
  apiEndpoint: string;
  queryParams?: Record<string, string>;
  showStorage?: boolean;
  storage?: StorageQuota | null;
  showFileCount?: boolean;
  headerSlot?: React.ReactNode;
  emptyStateMessage?: {
    title: string;
    subtitle: string;
  };
  enableFolderNavigation?: boolean;
}

interface ApiResponse {
  allFiles: DriveFile[];
  totalCount: number;
  hasNextPage: boolean;
  nextPageToken?: string;
  currentFolder?: FolderMetadata | null;
  breadcrumbPath?: FolderMetadata[];
}

const FileListView: React.FC<FileListViewProps> = ({
  title,
  apiEndpoint,
  queryParams = {},
  showStorage = false,
  storage = null,
  showFileCount = true,
  headerSlot,
  emptyStateMessage = {
    title: "No files found",
    subtitle: "Files will appear here when available",
  },
  enableFolderNavigation = false,
}) => {
  // ============ TYPE GUARD FUNCTION ============
  const isHTMLElement = (element: any): element is HTMLElement => {
    return (
      element &&
      typeof element === "object" &&
      "contains" in element &&
      typeof element.contains === "function"
    );
  };

  // ============ ROUTING HOOKS ============
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isTrashView = location.pathname === "/trash";

  // Get folderId from URL params (for /folders?folderId=xyz)
  const folderIdFromURL = searchParams.get("folderId");

  // ============ STATE VARIABLES ============
  const [previewFile, setPreviewFile] = useState<DriveFile | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const [allFiles, setAllFiles] = useState<DriveFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [starringFile, setStarringFile] = useState<string | null>(null);
  const [deletingFile, setDeletingFile] = useState<string | null>(null);

  // Floating UI popup state
  const [openFilePopup, setOpenFilePopup] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Modal states
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);

  // Folder navigation state
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [currentFolder, setCurrentFolder] = useState<FolderMetadata | null>(
    null
  );
  const [breadcrumbPath, setBreadcrumbPath] = useState<FolderMetadata[]>([]);

  // ============ FLOATING UI HOOKS ============
  const {
    x: filePopupX,
    y: filePopupY,
    strategy: filePopupStrategy,
    refs: filePopupRefs,
  } = useFloating({
    placement: "bottom-end",
    middleware: [offset(8), flip(), shift()],
    whileElementsMounted: autoUpdate,
  });

  const {
    x: dropdownX,
    y: dropdownY,
    strategy: dropdownStrategy,
    refs: dropdownRefs,
  } = useFloating({
    placement: "bottom-start",
    middleware: [offset(8), flip(), shift()],
    whileElementsMounted: autoUpdate,
  });

  // ============ HELPER FUNCTIONS ============
  const openFilePreview = (file: DriveFile) => {
    setPreviewFile(file);
    setIsPreviewOpen(true);
  };

  const closeFilePreview = () => {
    setIsPreviewOpen(false);
    setPreviewFile(null);
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return "--";
    const kb = bytes / 1024;
    const mb = kb / 1024;
    if (mb >= 1) return `${mb.toFixed(1)} MB`;
    if (kb >= 1) return `${kb.toFixed(1)} KB`;
    return `${bytes} B`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "--";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getDisplayTitle = () => {
    if (currentFolder) {
      return currentFolder.name;
    }
    return title;
  };

  // ============ FOLDER NAVIGATION - ALWAYS NAVIGATE TO /folders ============
  const handleFolderClick = (folder: DriveFile) => {
    if (folder.mimeType === "application/vnd.google-apps.folder") {
      // ALWAYS navigate to /folders route for folder navigation
      console.log("handelFolderClick on line 208 chala");
      navigate(`/folders?folderId=${folder.id}`);
    }
  };

  // ============ UPDATED BREADCRUMB COMPONENT ============
  const Breadcrumb: React.FC = () => {
    // Only show breadcrumb if we have navigation
    if (!currentFolder && breadcrumbPath.length === 0) {
      return null;
    }

    // FILTER OUT "MyDrive" or root folder from breadcrumb path
    const filteredBreadcrumb = breadcrumbPath.filter((folder, idx) => {
      // Skip the first folder if it's "MyDrive", "All Files", or other root folder names
      if (
        idx === 0 &&
        (folder.name.toLowerCase().includes("mydrive") ||
          folder.name.toLowerCase().includes("all files") ||
          folder.name.toLowerCase().includes("drive") ||
          folder.name === "My Drive")
      ) {
        return false; // Don't include this folder in breadcrumb
      }
      return true; // Include all other folders
    });

    return (
      <nav className="flex items-center space-x-2 mb-4 text-sm">
        <button
          onClick={() => navigate("/dashboard")} // Home goes to Dashboard
          className="flex items-center gap-1 px-2 py-1 rounded hover:bg-neutral-700 transition-colors text-gray-300 hover:text-white"
        >
          <HouseIcon size={16} />
          <span>Home</span>
        </button>

        {/* Render FILTERED breadcrumb path */}
        {filteredBreadcrumb.map((folder, index) => (
          <React.Fragment key={folder.id}>
            <CaretRightIcon size={14} className="text-gray-500" />
            <button
              onClick={() => navigate(`/folders?folderId=${folder.id}`)}
              className="px-2 py-1 rounded hover:bg-neutral-700 transition-colors text-gray-300 hover:text-white truncate max-w-[150px]"
            >
              {folder.name}
            </button>
          </React.Fragment>
        ))}

        {currentFolder && (
          <>
            <CaretRightIcon size={14} className="text-gray-500" />
            <span className="px-2 py-1 text-white font-medium truncate max-w-[150px]">
              {currentFolder.name}
            </span>
          </>
        )}
      </nav>
    );
  };

  // ============ POPUP HANDLERS WITH FLOATING UI ============
  const handleFileDotsClick = (e: React.MouseEvent, fileId: string) => {
    e.stopPropagation();

    if (openFilePopup === fileId) {
      setOpenFilePopup(null);
      return;
    }

    filePopupRefs.setReference(e.currentTarget as HTMLElement);
    setOpenFilePopup(fileId);
  };

  const closeFilePopup = () => {
    setOpenFilePopup(null);
  };

  const handleDropdownClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isDropdownOpen) {
      setIsDropdownOpen(false);
      return;
    }

    dropdownRefs.setReference(e.currentTarget as HTMLElement);
    setIsDropdownOpen(true);
  };

  const closeDropdown = () => {
    setIsDropdownOpen(false);
  };

  // Modal action handlers
  const handleUploadFiles = () => {
    closeDropdown();
    setIsUploadModalOpen(true);
  };

  const handleCreateFolder = () => {
    closeDropdown();
    setIsFolderModalOpen(true);
  };

  const handleUploadComplete = (files: File[]) => {
    console.log("Files uploaded successfully:", files);
    fetchFiles(undefined, currentFolderId);
    setIsUploadModalOpen(false);
  };

  const handleFolderCreated = (folderName: string) => {
    console.log("Folder created successfully:", folderName);
    fetchFiles(undefined, currentFolderId);
  };

  // ============ FIXED CLOSE ON OUTSIDE CLICK ============
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;

      // Close file popup if clicking outside
      if (
        openFilePopup &&
        filePopupRefs.floating.current &&
        isHTMLElement(filePopupRefs.floating.current) &&
        !filePopupRefs.floating.current.contains(target) &&
        filePopupRefs.reference.current &&
        isHTMLElement(filePopupRefs.reference.current) &&
        !filePopupRefs.reference.current.contains(target)
      ) {
        closeFilePopup();
      }

      // Close dropdown if clicking outside
      if (
        isDropdownOpen &&
        dropdownRefs.floating.current &&
        isHTMLElement(dropdownRefs.floating.current) &&
        !dropdownRefs.floating.current.contains(target) &&
        dropdownRefs.reference.current &&
        isHTMLElement(dropdownRefs.reference.current) &&
        !dropdownRefs.reference.current.contains(target)
      ) {
        closeDropdown();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openFilePopup, isDropdownOpen, filePopupRefs, dropdownRefs]);

  // ============ STAR/UNSTAR FUNCTIONALITY ============
  const toggleStar = async (fileId: string, currentStarred: boolean) => {
    try {
      setStarringFile(fileId);

      const response = await axios.patch(
        `/api/google/files/star/${fileId}?star=${!currentStarred}`,
        {
          starred: !currentStarred,
        }
      );

      if (response.data.success) {
        setAllFiles((prevFiles) =>
          prevFiles.map((file) =>
            file.id === fileId ? { ...file, starred: !currentStarred } : file
          )
        );
      }
    } catch (error) {
      console.error("Error toggling star:", error);
    } finally {
      setStarringFile(null);
    }
  };

  // ============ DELETE/RESTORE FUNCTIONALITY ============
  const toggleDelete = async (fileId: string) => {
    try {
      setDeletingFile(fileId);

      const endpoint = isTrashView
        ? `/api/google/files/restore/${fileId}`
        : `/api/google/files/delete/${fileId}`;

      const response = await axios.patch(endpoint);

      if (response.data.success) {
        setAllFiles((prevFiles) =>
          prevFiles.filter((file) => file.id !== fileId)
        );

        console.log(
          isTrashView ? "File restored successfully" : "File moved to trash"
        );
      }
    } catch (error) {
      console.error("Error toggling delete:", error);
    } finally {
      setDeletingFile(null);
    }
  };

  // ============ DUPLICATE REMOVAL FUNCTION ============
  const removeDuplicateFiles = (files: DriveFile[]): DriveFile[] => {
    const seenIds = new Set<string>();
    return files.filter((file) => {
      if (seenIds.has(file.id)) {
        return false;
      }
      seenIds.add(file.id);
      return true;
    });
  };

  // ============ MAIN FETCH FILES FUNCTION ============
  const fetchFiles = async (
    pageToken?: string,
    folderId?: string | null
  ): Promise<void> => {
    try {
      setError(null);

      const params = new URLSearchParams({
        limit: "35",
        ...queryParams,
        ...(pageToken && { pageToken }),
        ...(folderId && { folderId }),
      });

      const response: AxiosResponse<ApiResponse> = await axios.get(
        `${apiEndpoint}?${params.toString()}`
      );

      if (!pageToken) {
        const uniqueFiles = removeDuplicateFiles(response.data.allFiles || []);
        setAllFiles(uniqueFiles);
        setIsLoading(false);

        setCurrentFolder(response.data.currentFolder || null);
        setBreadcrumbPath(response.data.breadcrumbPath || []);
      } else {
        setAllFiles((prevFiles) => {
          const existingIds = new Set(prevFiles.map((f) => f.id));
          const newFiles = (response.data.allFiles || []).filter(
            (file) => !existingIds.has(file.id)
          );
          return [...prevFiles, ...newFiles];
        });
      }

      setHasNextPage(response.data.hasNextPage || false);
      setNextPageToken(response.data.nextPageToken || null);
    } catch (error: unknown) {
      console.error("Error fetching files:", error);
      setError("Failed to fetch files");
    } finally {
      setIsLoadingMore(false);
      if (!pageToken) setIsLoading(false);
    }
  };

  // ============ FETCH MORE FILES (PAGINATION) ============
  const fetchMoreFiles = useCallback(() => {
    if (!hasNextPage || isLoadingMore) return;
    setIsLoadingMore(true);
    fetchFiles(nextPageToken || undefined, currentFolderId);
  }, [hasNextPage, isLoadingMore, nextPageToken, currentFolderId]);

  // ============ INFINITE SCROLL EFFECT ============
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
          document.documentElement.offsetHeight - 1000 &&
        !isLoadingMore &&
        hasNextPage
      ) {
        fetchMoreFiles();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [fetchMoreFiles, isLoadingMore, hasNextPage]);

  // ============ UPDATED LOAD EFFECT FOR URL FOLDER NAVIGATION ============
  useEffect(() => {
    if (enableFolderNavigation) {
      // Use folderId from URL params
      setCurrentFolderId(folderIdFromURL);
      fetchFiles(undefined, folderIdFromURL);
    } else {
      // Legacy behavior
      fetchFiles(undefined, currentFolderId);
    }
  }, [
    apiEndpoint,
    JSON.stringify(queryParams),
    folderIdFromURL,
    currentFolderId,
    enableFolderNavigation,
  ]);

  // ============ LOADING & ERROR STATES ============
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-400">
        <div className="text-lg mb-2">Error</div>
        <div className="text-sm">{error}</div>
      </div>
    );
  }

  // ============ MAIN RENDER ============
  return (
    <div
      className={`${location.pathname !== "/dashboard" ? "mt-2" : "mt-16"} p-4`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-antique-olive mt-2 text-white md:text-xl lg:text-2xl tracking-wide">
          {getDisplayTitle()} {showFileCount && `(${allFiles.length})`}
        </h1>
        <div className="flex items-center justify-center gap-4">
          {showStorage && storage && <HorizontalStorageBar storage={storage} />}
          {headerSlot}

          <button
            onClick={handleDropdownClick}
            className="p-2 hover:bg-neutral-700 rounded-lg transition-colors duration-200"
          >
            <DotsSixIcon size={32} className="text-white" />
          </button>
        </div>
      </div>

      {/* Breadcrumb Navigation */}
      <Breadcrumb />

      {/* Column Headers */}
      <div className="grid grid-cols-[70%_30%] md:grid-cols-[45%_20%_15%_15%] lg:grid-cols-[35%_20%_15%_15%_15%] gap-4 px-4 py-2 text-gray-400 uppercase text-xs font-semibold tracking-wider border-b border-neutral-800 mb-3">
        <div className="flex items-center gap-2">
          <span>Name</span>
        </div>
        <div className="hidden md:block text-center">Owner</div>
        <div className="hidden md:block text-center">Size</div>
        <div className="hidden lg:block text-center">Modified</div>
        <div className="text-center">Actions</div>
      </div>

      {/* File Rows */}
      {allFiles.length > 0 ? (
        allFiles.map((file) => {
          const { stripColor, iconColor, IconComponent } = getFileTypeStyle(
            file.mimeType
          );
          const isFolder =
            file.mimeType === "application/vnd.google-apps.folder";

          return (
            <div
              key={file.id}
              className={`grid grid-cols-[70%_30%] md:grid-cols-[45%_20%_15%_15%] lg:grid-cols-[35%_20%_15%_15%_15%] gap-4 h-12 text-white w-full rounded-lg px-4 mb-3 items-center border-[1px] border-neutral-800 bg-[#18181B] hover:bg-neutral-800 hover:scale-[1.008] transition duration-100 cursor-pointer`}
              onClick={() => {
                if (isFolder) {
                  handleFolderClick(file);
                } else {
                  openFilePreview(file);
                }
              }}
            >
              {/* Name + Icon */}
              <div className="flex items-center gap-2">
                {isFolder ? (
                  <FolderIcon
                    size={20}
                    weight="fill"
                    className="text-blue-400"
                  />
                ) : (
                  <IconComponent
                    size={20}
                    weight="fill"
                    style={{ color: iconColor }}
                  />
                )}
                <h1 className="text-sm font-light font-fkGrotesk tracking-wider truncate hover:text-blue-600">
                  {(() => {
                    const nameWithoutExtension =
                      file.name.lastIndexOf(".") !== -1 && !isFolder
                        ? file.name.substring(0, file.name.lastIndexOf("."))
                        : file.name;
                    return nameWithoutExtension.length > 25
                      ? nameWithoutExtension.slice(0, 25) + "..."
                      : nameWithoutExtension;
                  })()}
                </h1>
              </div>

              {/* Owner (MD+ only) */}
              <div className="hidden md:flex justify-center items-center text-sm font-light text-gray-300">
                --
              </div>

              {/* Size (MD+ only) */}
              <div className="hidden md:flex justify-center items-center text-sm font-light text-gray-300">
                {isFolder ? "--" : formatFileSize(parseInt(file.size || "0"))}
              </div>

              {/* Modified Date (LG only) */}
              <div className="hidden lg:flex justify-center items-center text-sm font-light text-gray-300">
                {formatDate(file.modifiedTime)}
              </div>

              {/* 3 Dots Menu (ALL devices) - Prevent row click */}
              <div className="flex justify-center items-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent row click when clicking dots
                    handleFileDotsClick(e, file.id);
                  }}
                  className="p-2 hover:bg-neutral-700 rounded-full transition-colors duration-200"
                >
                  <DotsThreeVerticalIcon size={16} className="text-gray-400" />
                </button>
              </div>
            </div>
          );
        })
      ) : (
        <div className="text-center py-12 text-gray-400">
          <div className="text-lg mb-2">{emptyStateMessage.title}</div>
          <div className="text-sm">{emptyStateMessage.subtitle}</div>
        </div>
      )}

      {/* Header Dropdown Menu - Using Floating UI */}
      {isDropdownOpen &&
        createPortal(
          <AnimatePresence>
            <motion.div
              key="header-dropdown-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-transparent z-[9997]"
              onClick={closeDropdown}
            />

            <motion.div
              key="header-dropdown"
              ref={dropdownRefs.setFloating}
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15 }}
              className="w-56 bg-neutral-900/95 backdrop-blur-md border border-neutral-600/50 rounded-xl shadow-2xl z-[9999]"
              style={{
                position: dropdownStrategy,
                top: dropdownY ?? 0,
                left: dropdownX ?? 0,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-2 space-y-1">
                <button
                  onClick={handleUploadFiles}
                  className="w-full flex items-center gap-3 p-3 hover:bg-neutral-800/50 rounded-lg transition-colors duration-200"
                >
                  <UploadIcon
                    size={18}
                    className="text-green-500 flex-shrink-0"
                  />
                  <span className="text-sm text-gray-200 font-medium">
                    Upload Files
                  </span>
                </button>

                <button
                  onClick={handleCreateFolder}
                  className="w-full flex items-center gap-3 p-3 hover:bg-neutral-800/50 rounded-lg transition-colors duration-200"
                >
                  <FolderPlusIcon
                    size={18}
                    className="text-blue-500 flex-shrink-0"
                  />
                  <span className="text-sm text-gray-200 font-medium">
                    New Folder
                  </span>
                </button>

                <div className="h-px bg-neutral-700/50 my-2"></div>

                <button
                  onClick={closeDropdown}
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
        )}

      {/* File Action Popup - Using Floating UI */}
      {openFilePopup &&
        createPortal(
          <AnimatePresence>
            <motion.div
              key="file-popup-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-xxs z-[9998]"
              onClick={closeFilePopup}
            />

            <motion.div
              key={`file-popup-${openFilePopup}`}
              ref={filePopupRefs.setFloating}
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15 }}
              className="w-64 bg-neutral-900/95 backdrop-blur-md border border-neutral-600/50 rounded-xl shadow-2xl z-[9999]"
              style={{
                position: filePopupStrategy,
                top: filePopupY ?? 0,
                left: filePopupX ?? 0,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {(() => {
                const file = allFiles.find((f) => f.id === openFilePopup);
                if (!file) return null;
                const isFolder =
                  file.mimeType === "application/vnd.google-apps.folder";

                return (
                  <>
                    <div className="p-4 border-b border-neutral-700/50">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-white truncate pr-2 text-sm">
                          {file.name.length > 20
                            ? file.name.slice(0, 20) + "..."
                            : file.name}
                        </h3>
                        <button
                          onClick={closeFilePopup}
                          className="p-1.5 hover:bg-neutral-700/50 rounded-lg transition-colors duration-200"
                        >
                          <XIcon size={14} className="text-gray-400" />
                        </button>
                      </div>
                    </div>

                    <div className="p-4 space-y-3">
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-3 text-sm">
                          <HardDriveIcon
                            size={16}
                            className="text-gray-400 flex-shrink-0"
                          />
                          <span className="text-gray-300 min-w-[60px]">
                            Size:
                          </span>
                          <span className="text-white font-medium">
                            {formatFileSize(parseInt(file.size || "0"))}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <ClockIcon
                            size={16}
                            className="text-gray-400 flex-shrink-0"
                          />
                          <span className="text-gray-300 min-w-[60px]">
                            Modified:
                          </span>
                          <span className="text-white font-medium">
                            {formatDate(file.modifiedTime)}
                          </span>
                        </div>
                      </div>

                      <div className="border-t border-neutral-700/50 pt-3 space-y-1">
                        {/* Preview button for files */}
                        {!isFolder && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openFilePreview(file);
                              closeFilePopup();
                            }}
                            className="w-full flex items-center gap-3 p-3 hover:bg-neutral-800/50 rounded-lg transition-colors duration-200"
                          >
                            <InfoIcon
                              size={18}
                              className="text-blue-400 flex-shrink-0"
                            />
                            <span className="text-sm text-gray-200 font-medium">
                              Preview
                            </span>
                          </button>
                        )}

                        {!isTrashView && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleStar(file.id, file.starred);
                              closeFilePopup();
                            }}
                            disabled={starringFile === file.id}
                            className="w-full flex items-center gap-3 p-3 hover:bg-neutral-800/50 rounded-lg transition-colors duration-200"
                          >
                            {starringFile === file.id ? (
                              <div className="animate-spin w-4 h-4 border border-yellow-500 border-t-transparent rounded-full flex-shrink-0"></div>
                            ) : (
                              <StarIcon
                                size={18}
                                weight={file.starred ? "fill" : "regular"}
                                className={`flex-shrink-0 ${
                                  file.starred
                                    ? "text-yellow-500"
                                    : "text-gray-400"
                                }`}
                              />
                            )}
                            <span className="text-sm text-gray-200 font-medium">
                              {file.starred
                                ? "Remove from starred"
                                : "Add to starred"}
                            </span>
                          </button>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleDelete(file.id);
                            closeFilePopup();
                          }}
                          disabled={deletingFile === file.id}
                          className="w-full flex items-center gap-3 p-3 hover:bg-neutral-800/50 rounded-lg transition-colors duration-200"
                        >
                          {deletingFile === file.id ? (
                            <div
                              className={`animate-spin w-4 h-4 border ${
                                isTrashView
                                  ? "border-green-500"
                                  : "border-red-500"
                              } border-t-transparent rounded-full flex-shrink-0`}
                            ></div>
                          ) : isTrashView ? (
                            <ArrowCounterClockwiseIcon
                              size={18}
                              className="text-green-500 flex-shrink-0"
                            />
                          ) : (
                            <TrashIcon
                              size={18}
                              className="text-red-500 flex-shrink-0"
                            />
                          )}
                          <span className="text-sm text-gray-200 font-medium">
                            {isTrashView ? "Restore file" : "Move to trash"}
                          </span>
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log("Show file info for:", file.id);
                            closeFilePopup();
                          }}
                          className="w-full flex items-center gap-3 p-3 hover:bg-neutral-800/50 rounded-lg transition-colors duration-200"
                        >
                          <InfoIcon
                            size={18}
                            className="text-gray-400 flex-shrink-0"
                          />
                          <span className="text-sm text-gray-200 font-medium">
                            File info
                          </span>
                        </button>
                      </div>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </AnimatePresence>,
          document.body
        )}

      {/* Upload Modal */}
      <FileUpload
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadComplete={handleUploadComplete}
      />

      {/* Create Folder Modal */}
      <CreateFolderModal
        isOpen={isFolderModalOpen}
        onClose={() => setIsFolderModalOpen(false)}
        onFolderCreated={handleFolderCreated}
      />

      {/* Loading more indicator */}
      {isLoadingMore && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* End of results indicator */}
      {!hasNextPage && allFiles.length > 0 && (
        <div className="text-center py-8 text-gray-400 text-sm">
          <div className="flex items-center justify-center gap-2">
            <div className="w-16 h-px bg-gray-600"></div>
            <span>No more files to load</span>
            <div className="w-16 h-px bg-gray-600"></div>
          </div>
        </div>
      )}

      {/* File Preview Modal */}
      <FilePreviewModal
        isOpen={isPreviewOpen}
        file={previewFile}
        onClose={closeFilePreview}
      />
    </div>
  );
};

export default FileListView;
