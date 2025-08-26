import React, { useEffect, useRef } from "react";

const VantaBirdsBackground: React.FC = () => {
  const vantaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let effect: VantaEffect | undefined;    // <- now recognised

    if (vantaRef.current) {
      effect = window.VANTA.BIRDS({
        el: vantaRef.current,
        mouseControls: true,
        touchControls: true,
        resize: true,
        backgroundColor: 0x060618,
        color1: 0x2849b6,
        color2: 0x253675,
        scale: 1,
        birdSize: 2,
        wingspan: 30,
        separation: 63,
        alignment: 70,
        cohesion: 53,
        quantity: 3,
      });

      const canvas = vantaRef.current.querySelector("canvas");
      if (canvas) {
        canvas.style.zIndex = "-999";
        canvas.style.position = "absolute";
      }
      vantaRef.current.style.zIndex = "-999";
    }

    return () => effect?.destroy();
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
