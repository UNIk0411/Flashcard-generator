import React from "react";
import { FiFolder, FiCopy, FiHelpCircle, FiTrendingUp } from "react-icons/fi";

export default function ProgressTracker({ decks = [] }) {
  // Aggregate stats across all saved decks
  const totalDecks = decks.length;
  let totalCardsCount = 0;
  let totalMcqsCount = 0;
  let masteredCount = 0;
  let totalCardsEvaluated = 0;

  decks.forEach((deck) => {
    const cards = deck.flashcards || [];
    totalCardsCount += cards.length;
    totalMcqsCount += (deck.mcqs || []).length;

    // Load progress state for each deck to count mastered cards
    try {
      const storedProgress = window.localStorage.getItem(`studyforge_progress_${deck.id}`);
      if (storedProgress) {
        const progressObj = JSON.parse(storedProgress);
        Object.keys(progressObj).forEach((key) => {
          totalCardsEvaluated++;
          if (progressObj[key] >= 3) {
            masteredCount++;
          }
        });
      }
    } catch (e) {
      console.error("Error reading progress for deck " + deck.id, e);
    }
  });

  const overallMasteryVal = totalCardsCount > 0 
    ? Math.round((masteredCount / totalCardsCount) * 100) 
    : 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Total Decks */}
      <div className="rounded-2xl border border-gray-150 bg-white p-5 shadow-sm dark:border-slate-850 dark:bg-slate-900 transition-all hover-scale">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xs font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500">
              Total Decks
            </span>
            <span className="mt-1 block text-2xl font-bold text-slate-800 dark:text-white">
              {totalDecks}
            </span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-slate-800 dark:text-blue-400">
            <FiFolder className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Total Flashcards */}
      <div className="rounded-2xl border border-gray-150 bg-white p-5 shadow-sm dark:border-slate-850 dark:bg-slate-900 transition-all hover-scale">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xs font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500">
              Flashcards Built
            </span>
            <span className="mt-1 block text-2xl font-bold text-slate-800 dark:text-white">
              {totalCardsCount}
            </span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-slate-800 dark:text-violet-400">
            <FiCopy className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Total MCQs */}
      <div className="rounded-2xl border border-gray-150 bg-white p-5 shadow-sm dark:border-slate-850 dark:bg-slate-900 transition-all hover-scale">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xs font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500">
              MCQs Generated
            </span>
            <span className="mt-1 block text-2xl font-bold text-slate-800 dark:text-white">
              {totalMcqsCount}
            </span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-slate-800 dark:text-emerald-450">
            <FiHelpCircle className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Mastery Index */}
      <div className="rounded-2xl border border-gray-150 bg-white p-5 shadow-sm dark:border-slate-850 dark:bg-slate-900 transition-all hover-scale">
        <div className="flex items-center justify-between">
          <div className="w-full mr-2">
            <span className="text-2xs font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500">
              Concept Mastery
            </span>
            <span className="mt-1 block text-2xl font-bold text-slate-800 dark:text-white">
              {overallMasteryVal}%
            </span>
            <div className="mt-2.5 h-1.5 w-full rounded-full bg-gray-105 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${overallMasteryVal}%` }}
              />
            </div>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-slate-800 dark:text-amber-400">
            <FiTrendingUp className="h-5 w-5" />
          </div>
        </div>
      </div>
    </div>
  );
}
