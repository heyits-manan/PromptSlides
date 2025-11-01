"use client";

import { Download } from "lucide-react";
import { generatePPTX, downloadPPTX } from "@/lib/pptGenerator";
import { useState } from "react";
import SlideViewer from "./SlideViewer";
import type { Presentation } from "@/types";

interface PresentationPreviewProps {
  presentation: Presentation | null | undefined;
}

export default function PresentationPreview({
  presentation,
}: PresentationPreviewProps) {
  const [isDownloading, setIsDownloading] = useState(false);

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

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white flex items-center justify-between flex-shrink-0">
        <h2 className="text-lg font-semibold">Presentation Preview</h2>
        {presentation && (
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {isDownloading ? "Generating..." : "Download PPTX"}
          </button>
        )}
      </div>

      {/* Preview Area */}
      <div className="flex-1 overflow-hidden">
        {!presentation ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <div className="w-24 h-24 mb-4 rounded-lg bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
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
          <SlideViewer slides={presentation.slides} />
        )}
      </div>
    </div>
  );
}
