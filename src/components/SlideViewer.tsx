"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Slide } from "@/types";

interface SlideViewerProps {
  slides: Slide[];
}

export default function SlideViewer({ slides }: SlideViewerProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const listRef = useRef<HTMLDivElement | null>(null);
  const slideRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    slideRefs.current = slideRefs.current.slice(0, slides.length);
  }, [slides]);

  useEffect(() => {
    const container = listRef.current;
    if (!container) return;

    const nodes = slideRefs.current.filter(
      (node): node is HTMLDivElement => node !== null
    );

    if (nodes.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible) {
          const index = Number(visible.target.getAttribute("data-index"));
          if (!Number.isNaN(index)) {
            setCurrentSlide((prev) => (prev === index ? prev : index));
          }
        }
      },
      {
        root: container,
        threshold: [0.4, 0.6, 0.75],
      }
    );

    nodes.forEach((node) => observer.observe(node));

    return () => observer.disconnect();
  }, [slides]);

  const renderRichText = (text: string): ReactNode => {
    const regex = /\*\*(.+?)\*\*/g;
    const segments: ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    let key = 0;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        segments.push(text.slice(lastIndex, match.index));
      }

      segments.push(
        <span key={`bold-${key++}`} className="font-semibold text-gray-900">
          {match[1]}
        </span>
      );
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      segments.push(text.slice(lastIndex));
    }

    return segments.length > 0 ? segments : text;
  };

  const handleThumbnailClick = (index: number) => {
    const node = slideRefs.current[index];
    if (node) {
      node.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    setCurrentSlide(index);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 flex flex-col p-10 bg-[#f8fafc] overflow-hidden">
        <div ref={listRef} className="flex-1 overflow-y-auto pr-4">
          <div className="space-y-10 pb-12">
            {slides.map((slide, idx) => {
              const isTitleSlide = idx === 0;
              const isActive = idx === currentSlide;

              return (
                <div
                  key={slide.id || idx}
                  data-index={idx}
                  ref={(el) => {
                    slideRefs.current[idx] = el;
                  }}
                  className={`relative bg-white border border-gray-200 rounded-[18px] shadow-[0_24px_48px_rgba(15,23,42,0.08)] transition-all ${
                    isActive ? "ring-1 ring-[#2563eb]/40" : ""
                  }`}
                  style={{
                    width: "min(900px, 92vw)",
                    minHeight: "560px",
                    marginLeft: "auto",
                    marginRight: "auto",
                  }}
                >
                  {isTitleSlide ? (
                    <div className="h-full flex flex-col px-16 py-16 bg-white">
                      <div className="absolute inset-x-0 top-0 h-[3px] bg-[#2563eb]" />
                      <div className="flex-1 flex flex-col justify-center max-w-3xl">
                        <p className="text-xs tracking-[0.32em] uppercase text-gray-400 mb-6">
                          Presentation Overview
                        </p>
                        <h1 className="text-[clamp(36px,4.8vw,54px)] font-semibold text-gray-900 leading-[1.15] mb-8">
                          {slide.title}
                        </h1>
                        {slide.content?.[0] && (
                          <p className="text-xl text-gray-600 leading-relaxed max-w-2xl">
                            {renderRichText(slide.content[0])}
                          </p>
                        )}
                      </div>
                      <div className="pt-12 text-sm text-gray-400 font-medium">
                        {String(idx + 1).padStart(2, "0")} /{" "}
                        {String(slides.length).padStart(2, "0")}
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col px-16 py-16 bg-white relative">
                      <div className="absolute inset-x-0 top-0 h-[3px] bg-[#2563eb]" />
                      <p className="text-xs tracking-[0.32em] uppercase text-gray-400">
                        Key Insight
                      </p>
                      <h2 className="text-[clamp(30px,3.6vw,46px)] font-semibold text-gray-900 leading-tight mt-4 mb-8">
                        {slide.title}
                      </h2>
                      <div className="flex-1">
                        <ul className="flex flex-col gap-7 max-w-3xl">
                          {slide.content.map((point, bulletIdx) => (
                            <li
                              key={bulletIdx}
                              className="flex items-start gap-5 text-[20px] leading-[1.65] text-gray-800"
                            >
                              <span className="mt-2 block h-2.5 w-2.5 rounded-full bg-[#2563eb]" />
                              <span className="flex-1">
                                {renderRichText(point)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="pt-12 text-sm font-medium text-gray-400">
                        {String(idx + 1).padStart(2, "0")} /{" "}
                        {String(slides.length).padStart(2, "0")}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 bg-white px-8 py-6 flex-shrink-0">
        <div className="flex items-center justify-center gap-2 mb-5">
          <span className="text-sm font-semibold text-gray-700 tracking-wide">
            Slide {currentSlide + 1} of {slides.length}
          </span>
        </div>

        {/* <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {slides.map((s, idx) => (
            <button
              key={s.id || idx}
              onClick={() => handleThumbnailClick(idx)}
              className={`shrink-0 w-36 h-20 rounded-xl border transition-all ${
                idx === currentSlide
                  ? "border-[#2563eb] shadow-[0_12px_24px_rgba(37,99,235,0.12)]"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div
                className={`w-full h-full flex flex-col items-start justify-center text-xs px-3 py-2 rounded-[10px] ${
                  idx === currentSlide ? "bg-[#f1f5f9]" : "bg-white"
                }`}
              >
                <span className="text-[10px] uppercase tracking-[0.24em] font-semibold text-gray-400 mb-1">
                  {idx === 0 ? "Intro" : `Slide ${idx + 1}`}
                </span>
                <div
                  className="text-[12px] font-semibold text-gray-800 leading-snug overflow-hidden"
                  style={{
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {s.title}
                </div>
              </div>
            </button>
          ))}
        </div> */}
      </div>
    </div>
  );
}
