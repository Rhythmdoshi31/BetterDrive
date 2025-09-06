import React from "react";
import Hero from "./Hero";
import NavBar from "./NavBar";
import { ComparisonPage } from "./ComparisonPage";
import { WobbleCard } from "./ui/wobble-card";

const Home: React.FC = () => {
  return (
    <div className="h-full">
      <NavBar />
      <Hero data-midnight="blue" />
      {/* bg-gray-100 dark:bg-neutral-900/50 */}
      <ComparisonPage />
      <div className="h-[100vh] flex items-center justify-center">
        <WobbleCard children="hi" />
      </div>
    </div>
  );
};

export default Home;
