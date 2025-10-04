import { useEffect, useState } from "react";
import { LinkPreview } from "./ui/link-preview";

export const Footer = () => {
  const [_isDarkMode, setIsDarkMode] = useState(false);

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
    <div id="contact" className={`h-auto min-h-[60vh] pb-8 md:pb-0 w-full flex flex-col md:flex-row items-center justify-center dark:bg-[#000000] dark:border-t-neutral-700/50 bg-[#FFFCFC] border-t-neutral-300/50 border-[1px]`}>
      <div className="flex flex-col h-auto w-full md:h-full md:w-[40%] lg:w-[50%] items-center md:items-start justify-end">
        <div className="px-[6vw] md:pl-[6vw] lg:pl-[10vw] md:pr-0 h-auto pt-8 pb-4 md:h-[30vh] flex flex-col justify-center md:justify-end text-center md:text-left">
          <div>
            <a
              href="#"
              className="relative z-20 mr-4 flex items-center justify-center md:justify-start space-x-2 py-1 mb-4 md:mb-0 text-[2rem] md:text-[3rem] lg:text-[4rem] font-normal text-black"
            >
              <img
                src="BDlogo.webp"
                alt="logo"
                width={48}
                height={48}
                className="scale-120 mr-2 bg-black rounded-md"
              />
              <span className="font-medium text-black dark:text-white">
                BetterDrive
              </span>
            </a>
          </div>
          <div className={`text-md dark:text-neutral-500 text-neutral-700`}>
            <h1 className="">
              A product by <LinkPreview url="https://rhythmdoshi.site" className={`dark:text-sky-500 dark:hover:text-sky-600 text-sky-600 hover:text-sky-500`}>Rhythm Doshi</LinkPreview>
            </h1>
          </div>
        </div>
        <div className="w-full py-4 md:h-[30vh] flex items-center md:items-end justify-center md:justify-start pb-4 md:pb-[13vh] px-[6vw] md:pl-[6vw] lg:pl-[10vw] md:pr-0">
          <h1 className={`dark:text-neutral-500 text-neutral-700 text-sm`}>
            © 2025 BetterDrive. All rights reserved.
          </h1>
        </div>
      </div>
      <div className="flex h-auto w-full md:h-full md:w-[50%] px-[6vw] md:pl-[10vw] md:pr-0 items-center justify-center pb-8 md:pb-0">
        <div className={`flex w-full gap-8 md:gap-8 lg:gap-16 dark:text-neutral-500 text-neutral-600 text-md justify-center md:justify-start`}>
          {/* First column - 5 rows with extra space after 2nd item */}
          <div className="flex flex-col justify-center space-y-4">
            {corePages.slice(0, 5).map((e, i) => (
              <div key={i} className={i === 0 ? `mb-8 dark:text-sky-500 hover:text-sky-600 text-sky-600 hover:text-sky-500` : ""}>
                {e}
              </div>
            ))}
          </div>

          {/* Second column - 3 rows with extra space between 2nd and 3rd row */}
          <div className="flex flex-col justify-center space-y-4">
            {corePages.slice(5).map((e, i) => (
              <div key={i} className={i === 1 ? "mb-16" : ""}>
                {e}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const corePages = [
  "rhythmdoshi04@gmail.com",
  "Home",
  "Pricing",
  "FAQ",
  "Sponsor",
  "About",
  "Contact",
  "Privacy Policy",
  "Terms of Service",
];
