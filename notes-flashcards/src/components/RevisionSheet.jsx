import React, { useState } from "react";
import { FiBookOpen, FiBookmark, FiCpu, FiHash, FiChevronDown, FiChevronUp } from "react-icons/fi";

export default function RevisionSheet({ revisionSheetData = [] }) {
  const [expandedIndex, setExpandedIndex] = useState(null);

  if (revisionSheetData.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500 dark:text-slate-400">
        No revision notes available in this deck.
      </div>
    );
  }

  // Categories helper to map headings and icons
  const getCategoryIcon = (category) => {
    const lower = category.toLowerCase();
    if (lower.includes("formula")) return <FiHash className="h-4 w-4" />;
    if (lower.includes("command") || lower.includes("code")) return <FiCpu className="h-4 w-4" />;
    if (lower.includes("definition")) return <FiBookmark className="h-4 w-4" />;
    return <FiBookOpen className="h-4 w-4" />;
  };

  const getCategoryColor = (category) => {
    const lower = category.toLowerCase();
    if (lower.includes("formula")) return "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/20";
    if (lower.includes("command") || lower.includes("code")) return "text-violet-600 bg-violet-50 dark:text-violet-400 dark:bg-violet-950/20";
    if (lower.includes("definition")) return "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/20";
    return "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/20";
  };

  // Group by category
  const categoriesMap = revisionSheetData.reduce((acc, curr) => {
    const cat = curr.category || "General Notes";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(curr);
    return acc;
  }, {});

  const toggleExpand = (idx) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-900 border border-gray-100 dark:border-slate-800">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white">
          Revision Sheet
        </h2>
        <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
          Quick review sheet containing critical terminology, key concepts, formulas, and code snippets.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {Object.keys(categoriesMap).map((categoryName, catIdx) => {
          const items = categoriesMap[categoryName];
          return (
            <div key={catIdx} className="rounded-2xl border border-gray-150 bg-white overflow-hidden shadow-sm dark:border-slate-850 dark:bg-slate-900 transition-colors">
              {/* Category Header */}
              <div className="flex items-center gap-2.5 bg-gray-50/50 px-5 py-4 border-b border-gray-100 dark:bg-slate-850/30 dark:border-slate-800">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${getCategoryColor(categoryName)}`}>
                  {getCategoryIcon(categoryName)}
                </div>
                <h3 className="font-bold text-slate-800 dark:text-white text-sm sm:text-base">
                  {categoryName}
                </h3>
                <span className="ml-auto rounded-full bg-gray-100 px-2 py-0.5 text-2xs font-semibold text-gray-600 dark:bg-slate-800 dark:text-slate-450">
                  {items.length} {items.length === 1 ? "Item" : "Items"}
                </span>
              </div>

              {/* Category Items List */}
              <div className="divide-y divide-gray-100 dark:divide-slate-850">
                {items.map((item, itemIdx) => {
                  const globalIdx = `${catIdx}_${itemIdx}`;
                  const isExpanded = expandedIndex === globalIdx;

                  return (
                    <div key={itemIdx} className="transition-colors">
                      <button
                        onClick={() => toggleExpand(globalIdx)}
                        className="flex w-full items-center justify-between px-5 py-4 text-left font-semibold text-slate-800 hover:bg-gray-50/50 dark:text-slate-200 dark:hover:bg-slate-850/40"
                      >
                        <span className="text-sm sm:text-base">{item.title}</span>
                        {isExpanded ? (
                          <FiChevronUp className="h-4 w-4 text-gray-400 shrink-0" />
                        ) : (
                          <FiChevronDown className="h-4 w-4 text-gray-400 shrink-0" />
                        )}
                      </button>
                      
                      {isExpanded && (
                        <div className="bg-gray-50/30 px-5 pb-5 pt-1 text-sm text-slate-650 dark:bg-slate-900/40 dark:text-slate-400 leading-relaxed border-t border-gray-50 dark:border-slate-850/30">
                          {categoryName.toLowerCase().includes("command") || categoryName.toLowerCase().includes("code") ? (
                            <pre className="mt-2 rounded-xl bg-slate-950 p-4 font-mono text-xs text-slate-200 overflow-x-auto">
                              <code>{item.content}</code>
                            </pre>
                          ) : (
                            <p className="whitespace-pre-wrap">{item.content}</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
