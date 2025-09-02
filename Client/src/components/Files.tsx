import React from "react";
import type { DriveFile } from "../types";
import { getFileTypeStyle } from "../utils/fileTypeHelper";
import HorizontalStorageBar from "./storageBar";
import { DotsSixIcon } from "@phosphor-icons/react";

interface StorageQuota {
  used: number;
  usedInDrive: number;
  usedInTrash: number;
  limit: number;
}

interface AllFilesSectionProps {
  allFiles: DriveFile[];
  storage: StorageQuota | null;
  isLoadingMore: boolean;
  hasNextPage: boolean;
}

const AllFilesSection: React.FC<AllFilesSectionProps> = ({
  allFiles,
  storage,
  isLoadingMore,
  hasNextPage,
}) => {
  // Helper function to format file size
  const formatFileSize = (bytes: number) => {
    if (!bytes) return "--";
    const kb = bytes / 1024;
    const mb = kb / 1024;
    if (mb >= 1) return `${mb.toFixed(1)} MB`;
    if (kb >= 1) return `${kb.toFixed(1)} KB`;
    return `${bytes} B`;
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "--";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="mt-16 p-4">
      <div className="flex items-center justify-between mb-4">
        {/* Left: All Files heading */}
        <h1 className="font-antique-olive text-white md:text-xl lg:text-2xl tracking-wide">
          All Files ({allFiles.length})
        </h1>

        {/* Right: Horizontal Storage Bar */}
        <div className="flex items-center justify-center gap-4">
          {storage && <HorizontalStorageBar storage={storage} />}
          <DotsSixIcon size={32} className="text-white" />
        </div>
      </div>

      {/* Column Headers - Responsive */}
      <div className="grid grid-cols-[45%_20%_25%] lg:grid-cols-[35%_20%_20%_20%] gap-4 px-4 py-2 text-gray-400 uppercase text-xs font-semibold tracking-wider border-b border-neutral-800 mb-3">
        <div className="flex items-center gap-2">
          <span>Name</span>
        </div>
        <div>Owner</div>
        <div>Size</div>
        <div className="hidden lg:block text-right">Modified</div>
      </div>

      {/* File Rows - Using allFiles for pagination */}
      {allFiles.map((file) => {
        const { stripColor, iconColor, IconComponent } = getFileTypeStyle(
          file.mimeType
        );

        return (
          <div
            key={file.id}
            className="grid grid-cols-[45%_20%_25%] lg:grid-cols-[35%_20%_20%_20%] gap-4 h-12 text-white w-full rounded-lg px-4 mb-3 items-center border-[1px] border-neutral-800 bg-[#18181B] hover:bg-neutral-800 hover:scale-[1.008] transition duration-100 cursor-pointer"
          >
            {/* Name + Icon Column (45% on md, 35% on lg) */}
            <div className="flex items-center gap-2">
              <IconComponent
                size={20}
                weight="fill"
                style={{ color: iconColor }}
              />
              <h1 className="text-sm font-light font-fkGrotesk tracking-wider truncate">
                {(() => {
                  const nameWithoutExtension =
                    file.name.lastIndexOf(".") !== -1
                      ? file.name.substring(0, file.name.lastIndexOf("."))
                      : file.name;

                  return nameWithoutExtension.length > 25
                    ? nameWithoutExtension.slice(0, 25) + "..."
                    : nameWithoutExtension;
                })()}
              </h1>
            </div>

            {/* Owner Column (25% on both md and lg) */}
            <div className="text-sm font-light text-gray-300 truncate">
              --
            </div>

            {/* Size Column (25% on md, 20% on lg) */}
            <div className="text-sm font-light text-gray-300">
              {formatFileSize(parseInt(file.size || "0"))}
            </div>

            {/* Modified Date Column (hidden on md, 20% on lg) */}
            <div className="hidden lg:block text-sm font-light text-gray-300 text-right">
              {formatDate(file.modifiedTime)}
            </div>
          </div>
        );
      })}

      {/* Loading indicator */}
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

      {/* No files message */}
      {allFiles.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <div className="text-lg mb-2">No files found</div>
          <div className="text-sm">Upload some files to get started</div>
        </div>
      )}
    </div>
  );
};

export default AllFilesSection;
