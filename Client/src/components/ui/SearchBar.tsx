import { useState } from "react";
import { PlaceholdersAndVanishInput } from "./placeholders-and-vanish-input";

export const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState("");

    const placeholders = [
        "Search for files and folders...",
        "Find documents, images, videos...",
        "Search by file name or type...",
        "Look for PDFs, presentations, spreadsheets...",
        "Find files shared with you...",
        "Search for recent files...",
        "Find folders by name...",
        "Search Google Docs, Sheets, Slides...",
        "Look for files you starred...",
        "Find files by date or size...",
      ];

      const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          setSearchQuery(e.target.value);
        };
      
        const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
          e.preventDefault();
          
          if (!searchQuery.trim()) return;
          
          // Your Google Drive API search logic here
          console.log("Searching Google Drive for:", searchQuery);
          
          // Example search implementation
        //   try {
        //     // Call your Google Drive search function
        //     const results = await searchGoogleDrive(searchQuery);
        //     // Handle results...
        //   } catch (error) {
        //     console.error("Search failed:", error);
        // }
        };

    return (
        <PlaceholdersAndVanishInput
            placeholders={placeholders}
            onChange={handleSearchChange}
            onSubmit={handleSearch} 
          />
    )
};


