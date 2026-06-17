import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiCheck, FiLoader } from "react-icons/fi";

const stepsList = [
  "Reading and parsing document...",
  "Analyzing text content & context...",
  "Synthesizing revision metrics with Gemini...",
  "Structuring flashcards and multiple-choice questions...",
  "Polishing summaries and exam sheets...",
];

export default function LoadingScreen({ currentStep = 0 }) {
  const [activeMessageIndex, setActiveMessageIndex] = useState(0);

  // Rotate messages to add high-fidelity feedback feel
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveMessageIndex((prev) => (prev + 1) % stepsList.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/60 backdrop-blur-md dark:bg-slate-950/85 transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl dark:bg-slate-900 border border-gray-150 dark:border-slate-800 mx-4"
      >
        <div className="flex flex-col items-center">
          {/* Main Loader Ring */}
          <div className="relative flex h-20 w-20 items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              className="absolute h-16 w-16 rounded-full border-4 border-blue-100 border-t-blue-600 dark:border-slate-850 dark:border-t-blue-500"
            />
            <div className="h-6 w-6 rounded-full bg-blue-600/10 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 flex items-center justify-center animate-pulse">
              <FiLoader className="animate-spin h-3.5 w-3.5" />
            </div>
          </div>

          <h3 className="mt-6 text-lg font-bold text-slate-900 dark:text-white">
            Forging Study Materials
          </h3>
          <p className="mt-1 text-sm text-center text-gray-500 dark:text-slate-400 px-4">
            Our AI model is building your personalized practice deck.
          </p>

          {/* Dynamic Message Box */}
          <div className="mt-8 w-full border-t border-gray-100 dark:border-slate-800 pt-6">
            <div className="flex flex-col gap-4">
              {stepsList.map((stepMessage, index) => {
                const isCompleted = index < currentStep;
                const isActive = index === currentStep;

                return (
                  <div
                    key={index}
                    className={`flex items-center gap-3 text-sm transition-all duration-300 ${
                      isActive
                        ? "text-blue-600 dark:text-blue-400 font-semibold scale-100"
                        : isCompleted
                        ? "text-emerald-600 dark:text-emerald-450 opacity-80"
                        : "text-gray-400 dark:text-slate-600 opacity-50"
                    }`}
                  >
                    <div
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-all ${
                        isCompleted
                          ? "border-emerald-500 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400"
                          : isActive
                          ? "border-blue-500 bg-blue-50 dark:border-blue-900/30 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400"
                          : "border-gray-200 dark:border-slate-800 bg-transparent"
                      }`}
                    >
                      {isCompleted ? (
                        <FiCheck className="h-3 w-3 stroke-[3]" />
                      ) : isActive ? (
                        <FiLoader className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <span className="text-2xs font-bold">{index + 1}</span>
                      )}
                    </div>
                    <span className="truncate">{stepMessage}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
