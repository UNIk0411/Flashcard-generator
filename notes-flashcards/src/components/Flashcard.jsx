import React from "react";
import { FiHelpCircle, FiCheck, FiX, FiCheckCircle } from "react-icons/fi";

export default function Flashcard({
  card,
  isFlipped,
  onFlip,
  onKnow,
  onDontKnow,
  confidenceScore = 0,
}) {
  const { question, answer } = card;

  // Visual helper for card mastery status
  const getConfidenceBadge = () => {
    if (confidenceScore >= 3) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
          <FiCheckCircle className="h-3 w-3" /> Mastered
        </span>
      );
    }
    if (confidenceScore > 0) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800 dark:bg-blue-950/40 dark:text-blue-300">
          Learning ({confidenceScore})
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-800 dark:bg-slate-800 dark:text-slate-300">
        New
      </span>
    );
  };

  return (
    <div className="w-full max-w-xl perspective-1000 mx-auto">
      <div
        onClick={onFlip}
        className={`relative h-80 w-full cursor-pointer transform-style-3d transition-transform duration-500 ${
          isFlipped ? "rotate-y-180" : ""
        }`}
      >
        {/* Front Side */}
        <div className="absolute inset-0 backface-hidden flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-slate-500">
              Question
            </span>
            {getConfidenceBadge()}
          </div>
          <div className="flex flex-1 items-center justify-center text-center px-4">
            <h3 className="text-lg sm:text-xl font-bold leading-relaxed text-slate-800 dark:text-white">
              {question}
            </h3>
          </div>
          <div className="text-center text-xs text-gray-400 dark:text-slate-550 select-none">
            Click card to flip and view answer
          </div>
        </div>

        {/* Back Side */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 flex flex-col justify-between rounded-2xl border border-gray-200 bg-slate-50 p-6 shadow-md dark:border-slate-800 dark:bg-slate-850 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-slate-500">
              Answer
            </span>
            {getConfidenceBadge()}
          </div>
          <div className="flex flex-1 items-center justify-center text-center overflow-y-auto px-4 my-2">
            <p className="text-base sm:text-lg leading-relaxed text-slate-800 dark:text-slate-200">
              {answer}
            </p>
          </div>

          <div className="flex justify-center gap-3" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={onDontKnow}
              className="flex items-center gap-1.5 rounded-xl bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:hover:bg-rose-950/40 transition-colors"
            >
              <FiX className="h-4 w-4" />
              Don't Know
            </button>
            <button
              onClick={onKnow}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:hover:bg-emerald-950/40 transition-colors"
            >
              <FiCheck className="h-4 w-4" />
              Know
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}