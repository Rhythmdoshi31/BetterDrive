import { NavbarLogo } from "./ui/resizable-navbar";
import Toggle from "./toggleDarkMode";
import { SearchBar } from "./ui/SearchBar";
import type { User } from "../types/auth";
import { 
  GearIcon, ClockIcon, FolderIcon, MoonIcon, StarIcon, TrashIcon, UsersIcon, ListIcon, XIcon
} from "@phosphor-icons/react";
import { useState } from "react";

interface MainNavProps {
    user: User | null;
}

const MainNav = ({ user }: MainNavProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const placeholderProfilePic = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBwgHBgkIBwgKCgkLDRYPDQwMDRsUFRAWIB0iIiAdHx8kKDQsJCYxJx8fLT0tMTU3Ojo6Iys/RD84QzQ5OjcBCgoKDQwNGg8PGjclHyU3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3N//AABEIAMAAzAMBIgACEQEDEQH/xAAbAAEAAgMBAQAAAAAAAAAAAAAABQYBAwQCB//EADkQAAIBAwEFBQYEBAcAAAAAAAABAgMEESEFEjFBURMiMmFxBkKB0eEVJUNjkrLx/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/APqIAAAAAAAAAAAAAByzyMb0fiXzAyDCafBpmQAAAAAAAAAAAAAAAAAAAAAAAAABquK8LelKpV8Mfm/QDZOcYRcpNKK5sibra7zu2sUv9x/Y4bu8q3Uu/pTzpBHOBtq3Faq8zqTfk3oa3J+fzMADO9JcG8+TN1K7uabzCtP0byaABN2O01XmqVdKM3wmzo0SXqVLOGmuKeUStPbNRYVSlFrm09QJkGq3uKdxT36TbXB54o2gAAAAAAAAAAAAAAAAAABjHTiV7ady7m40b3IaJE5eTdO0qyXKOhWAAA5gAZMZQADIejwABkwB2bLuHQu4rPcqd2S+5YSpZedHhrgy1wkpwjNe8k/mB6AAAAAAAAAAAAAAAAAAHPfpuzrJfCVrJa6iUoOL95NFctLbtb+nbT0zU3ZMDzSt6tWpClTg3Unqo+XU93lGnbz7CMu1rLSbXBPpEtdCx7Ht6sGo16zwpNeCPJHmls38HHFnTpdq1rXrtt564xr9AK+7OVKl2t3+XBruwfin6L7nMlKc92Ed5vworUtEtgqtUda8uZ3FTjjwp+Wdcfoe4bImk4RqwtqT4xt495+spf0ArjtY0Endtqb4UY+J+vT9yQ2bsOpcy7W6i6NLlFaOS+xPWmzLS0alSpJz+OWrOwCB9otnJWdOrbU0o0O64pe7/Z/uVo+hySlFxkk01hp8/Ire2dnS2fcPdWaM9YP7AcD4MtFpra0X1px/Yq7541LTbx3KFKPwwivoBsAAAAAAAAAAAAAAAAAAAj9n0c+0knjwrf8Ap/ckMZaPNnRnS27OUo+O3zn9Uv6ATHLHID0AAAAAAA5YIn2nS/wxZX+rH7ksQ3tVLGzqa61V+zArVpS7a4pwXBvX05loOHZWyqtGi7uqknKOkHxSO7hpxAAAAAAAAAAAAAAAAAAAD1TeJp9GSLpqVaNV+JRcc+Tx/QjCToy3qUJeQHv04AAAAAAAAHNeWcburb9qs0qUnNrq8aHSANV28UJt410I4676WkYddTkAAAAAAAAAAAAAAAAAAAAd1lJOlu9rKfA4R6N5AlgeaU+0pxl1PQAAAAAAGnPgOZwXc260o5e6uQHm5qKdV7q0NQAAAAAAAAAAAAAAAAAAAAAAB12U85p9NUdZFQbjNOLw85ySVKqqizwfNAewAAAPMpqCywFSapwc5PCIyTcpOT5m6tJ15rPhzojVVj2c3H5AeQAAAAAAAAAAAAAAAAAAAAAAAZXFP9DpS1T5+Rzx0Upv3V9eR10e9Sg+bQHqNWS46nrtn8P1Mbo3QMOrN8MI1tbzzLU27owBrhBJtnHtmtK1pUq6SlDe3Jx56rRkh68Cq7b2j+Lq9lSf5NN/8n1AmYSjOCnB5jJZTMkPsi8Sf4eo8fA3w9CYfpgAAAAAAAAAAAAAAAAAAAAfBvKWDku9oULfMd7fqL3Y/cjFXr7RuqdGT3YTkluLpzyBYtHaKSeVPDT6nTafwF5aGKsE6SilpHge7aO7RWQNmBgzk8uQBs8jmcO1b9WFvph1Z6QX3A4vaDaXZxdnRl3pfxZJ+FdPUrqMuTnJyk8yby2+bMAPR49CWtNrJJQuU+HjX3IkYzxAtVKrCrFTpzUodUz2VWlVqUZb1KbjLqiXs9qxn3bhbsviXACTBhNNJrvJ8GZAAAAAAAAAAi73arpVZUreCe68OUno35Ija15Xr6VKj3eO6lhATVxtGhQynLfl0gRV1tG4uE0pdnTfuw5/qcYALhwJT2epx/GTrTTxSg3+pFk57PU80K8+skvl/wCgSlrcVakpdvjdk8xSXhO1TjGGmpzxie8AeatxUSe5u/qYo3Km1GaUZ9OplxNU6edf2A33NxC1oTq1X3YrPr5FOvbmd5czrVXrLguSXQ6NqX07mp2UZZo0n3f5n1OADJgAAAAAAA3W13Xtn+VUeG8uL1TJa12tRqpRq/ly89V8yDHoBbU8rTDXVMFYt7mtb60ptL4XqvkS1ntanVlGNaPZzemU+6BIgYxp8wANdeoqVGdR+6mzYR226u5QjST1m/ogINtyeZcXqAAAAAwyzez8N3Z0ZfFOT+32K0WrYi/yuhn+b/swO4GTAGSK27d/h6HY05fmVFxXJElXqxoUZ1ZvuxWWU66uJXVxKtPOZPh0QGrRcAAAAAAAAAAAAAAANZAsmz6/4i0pyfi4S82jpIjYNXvVqT4Nb0fLqS4H/9k=";

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const menuItems = [
    {
      icon: <MoonIcon size={20} className="text-blue-600 dark:text-blue-300" />,
      label: "Theme",
      action: undefined, // Special case for theme toggle
      isTheme: true
    },
    {
      icon: <FolderIcon size={20} className="text-blue-600 dark:text-blue-300" />,
      label: "My Drive",
      action: () => {
        window.location.href = "/"
        closeMobileMenu();
      }
    },
    {
      icon: <ClockIcon size={20} className="text-green-600 dark:text-green-300" />,
      label: "Recent",
      action: () => {
        window.location.href = "/recent"
        closeMobileMenu();
      }
    },
    {
      icon: <StarIcon size={20} className="text-yellow-500 dark:text-yellow-400" />,
      label: "Starred",
      action: () => {
        window.location.href = "/starred"
        closeMobileMenu();
      }
    },
    {
      icon: <UsersIcon size={20} className="text-purple-600 dark:text-purple-400" />,
      label: "Shared with me",
      action: () => {
        alert("mainNav.tsx me line 62 thik nhi hui hai")
        closeMobileMenu();
      }
    },
    {
      icon: <TrashIcon size={20} className="text-red-500 dark:text-red-400" />,
      label: "Trash",
      action: () => {
        window.location.href = "/trash"
        closeMobileMenu();
      }
    },
    {
      icon: <GearIcon size={20} className="text-gray-600 dark:text-gray-300" />,
      label: "Settings",
      action: () => {
        window.location.href = "/settings"
        closeMobileMenu();
      }
    }
  ];

  return (
    <>
      {/* Desktop Header (md and above) */}
      <div className="h-16 w-full hidden md:flex items-center justify-between px-4 md:px-8 lg:px-12 xl:px-16 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 fixed top-0 left-0 right-0 z-50 backdrop-blur-sm bg-white/95 dark:bg-black/95">
        <div className="flex items-center flex-1 min-w-0">
          <div className="flex-shrink-0">
            <NavbarLogo />
          </div>
          <div className="ml-4 lg:ml-8 xl:ml-20 flex-1 max-w-md lg:max-w-lg xl:max-w-xl">
            <SearchBar />
          </div>
        </div>
        
        <div className="flex items-center gap-3 lg:gap-4 xl:gap-6 flex-shrink-0">
          {user && (
            <div className="hidden lg:flex items-center gap-2 xl:gap-3 mr-2 xl:mr-4">
              <img
                src={placeholderProfilePic}
                alt="Profile"
                className="h-7 w-7 xl:h-8 xl:w-8 rounded-full ring-2 ring-gray-200 dark:ring-gray-700"
              />
              <h1 className="dark:text-white font-fkGrotesk text-sm xl:text-base truncate max-w-24 xl:max-w-32">
                Hi! {user.name}
              </h1>
            </div>
          )}
          
          {user && (
            <div className="lg:hidden">
              <img
                src={placeholderProfilePic}
                alt="Profile"
                className="h-7 w-7 rounded-full ring-2 ring-gray-200 dark:ring-gray-700"
              />
            </div>
          )}
          
          <GearIcon
            size={24}
            className="md:w-6 md:h-6 lg:w-7 lg:h-7 xl:w-8 xl:h-8 dark:text-gray-300 text-gray-600 hover:rotate-90 hover:text-gray-500 dark:hover:text-gray-400 duration-300 transition-all cursor-pointer"
          />
          <Toggle />
        </div>
      </div>

      {/* Mobile Header (smaller than md) */}
      <div className="h-14 w-full md:hidden flex items-center justify-between px-3 sm:px-4 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-700 fixed top-0 left-0 right-0 z-50 backdrop-blur-sm bg-white/95 dark:bg-black/95">
        {/* Logo */}
        <div className="flex-shrink-0">
          <NavbarLogo />
        </div>
        
        {/* Search Bar - Wider and More Left-Aligned */}
        <div className="flex-1 max-w-md ml-2 mr-1 sm:ml-3 sm:mr-2">
          <SearchBar />
        </div>
        
        {/* Hamburger Menu */}
        <button
          onClick={toggleMobileMenu}
          className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors flex-shrink-0"
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? (
            <XIcon size={20} className="text-gray-600 dark:text-gray-300" />
          ) : (
            <ListIcon size={20} className="text-gray-600 dark:text-gray-300" />
          )}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/30 z-40 md:hidden"
            onClick={closeMobileMenu}
          />
          
          {/* Mobile Menu Popup - Full Width Dropdown */}
          <div className="fixed top-14 left-0 right-0 w-full bg-white dark:bg-black border-b border-gray-200 dark:border-gray-700 shadow-lg z-50 md:hidden animate-in slide-in-from-top duration-300">
            <div className="p-4 max-w-sm mx-auto space-y-2">
              
              {/* User Profile Section */}
              {user && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-neutral-800 rounded-lg mb-4">
                  <img
                    src={placeholderProfilePic}
                    alt="Profile"
                    className="h-10 w-10 rounded-full ring-2 ring-gray-200 dark:ring-gray-600"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-fkGrotesk font-medium text-gray-900 dark:text-white text-sm truncate">
                      {user.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
              )}

              {/* Navigation Menu Items */}
              <div className="space-y-1">
                {menuItems.map((item, index) => (
                  <div key={index}>
                    {item.isTheme ? (
                      // Special case for theme toggle
                      <div className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-neutral-800 rounded-lg transition-colors">
                        <div className="flex items-center gap-3">
                          {item.icon}
                          <span className="font-fkGrotesk text-gray-900 dark:text-white">
                            {item.label}
                          </span>
                        </div>
                        <Toggle />
                      </div>
                    ) : (
                      // Regular menu items
                      <button
                        onClick={item.action}
                        className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-neutral-800 rounded-lg transition-colors text-left"
                      >
                        {item.icon}
                        <span className="font-fkGrotesk text-gray-900 dark:text-white">
                          {item.label}
                        </span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default MainNav;
