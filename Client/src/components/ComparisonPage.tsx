import React from "react";
import ImageCompare from "./ImageCompare";
import { FlipWords } from "./ui/flip-words";
import { NavbarButton } from "./ui/resizable-navbar";

export const ComparisonPage: React.FC = () => {

    const handleConnectDrive = (): void => {
    window.location.href = "http://localhost:3000/auth/google";
  };

    return (
    <div
      className="h-[100vh] w-full flex flex-col items-center pt-[13vh] justify-start"
      style={{
        background:
          "linear-gradient(135deg, rgba(3, 12, 37, 0.5) 0%, rgba(8, 8, 28, 0.5) 50%, rgba(0,0,0,0.5) 100%), linear-gradient(225deg, rgba(3, 12, 37, 0.5) 0%, rgba(8,8,28,0.5) 50%, rgba(0,0,0,0.5) 100%)",
      }}
      id="imgCompare"
    >
    
      <FlipWords
        words={["BetterDrive: because you deserve Better", "How our platform makes your Drive Better", "Your files, Finally Beatiful"]}
        duration={2000}
        className="text-4xl mb-4 pr-1"
      />
      <hr className="mb-7 h-[2px] dark:h-[1px] w-[7vw] bg-neutral-900/50 dark:bg-gray-500" />
      <ImageCompare id="hi" />

      {/* CTA - more action-oriented */}
      <NavbarButton variant="gradient" className="mt-8 scale-110 px-5"  onClick={handleConnectDrive}>
          Join us Today
        </NavbarButton>
    </div>
  );
};
