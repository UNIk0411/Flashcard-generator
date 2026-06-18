import React from "react";
import { FiSun, FiMoon, FiBookOpen } from "react-icons/fi";

export default function Navbar({ isDarkMode, onToggleDarkMode }) {
  return (
    <nav className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
              <FiBookOpen className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Study Notes Generator
              </span>
              
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onToggleDarkMode}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-slate-700 hover:bg-gray-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
              aria-label="Toggle theme"
            >
              {isDarkMode ? (
                <FiSun className="h-5 w-5 text-amber-500" />
              ) : (
                <FiMoon className="h-5 w-5 text-indigo-600" />
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
