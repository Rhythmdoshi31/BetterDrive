"use client";
import { cn } from "../../lib/utils";
import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { Links } from "../../types/sidebar-types";

interface CleanSidebarProps {
  links: Links[];
  uploadLink: Links;
  className?: string;
}

export const CleanSidebar: React.FC<CleanSidebarProps> = ({ 
  links, 
  uploadLink, 
  className 
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [hoverOrigin, setHoverOrigin] = useState<'top' | 'bottom' | 'center'>('center');
  const prevMousePosition = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Icon dimensions
  const iconHeight = 40; // Height of each icon
  const iconGap = 12; // Gap between icons
  const stripStartY = 70; // Starting position after upload button

  const detectHoverDirection = useCallback((iconIndex: number, mouseY: number) => {
    if (!containerRef.current) return 'center';
    
    const rect = containerRef.current.getBoundingClientRect();
    const iconCenterY = stripStartY + (iconIndex * (iconHeight + iconGap)) + (iconHeight / 2);
    const iconTopY = iconCenterY - (iconHeight / 2);
    const iconBottomY = iconCenterY + (iconHeight / 2);
    const relativeMouseY = mouseY - rect.top;
    const prevRelativeY = prevMousePosition.current.y - rect.top;

    // If mouse came from above the icon
    if (prevRelativeY < iconTopY && relativeMouseY >= iconTopY) {
      return 'top';
    }
    // If mouse came from below the icon  
    else if (prevRelativeY > iconBottomY && relativeMouseY <= iconBottomY) {
      return 'bottom';
    }
    // Default: from left/right or direct hover
    else {
      return 'center';
    }
  }, [stripStartY, iconHeight, iconGap]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    prevMousePosition.current = { x: e.clientX, y: e.clientY };
  }, []);

  const getStripAnimation = (origin: 'top' | 'bottom' | 'center', iconIndex: number) => {
    const iconCenterY = stripStartY + (iconIndex * (iconHeight + iconGap)) + (iconHeight / 2);
    const iconTopY = iconCenterY - (iconHeight / 2);
    const iconBottomY = iconCenterY + (iconHeight / 2);
    const stripHeight = iconHeight; // Only cover the icon height

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
    <div 
      ref={containerRef}
      className={cn(
        "fixed md:left-4 lg:left-9 top-[50%] -translate-y-[50%] z-40 flex flex-col items-center",
        className
      )}
      onMouseMove={handleMouseMove}
    >
      <div className="relative">
        <div className="relative z-10 mb-0">
          <CleanSidebarItem link={uploadLink} isUpload />
        </div>

        <div 
          className="bg-white dark:bg-neutral-950/80 rounded-b-full border-[1px] border-gray-200 dark:border-neutral-800 flex flex-col items-center gap-3 -mt-7 pt-10 pb-4 px-2 rdelative md:w-10 lg:w-14"
          style={{ 
            minHeight: 'calc(70vh - 120px + 1vh)'
          }}>
          
          {/* Blue Strip - Only covers the hovered icon */}
          <AnimatePresence>
            {hoveredIndex !== null && (
              <motion.div
                className="absolute left-0 w-1 bg-blue-600 dark:bg-blue-400 rounded-r-xs"
                {...getStripAnimation(hoverOrigin, hoveredIndex)}
                exit={{ 
                  height: 0,
                  top: stripStartY + (hoveredIndex * (iconHeight + iconGap)) + (iconHeight / 2)
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
  );
};

interface CleanSidebarItemProps {
  link: Links;
  isUpload?: boolean;
  onHover?: (mouseY: number) => void;
  onLeave?: () => void;
  index?: number;
}

const CleanSidebarItem: React.FC<CleanSidebarItemProps> = ({ 
  link, 
  isUpload = false,
  onHover,
  onLeave,
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

  if (isUpload) {
    return (
      <div className="relative flex justify-center">
        <a
          href={link.href}
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
                <div className="absolute right-full top-1/2 -translate-y-1/2"></div>
              </motion.div>
            )}
          </AnimatePresence>
        </a>
      </div>
    );
  }

  return (
    <div className="relative flex justify-center">
      <a
        href={link.href}
        className="flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ease-in-out relative group hover:bg-blue-50 dark:hover:bg-blue-900/20"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className={cn(
          "transition-all duration-300 ease-in-out group-hover:scale-110",
          isHovered 
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
