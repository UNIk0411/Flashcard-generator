import React, { useState } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import Navbar from "../components/Navbar";
import UploadZone from "../components/UploadZone";
import ProgressTracker from "../components/ProgressTracker";
import LoadingScreen from "../components/LoadingScreen";
import FlashcardDeck from "../components/FlashcardDeck";
import MCQCard from "../components/MCQCard";
import SummaryPanel from "../components/SummaryPanel";
import RevisionSheet from "../components/RevisionSheet";
import { parseFile } from "../services/fileParser";
import { generateStudyMaterials } from "../services/gemini";
import { FiBookOpen, FiTrash2, FiClock, FiLayers, FiHelpCircle, FiChevronDown, FiChevronUp } from "react-icons/fi";

// Sub-component for Important Questions section (show/hide answer toggles)
function ImportantQuestionsList({ questions = [] }) {
  const [revealedIndices, setRevealedIndices] = useState({});

  const toggleReveal = (idx) => {
    setRevealedIndices((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  if (questions.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500 dark:text-slate-400">
        No exam questions available in this deck.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-900 border border-gray-100 dark:border-slate-800">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white">
          Important Exam Questions
        </h2>
        <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
          Review these high-probability questions extracted by AI to prepare for exams.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {questions.map((item, idx) => {
          const isRevealed = !!revealedIndices[idx];
          return (
            <div
              key={idx}
              className="rounded-2xl border border-gray-150 bg-white p-5 shadow-sm dark:border-slate-850 dark:bg-slate-900 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-xs font-bold text-blue-600 dark:bg-slate-800 dark:text-blue-400">
                    {idx + 1}
                  </span>
                  <h3 className="font-bold text-slate-850 dark:text-slate-200 text-sm sm:text-base leading-relaxed">
                    {item.question}
                  </h3>
                </div>
                <button
                  onClick={() => toggleReveal(idx)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-slate-700 hover:bg-gray-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-750 transition-colors"
                  aria-label="Toggle answer reveal"
                >
                  {isRevealed ? <FiChevronUp className="h-4 w-4" /> : <FiChevronDown className="h-4 w-4" />}
                </button>
              </div>

              {isRevealed && (
                <div className="mt-4 border-t border-gray-100 dark:border-slate-800 pt-4 text-sm text-slate-650 dark:text-slate-400 leading-relaxed transition-all">
                  <p className="font-semibold text-slate-900 dark:text-slate-300 mb-1">Suggested Answer</p>
                  <p className="whitespace-pre-wrap">{item.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [isDarkMode, setIsDarkMode] = useLocalStorage("studyforge_darkmode", false);
  const [decks, setDecks] = useLocalStorage("studyforge_decks", []);
  const [activeDeckId, setActiveDeckId] = useLocalStorage("studyforge_active_deck_id", "");
  const [activeTab, setActiveTab] = useState("flashcards"); // flashcards, mcqs, summary, revision, questions
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState(null);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  const handleFileSelected = async (file) => {
    if (!file) {
      setError(null);
      return;
    }

    setIsProcessing(true);
    setError(null);
    setLoadingStep(0); // Parsing phase

    try {
      // 1. Client-side Parsing
      const extractedText = await parseFile(file);
      
      // 2. AI Generation phase triggers
      setLoadingStep(1);
      setTimeout(() => setLoadingStep(2), 1500);

      // Call Gemini Service
      const generatedData = await generateStudyMaterials(extractedText);

      setLoadingStep(3);
      
      // Generate unique ID
      const newDeckId = Date.now().toString();
      const newDeck = {
        id: newDeckId,
        name: file.name.replace(/\.[^/.]+$/, ""), // Strip extension
        date: new Date().toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        flashcards: generatedData.flashcards,
        mcqs: generatedData.mcqs,
        summary: generatedData.summary,
        revision_sheet: generatedData.revision_sheet,
        important_questions: generatedData.important_questions,
      };

      setLoadingStep(4);
      
      // Delay slightly for smooth transition feel
      setTimeout(() => {
        setDecks((prev) => [newDeck, ...prev]);
        setActiveDeckId(newDeckId);
        setIsProcessing(false);
      }, 1000);

    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong while compiling materials.");
      setIsProcessing(false);
    }
  };

  const deleteDeck = (id, e) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this deck?")) {
      const updatedDecks = decks.filter((deck) => deck.id !== id);
      setDecks(updatedDecks);
      // Clean up deck statistics in LocalStorage
      window.localStorage.removeItem(`studyforge_progress_${id}`);
      
      if (activeDeckId === id) {
        if (updatedDecks.length > 0) {
          setActiveDeckId(updatedDecks[0].id);
        } else {
          setActiveDeckId("");
        }
      }
    }
  };

  const activeDeck = decks.find((deck) => deck.id === activeDeckId) || null;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? "dark bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-800"}`}>
      <Navbar isDarkMode={isDarkMode} onToggleDarkMode={toggleDarkMode} />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-8">
          
          {/* Aggregated stats */}
          <ProgressTracker decks={decks} />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column - Decks Sidebar */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              
              {/* Creator Zone */}
              <div className="rounded-2xl border border-gray-150 bg-white p-5 shadow-sm dark:border-slate-850 dark:bg-slate-900 transition-colors">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-3">
                  Upload Study Material
                </h3>
                <UploadZone onFileSelected={handleFileSelected} isProcessing={isProcessing} error={error} />
              </div>

              {/* Saved Decks List */}
              <div className="rounded-2xl border border-gray-150 bg-white p-5 shadow-sm dark:border-slate-850 dark:bg-slate-900 transition-colors">
                <div className="flex items-center gap-2 border-b border-gray-105 dark:border-slate-800 pb-3 mb-4">
                  <FiLayers className="text-blue-500 h-4 w-4" />
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                    Your Study Decks
                  </h3>
                  <span className="ml-auto rounded-full bg-blue-50 px-2 py-0.5 text-2xs font-semibold text-blue-600 dark:bg-slate-800 dark:text-blue-450">
                    {decks.length}
                  </span>
                </div>

                {decks.length === 0 ? (
                  <div className="py-8 text-center text-sm text-gray-400 dark:text-slate-500">
                    No decks created yet. Upload a document above to get started.
                  </div>
                ) : (
                  <div className="flex flex-col gap-2.5 max-h-[360px] overflow-y-auto pr-1">
                    {decks.map((deck) => {
                      const isActive = deck.id === activeDeckId;
                      return (
                        <div
                          key={deck.id}
                          onClick={() => setActiveDeckId(deck.id)}
                          className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                            isActive
                              ? "border-blue-500 bg-blue-50/30 dark:border-blue-500 dark:bg-blue-950/15"
                              : "border-gray-100 hover:border-gray-300 hover:bg-gray-50/50 dark:border-slate-850 dark:hover:border-slate-800 dark:hover:bg-slate-850/50"
                          }`}
                        >
                          <div className="overflow-hidden mr-2">
                            <p className="truncate text-sm font-semibold text-slate-800 dark:text-white">
                              {deck.name}
                            </p>
                            <div className="flex items-center gap-2 mt-1.5 text-2xs text-gray-400 dark:text-slate-500">
                              <span className="flex items-center gap-0.5">
                                <FiClock className="h-3 w-3" />
                                {deck.date}
                              </span>
                              <span>•</span>
                              <span>{deck.flashcards.length} cards</span>
                            </div>
                          </div>
                          <button
                            onClick={(e) => deleteDeck(deck.id, e)}
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-rose-50 hover:text-rose-600 dark:text-slate-500 dark:hover:bg-rose-955/20 dark:hover:text-rose-400 transition-colors"
                            aria-label="Delete deck"
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Study/Review Pane */}
            <div className="lg:col-span-8">
              {activeDeck ? (
                <div className="flex flex-col gap-6">
                  
                  {/* Deck Title Header */}
                  <div className="rounded-2xl border border-gray-150 bg-white p-5 shadow-sm dark:border-slate-850 dark:bg-slate-900 transition-colors">
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                      {activeDeck.name}
                    </h1>
                  </div>

                  {/* Navigation Tabs */}
                  <div className="flex border-b border-gray-200 dark:border-slate-850 overflow-x-auto gap-2 scrollbar-none">
                    {[
                      { id: "flashcards", label: "Flashcards" },
                      { id: "mcqs", label: "MCQ Quiz" },
                      { id: "summary", label: "Summary" },
                      { id: "revision", label: "Revision Sheet" },
                      { id: "questions", label: "Exam Questions" },
                    ].map((tab) => {
                      const isActive = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`border-b-2 px-4 py-3 text-sm font-semibold whitespace-nowrap transition-colors ${
                            isActive
                              ? "border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500"
                              : "border-transparent text-gray-400 hover:text-slate-700 dark:text-slate-450 dark:hover:text-slate-205"
                          }`}
                        >
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Active Tab Screen render */}
                  <div className="transition-all">
                    {activeTab === "flashcards" && (
                      <FlashcardDeck deckId={activeDeck.id} cards={activeDeck.flashcards} />
                    )}
                    {activeTab === "mcqs" && (
                      <MCQCard deckId={activeDeck.id} mcqs={activeDeck.mcqs} />
                    )}
                    {activeTab === "summary" && (
                      <SummaryPanel deckId={activeDeck.id} summary={activeDeck.summary} />
                    )}
                    {activeTab === "revision" && (
                      <RevisionSheet revisionSheetData={activeDeck.revision_sheet} />
                    )}
                    {activeTab === "questions" && (
                      <ImportantQuestionsList questions={activeDeck.important_questions} />
                    )}
                  </div>
                </div>
              ) : (
                /* Empty state */
                <div className="rounded-2xl border border-gray-150 bg-white p-12 text-center shadow-sm dark:border-slate-850 dark:bg-slate-900 py-24 transition-colors">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-slate-800 dark:text-blue-400 shadow-inner">
                    <FiBookOpen className="h-8 w-8" />
                  </div>
                  <h2 className="mt-6 text-xl font-bold text-slate-800 dark:text-white">
                    No Study Deck Selected
                  </h2>
                  <p className="mt-2 text-sm text-gray-505 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                    Upload your study materials (PDF, DOCX, PPTX, TXT, or MD) on the left sidebar to generate learning tools.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Fullscreen Loading Overlay */}
      {isProcessing && <LoadingScreen currentStep={loadingStep} />}
    </div>
  );
}
