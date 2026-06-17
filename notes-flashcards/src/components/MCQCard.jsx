import React, { useState } from "react";
import { FiCheck, FiX, FiInfo, FiChevronRight, FiRefreshCw, FiDownload, FiAward } from "react-icons/fi";

export default function MCQCard({ deckId, mcqs = [] }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [history, setHistory] = useState([]); // Array of { questionIndex, selected, isCorrect }
  const [quizComplete, setQuizComplete] = useState(false);

  if (mcqs.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500 dark:text-slate-400">
        No multiple choice questions available in this deck.
      </div>
    );
  }

  const currentQuestion = mcqs[currentIdx];
  const { question, options = [], answer, explanation } = currentQuestion;

  const handleOptionSelect = (option) => {
    if (isAnswered) return;
    setSelectedOption(option);
  };

  const handleAnswerSubmit = () => {
    if (selectedOption === null || isAnswered) return;

    const isCorrect = selectedOption === answer;
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }

    setHistory((prev) => [
      ...prev,
      {
        questionIndex: currentIdx,
        selected: selectedOption,
        isCorrect,
      },
    ]);

    setIsAnswered(true);
  };

  const handleNext = () => {
    setSelectedOption(null);
    setIsAnswered(false);
    if (currentIdx + 1 < mcqs.length) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      setQuizComplete(true);
    }
  };

  const restartQuiz = () => {
    setCurrentIdx(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setHistory([]);
    setQuizComplete(false);
  };

  const exportMCQAsJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(mcqs, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `studynotes_mcq_${deckId}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const getOptionClasses = (option) => {
    const baseClass = "w-full text-left p-4 rounded-xl border font-medium transition-all flex items-center justify-between ";
    
    // Not submitted yet
    if (!isAnswered) {
      if (selectedOption === option) {
        return baseClass + "border-blue-500 bg-blue-50/50 text-blue-900 dark:border-blue-500 dark:bg-blue-950/20 dark:text-blue-200 ring-2 ring-blue-500/20";
      }
      return baseClass + "border-gray-200 bg-white text-slate-800 hover:border-blue-300 hover:bg-gray-50/50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-700";
    }

    // After answer is submitted
    if (option === answer) {
      // Correct Option (always highlight green)
      return baseClass + "border-emerald-500 bg-emerald-50 text-emerald-900 dark:border-emerald-500 dark:bg-emerald-950/30 dark:text-emerald-200 font-semibold";
    }
    
    if (selectedOption === option && option !== answer) {
      // Selected Option was Incorrect (highlight red)
      return baseClass + "border-rose-500 bg-rose-50 text-rose-900 dark:border-rose-500 dark:bg-rose-950/30 dark:text-rose-200";
    }

    // All other unselected, incorrect options
    return baseClass + "border-gray-100 bg-white opacity-60 text-slate-400 dark:border-slate-850 dark:bg-slate-900 dark:text-slate-500";
  };

  const scorePercentage = Math.round((score / mcqs.length) * 100);

  return (
    <div className="flex flex-col gap-6">
      {/* Quiz Panel Header */}
      <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-900 border border-gray-100 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">
              Multiple Choice Quiz
            </h2>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
              Test your knowledge. Answer questions one-by-one to get graded immediately.
            </p>
          </div>
          <button
            onClick={exportMCQAsJSON}
            className="flex items-center justify-center gap-1.5 self-start sm:self-center rounded-xl border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-gray-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            <FiDownload className="h-3.5 w-3.5" /> Export MCQs
          </button>
        </div>

        {/* Stats progress */}
        <div className="mt-4 flex items-center justify-between text-xs font-semibold text-gray-500 dark:text-slate-400">
          <span>Question Progress</span>
          <span>{quizComplete ? mcqs.length : currentIdx + 1} / {mcqs.length}</span>
        </div>
        <div className="mt-1.5 h-2 w-full rounded-full bg-gray-100 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-blue-600 transition-all duration-300"
            style={{ width: `${((quizComplete ? mcqs.length : currentIdx + 1) / mcqs.length) * 100}%` }}
          />
        </div>
      </div>

      {quizComplete ? (
        /* Quiz Summary Screen */
        <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900 py-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-slate-800 dark:text-blue-400 shadow-md">
            <FiAward className="h-9 w-9" />
          </div>
          
          <h3 className="mt-4 text-xl font-bold text-slate-800 dark:text-white">
            Quiz Completed!
          </h3>
          
          <div className="mt-6 max-w-sm mx-auto rounded-xl bg-slate-50 dark:bg-slate-850 p-5">
            <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-slate-800">
              <span className="text-sm text-slate-600 dark:text-slate-400">Total Questions</span>
              <span className="text-base font-bold text-slate-950 dark:text-white">{mcqs.length}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-slate-800">
              <span className="text-sm text-slate-600 dark:text-slate-400">Correct Answers</span>
              <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">{score}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">Final Grade</span>
              <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{scorePercentage}%</span>
            </div>
          </div>

          <div className="mt-8 flex justify-center gap-3">
            <button
              onClick={restartQuiz}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/20 transition-all"
            >
              <FiRefreshCw className="h-4 w-4" /> Take Quiz Again
            </button>
          </div>
        </div>
      ) : (
        /* Active Quiz Screen */
        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-gray-250 bg-white p-6 shadow-sm dark:border-slate-850 dark:bg-slate-900 transition-colors">
            {/* Question Text */}
            <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white leading-relaxed">
              {question}
            </h3>

            {/* Options List */}
            <div className="mt-6 flex flex-col gap-3">
              {options.map((option, idx) => {
                const isCorrectOption = option === answer;
                const isSelectedOption = option === selectedOption;

                return (
                  <button
                    key={idx}
                    onClick={() => handleOptionSelect(option)}
                    className={getOptionClasses(option)}
                    disabled={isAnswered}
                  >
                    <span>{option}</span>
                    {isAnswered && isCorrectOption && (
                      <FiCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    )}
                    {isAnswered && isSelectedOption && !isCorrectOption && (
                      <FiX className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation box */}
            {isAnswered && explanation && (
              <div className="mt-6 flex items-start gap-3 rounded-xl bg-blue-50/50 p-4 text-sm text-slate-700 dark:bg-slate-850/50 dark:text-slate-300 border border-blue-100/30 dark:border-slate-800/30 transition-all">
                <FiInfo className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-blue-900 dark:text-blue-300">Explanation</p>
                  <p className="mt-1 text-slate-650 dark:text-slate-400 leading-relaxed">
                    {explanation}
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-6 flex justify-end">
              {!isAnswered ? (
                <button
                  onClick={handleAnswerSubmit}
                  disabled={selectedOption === null}
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-40 disabled:pointer-events-none hover:shadow-lg hover:shadow-blue-500/20 transition-all"
                >
                  Submit Answer
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/20 transition-all"
                >
                  {currentIdx + 1 === mcqs.length ? "Finish Quiz" : "Next Question"}
                  <FiChevronRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
