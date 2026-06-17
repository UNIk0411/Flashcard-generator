import React, { useState, useRef } from "react";
import { FiUploadCloud, FiFileText, FiX, FiAlertTriangle } from "react-icons/fi";

export default function UploadZone({ onFileSelected, isProcessing, error }) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const allowedExtensions = ["pdf", "pptx", "docx", "txt", "md"];

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const validateAndSetFile = (file) => {
    if (!file) return;
    const extension = file.name.split(".").pop().toLowerCase();
    if (!allowedExtensions.includes(extension)) {
      alert("Invalid file type. Please upload a PDF, PPTX, DOCX, TXT, or MD file.");
      return;
    }
    setSelectedFile(file);
    onFileSelected(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const triggerInput = () => {
    fileInputRef.current.click();
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onFileSelected(null);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="w-full">
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={!selectedFile && !isProcessing ? triggerInput : undefined}
        className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
          selectedFile
            ? "border-emerald-300 bg-emerald-50/20 dark:border-emerald-800 dark:bg-emerald-950/10 cursor-default"
            : isDragActive
            ? "border-blue-500 bg-blue-50/30 dark:border-blue-500 dark:bg-blue-950/10 cursor-pointerScale"
            : "border-gray-300 bg-white hover:border-blue-400 hover:bg-gray-50/50 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-slate-700 cursor-pointer"
        } ${isProcessing ? "opacity-75 pointer-events-none" : ""}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.pptx,.docx,.txt,.md"
          onChange={handleChange}
          disabled={isProcessing}
        />

        {selectedFile ? (
          <div className="flex w-full max-w-md items-center justify-between rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-slate-850 dark:bg-slate-800 transition-all">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                <FiFileText className="h-5 w-5" />
              </div>
              <div className="text-left overflow-hidden">
                <p className="truncate text-sm font-semibold text-slate-800 dark:text-white">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>
            {!isProcessing && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  clearFile();
                }}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:text-slate-500 dark:hover:bg-slate-700 dark:hover:text-slate-350 transition-colors"
                aria-label="Remove file"
              >
                <FiX className="h-4.5 w-4.5" />
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-slate-800 dark:text-blue-400 shadow-inner">
              <FiUploadCloud className="h-7 w-7" />
            </div>
            <p className="text-base font-semibold text-slate-800 dark:text-white">
              Drag and drop your study material here
            </p>
            <p className="mt-1.5 text-sm text-gray-500 dark:text-slate-400">
              or click to browse from your computer
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs font-medium text-gray-400 dark:text-slate-500">
              <span className="rounded bg-gray-100 px-1.5 py-0.5 dark:bg-slate-800">PDF</span>
              <span className="rounded bg-gray-100 px-1.5 py-0.5 dark:bg-slate-800">DOCX</span>
              <span className="rounded bg-gray-100 px-1.5 py-0.5 dark:bg-slate-800">PPTX</span>
              <span className="rounded bg-gray-100 px-1.5 py-0.5 dark:bg-slate-800">TXT</span>
              <span className="rounded bg-gray-100 px-1.5 py-0.5 dark:bg-slate-800">MD</span>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50/50 p-3 text-sm text-rose-800 dark:border-rose-900/30 dark:bg-rose-950/15 dark:text-rose-400">
          <FiAlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Parsing/Generation Error</p>
            <p className="mt-0.5 text-xs text-rose-700 dark:text-rose-350">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}
