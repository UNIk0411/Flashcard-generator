import React, { useState } from "react";
import { FiCopy, FiDownload, FiCheck } from "react-icons/fi";

export default function SummaryPanel({ deckId, summary }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!summary) return;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    if (!summary) return;
    const dataStr = "data:text/plain;charset=utf-8," + encodeURIComponent(summary);
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `studynotes_summary_${deckId}.txt`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="rounded-2xl border border-gray-150 bg-white p-6 shadow-sm dark:border-slate-850 dark:bg-slate-900 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">
            AI Study Summary
          </h2>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
            A comprehensive, high-level overview of your uploaded study material.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-gray-55 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            {copied ? (
              <>
                <FiCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                Copied
              </>
            ) : (
              <>
                <FiCopy className="h-3.5 w-3.5" />
                Copy Text
              </>
            )}
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/20 transition-all"
          >
            <FiDownload className="h-3.5 w-3.5" />
            Export TXT
          </button>
        </div>
      </div>

      <div className="mt-6 prose prose-slate max-w-none dark:prose-invert">
        <div className="text-base text-slate-750 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
          {summary || "No summary was generated."}
        </div>
      </div>
    </div>
  );
}
