import { useState, useEffect } from "react";
import { MoonStarsIcon, SunDim } from "@phosphor-icons/react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [dark]);

  return (
    <button
      onClick={() => setDark(!dark)}
      className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors duration-300 shadow-md cursor-pointer"
    >
      {dark ? (
        <SunDim className="w-5 h-5 text-yellow-400 " />
      ) : (
        <MoonStarsIcon className="w-5 h-5 text-gray-700" />
      )}
    </button>
  );
}
