import React from "react";
import VantaBirdsBackground from "./VantaBirdsBackground";
import { TextGenerateEffect } from "./ui/text-generate-effect";

interface HeroProps {
  className?: string;
}

const Hero: React.FC<HeroProps> = ({ className }) => {
  const handleConnectDrive = (): void => {
    window.location.href = "http://localhost:3000/auth/google";
  };

  return (
    <div className={`relative h-svh ${className || ""}`}>
      <VantaBirdsBackground />
      <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-5 text-black dark:text-white">
  
  {/* Main headline - more impactful */}
  <h1 className="text-[2.8rem] md:text-[3.1rem] font-black font-antique-olive tracking-wide scale-y-110 leading-tight">
    GOOGLE DRIVE <br />THAT FEELS RIGHT
  </ h1>
  
  {/* Subheading - clearer value */}
  <TextGenerateEffect words="Simple . clean . effortless" className="text-xl mb-6 py-1 px-2 font-light font-oswald" />
  
  {/* CTA - more action-oriented */}
  <button 
    onClick={handleConnectDrive}
    className="bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 px-7 py-[0.65rem] rounded-lg font-semibold text-lg transition-colors"
  >
    Feel The Difference
  </button>
  
</div>

    </div>
  );
};

export default Hero;
