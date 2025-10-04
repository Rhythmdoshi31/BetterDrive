import React from "react";
import VantaBirdsBackground from "./VantaBirdsBackground";
import { TextGenerateEffect } from "./ui/text-generate-effect";

interface HeroProps {
  className?: string;
}

const Hero: React.FC<HeroProps> = ({ className }) => {
  return (
    <div id="home" className={`relative h-svh ${className || ""}`}>
      <VantaBirdsBackground />
      <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-5 text-black dark:text-white">
        {/* Main headline - more impactful */}
        <h1 className="text-[2.8rem] md:text-[3.1rem] font-black font-antique-olive tracking-wide scale-y-110 leading-tight">
          GOOGLE DRIVE <br />
          THAT FEELS RIGHT
        </h1>

        {/* Subheading - clearer value */}
        <TextGenerateEffect
          words="Simple . clean . effortless"
          className="text-xl mb-6 py-1 px-2 font-light font-oswald"
        />

        {/* CTA */}
        <button
          onClick={() => {
            // Check if screen is large (lg breakpoint is 1024px in Tailwind)
            const element = document.getElementById("imgCompare");
              if (element) {
                element.scrollIntoView({ behavior: "smooth" });
              }
            // if (window.innerWidth >= 1024) {
            //   // Large screens: scroll to imgCompare
            //   const element = document.getElementById("imgCompare");
            //   if (element) {
            //     element.scrollIntoView({ behavior: "smooth" });
            //   }
            // } else {
            //   // Small screens: redirect to Google auth
            //   // window.location.href = "http://localhost:3000/auth/google";
            //   // window.location.href = "https://better-drive-tau.vercel.app/vip-list";

            // }
          }}
          className="bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 px-7 py-[0.65rem] rounded-lg font-semibold text-[1.145rem] transition-colors shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
        >
          {/* Show "Connect Drive" on mobile, "Feel The Difference" on large screens */}
          <span className="lg:hidden">Feel The Difference</span>
          <span className="hidden lg:inline">Feel The Difference</span>
        </button>
      </div>
    </div>
  );
};

export default Hero;
