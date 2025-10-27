import React, { useRef, useState } from "react";
import type { DriveFile, DashboardResponse } from "../types";
import { getFileTypeStyle } from "../utils/fileTypeHelper";
import { CaretDownIcon, PlusIcon } from "@phosphor-icons/react";
import FilePreviewModal from "./FilePreviewModal";

interface DashboardGridProps {
  dashBoardData: DashboardResponse | null;
}

const DashboardGrid: React.FC<DashboardGridProps> = ({ dashBoardData }) => {
  // Drag scroll functionality
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const [previewFile, setPreviewFile] = useState<DriveFile | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (scrollRef.current?.offsetLeft || 0));
    setScrollLeft(scrollRef.current?.scrollLeft || 0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - (scrollRef.current?.offsetLeft || 0);
    const walk = (x - startX) * 2;
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  const openFilePreview = (file: DriveFile) => {
      setPreviewFile(file);
      setIsPreviewOpen(true);
    };
  
    const closeFilePreview = () => {
      setIsPreviewOpen(false);
      setPreviewFile(null);
    };

  return ( // Giving paddingg for mobiles
    <div className="px-4 sm:p-0 grid grid-cols-1 sm:grid-cols-[30%_70%] sm:gap-4 sm:max-h-[35vh] p-2 md:pt-4">

      {/* Left Grid - 30% */}
      <div className="bg-gray-100 dark:bg-neutral-900/20 md:p-3 lg:p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <h1 className="font-antique-olive text-white md:text-xl lg:text-2xl tracking-wide pt-1">
            My Drive
          </h1>
          <div className="flex items-center justify-center gap-2 md:gap-3 lg:gap-4 text-white">
            <CaretDownIcon
              size={34}
              className="bg-blue-600 p-2 rounded-[50%] hover:bg-blue-500 hover:md:scale-100 hover:lg:scale-105 md:scale-90 lg:scale-100 hover:font-semibold transition duration-100"
            />
            <PlusIcon
              size={34}
              className="bg-green-600 p-2 rounded-[50%] hover:bg-green-500 hover:md:scale-100 hover:lg:scale-105 md:scale-90 lg:scale-100 hover:font-semibold transition duration-100"
            />
          </div>
        </div>
        <div>
          <h1 className="font-sans font-thin tracking-wider text-white md:text-md lg:text-lg my-1 mb-2">
            Quick Access
          </h1>
          {dashBoardData?.top3?.map((e) => {
            const { iconColor, IconComponent } = getFileTypeStyle(e.mimeType);
            return (
              <div
                key={e.id}
                className="border-[1px] border-neutral-800 bg-[#18181B] hover:bg-neutral-800 hover:scale-[1.008] transition duration-100 cursor-pointer w-full my-3 py-2 pl-2 rounded-md flex items-center justify-start gap-2"
              >
                <IconComponent
                  size={24}
                  weight="fill"
                  style={{ color: iconColor }}
                />
                <h1 className="text-gray-200 pt-1">{e.name}</h1>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Grid - 70% */}
      <div className="bg-gray-100 dark:bg-neutral-900/20 md:p-4 pt-3 md:pb-6 rounded-lg shadow-sm">
        <h1 className="font-antique-olive text-white md:text-right md:text-xl lg:text-2xl tracking-wide pr-2 mb-3">
          Recent Files
        </h1>

        <div
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          className={`flex overflow-x-auto scrollbar-hidden font-fkGrotesk overflow-y-hidden lg:pb-3 pb-2 h-full gap-3 scrollbar-hide select-none ${
            isDragging ? "cursor-grabbing" : "cursor-grab"
          }`}
        >
          {dashBoardData?.top7Previews?.map((file) => {
            const { stripColor, iconColor, IconComponent } = getFileTypeStyle(
              file.mimeType
            );

            return (
              <div
                key={file.id}
                onClick={(e) => {
                    e.stopPropagation();
                    openFilePreview(file);
                  }}
                className="border-[1px] border-neutral-800 bg-[#18181B] w-40 h-[90%] rounded-lg shadow-sm flex flex-col overflow-hidden hover:shadow-md transition-shadow cursor-pointer flex-shrink-0 relative hover:bg-neutral-800 transition duration-100"
                onMouseDown={(e) => e.stopPropagation()}
              >
                {/* Image Container */}
                <div className="p-2 pb-0">
                  <div className="w-full h-34 rounded-sm overflow-hidden bg-gray-100 dark:bg-neutral-700 dark:text-gray-200">
                    {file.thumbnailLink ? (
                      <img
                        src={file.thumbnailLink}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                        <span className="text-xs text-gray-500">
                          No Preview
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* File Name with Icon */}
                <div className="px-2 flex items-center h-full gap-1.5">
                  <div
                    className="w-0.5 h-4 rounded-sm flex-shrink-0"
                    style={{ backgroundColor: stripColor }}
                  />
                  <IconComponent
                    size={18}
                    weight="fill"
                    style={{ color: iconColor }}
                  />
                  <p className="text-[0.93rem] text-gray-200 truncate leading-tight flex-1 hover:text-blue-600">
                    {file.name.slice(0, 12) + "..."}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* File Preview Modal */}
      <FilePreviewModal
        isOpen={isPreviewOpen}
        file={previewFile}
        onClose={closeFilePreview}
      />
    </div>
  );
};

export default DashboardGrid;
