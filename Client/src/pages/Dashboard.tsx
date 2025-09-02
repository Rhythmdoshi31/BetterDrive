import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import axios from "axios";
import type { AxiosResponse } from "axios";
import type { DriveFile } from "../types";
import { getCookieValue } from "../utils/cookieHelper";
import { CleanSidebar } from "../components/ui/sidebar";
import type { User } from "../types/auth";
// Import Phosphor Icons
import {
  HouseIcon,
  SignOutIcon,
  StarIcon,
  GearIcon,
  ClockIcon,
  UsersIcon,
  PlusIcon,
  CaretDownIcon,
} from "@phosphor-icons/react";
import MainNav from "../components/mainNav";
import { getFileTypeStyle } from "../utils/fileTypeHelper";
import StorageBar from "../components/storageBar";
import VerticalStorageBar from "../components/storageBar";
import HorizontalStorageBar from "../components/storageBar";

interface StorageQuota {
  used: number;
  usedInDrive: number;
  usedInTrash: number;
  limit: number;
}

interface DashboardResponse {
  top3: DriveFile[];
  top7Previews: DriveFile[];
  allFiles: DriveFile[];
  totalCount: number;
  hasNextPage: boolean;
  nextPageToken?: string;
}

// Configure axios
axios.defaults.withCredentials = true;
axios.defaults.baseURL = "http://localhost:3000";

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [storage, setStorage] = useState<StorageQuota | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [dashBoardData, setdashBoardData] = useState<DashboardResponse | null>(null);
  const [allFiles, setAllFiles] = useState<DriveFile[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);

  // Drag scroll functionality
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Infinite scroll hook
  const useInfiniteScroll = (callback: () => void, isFetching: boolean) => {
    const [isFetchingMore, setIsFetchingMore] = useState(false);

    useEffect(() => {
      const handleScroll = () => {
        if (
          window.innerHeight + document.documentElement.scrollTop >= 
          document.documentElement.offsetHeight - 1000 && // Load 1000px before bottom
          !isFetching && hasNextPage
        ) {
          setIsFetchingMore(true);
        }
      };

      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }, [isFetching]);

    useEffect(() => {
      if (!isFetchingMore) return;
      callback();
    }, [isFetchingMore, callback]);

    useEffect(() => {
      if (isFetching) setIsFetchingMore(false);
    }, [isFetching]);

    return [isFetchingMore, setIsFetchingMore];
  };

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

  // Fetch files function with pagination support
  const fetchFiles = async (pageToken?: string): Promise<void> => {
    try {
      const params = new URLSearchParams();
      params.append('limit', '35');
      if (pageToken) {
        params.append('pageToken', pageToken);
      }

      const response: AxiosResponse<DashboardResponse> = await axios.get(
        `/api/google/dashboard/files?${params.toString()}`
      );
      
      if (!pageToken) {
        // Initial load - also fetch storage
        const response2: AxiosResponse = await axios.get("/api/google/storage");
        setStorage(response2.data.storage);
        
        // Set initial dashboard data
        setdashBoardData(response.data);
        setAllFiles(response.data.allFiles);

        const userData = getCookieValue<User>("user_data");
        setUser(userData);
        if (!userData || !userData.isAuthenticated)
          window.location.href = "/login";
      } else {
        // Pagination - append new files
        setAllFiles(prevFiles => [...prevFiles, ...response.data.allFiles]);
      }

      setHasNextPage(response.data.hasNextPage || false);
      setNextPageToken(response.data.nextPageToken || null);

      if (!pageToken) setLoading(false);
    } catch (error: unknown) {
      console.error("Error fetching files:", error);
      setError("Failed to fetch files");
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        window.location.href = "/";
      }
    } finally {
      if (!pageToken) setLoading(false);
      setIsLoadingMore(false);
    }
  };

  // Fetch more files for pagination
  const fetchMoreFiles = useCallback(() => {
    if (!hasNextPage || isLoadingMore) return;
    setIsLoadingMore(true);
    fetchFiles(nextPageToken || undefined);
  }, [hasNextPage, isLoadingMore, nextPageToken]);

  // Use infinite scroll
  useInfiniteScroll(fetchMoreFiles, isLoadingMore);

  useEffect(() => {
    fetchFiles();
  }, []);

  console.log("storage", storage);
  console.log("user", user);
  console.log("dashboard", dashBoardData);
  console.log("allFiles count:", allFiles.length);

  const uploadLink = {
    label: "Upload Files",
    href: "#upload",
    icon: <PlusIcon size={24} weight="bold" />,
  };

  const links = [
    {
      label: "My Drive",
      href: "/drive",
      icon: <HouseIcon size={20} />,
    },
    {
      label: "Recent",
      href: "/recent",
      icon: <ClockIcon size={20} />,
    },
    {
      label: "Starred",
      href: "/starred",
      icon: <StarIcon size={20} />,
    },
    {
      label: "Shared with me",
      href: "/shared",
      icon: <UsersIcon size={20} />,
    },
    {
      label: "Settings",
      href: "/settings",
      icon: <GearIcon size={20} />,
    },
    {
      label: "Logout",
      href: "/logout",
      icon: <SignOutIcon size={20} />,
    },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      setUploading(true);
      const response = await axios.post("/api/google/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("Upload success:", response.data);

      // Refresh files after upload
      setAllFiles([]);
      setNextPageToken(null);
      setHasNextPage(true);
      fetchFiles();
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed");
    } finally {
      setUploading(false);
      setSelectedFile(null);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  if (error)
    return (
      <div className="flex items-center justify-center h-screen text-red-500">
        Error: {error}
      </div>
    );

  return (
    <div className="font-fkGrotesk min-h-screen bg-gray-50 dark:bg-black">
      <MainNav user={user} />
      {/* Clean Sidebar */}
      <CleanSidebar links={links} uploadLink={uploadLink} />

      {/* Main Content - Positioned to match sidebar spacing */}
      <div className="pt-16 overflow-x-hidden">
        {/* Container with margin to match sidebar positioning */}
        <div
          className="md:ml-[8vw] md:mr-8 lg:mr-14 min-h-screen pb-8"
          style={{
            // 101px = sidebar left position (36px) + sidebar width (56px) + gap (9px)
          }}
        >
          <div className="grid grid-cols-[30%_70%] gap-4 max-h-[35vh] pt-4">
            {/* Left Grid - 30% */}
            <div className="bg-gray-100 dark:bg-neutral-900/50 md:p-3 lg:p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <h1 className="font-antique-olive text-white md:text-xl lg:text-2xl tracking-wide pt-1">
                  My Drive
                </h1>
                <div className="flex items-center justify-center md:gap-3 lg:gap-4 text-white">
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
                  const { iconColor, IconComponent } = getFileTypeStyle(
                    e.mimeType
                  );
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
            <div className="bg-gray-100 dark:bg-neutral-900/50 p-4 pt-3 pb-6 rounded-lg shadow-sm">
              <h1 className="font-antique-olive text-white text-right md:text-xl lg:text-2xl tracking-wide pr-2 mb-3">
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
                  const { stripColor, iconColor, IconComponent } =
                    getFileTypeStyle(file.mimeType);

                  return (
                    <div
                      key={file.id}
                      className="border-[1px] border-neutral-800 bg-[#18181B] w-40 h-[90%] rounded-lg shadow-sm flex flex-col overflow-hidden hover:shadow-md transition-shadow cursor-pointer flex-shrink-0 relative hover:bg-neutral-800 transition duration-100"
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      {/* Image Container */}
                      <div className="p-2 pb-0">
                        <div className="w-full h-34 rounded-sm overflow-hidden bg-gray-100">
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
                        <p className="text-[0.93rem] text-gray-200 truncate leading-tight flex-1">
                          {file.name.slice(0, 12) + "..."}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="mt-20 p-4">
            <div className="flex items-center justify-between mb-4">
              {/* Left: All Files heading */}
              <h1 className="font-antique-olive text-white md:text-xl lg:text-2xl tracking-wide">
                All Files ({allFiles.length})
              </h1>

              {/* Right: Horizontal Storage Bar */}
              {storage && <HorizontalStorageBar storage={storage} />}
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
            {allFiles.length === 0 && !loading && (
              <div className="text-center py-12 text-gray-400">
                <div className="text-lg mb-2">No files found</div>
                <div className="text-sm">Upload some files to get started</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
