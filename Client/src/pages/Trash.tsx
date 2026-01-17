import React, { useEffect, useState } from "react";
import axios from "axios";
import type { User } from "../types/auth";
import { getCookieValue } from "../utils/cookieHelper";
import { CleanSidebar } from "../components/ui/sidebar";
import MainNav from "../components/MainNav";
import FileListView from "../components/Files";
import {
  HouseIcon,
  StarIcon,
  GearIcon,
  ClockIcon,
  UsersIcon,
  PlusIcon,
  TrashIcon,
} from "@phosphor-icons/react";

// Configure axios
axios.defaults.withCredentials = true;
axios.defaults.baseURL = "http://betterdrive-production.up.railway.app";

const TrashFiles: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchInitialData = async (): Promise<void> => {
      try {
        const userData = getCookieValue<User>("user_data");
        setUser(userData);
        if (!userData || !userData.isAuthenticated) {
          window.location.href = "/login";
          return;
        }
        setLoading(false);
      } catch (error: unknown) {
        console.error("Error fetching user data:", error);
        setError("Failed to load user data");
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          window.location.href = "/";
        }
      }
    };

    fetchInitialData();
  }, []);

  const uploadLink = {
    label: "Upload Files",
    href: "#upload",
    icon: <PlusIcon size={24} weight="bold" />,
  };

  const links = [
    {
      label: "My Drive",
      href: "/dashboard",
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
      label: "Trash",
      href: "/trash",
      icon: <TrashIcon size={20} />,
    },
    {
      label: "Settings",
      href: "/settings",
      icon: <GearIcon size={20} />,
    },
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
      <CleanSidebar links={links} uploadLink={uploadLink} />

      <div className="pt-16 overflow-x-hidden">
        <div className="md:ml-[8vw] md:mr-8 lg:mr-14 min-h-screen pb-8">
          <FileListView
            title="Trash"
            apiEndpoint="/api/google/files"
            queryParams={{ filter: 'trashed' }}
            showFileCount={true}
            emptyStateMessage={{
              title: "Trash is empty",
              subtitle: "Deleted files will appear here"
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default TrashFiles;
