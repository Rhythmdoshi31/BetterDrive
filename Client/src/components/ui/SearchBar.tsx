import React, { useState } from 'react';
import { MagnifyingGlassIcon, XIcon } from '@phosphor-icons/react';

interface SearchComponentProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
  disabled?: boolean;
}

const SearchComponent: React.FC<SearchComponentProps> = ({
  placeholder = "Search your files...",
  onSearch,
  className = "",
  disabled = false
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch?.(value);
  };

  const clearSearch = () => {
    setSearchQuery("");
    onSearch?.("");
  };

  return (
    <div className={`relative ${className}`}>
      {/* Search Container */}
      <div className={`
        relative flex items-center
        w-full max-w-[90vw] sm:max-w-[70vw] md:w-[35vw]
        h-10 px-4 rounded-3xl
        bg-white dark:bg-black
        border-1 transition-all duration-200 ease-in-out
        ${isFocused 
          ? 'border-blue-500 dark:border-blue-400 shadow-lg ring-2 ring-blue-100 dark:ring-blue-900/30' 
          : 'border-gray-200 dark:border-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}>
        
        {/* Magnifying Glass Icon */}
        <MagnifyingGlassIcon 
          size={20} 
          className={`
            mr-3 transition-colors duration-200
            ${isFocused 
              ? 'text-blue-500 dark:text-blue-400' 
              : 'text-gray-400 dark:text-gray-500'
            }
          `}
        />
        
        {/* Search Input */}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          disabled={disabled}
          className="
            flex-1 bg-transparent outline-none
            text-gray-900 dark:text-gray-100
            placeholder-gray-400 dark:placeholder-gray-500
            text-base font-medium
            disabled:cursor-not-allowed
          "
        />
        
        {/* Clear Button */}
        {searchQuery && (
          <button
            onClick={clearSearch}
            className="
              ml-2 p-1 rounded-full
              text-gray-400 dark:text-gray-500
              hover:text-gray-600 dark:hover:text-gray-300
              hover:bg-gray-100 dark:hover:bg-gray-700
              transition-all duration-200
            "
          >
            <XIcon size={16} />
          </button>
        )}
      </div>
      
      {/* Search Results Indicator (Optional) */}
      {searchQuery && (
        <div className="absolute top-full left-0 right-0 mt-1">
          <div className="text-xs text-gray-500 dark:text-gray-400 px-2">
            Searching for "{searchQuery}"...
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchComponent;
