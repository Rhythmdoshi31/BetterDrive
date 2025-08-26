import React from "react";
import VantaBirdsBackground from "./VantaBirdsBackground";

const Hero: React.FC = () => {
  const handleConnectDrive = (): void => {
    window.location.href = "http://localhost:3000/auth/google";
  };

  return (
    <div className="relative h-full">  {/* Added h-screen for full height */}
      <VantaBirdsBackground />
      <div className="relative z-50 h-full flex flex-col justify-center items-center text-center px-5 text-white">
        <h1 className="text-5xl font-bold mb-6 text-white">Welcome to OneApp!</h1>
        <a 
          href="/dashboard" 
          className="text-blue-300 hover:text-blue-100 mb-6 text-lg underline"
        >
          Go to Dashboard
        </a>
        <h2 className="text-2xl mb-8 text-white">Your Google Drive Files</h2>
        <button 
          onClick={handleConnectDrive}
          className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg text-white font-semibold text-lg transition-colors"
        >
          Connect Google Drive
        </button>
      </div>
    </div>
  );
};

export default Hero;
