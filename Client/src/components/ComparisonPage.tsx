import React from "react";
import ImageCompare from "./ImageCompare";
import { FlipWords } from "./ui/flip-words";
import { NavbarButton } from "./ui/resizable-navbar";

export const ComparisonPage: React.FC = () => {
  const handleConnectDrive = (): void => {
    window.location.href = "http://localhost:3000/auth/google";
  };

  return (
    //  pt-[13vh] flex-col
    <div
    className="h-[100vh] w-full flex flex-col items-center justify-start pt-[14vh]"
    style={{
        background:
        "linear-gradient(135deg, rgba(0,0,0,0.5) 0%, rgba(8, 8, 28, 0.5) 50%, rgba(3, 12, 37, 0.5) 100%), linear-gradient(225deg, rgba(0,0,0,0.5) 0%, rgba(13, 13, 68, 0.5) 50%, rgba(3, 12, 37, 0.5) 100%)",
    }}
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
        className="mt-2 text-3xl mb-4 pr-1 font-antique-olive"
        />
      </div>
      <hr className="mb-7 h-[2px] dark:h-[1px] w-[7vw] bg-neutral-900/50 dark:bg-gray-500" />
      <ImageCompare id="hi" />

      {/* CTA - more action-oriented */}
      <NavbarButton
        variant="gradient"
        className="mt-8 scale-110 px-5"
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
