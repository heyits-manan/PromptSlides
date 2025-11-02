"use client";

import { Download } from "lucide-react";
import { generatePPTX, downloadPPTX } from "@/lib/pptGenerator";
import { useEffect, useState, type KeyboardEvent } from "react";
import SlideViewer from "./SlideViewer";
import type { Presentation } from "@/types";

interface PresentationPreviewProps {
  presentation: Presentation | null | undefined;
  onEditSlide?: (slideIndex: number, instruction: string) => Promise<void>;
  isEditing?: boolean;
}

export default function PresentationPreview({
  presentation,
  onEditSlide,
  isEditing = false,
}: PresentationPreviewProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [editingSlideIndex, setEditingSlideIndex] = useState<number | null>(null);
  const [editPrompt, setEditPrompt] = useState("");
  const [editError, setEditError] = useState<string | null>(null);

  useEffect(() => {
    setEditingSlideIndex(null);
    setEditPrompt("");
    setEditError(null);
  }, [presentation?.id, presentation?.updated_at]);

  const handleDownload = async () => {
    if (!presentation) return;

    setIsDownloading(true);
    try {
      const blob = await generatePPTX(presentation);
      downloadPPTX(blob, presentation.title || "presentation");
    } catch (error) {
      console.error("Error downloading presentation:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const openEditor = (slideIndex: number) => {
    if (!presentation || !onEditSlide) return;
    setActiveSlide(slideIndex);
    setEditingSlideIndex(slideIndex);
    setEditPrompt("");
    setEditError(null);
  };

  const closeEditor = () => {
    if (isEditing) return;
    setEditingSlideIndex(null);
    setEditPrompt("");
    setEditError(null);
  };

  const handleSubmitEdit = async () => {
    if (editingSlideIndex === null || !onEditSlide) return;

    const trimmed = editPrompt.trim();

    if (!trimmed) {
      setEditError("Describe how you want the slide to change.");
      return;
    }

    setEditError(null);

    try {
      await onEditSlide(editingSlideIndex, trimmed);
      setEditingSlideIndex(null);
      setEditPrompt("");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to edit slide";
      setEditError(message);
    }
  };

  const handleTextareaKeyDown = (
    event: KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      void handleSubmitEdit();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white flex items-center justify-between flex-shrink-0">
        <h2 className="text-lg font-semibold">Presentation Preview</h2>
        <div className="flex items-center gap-2">
          {onEditSlide && presentation && (
            <button
              type="button"
              onClick={() => openEditor(activeSlide)}
              disabled={isEditing || !presentation}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isEditing ? "Editing..." : `Edit Slide ${activeSlide + 1}`}
            </button>
          )}
          {presentation && (
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex items-center gap-2 px-4 py-2 text-sm border-2 border-gray-700 hover:cursor-pointer hover:bg-amber-50 bg-white text-black rounded-lg disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {isDownloading ? "Generating..." : "Download PPTX"}
            </button>
          )}
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 overflow-hidden">
        {!presentation ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <div className="w-24 h-24 mb-4 rounded-lg flex items-center justify-center">
              <svg
                className="w-12 h-12 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900">
              No Presentation Yet
            </h3>
            <p className="text-gray-600 max-w-sm">
              Start a conversation to generate your presentation. Your slides
              will appear here once created.
            </p>
          </div>
        ) : (
          <SlideViewer
            slides={presentation.slides}
            onSlideChange={setActiveSlide}
            onRequestEdit={onEditSlide ? openEditor : undefined}
            isEditing={isEditing}
          />
        )}
      </div>

      {onEditSlide && presentation && editingSlideIndex !== null && (
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-5 flex-shrink-0">
          <div className="max-w-3xl">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-800 mb-2">
                  How should slide {editingSlideIndex + 1} change?
                </h3>
                <textarea
                  value={editPrompt}
                  onChange={(event) => setEditPrompt(event.target.value)}
                  onKeyDown={handleTextareaKeyDown}
                  rows={3}
                  placeholder="Example: Emphasize the sustainability benefits and add a bullet about long-term ROI."
                  disabled={isEditing}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent disabled:opacity-60 disabled:cursor-not-allowed"
                />
                <p className="mt-2 text-xs text-gray-500">
                  Press Ctrl/Cmd + Enter to apply edits.
                </p>
                {editError && (
                  <p className="mt-2 text-sm text-red-600">{editError}</p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleSubmitEdit}
                  disabled={isEditing}
                  className="px-4 py-2 bg-[#2563eb] text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-[#1d4ed8] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isEditing ? "Applying..." : "Apply edits"}
                </button>
                <button
                  type="button"
                  onClick={closeEditor}
                  disabled={isEditing}
                  className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
