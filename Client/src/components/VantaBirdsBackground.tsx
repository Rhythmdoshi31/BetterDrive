import React, { useEffect, useRef } from "react";

const VantaBirdsBackground: React.FC = () => {
  const vantaRef = useRef<HTMLDivElement>(null);
  const effectRef = useRef<VantaEffect | null>(null);

  useEffect(() => {
    const initVanta = () => {
      const isDark = document.documentElement.classList.contains("dark");
      const backgroundColor = isDark ? 0xb0b14 : 0xfff3f3;

      if (effectRef.current) effectRef.current.destroy();

      if (vantaRef.current) {
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

        const canvas = vantaRef.current.querySelector("canvas");
        if (canvas) {
          canvas.style.zIndex = "-999";
          canvas.style.position = "absolute";
        }
        vantaRef.current.style.zIndex = "-999";
      }
    };

    // initialize first time
    initVanta();

    // watch for dark/light toggle
    const observer = new MutationObserver(() => {
      initVanta();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      observer.disconnect();
      effectRef.current?.destroy();
    };
  }, []);

  return (
    <div
      ref={vantaRef}
      className="absolute inset-0"
      style={{ zIndex: -999, pointerEvents: "none" }}
    />
  );
};

export default VantaBirdsBackground;
