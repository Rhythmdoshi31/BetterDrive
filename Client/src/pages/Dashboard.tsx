import React, { useEffect, useState } from "react";
import axios from "axios";
import type { DriveFile } from "../types";
import { getCookieValue } from "../utils/cookieHelper";
import { CleanSidebar } from "../components/ui/sidebar";
import type { User } from "../types/auth";
import {
  HouseIcon,
  StarIcon,
  GearIcon,
  ClockIcon,
  UsersIcon,
  PlusIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import MainNav from "../components/MainNav";
import DashboardGrid from "../components/DashbGrid";
import FileListView from "../components/Files";

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
axios.defaults.baseURL = "https://betterdrive-production.up.railway.app";

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [storage, setStorage] = useState<StorageQuota | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [dashBoardData, setdashBoardData] = useState<DashboardResponse | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0); // Changes whenever a folder is created in DashbGrid.tsx and the key is set in Files.tsx to refresh the component..

  // Fetch initial dashboard data (top3, top7, storage)
  const fetchInitialData = async (): Promise<void> => {
    try {
      const [dashboardResponse, storageResponse] = await Promise.all([
        axios.get("/api/google/dashboard/files"), // Just for top3 & top7
        axios.get("/api/google/storage")
      ]);
      
      setdashBoardData(dashboardResponse.data);
      setStorage(storageResponse.data.storage);
      
      const userData = getCookieValue<User>("user_data");
      setUser(userData);
      if (!userData || !userData.isAuthenticated)
        window.location.href = "/login";
      
      setLoading(false);
    } catch (error: unknown) {
      console.error("Error fetching initial data:", error);
      setError("Failed to fetch dashboard data");
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        window.location.href = "/";
      }
    }
  };
  
  console.log("DashbData", dashBoardData);
  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleFilesRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const uploadLink = {
    label: "Upload Files",
    href: "#upload",
    icon: <PlusIcon size={24} weight="bold" />,
  };

  const links = [
    { label: "My Drive", href: "/drive", icon: <HouseIcon size={20} /> },
    { label: "Recent", href: "/recent", icon: <ClockIcon size={20} /> },
    { label: "Starred", href: "/starred", icon: <StarIcon size={20} /> },
    { label: "Shared with me", href: "/shared", icon: <UsersIcon size={20} /> },
    {
      label: "Trash",
      href: "/trash",
      icon: <TrashIcon size={20} />,
    },
    { label: "Settings", href: "/settings", icon: <GearIcon size={20} /> },
    
  ];

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
      <CleanSidebar links={links} uploadLink={uploadLink} onRefresh={handleFilesRefresh} />

      <div className="pt-16 overflow-x-hidden">
        <div className="md:ml-[8vw] md:mr-8 lg:mr-14 min-h-screen pb-8">
          
          {/* Dashboard Grid (top3 & top7) */}
          <DashboardGrid dashBoardData={dashBoardData} onRefresh={handleFilesRefresh}/>
          
          {/* All Files List using FileListView */}
          <FileListView 
            key={refreshTrigger}
            title="All Files"
            apiEndpoint="/api/google/dashboard/files"
            showStorage={true}
            storage={storage}
            showFileCount={true}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
