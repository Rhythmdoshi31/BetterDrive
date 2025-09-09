import { LinkPreview } from "./ui/link-preview";

export const Footer = () => {
  return (
    <div className="h-[60vh] w-full flex items-center justify-center bg-[#000000] border-[1px] border-t-neutral-700/50">
      <div className="flex flex-col h-full w-[50%] items-start justify-end">
        <div className="pl-[10vw] h-[30vh] flex flex-col justify-end">
          <div>
            <a
              href="#"
              className="relative z-20 mr-4 flex items-center space-x-2 py-1 text-[4rem] font-normal text-black"
            >
              <img
                src="https://assets.aceternity.com/logo-dark.png"
                alt="logo"
                width={44}
                height={44}
              />
              <span className="font-medium text-black dark:text-white">
                BetterDrive
              </span>
            </a>
          </div>
          <div className="text-md text-neutral-500">
            <h1 className="">
              A product by <LinkPreview url="https://rhythmdoshi.site" className="text-sky-500" >Rhythm Doshi</LinkPreview>
            </h1>
          </div>
        </div>
        <div className="w-full h-[30vh] flex items-end pb-[13vh] pl-[10vw]">
          <h1 className="text-neutral-500 text-sm ">
            © 2025 BetterDrive. All rights reserved.
          </h1>
        </div>
      </div>
      <div className="flex h-full w-[50%] pl-[10vw] items-center justify-center">
        <div className="flex w-full gap-16 text-neutral-500 text-md">
          {/* First column - 5 rows with extra space after 2nd item */}
          <div className="flex flex-col justify-center space-y-4">
            {corePages.slice(0, 5).map((e, i) => (
              <div key={i} className={i === 0 ? "mb-8 text-sky-500" : ""}>
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
