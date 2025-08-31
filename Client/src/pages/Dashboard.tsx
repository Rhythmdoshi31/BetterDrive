import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import type { AxiosResponse } from "axios";
import type { DriveFile, FilesResponse } from "../types";
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
  FolderSimpleIcon,
} from "@phosphor-icons/react";
import MainNav from "../components/mainNav";

interface StorageQuota {
  used: number;
  usedInDrive: number;
  usedInTrash: number;
  limit: number;
}

// Configure axios
axios.defaults.withCredentials = true;
axios.defaults.baseURL = "http://localhost:3000";

const Dashboard: React.FC = () => {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [storage, setStorage] = useState<StorageQuota | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchFiles = async (): Promise<void> => {
      try {
        const response: AxiosResponse<FilesResponse> = await axios.get(
          "/api/google/files?type=all&parentId=root&trashed=false"
        );
        const response2: AxiosResponse = await axios.get("/api/google/storage");

        setFiles(response.data.files || []);
        setStorage(response2.data.storage);

        const userData = getCookieValue<User>("user_data");
        setUser(userData);
        if (!userData || !userData.isAuthenticated)
          window.location.href = "/login";

        setLoading(false);
      } catch (error: unknown) {
        console.error("Error fetching files:", error);
        setError("Failed to fetch files");
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          window.location.href = "/";
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, []);

  console.log("files", files);
  console.log("storage", storage);
  console.log("user", user);

  // Add this to your Dashboard component after fetching files
  const processedFiles = useMemo(() => {
    if (!files.length) return { top3: [], top6Previews: [], restFiles: [] };

    // Separate files by type
    const folders = files.filter(
      (file) => file.mimeType === "application/vnd.google-apps.folder"
    );

    const filesWithPreview = files.filter(
      (file) =>
        file.thumbnailLink &&
        file.mimeType !== "application/vnd.google-apps.folder"
    );

    const filesWithoutPreview = files.filter(
      (file) =>
        !file.thumbnailLink &&
        file.mimeType !== "application/vnd.google-apps.folder"
    );

    // Get top 3 - prioritize folders
    let top3: DriveFile[] = [];

    // First, add up to 3 folders
    top3 = folders.slice(0, 3);

    // If less than 3, fill with files without preview
    let needed = 3 - top3.length;
    if (needed > 0) {
      top3 = [...top3, ...filesWithoutPreview.slice(0, needed)];
    }

    // If still less than 3, fill with any remaining files
    needed = 3 - top3.length;
    if (needed > 0) {
      const remainingFiles = files.filter(
        (file) => !top3.find((t) => t.id === file.id)
      );
      top3 = [...top3, ...remainingFiles.slice(0, needed)];
    }

    // Get top 6 previewable files
    const top6Previews = filesWithPreview.slice(0, 6);

    return {
      top3, // Top 3 folders/files (prioritizing folders)
      top6Previews, // Top 6 files with thumbnails
    };
  }, [files]);

  // Now you can use:
  console.log("Top 3:", processedFiles.top3);
  console.log("Top 6 Previews:", processedFiles.top6Previews);

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

      const filesResponse: AxiosResponse<FilesResponse> = await axios.get(
        "/api/google/files"
      );
      setFiles(filesResponse.data.files || []);
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
        Loading...
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
      <div className="pt-16 overflow-auto overflow-x-hidden">
        {/* Container with margin to match sidebar positioning */}
        <div
          className="md:ml-[8vw] lg:ml-[10vw] md:mr-8 lg:mr-14 h-screen"
          style={
            {
              // 101px = sidebar left position (36px) + sidebar width (56px) + gap (9px)
            }
          }
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
                {processedFiles?.top3?.map((e) => {
                  return (
                    <div className="bg-neutral-800 hover:bg-neutral-700 transition duration-100 w-full my-3 py-2 pl-2 rounded-md flex items-center justify-start gap-2">
                      <FolderSimpleIcon
                        size={28}
                        color="#0c42d9ff"
                        weight="fill"
                      />
                      <h1 className="text-gray-200">{e.name}</h1>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Grid - 70% */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
              <h1 className="font-antique-olive text-white text-right md:text-xl lg:text-2xl tracking-wide pr-2 mb-2">
                Recent Files
              </h1>

              <div className="flex items-center justify-start gap-2">
                {processedFiles?.top6Previews?.map((file) => {
                return (
                  <div
                    key={file.id}
                    className="bg-white dark:bg-gray-700 flex-1 w-24 rounded-lg shadow-sm flex flex-col overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  >
                    {/* Image Container */}
                    <div className="flex-1 p-2">
                      <div className="w-full h-16 rounded-md overflow-hidden bg-gray-100">
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

                    {/* File Name */}
                    <div className="px-2 pb-2">
                      <p className="text-xs text-gray-800 dark:text-gray-200 truncate leading-tight">
                        {file.name}
                      </p>
                    </div>
                  </div>
                );
              })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
