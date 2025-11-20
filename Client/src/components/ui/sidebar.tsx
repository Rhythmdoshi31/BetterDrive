import { cn } from "../../lib/utils";
import React, { useState, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { Links } from "../../types/sidebar-types";
import { useLocation } from "react-router-dom";
import FileUpload from "../FileUpload";

interface CleanSidebarProps {
  links: Links[];
  uploadLink: Links;
  className?: string;
  onRefresh?: () => void;
}

export const CleanSidebar: React.FC<CleanSidebarProps> = ({ 
  links, 
  uploadLink, 
  className,
  onRefresh
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [hoverOrigin, setHoverOrigin] = useState<'top' | 'bottom' | 'center'>('center');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const prevMousePosition = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Get current route
  const location = useLocation();
  const pathname = location.pathname;

  // Find active index with dashboard as fallback
  const activeIndex = useMemo(() => {
    let index = links.findIndex(link => {
      if (link.href === pathname) return true;
      if (pathname === '/dashboard' && link.href === '/dashboard') return true;
      if (pathname === '/' && link.href === '/dashboard') return true;
      return false;
    });

    // If no match found, default to dashboard (My Drive)
    if (index === -1) {
      const dashboardIndex = links.findIndex(link => link.href === '/dashboard' || link.href === '/');
      index = dashboardIndex !== -1 ? dashboardIndex : 0;
    }

    return index;
  }, [pathname, links]);

  // Icon dimensions
  const iconHeight = 40;
  const iconGap = 12;
  const stripStartY = 25;

  // Handle upload completion
  const handleUploadComplete = (files: File[]) => {
    console.log('Files uploaded successfully:', files);
    setIsUploadModalOpen(false);
    onRefresh?.();
  };

  const detectHoverDirection = useCallback((iconIndex: number, mouseY: number) => {
    if (!containerRef.current) return 'center';
    
    const rect = containerRef.current.getBoundingClientRect();
    const iconCenterY = stripStartY + (iconIndex * (iconHeight + iconGap)) + (iconHeight / 2);
    const iconTopY = iconCenterY - (iconHeight / 2);
    const iconBottomY = iconCenterY + (iconHeight / 2);
    const relativeMouseY = mouseY - rect.top;
    const prevRelativeY = prevMousePosition.current.y - rect.top;

    if (prevRelativeY < iconTopY && relativeMouseY >= iconTopY) {
      return 'top';
    }
    else if (prevRelativeY > iconBottomY && relativeMouseY <= iconBottomY) {
      return 'bottom';
    }
    else {
      return 'center';
    }
  }, [stripStartY, iconHeight, iconGap]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    prevMousePosition.current = { x: e.clientX, y: e.clientY };
  }, []);

  const getStripAnimation = (origin: 'top' | 'bottom' | 'center', iconIndex: number) => {
    const iconTopY = stripStartY + (iconIndex * (iconHeight + iconGap)) + 15;
    const iconCenterY = iconTopY + (iconHeight / 2);
    const iconBottomY = iconTopY + iconHeight;
    const stripHeight = iconHeight;

    switch (origin) {
      case 'top':
        return {
          initial: { height: 0, top: iconTopY },
          animate: { height: stripHeight, top: iconTopY },
        };
      case 'bottom':
        return {
          initial: { height: 0, top: iconBottomY },
          animate: { height: stripHeight, top: iconTopY },
        };
      case 'center':
      default:
        return {
          initial: { height: 0, top: iconCenterY },
          animate: { height: stripHeight, top: iconTopY },
        };
    }
  };

  return (
    <>
      <div 
        ref={containerRef}
        className={cn(
          "fixed md:left-4 lg:left-9 top-[50%] -translate-y-[50%] z-40 flex flex-col items-center h-[50vh]",
          className
        )}
        onMouseMove={handleMouseMove}
      >
        <div className="relative h-full flex flex-col">
          <div className="relative z-10 mb-0 flex-shrink-0">
            <CleanSidebarItem 
              link={uploadLink} 
              isUpload 
              onUploadClick={() => setIsUploadModalOpen(true)}
            />
          </div>

          <div 
            className="bg-white dark:bg-neutral-950/80 rounded-b-full border-[1px] border-gray-200 dark:border-neutral-800 flex flex-col items-center gap-3 -mt-7 pt-10 pb-6 px-2 relative md:w-10 lg:w-14 flex-1"
          >
            
            {/* Active Strip */}
            <motion.div
              className="absolute left-0 w-1 bg-blue-600 dark:bg-blue-400 rounded-r-xs z-10"
              initial={false}
              animate={{ 
                height: iconHeight,
                top: stripStartY + (activeIndex * (iconHeight + iconGap)) + 15
              }}
              transition={{ 
                duration: 0.3, 
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
            />
            
            {/* Hover Strip */}
            <AnimatePresence>
              {hoveredIndex !== null && hoveredIndex !== activeIndex && (
                <motion.div
                  className="absolute left-0 w-1 bg-blue-500/60 dark:bg-blue-300/60 rounded-r-xs"
                  {...getStripAnimation(hoverOrigin, hoveredIndex)}
                  exit={{ 
                    height: 0,
                    top: stripStartY + (hoveredIndex * (iconHeight + iconGap)) + 15 + (iconHeight / 2)
                  }}
                  transition={{ 
                    duration: 0.2, 
                    ease: [0.25, 0.46, 0.45, 0.94]
                  }}
                />
              )}
            </AnimatePresence>
            
            {links.map((link, idx) => (
              <CleanSidebarItem 
                key={idx} 
                link={link}
                isActive={idx === activeIndex}
                onHover={(mouseY) => {
                  const origin = detectHoverDirection(idx, mouseY);
                  setHoverOrigin(origin);
                  setHoveredIndex(idx);
                }}
                onLeave={() => setHoveredIndex(null)}
                index={idx}
              />
            ))}
          </div>
        </div>
      </div>

      {/* FileUpload Modal */}
      <FileUpload
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadComplete={handleUploadComplete}
      />
    </>
  );
};

interface CleanSidebarItemProps {
  link: Links;
  isUpload?: boolean;
  isActive?: boolean;
  onHover?: (mouseY: number) => void;
  onLeave?: () => void;
  index?: number;
  onUploadClick?: () => void;
}

const CleanSidebarItem: React.FC<CleanSidebarItemProps> = ({ 
  link, 
  isUpload = false,
  isActive = false,
  onHover,
  onLeave,
  onUploadClick,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = (e: React.MouseEvent) => {
    setIsHovered(true);
    onHover?.(e.clientY);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    onLeave?.();
  };

  const handleUploadClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onUploadClick?.();
  };

  if (isUpload) {
    return (
      <div className="relative flex justify-center">
        <button
          onClick={handleUploadClick} 
          className="flex items-center justify-center w-10 lg:w-14 h-10 lg:h-14 bg-green-600 hover:bg-green-700 rounded-full transition-all duration-200 shadow-lg group"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="text-gray-200 transition-transform duration-200 group-hover:scale-110">
            {link.icon}
          </div>

          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, x: -10, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -10, scale: 0.8 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="absolute left-full ml-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap shadow-lg z-50 top-1/2 -translate-y-1/2"
              >
                {link.label}
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>
    );
  }

  return (
    <div className="relative flex justify-center">
      <a
        href={link.href}
        className={cn(
          "flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ease-in-out relative group",
          isActive 
            ? "bg-blue-50 dark:bg-blue-900/20" 
            : "hover:bg-blue-50 dark:hover:bg-blue-900/20"
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className={cn(
          "transition-all duration-300 ease-in-out group-hover:scale-110",
          isActive || isHovered 
            ? "text-blue-600 dark:text-blue-400" 
            : "text-gray-600 dark:text-gray-400"
        )}>
          {link.icon}
        </div>

        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, x: -10, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -10, scale: 0.8 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="absolute left-full ml-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap shadow-lg z-50 top-1/2 -translate-y-1/2"
            >
              {link.label}
              <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900 dark:border-r-gray-100"></div>
            </motion.div>
          )}
        </AnimatePresence>
      </a>
    </div>
  );
};

export default CleanSidebar;
