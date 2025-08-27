import React from "react";
import Hero from "./Hero";
import NavBar from "./NavBar";

const Home: React.FC = () => {
  

  return (
    <div className="h-[200vh]">
      <NavBar />
      <Hero data-midnight="blue" />
      <h1 className="p-4 bg-green-600 dark:bg-red-600 ">
        Dark Mode
      </h1>
    </div>
  );
};

export default Home;
