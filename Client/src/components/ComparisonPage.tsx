import React, { useEffect, useState } from "react";
import ImageCompare from "./ImageCompare";
import { FlipWords } from "./ui/flip-words";
import { NavbarButton } from "./ui/resizable-navbar";
import '../styles/gradients.css'

export const ComparisonPage: React.FC = () => {
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
  const handleConnectDrive = (): void => {
    // window.location.href = "http://localhost:3000/auth/google";
    window.location.href = "https://better-drive-tau.vercel.app/vip-list";
  };
  return (
    //  pt-[13vh] flex-col
    <div
    className={`min-h-fit max-h-[100svh] w-full flex flex-col items-center justify-start py-[15svh] sm:pb-[10vh] sm:pt-[12.9vh] ${isDarkMode ? 'comparisonPageGradient-dark' : 'bg-[#FFFEFE]'}`}
    id="imgCompare"
    >
      <div className="overflow-hidden">
        <FlipWords
        words={[
            "BetterDrive: because you deserve Better",
            "How our platform makes your Drive Better",
            "Your files, Finally Beatiful",
        ]}
        duration={2000}
        className="h-[6vh] sm:h-auto mt-2 text-3xl mb-6 sm:mb-4 pr-1 font-antique-olive text-center"
        />
      </div>
      <hr className="mb-16 sm:mb-12 h-[2px] dark:h-[1px] w-[7vw] bg-neutral-900/50 dark:bg-gray-500" />
      <div className="shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-3xl">
        <ImageCompare id="hi"/>
      </div>

      {/* CTA - more action-oriented */}
      <NavbarButton
        variant="gradient"
        className="mt-16 sm:mt-8 scale-135 sm:scale-115 px-5 shadow-md"
        onClick={handleConnectDrive}
        >
        Join us Today
      </NavbarButton> 

        {/* FOR SIDE-BY-SIDE */}
          {/* px-20 pt-0 */}
      {/* <div>
        <FlipWords
        words={[
          "BetterDrive: because you deserve Better",
          "How our platform makes your Drive Better",
          "Your files, Finally Beatiful",
        ]}
        duration={2000}
        className="text-3xl mb-4 pr-1"
      />
      <hr className="mb-7 h-[2px] dark:h-[1px] w-[20vw] bg-neutral-900/50 dark:bg-gray-500" />
      <NavbarButton
        variant="gradient"
        className="mt-8 scale-110 px-5"
        onClick={handleConnectDrive}
      >
        Join us Today
      </NavbarButton>
      </div>
      <ImageCompare id="hi" /> */}

    </div>
  );
};
