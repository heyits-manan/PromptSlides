"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import MainContent from "@/components/MainContent";
import MessageBlock from "@/components/MessageBlock";
import PresentationPreview from "@/components/PresentationPreview";
import type { ChatMessage } from "@/types";

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditingSlide, setIsEditingSlide] = useState(false);

  const handleGenerate = async (input: string, files?: File[]) => {
    void files;
    // Add user message
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: input,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsGenerating(true);

    // Create placeholder assistant message for streaming
    const assistantMessageId = crypto.randomUUID();
    const assistantMessage: ChatMessage = {
      id: assistantMessageId,
      role: "assistant",
      content: "Generating presentation...",
      reasoning: [],
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, assistantMessage]);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: input }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate presentation");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No reader available");
      }

      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);

            if (data === "[DONE]") {
              setIsGenerating(false);
              continue;
            }

            try {
              const parsed = JSON.parse(data);

              if (parsed.type === "reasoning") {
                // Add reasoning step
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? {
                          ...msg,
                          reasoning: [...(msg.reasoning || []), parsed.step],
                        }
                      : msg
                  )
                );
              } else if (parsed.type === "progress") {
                // Show PPT generation progress
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? {
                          ...msg,
                          reasoning: [
                            ...(msg.reasoning || []),
                            {
                              type: "generating",
                              title: "",
                              content: parsed.message,
                            },
                          ],
                        }
                      : msg
                  )
                );
              } else if (parsed.type === "presentation") {
                // Add final presentation
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? {
                          ...msg,
                          presentation: parsed.presentation,
                          content: "Generated presentation",
                        }
                      : msg
                  )
                );
              } else if (parsed.type === "error") {
                throw new Error(parsed.error);
              }
            } catch (e) {
              console.error("Error parsing stream:", e);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error:", error);
      // Update message with error
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                content:
                  "Sorry, I encountered an error generating your presentation. Please try again.",
                reasoning: [],
              }
            : msg
        )
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEditSlide = async (slideIndex: number, instruction: string) => {
    const presentationToEdit = [...messages]
      .reverse()
      .find((msg) => msg.presentation)?.presentation;

    if (!presentationToEdit) {
      throw new Error("There is no presentation to edit yet");
    }

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: `Edit slide ${slideIndex + 1}: ${instruction}`,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);

    const assistantMessageId = crypto.randomUUID();
    const assistantMessage: ChatMessage = {
      id: assistantMessageId,
      role: "assistant",
      content: "Applying your slide edits...",
      reasoning: [
        {
          type: "generating",
          title: "",
          content: `Updating slide ${slideIndex + 1} based on your prompt...`,
        },
      ],
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, assistantMessage]);

    setIsEditingSlide(true);

    try {
      const response = await fetch("/api/edit-slide", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          presentation: presentationToEdit,
          slideIndex,
          instruction,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data) {
        const message = data?.error || "Failed to edit slide";
        throw new Error(message);
      }

      const updatedPresentation = data.presentation;

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                content: `Updated slide ${slideIndex + 1}`,
                reasoning: [
                  {
                    type: "generating",
                    title: "",
                    content: "Applied your slide edits.",
                  },
                ],
                presentation: updatedPresentation,
              }
            : msg
        )
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to edit slide";

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                content: `Sorry, I could not apply that edit: ${message}`,
                reasoning: [],
              }
            : msg
        )
      );

      throw new Error(message);
    } finally {
      setIsEditingSlide(false);
    }
  };

  // Get the latest presentation from messages
  const latestPresentation = messages
    .slice()
    .reverse()
    .find((msg) => msg.presentation)?.presentation;

  const hasMessages = messages.length > 0;

  return (
    <div className="flex h-screen bg-white">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex">
        {/* Left Side - Chat and Reasoning */}
        <div
          className={`flex flex-col border-r border-gray-200 transition-all duration-500 ${
            hasMessages ? "flex-1" : "w-full"
          }`}
        >
          {/* Header */}
          <div className="px-8 py-6 border-b border-gray-200">
            <h1 className="text-xl font-semibold text-gray-900">AI Slides</h1>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-8 py-6">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center max-w-2xl">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Create Your Presentation
                  </h2>
                  <p className="text-gray-600">
                    Tell me what you would like to create and I will generate a
                    professional presentation for you with detailed reasoning.
                  </p>
                </div>
              </div>
            ) : (
              <div>
                {messages.map((message) => (
                  <MessageBlock
                    key={message.id}
                    message={message}
                    showPresentation={false}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Input Area */}
          <MainContent
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
          />
        </div>

        {/* Right Side - Presentation Preview (animated slide-in) */}
        {hasMessages && (
          <div className="animate-slide-in-right w-[50vw]">
            <PresentationPreview
              presentation={latestPresentation}
              onEditSlide={handleEditSlide}
              isEditing={isEditingSlide}
            />
          </div>
        )}
      </div>
    </div>
  );
}
