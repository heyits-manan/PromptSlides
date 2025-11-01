"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Slide } from "@/types";

interface SlideViewerProps {
  slides: Slide[];
}

export default function SlideViewer({ slides }: SlideViewerProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const goToPrevious = () => {
    setCurrentSlide((prev) => Math.max(0, prev - 1));
  };

  const goToNext = () => {
    setCurrentSlide((prev) => Math.min(slides.length - 1, prev + 1));
  };

  const slide = slides[currentSlide];
  const isFirstSlide = currentSlide === 0;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Slide Display Area */}
      <div className="flex-1 flex items-center justify-center p-4 bg-gray-100 overflow-hidden">
        <div className="relative max-w-full">
          {/* The Slide */}
          <div
            className="bg-white shadow-2xl mx-auto"
            style={{
              width: "min(700px, 100%)",
              height: "min(394px, calc(100vw * 0.45 * 0.5625))", // 16:9 aspect ratio, scaled to fit
            }}
          >
            {isFirstSlide ? (
              // Title Slide
              <div className="h-full flex flex-col items-center justify-center p-8 bg-linear-to-br from-purple-600 to-blue-600 text-white">
                <h1 className="text-3xl md:text-4xl font-bold text-center mb-4 leading-tight">
                  {slide.title}
                </h1>
                {slide.content && slide.content.length > 0 && (
                  <p className="text-base md:text-lg text-center opacity-90">
                    {slide.content[0]}
                  </p>
                )}
              </div>
            ) : (
              // Content Slide
              <div className="h-full flex flex-col p-6 md:p-8 relative">
                {/* Purple header bar */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-600 to-blue-600" />

                {/* Slide Title */}
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-6 pt-3">
                  {slide.title}
                </h2>

                {/* Slide Content */}
                <div className="flex-1 flex flex-col justify-center overflow-y-auto">
                  <ul className="space-y-2 md:space-y-3">
                    {slide.content.map((point, idx) => (
                      <li
                        key={idx}
                        className="flex items-start text-sm md:text-base text-gray-700 leading-relaxed"
                      >
                        <span className="text-purple-600 mr-2 md:mr-3 mt-0.5 text-lg md:text-xl flex-shrink-0">
                          •
                        </span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Slide Number */}
                <div className="absolute bottom-2 right-3 text-xs text-gray-400">
                  {currentSlide + 1}
                </div>
              </div>
            )}
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={goToPrevious}
            disabled={currentSlide === 0}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all z-10"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>

          <button
            onClick={goToNext}
            disabled={currentSlide === slides.length - 1}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all z-10"
          >
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Slide Counter and Thumbnails */}
      <div className="border-t border-gray-200 bg-white p-4 flex-shrink-0">
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="text-sm font-medium text-gray-700">
            Slide {currentSlide + 1} of {slides.length}
          </span>
        </div>

        {/* Slide Thumbnails */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {slides.map((s, idx) => (
            <button
              key={s.id || idx}
              onClick={() => setCurrentSlide(idx)}
              className={`shrink-0 w-28 h-16 rounded border-2 transition-all ${
                idx === currentSlide
                  ? "border-purple-600 shadow-md"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div
                className={`w-full h-full flex items-center justify-center text-xs p-2 ${
                  idx === 0
                    ? "bg-linear-to-br from-purple-600 to-blue-600 text-white"
                    : "bg-white text-gray-700"
                }`}
              >
                <div className="truncate text-center font-semibold">
                  {s.title}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
