import React, { useState, useEffect } from "react";
import Flashcard from "./Flashcard";
import { FiChevronLeft, FiChevronRight, FiRefreshCw, FiDownload, FiCheckCircle } from "react-icons/fi";
import { useLocalStorage } from "../hooks/useLocalStorage";

export default function FlashcardDeck({ deckId, cards = [] }) {
  // Save card confidence scores in local storage, key unique to this deck
  const [confidence, setConfidence] = useLocalStorage(`studyforge_progress_${deckId}`, {});
  const [queue, setQueue] = useState([]);
  const [currentQueueIndex, setCurrentQueueIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Initialize/reset queue
  useEffect(() => {
    if (cards.length > 0) {
      // Queue stores the indices of cards. Initial queue is 0, 1, 2, ..., N-1
      const initialQueue = cards.map((_, index) => index);
      setQueue(initialQueue);
      setCurrentQueueIndex(0);
      setIsFlipped(false);
    }
  }, [cards, deckId]);

  if (cards.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500 dark:text-slate-400">
        No flashcards available in this deck.
      </div>
    );
  }

  const currentCardIndex = queue[currentQueueIndex];
  const currentCard = cards[currentCardIndex];
  const currentConfidence = confidence[currentCardIndex] || 0;

  // Confidence state updater
  const updateConfidence = (cardIdx, change) => {
    setConfidence((prev) => {
      const current = prev[cardIdx] || 0;
      const nextScore = Math.max(0, Math.min(5, current + change));
      return { ...prev, [cardIdx]: nextScore };
    });
  };

  const handleKnow = () => {
    updateConfidence(currentCardIndex, 1);
    setIsFlipped(false);
    setCurrentQueueIndex((prev) => prev + 1);
  };

  const handleDontKnow = () => {
    // Reset or decrement confidence
    updateConfidence(currentCardIndex, -1);

    // Prioritize card again later: insert into queue
    // Add current index 3 places ahead, or at the end of the queue
    const nextQueue = [...queue];
    const itemToRequeue = queue[currentQueueIndex];
    
    // We insert 3 slots after currentQueueIndex
    const insertAt = Math.min(currentQueueIndex + 4, nextQueue.length);
    nextQueue.splice(insertAt, 0, itemToRequeue);
    
    setQueue(nextQueue);
    setIsFlipped(false);
    setCurrentQueueIndex((prev) => prev + 1);
  };

  const handlePrevious = () => {
    if (currentQueueIndex > 0) {
      setIsFlipped(false);
      setCurrentQueueIndex((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentQueueIndex((prev) => prev + 1);
  };

  const resetReview = () => {
    // Restart review queue with all cards
    const initialQueue = cards.map((_, index) => index);
    setQueue(initialQueue);
    setCurrentQueueIndex(0);
    setIsFlipped(false);
  };

  const exportDeckAsJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(cards, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `studynotes_flashcards_${deckId}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Stats calculation
  const masteredCount = cards.filter((_, idx) => (confidence[idx] || 0) >= 3).length;
  const learningCount = cards.filter((_, idx) => (confidence[idx] || 0) > 0 && (confidence[idx] || 0) < 3).length;
  const newCount = cards.length - masteredCount - learningCount;
  const masteryPercentage = Math.round((masteredCount / cards.length) * 100);

  const isSessionComplete = currentQueueIndex >= queue.length;

  return (
    <div className="flex flex-col gap-6">
      {/* Deck Stats Header */}
      <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-900 border border-gray-100 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">
              Flashcard Practice
            </h2>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
              Spaced repetition mode is active. "Don't Know" cards will re-appear later in the practice queue.
            </p>
          </div>
          <button
            onClick={exportDeckAsJSON}
            className="flex items-center justify-center gap-1.5 self-start sm:self-center rounded-xl border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-gray-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            <FiDownload className="h-3.5 w-3.5" /> Export Deck
          </button>
        </div>

        {/* Progress Grid */}
        <div className="mt-4 grid grid-cols-3 gap-3 border-t border-gray-100 dark:border-slate-800 pt-4 text-center">
          <div>
            <span className="block text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {masteredCount}
            </span>
            <span className="text-2xs font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500">
              Mastered
            </span>
          </div>
          <div>
            <span className="block text-xl font-bold text-blue-600 dark:text-blue-400">
              {learningCount}
            </span>
            <span className="text-2xs font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500">
              Learning
            </span>
          </div>
          <div>
            <span className="block text-xl font-bold text-gray-500 dark:text-slate-400">
              {newCount}
            </span>
            <span className="text-2xs font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500">
              Unstudied
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-500 dark:text-slate-400 mb-1">
            <span>Overall Mastery</span>
            <span>{masteryPercentage}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${masteryPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Flashcard Display Area */}
      {isSessionComplete ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900 py-12">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
            <FiCheckCircle className="h-7 w-7" />
          </div>
          <h3 className="mt-4 text-lg font-bold text-slate-800 dark:text-white">
            Practice Run Complete
          </h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-slate-400 max-w-sm mx-auto">
            You reviewed all cards in your current queue. Keep studying to master your concepts.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={resetReview}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/20 transition-all"
            >
              <FiRefreshCw className="h-4 w-4" /> Restart Deck
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <Flashcard
            card={currentCard}
            isFlipped={isFlipped}
            onFlip={() => setIsFlipped(!isFlipped)}
            onKnow={handleKnow}
            onDontKnow={handleDontKnow}
            confidenceScore={currentConfidence}
          />

          {/* Navigation and Flip Helpers */}
          <div className="flex items-center justify-between w-full max-w-xl px-2 mt-2">
            <button
              onClick={handlePrevious}
              disabled={currentQueueIndex === 0}
              className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-350 dark:hover:bg-slate-800 transition-colors"
            >
              <FiChevronLeft className="h-4 w-4" />
              Previous
            </button>

            <span className="text-xs font-semibold text-gray-500 dark:text-slate-450">
              Card {currentQueueIndex + 1} of {queue.length}
            </span>

            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-gray-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-350 dark:hover:bg-slate-800 transition-colors"
            >
              Next
              <FiChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
