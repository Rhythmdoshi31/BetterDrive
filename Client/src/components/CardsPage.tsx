import type React from "react";
import { WobbleCard } from "./ui/wobble-card";
import { useEffect, useState } from "react";
import '../styles/gradients.css'

export const CardsPage: React.FC = () => {
    const [isDarkMode, setIsDarkMode] = useState(false);
  
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    
    // Check initially
    checkDarkMode();
    
    // Watch for class changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []); 
  return (
    <div id="features"
      className={`flex flex-col items-center justify-center h-[160vh] sm:h-[140vh] md:h-[120vh] lg:h-[100vh] pt-[3vh] ${isDarkMode ? 'cardsPage-dark' : 'bg-[#FFFEFE]'}`}
    >
      <h1 className="text-[2.4rem] pr-1 dark:text-gray-100 text-neutral-900 font-antique-olive text-center">
        What Makes BetterDrive Special
      </h1>
      <hr className="mt-[2.4vh] mb-[-1.4vh] h-[2px] dark:h-[1px] w-[7vw] bg-neutral-900/50 dark:bg-gray-500" />

      <div className=" h-[145svh] xs:h-[110svh] sm:h-[100svh] md:h-[75svh] lg:h-[65svh] grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-4 px-[15svw] pt-[8svh]">
        <WobbleCard
          children={[
            "Find Files Faster",
            "Smart visual organization gets you there quickly with our smart search",
          ]}
          titleClassName="text-center md:text-left text-[1.75rem] md:text-[1.5rem] lg:text-[1.6rem] xl:text-[1.75rem] font-antique-olive font-light mb-2"
          descriptionClassName="text-center md:text-left font-fkGrotesk lg:text-md"
          containerClassName="col-span-1 md:col-span-2 bg-pink-600/80 dark:bg-[#A71254]"
        />
        <WobbleCard
          
          children={[
            "More Intuitive Design",
            "Clean, logical interface that works the way you think - no more hunting for basic features",
          ]}
          titleClassName="text-center md:text-left text-[1.73rem] font-antique-olive font-light mb-2"
          descriptionClassName="text-center md:text-left lg:text-md font-fkGrotesk md:mr-[10vw] lg:mr-[15vw]"
          containerClassName="col-span-1 md:col-span-3 bg-indigo-800/90 dark:bg-[#3A2CAC]"
        />
        <WobbleCard
          children={[
            "Reduce Visual Clutter",
            "Distraction-free interface, only what you need",
          ]}
          titleClassName="text-center md:text-left text-[1.75rem] font-antique-olive font-light mb-2"
          descriptionClassName="text-center md:text-left font-fkGrotesk md:mr-[20vw] lg:text-md"
          containerClassName="col-span-1 md:col-span-3 bg-blue-800/90 dark:bg-[#1F3C90]"
          />
        <WobbleCard
          children={[
            "Organize Files Better",
            "Cleaner folders, effortless file management",
          ]}
          titleClassName="text-center md:text-left text-[1.75rem] font-antique-olive font-light mb-2"
          descriptionClassName="text-center md:text-left font-fkGrotesk lg:text-md lg:mr-10"
          containerClassName="col-span-1 md:col-span-2 bg-violet-800/80 dark:bg-violet-800"
        />
      </div>
    </div>
  );
};
