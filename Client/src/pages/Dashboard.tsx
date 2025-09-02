import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import type { AxiosResponse } from "axios";
import type { DriveFile, DashboardResponse } from "../types";
import { getCookieValue } from "../utils/cookieHelper";
import { CleanSidebar } from "../components/ui/sidebar";
import type { User } from "../types/auth";
import {
  HouseIcon,
  SignOutIcon,
  StarIcon,
  GearIcon,
  ClockIcon,
  UsersIcon,
  PlusIcon,
} from "@phosphor-icons/react";
import MainNav from "../components/MainNav";
import DashboardGrid from "../components/DashbGrid";
import AllFilesSection from "../components/Files";

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

  // Infinite scroll hook
  const useInfiniteScroll = (callback: () => void, isFetching: boolean) => {
    const [isFetchingMore, setIsFetchingMore] = useState(false);

    useEffect(() => {
      const handleScroll = () => {
        if (
          window.innerHeight + document.documentElement.scrollTop >= 
          document.documentElement.offsetHeight - 1000 &&
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
      <CleanSidebar links={links} uploadLink={uploadLink} />

      {/* Main Content - Positioned to match sidebar spacing */}
      <div className="pt-16 overflow-x-hidden">
        <div className="md:ml-[8vw] md:mr-8 lg:mr-14 min-h-screen pb-8">
          
          {/* Dashboard Grid Component */}
          <DashboardGrid dashBoardData={dashBoardData} />
          
          {/* All Files Section Component */}
          <AllFilesSection 
            allFiles={allFiles}
            storage={storage}
            isLoadingMore={isLoadingMore}
            hasNextPage={hasNextPage}
          />
          
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
