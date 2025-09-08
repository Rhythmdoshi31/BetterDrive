import type React from "react";
import { WobbleCard } from "./ui/wobble-card";

export const CardsPage: React.FC = () => {
  return (
    <div
      className="flex flex-col items-center justify-center h-[100vh] pt-[3vh]"
      style={{
    background:
    "linear-gradient(45deg, rgba(0,0,0,0.5) 0%, rgba(8, 8, 28, 0.5) 50%, rgba(3, 12, 37, 0.5) 100%), linear-gradient(135deg, rgba(0,0,0,0.5) 0%, rgba(13, 13, 68, 0.5) 50%, rgba(3, 12, 37, 0.5) 100%)",
}}

    >
      <h1 className="text-4xl pr-1 text-white font-antique-olive">
        What Makes BetterDrive Special
      </h1>
      <hr className="mt-[2vh] mb-[-3vh] h-[2px] dark:h-[1px] w-[7vw] bg-neutral-900/50 dark:bg-gray-500" />

      <div className="h-[65vh] grid grid-cols-5 gap-4 px-[15vw] pt-[8vh]">
        <WobbleCard
          children={[
            "Find Files Faster",
            "Smart visual organization gets you there quickly",
          ]}
          titleClassName="text-left text-[1.75rem] font-antique-olive font-light mb-4"
          descriptionClassName="text-left font-fkGrotesk"
          containerClassName="col-span-2 bg-[#A71254]"
        />
        <WobbleCard
          
          children={[
            "More Intuitive Design",
            "Clean, logical interface that works the way you think - no more hunting for basic features",
          ]}
          titleClassName="text-left text-[1.75rem] font-antique-olive font-light mb-4"
          descriptionClassName="text-left font-fkGrotesk  mr-[15vw]"
          containerClassName="col-span-3 bg-pink-700 bg-[#3A2CAC]"
        />
        <WobbleCard
          children={[
            "Organize Files Better",
            "Cleaner folders, effortless file management",
          ]}
          titleClassName="text-left text-[1.75rem] font-antique-olive font-light mb-4"
          descriptionClassName="text-left font-fkGrotesk  mr-[20vw]"
          containerClassName="col-span-3 bg-violet-400 bg-[#1F3C90]"
        />
        <WobbleCard
          children={[
            "Reduce Visual Clutter",
            "Distraction-free interface, only what you need",
          ]}
          titleClassName="text-left text-[1.75rem] font-antique-olive font-light mb-4"
          descriptionClassName="text-left font-fkGrotesk"
          containerClassName="col-span-2 bg-violet-800"
        />
      </div>
    </div>
  );
};
