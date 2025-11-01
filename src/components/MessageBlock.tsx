import { User, Download } from 'lucide-react';
import ReasoningBlock from './ReasoningBlock';
import type { ChatMessage } from '@/types';
import { generatePPTX, downloadPPTX } from '@/lib/pptGenerator';
import { useState, useEffect, useRef } from 'react';

interface MessageBlockProps {
  message: ChatMessage;
  showPresentation?: boolean;
}

export default function MessageBlock({ message, showPresentation = true }: MessageBlockProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const reasoningEndRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!message.presentation) return;

    setIsDownloading(true);
    try {
      const blob = await generatePPTX(message.presentation);
      downloadPPTX(blob, message.presentation.title || 'presentation');
    } catch (error) {
      console.error('Error downloading presentation:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  // Auto-scroll to latest reasoning step
  useEffect(() => {
    if (message.reasoning && message.reasoning.length > 0) {
      reasoningEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [message.reasoning]);

  if (message.role === 'user') {
    return (
      <div className="flex items-start gap-3 justify-end mb-4">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg px-4 py-3 max-w-[80%]">
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
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <p className={`text-sm font-medium text-purple-600 ${!message.presentation ? 'animate-pulse' : ''}`}>
              {message.presentation ? 'Completed' : 'Thinking...'}
            </p>
          </div>
          <div className="ml-11">
            {message.reasoning.map((step, index) => (
              <ReasoningBlock key={index} step={step} />
            ))}

            {/* Show streaming AI content */}
            {!message.presentation && message.content !== "Generating presentation..." && (
              <div className="bg-white border border-gray-200 rounded-lg p-4 mb-3 mt-3">
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line font-mono">
                  {message.content}
                  <span className="inline-block w-2 h-4 bg-purple-600 ml-1 animate-pulse" />
                </p>
              </div>
            )}

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
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                {isDownloading ? 'Generating...' : 'Download PPTX'}
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
                      <div className="w-8 h-8 rounded bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-semibold text-purple-600">
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
                              <span className="text-purple-600 mt-1">•</span>
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
