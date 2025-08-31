import { NavbarLogo } from "./ui/resizable-navbar";
import Toggle from "./toggleDarkMode";
import { SearchBar } from "./ui/SearchBar";
import type { User } from "../types/auth";
import { GearIcon } from "@phosphor-icons/react";

interface MainNavProps {
    user: User | null;
}

const MainNav = ({ user } : MainNavProps) => {

  const placeholderProfilePic = "data:image/jpeg;base64,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";

    return (
        <>
            {/* Desktop Header */}
                <div className="h-16 w-full hidden md:flex items-center justify-between md:px-8 lg:px-12 bg-white dark:bg-black fixed top-0 left-0 right-0 z-50">
                  <div className="flex items-center">
                    <NavbarLogo/>
                    <div className="ml-4 lg:ml-20">
                      <SearchBar />
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-4 lg:gap-6">
                    {user && (
                      <div className="flex items-center justify-center gap-4 mr-0 lg:mr-8">
                        <img
                          src={placeholderProfilePic}
                          alt="Profile"
                          className="h-8 w-8 rounded-full"
                        />
                        <h1 className="dark:text-white font-fkGrotesk">
                          Hi! {user.name}
                        </h1>
                      </div>
                    )}
                    <GearIcon
                      size={30}
                      className="dark:text-gray-300 hover:rotate-90 hover:text-gray-500 duration-400 transition cursor-pointer"
                    />
                    <Toggle />
                  </div>
                </div>
            
                {/* Mobile Header */}
                <div className="h-16 w-full md:hidden flex items-center justify-between px-4 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-700 fixed top-0 left-0 right-0 z-50">
                  <NavbarLogo />
                  <div className="flex items-center justify-center gap-2">
                    <SearchBar />
                    <Toggle />
                  </div>
                </div>
            
        </>
    )
}

export default MainNav;