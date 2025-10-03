import { SignupFormDemo } from "./PreregisterForm";
import LightRays from "./ui/LightRays";
import { NavbarButton, NavbarLogo } from "./ui/resizable-navbar";
const PreregisterPage: React.FC = () => {
  const handleHome = () => {
    window.location.href = "http://localhost:5173"
  }
  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Background LightRays */}
      <div className="absolute inset-0 w-full h-full">
        <LightRays
          raysOrigin="top-center"
          raysColor="#105DFC"
          raysSpeed={1.5}
          lightSpread={0.6}
          rayLength={2}
          followMouse={true}
          mouseInfluence={0.15}
          noiseAmount={0}
          distortion={0.05}
          className="w-full h-full"
        />
      </div>
      <div className="absolute top-0 left-0 w-full h-[12vh] flex items-center justify-between px-[7vw] z-100">
        <NavbarLogo />
        <NavbarButton variant="gradient" onClick={handleHome}>Home</NavbarButton>
      </div>
      {/* Centered Form */}
      <div className="absolute inset-0 flex items-center justify-center z-50">
        <SignupFormDemo />
      </div>
    </div>
  );
};

export default PreregisterPage;
