import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import type { AxiosResponse } from "axios";
import type { DriveFile } from "../types";
import { getFileTypeStyle } from "../utils/fileTypeHelper";
import HorizontalStorageBar from "./StorageBar";
import FilePreviewModal from "./FilePreviewModal";
import {
  FolderIcon,
  CaretRightIcon,
  HouseIcon,
} from "@phosphor-icons/react";
import FileUpload from "./FileUpload";
import CreateFolderModal from "./CreateFolderModal";
import ActionsDropdown from "./ActionsDropdown";
import FileActionsPopup from "./FileActionsPopup";

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
  // ============ ROUTING HOOKS ============
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isTrashView = location.pathname === "/trash";

  // Get folderId from URL params
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

  // Modal states
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);

  // Folder navigation state
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [currentFolder, setCurrentFolder] = useState<FolderMetadata | null>(null);
  const [breadcrumbPath, setBreadcrumbPath] = useState<FolderMetadata[]>([]);

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

  // ============ FOLDER NAVIGATION ============
  const handleFolderClick = (folder: DriveFile) => {
    if (folder.mimeType === "application/vnd.google-apps.folder") {
      navigate(`/folders?folderId=${folder.id}`);
    }
  };

  // ============ BREADCRUMB COMPONENT ============
  const Breadcrumb: React.FC = () => {
    if (!currentFolder && breadcrumbPath.length === 0) {
      return null;
    }

    const filteredBreadcrumb = breadcrumbPath.filter((folder, idx) => {
      if (
        idx === 0 &&
        (folder.name.toLowerCase().includes("mydrive") ||
          folder.name.toLowerCase().includes("all files") ||
          folder.name.toLowerCase().includes("drive") ||
          folder.name === "My Drive")
      ) {
        return false;
      }
      return true;
    });

    return (
      <nav className="flex items-center space-x-2 mb-4 text-sm">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-1 px-2 py-1 rounded hover:bg-neutral-700 transition-colors text-gray-300 hover:text-white"
        >
          <HouseIcon size={16} />
          <span>Home</span>
        </button>

        {filteredBreadcrumb.map((folder) => (
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

  // ============ LOAD EFFECT FOR URL FOLDER NAVIGATION ============
  useEffect(() => {
    if (enableFolderNavigation) {
      setCurrentFolderId(folderIdFromURL);
      fetchFiles(undefined, folderIdFromURL);
    } else {
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
      className={`${
        location.pathname !== "/dashboard" ? "px-4 md:p-4 mt-2" : "mt-2 md:mt-16 p-4"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2 md:mb-4">
        <h1 className="font-antique-olive mt-2 text-black dark:text-white md:text-xl lg:text-2xl tracking-wide">
          {getDisplayTitle()} {showFileCount && `(${allFiles.length})`}
        </h1>
        <div className="flex items-center justify-center gap-4">
          {showStorage && storage && <HorizontalStorageBar storage={storage} />}
          {headerSlot}

          {/* REPLACED 6-DOTS BUTTON WITH NEW COMPONENT */}
          <ActionsDropdown
            onUploadFiles={() => setIsUploadModalOpen(true)}
            onCreateFolder={() => setIsFolderModalOpen(true)}
            onSettings={() => console.log("Settings clicked")}
          />
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
          const { iconColor, IconComponent } = getFileTypeStyle(file.mimeType);
          const isFolder = file.mimeType === "application/vnd.google-apps.folder";

          return (
            <div
              key={file.id}
              className={`grid grid-cols-[70%_30%] md:grid-cols-[45%_20%_15%_15%] lg:grid-cols-[35%_20%_15%_15%_15%] gap-4 h-12 text-black dark:text-white w-full rounded-lg px-4 mb-3 items-center border-[1px] border-neutral-300 dark:border-neutral-800 bg-neutral-300 dark:bg-[#18181B] hover:bg-neutral-400 dark:hover:bg-neutral-800 hover:scale-[1.008] transition duration-100 cursor-pointer`}
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
                  <FolderIcon size={20} weight="fill" className="text-blue-400" />
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

              {/* REPLACED 3-DOTS BUTTON WITH NEW COMPONENT */}
              <div className="flex justify-center items-center">
                <FileActionsPopup
                  file={file}
                  isTrashView={isTrashView}
                  onPreview={openFilePreview}
                  onStar={toggleStar}
                  onDelete={toggleDelete}
                  onFileInfo={(file) => console.log("File info:", file)}
                  starringFile={starringFile}
                  deletingFile={deletingFile}
                />
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

      {/* Upload Modal */}
      <FileUpload
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadComplete={() => fetchFiles(undefined, currentFolderId)}
      />

      {/* Create Folder Modal */}
      <CreateFolderModal
        isOpen={isFolderModalOpen}
        onClose={() => setIsFolderModalOpen(false)}
        onFolderCreated={() => fetchFiles(undefined, currentFolderId)}
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
