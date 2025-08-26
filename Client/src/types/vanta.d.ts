// src/types/vanta.d.ts   ← keep the .d.ts extension
// DO NOT put `export` in this file

interface VantaEffect {
  destroy(): void;
}

interface Window {
  VANTA: {
    BIRDS(options: Record<string, unknown>): VantaEffect;
  };
}
