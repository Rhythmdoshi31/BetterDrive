import React from "react";
import Hero from "./Hero";
import NavBar from "./NavBar";
import { ComparisonPage } from "./ComparisonPage";
import { CardsPage } from "./CardsPage";

const Home: React.FC = () => {
  return (
    <div className="h-full">
      <NavBar />
      <Hero data-midnight="blue" />
      {/* bg-gray-100 dark:bg-neutral-900/50 */}
      <ComparisonPage />
      <CardsPage />
    </div>
  );
};

export default Home;
