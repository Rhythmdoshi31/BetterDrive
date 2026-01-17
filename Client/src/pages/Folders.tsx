import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from "axios";
import type { User } from "../types/auth";
import { getCookieValue } from "../utils/cookieHelper";
import { CleanSidebar } from '../components/ui/sidebar';
import MainNav from '../components/MainNav'; // Add this import
import FileListView from '../components/Files';
import { 
  HouseIcon, 
  ClockIcon, 
  StarIcon, 
  UsersIcon, 
  TrashIcon, 
  GearIcon, 
  PlusIcon 
} from '@phosphor-icons/react';

// Configure axios (same as Recent page)
axios.defaults.withCredentials = true;
axios.defaults.baseURL = "https://betterdrive-production.up.railway.app";

const FoldersPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const folderId = searchParams.get('folderId');

  // Add user state management (same as Recent page)
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // User authentication effect (same as Recent page)
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

  // Redirect to dashboard if no folderId (prevent /folders without folderId)
  useEffect(() => {
    if (!folderId && !loading) { // Only redirect after loading is complete
      navigate('/dashboard', { replace: true });
    }
  }, [folderId, navigate, loading]);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500">
        Error: {error}
      </div>
    );
  }

  // Don't render anything if no folderId (will redirect anyway)
  if (!folderId) {
    return <div>Redirecting to dashboard...</div>;
  }

  // Sidebar configuration
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

  const uploadLink = {
    label: "Upload Files",
    href: "#upload",
    icon: <PlusIcon size={24} weight="bold" />,
  };

  return (
    <div className="font-fkGrotesk min-h-screen bg-gray-50 dark:bg-black">
      {/* Add MainNav here - same as Recent page */}
      <MainNav user={user} />
      
      {/* Sidebar */}
      <CleanSidebar 
        links={links} 
        uploadLink={uploadLink}
      />

      {/* Main Content - same layout as Recent page */}
      <div className="pt-16 overflow-x-hidden">
        <div className="md:ml-[8vw] md:mr-8 lg:mr-14 min-h-screen pb-8">
          <FileListView
            title="Files"
            apiEndpoint="/api/google/files"
            enableFolderNavigation={true} // CRITICAL: Must be true for URL navigation
            showStorage={false}
            showFileCount={true}
            emptyStateMessage={{
              title: "No files in this folder",
              subtitle: "Upload files or create folders to get started"
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default FoldersPage;
