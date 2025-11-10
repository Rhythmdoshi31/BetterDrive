import React, { useEffect, useRef } from "react";

const VantaBirdsBackground: React.FC = () => {
  const vantaRef = useRef<HTMLDivElement>(null);
  const effectRef = useRef<any>(null);

  useEffect(() => {
    const initVanta = () => {
      const isDark = document.documentElement.classList.contains("dark");
      const backgroundColor = isDark ? 0xb0b14 : 0xFFFEFE;

      if (effectRef.current) {
        try {
          effectRef.current.destroy();
        } catch (e) {
          console.log('Vanta destroy error:', e);
        }
      }

      if (vantaRef.current) {
        try {
          effectRef.current = window.VANTA.BIRDS({
            el: vantaRef.current,
            mouseControls: true,
            touchControls: true,
            resize: true,
            backgroundColor,
            color1: 0x2849b6,
            color2: 0x253675,
            scale: 1,
            birdSize: 2,
            wingspan: 30,
            separation: 20,
            alignment: 70,
            cohesion: 53,
            quantity: 2.7,
          });
        } catch (e) {
          console.error('Vanta init error:', e);
        }
      }
    };

    initVanta();

    // Dark mode observer
    const observer = new MutationObserver(initVanta);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      observer.disconnect();
      if (effectRef.current) {
        try {
          effectRef.current.destroy();
        } catch (e) {
          console.log('Cleanup error:', e);
        }
      }
    };
  }, []);

  return (
    <div
      ref={vantaRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: -999,
        pointerEvents: "none",
        overflow: "hidden",
        opacity: 1, // ✅ Always visible
      }}
    />
  );
};

export default VantaBirdsBackground;
