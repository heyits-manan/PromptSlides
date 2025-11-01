'use client';

import { useState, useRef } from 'react';
import { Paperclip, Image as ImageIcon, Send, ChevronLeft, Loader2, X } from 'lucide-react';

interface MainContentProps {
  onGenerate: (input: string, files?: File[]) => void;
  isGenerating: boolean;
  presentation: any;
}

export default function MainContent({ onGenerate, isGenerating, presentation }: MainContentProps) {
  const [input, setInput] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    if (input.trim()) {
      onGenerate(input, uploadedFile ? [uploadedFile] : undefined);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  return (
    <div className="border-t border-gray-200 px-8 py-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-4">
              {/* Attachment Icon */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Attach file"
              >
                <Paperclip className="w-6 h-6 text-gray-500" />
              </button>

              {/* Image Upload Icon */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Upload image"
              >
                <ImageIcon className="w-6 h-6 text-gray-500" />
              </button>

              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx"
              />

              {/* Text Input */}
              <div className="flex-1">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  placeholder="Start with a topic, we'll turn it into slides!"
                  disabled={isGenerating}
                  className="w-full bg-transparent border-none outline-none text-gray-900 placeholder-gray-400 text-base disabled:opacity-50"
                />
              </div>

              {/* Preview Thumbnail */}
              {uploadedFile && (
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center relative">
                  <span className="text-xs text-gray-500">📄</span>
                  <button
                    onClick={() => setUploadedFile(null)}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Send Button */}
              <button
                onClick={handleSubmit}
                disabled={!input.trim() || isGenerating}
                className="p-3 bg-gray-800 hover:bg-gray-900 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                ) : (
                  <Send className="w-5 h-5 text-white" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
  );
}
