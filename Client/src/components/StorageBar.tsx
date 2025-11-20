import React, { useState } from 'react';

interface StorageQuota {
  used: number;
  usedInDrive: number;
  usedInTrash: number;
  limit: number;
}

interface HorizontalStorageBarProps {
  storage: StorageQuota;
}

const HorizontalStorageBar: React.FC<HorizontalStorageBarProps> = ({ storage }) => {
  const [tooltip, setTooltip] = useState<{show: boolean; text: string; x: number; y: number} | null>(null);

  const formatStorage = (bytes: number) => {
    const gb = bytes / (1024 ** 3);
    return gb < 0.1 && gb > 0 ? gb.toFixed(2).replace(/\.?0+$/, '') : gb.toFixed(1);
  };

  // Calculate percentages
  const otherUsed = Math.max(0, storage.used - storage.usedInDrive - storage.usedInTrash);
  const otherPercent = Math.min((otherUsed / storage.limit) * 100, 100);
  const drivePercent = Math.min((storage.usedInDrive / storage.limit) * 100, 100);
  const trashPercent = Math.min((storage.usedInTrash / storage.limit) * 100, 100);
  const freeSpace = storage.limit - storage.used;

  // Ensure minimum visibility - if any segment is >0 but <1%, make it at least 1%
  const getVisibleWidth = (percent: number, hasData: boolean) => {
    if (!hasData || percent <= 0) return 0;
    return Math.max(percent, 1); // Minimum 1% width for visibility
  };

  const visibleOtherPercent = getVisibleWidth(otherPercent, otherUsed > 0);
  const visibleDrivePercent = getVisibleWidth(drivePercent, storage.usedInDrive > 0);
  const visibleTrashPercent = getVisibleWidth(trashPercent, storage.usedInTrash > 0);

  const handleMouseEnter = (text: string, event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltip({
      show: true,
      text,
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    });
  };

  const handleMouseLeave = () => {
    setTooltip(null);
  };

  return (
    <>
      <div className="hidden md:flex items-center gap-4">
        {/* Storage text */}
        <div className="text-right">
          <span className="text-blue-400 font-medium text-sm">
            {formatStorage(storage.used)}GB
          </span>
          <span className="text-gray-300 text-xs mx-1">/</span>
          <span className="text-gray-400 text-sm">
            {formatStorage(storage.limit)}GB
          </span>
        </div>
        
        {/* Horizontal storage bar with tooltips - RIGHT TO LEFT */}
        <div className="relative w-32 md:w-40 lg:w-48 h-3 bg-neutral-800 rounded-full overflow-hidden border border-neutral-700">
          {/* Free space background - hoverable */}
          <div
            className="absolute inset-0 bg-neutral-800 hover:bg-neutral-700 transition-colors duration-300 cursor-pointer"
            onMouseEnter={(e) => handleMouseEnter(`Free Space: ${formatStorage(freeSpace)}GB`, e)}
            onMouseLeave={handleMouseLeave}
          />
          
          {/* Other storage (blue) - starting from RIGHT */}
          {otherUsed > 0 && (
            <div
              className="absolute right-0 top-0 h-full bg-blue-500 hover:bg-blue-400 transition-all duration-300 cursor-pointer"
              style={{ width: `${visibleOtherPercent}%` }}
              onMouseEnter={(e) => handleMouseEnter(`Other: ${formatStorage(otherUsed)}GB`, e)}
              onMouseLeave={handleMouseLeave}
            />
          )}
          
          {/* Drive storage (green) - stacked to LEFT of other storage */}
          {storage.usedInDrive > 0 && (
            <div
              className="absolute top-0 h-full bg-green-500 hover:bg-green-400 transition-all duration-300 cursor-pointer"
              style={{ 
                right: `${visibleOtherPercent}%`,
                width: `${visibleDrivePercent}%`
              }}
              onMouseEnter={(e) => handleMouseEnter(`My Drive: ${formatStorage(storage.usedInDrive)}GB`, e)}
              onMouseLeave={handleMouseLeave}
            />
          )}
          
          {/* Trash storage (orange) - stacked to LEFT of drive storage */}
          {storage.usedInTrash > 0 && (
            <div
              className="absolute top-0 h-full bg-orange-500 hover:bg-orange-400 transition-all duration-300 cursor-pointer"
              style={{ 
                right: `${visibleOtherPercent + visibleDrivePercent}%`,
                width: `${visibleTrashPercent}%` 
              }}
              onMouseEnter={(e) => handleMouseEnter(`Trash: ${formatStorage(storage.usedInTrash)}GB`, e)}
              onMouseLeave={handleMouseLeave}
            />
          )}
        </div>
      </div>

      {/* Tooltip */}
      {tooltip?.show && (
        <div
          className="fixed bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg pointer-events-none whitespace-nowrap z-[9999] transition-opacity duration-200"
          style={{ 
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            transform: 'translate(-50%, -100%)'
          }}
        >
          <div className="absolute top-full left-1/2 transform -translate-x-1/2">
            <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
          {tooltip.text}
        </div>
      )}
    </>
  );
};

export default HorizontalStorageBar;
