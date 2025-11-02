import { User, Download, Loader2, CheckCircle2 } from "lucide-react";
import ReasoningBlock from "./ReasoningBlock";
import type { ChatMessage } from "@/types";
import { generatePPTX, downloadPPTX } from "@/lib/pptGenerator";
import { useState, useEffect, useRef } from "react";

interface MessageBlockProps {
  message: ChatMessage;
  showPresentation?: boolean;
}

export default function MessageBlock({
  message,
  showPresentation = true,
}: MessageBlockProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const reasoningEndRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!message.presentation) return;

    setIsDownloading(true);
    try {
      const blob = await generatePPTX(message.presentation);
      downloadPPTX(blob, message.presentation.title || "presentation");
    } catch (error) {
      console.error("Error downloading presentation:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  // Auto-scroll to latest reasoning step
  useEffect(() => {
    if (message.reasoning && message.reasoning.length > 0) {
      reasoningEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [message.reasoning]);

  if (message.role === "user") {
    return (
      <div className="flex items-start gap-3 justify-end mb-4">
        <div className="bg-[#2563eb] text-white rounded-lg px-4 py-3 max-w-[80%] shadow-sm">
          <p className="text-sm">{message.content}</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
          <User className="w-5 h-5 text-gray-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      {/* Reasoning Steps */}
      {message.reasoning && message.reasoning.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full border border-slate-200 bg-white flex items-center justify-center text-xs font-semibold text-slate-600">
              AI
            </div>
            <div
              className={`flex items-center gap-2 text-sm font-semibold ${
                message.presentation ? "text-emerald-600" : "text-[#2563eb]"
              }`}
            >
              {message.presentation ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              <span>
                {message.presentation
                  ? "Slides ready to review"
                  : "Drafting presentation…"}
              </span>
            </div>
          </div>
          <div className="ml-11">
            {message.reasoning!.map((step, index) => {
              const isLast = index === message.reasoning!.length - 1;
              const isActive = !message.presentation && isLast;
              return (
                <ReasoningBlock
                  key={index}
                  step={step}
                  isLast={isLast}
                  isActive={isActive}
                />
              );
            })}
            <div ref={reasoningEndRef} />
          </div>
        </div>
      )}

      {/* Presentation Result */}
      {showPresentation && message.presentation && (
        <div className="ml-11">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {message.presentation.title}
                </h3>
                {message.presentation.description && (
                  <p className="text-sm text-gray-600">
                    {message.presentation.description}
                  </p>
                )}
              </div>
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="flex items-center gap-2 px-4 py-2 bg-[#2563eb] text-white rounded-lg hover:bg-[#1d4ed8] transition-all disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                {isDownloading ? "Generating..." : "Download PPTX"}
              </button>
            </div>

            {/* Slides Preview */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700">
                {message.presentation.slides.length} slides created
              </p>
              <div className="grid gap-3">
                {message.presentation.slides.slice(0, 3).map((slide, index) => (
                  <div
                    key={slide.id || index}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded bg-[#e0e7ff] flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-semibold text-[#1e3a8a]">
                          {index + 1}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          {slide.title}
                        </h4>
                        <ul className="space-y-1">
                          {slide.content.slice(0, 3).map((point, idx) => (
                            <li
                              key={idx}
                              className="text-sm text-gray-600 flex items-start gap-2"
                            >
                              <span className="text-[#2563eb] mt-1">•</span>
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
                {message.presentation.slides.length > 3 && (
                  <p className="text-sm text-gray-500 text-center">
                    +{message.presentation.slides.length - 3} more slides
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
