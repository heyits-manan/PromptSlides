"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import MainContent from "@/components/MainContent";
import MessageBlock from "@/components/MessageBlock";
import PresentationPreview from "@/components/PresentationPreview";
import ConversationHistory from "@/components/ConversationHistory";
import type { ChatMessage, Conversation, ReasoningStep } from "@/types";

const HISTORY_STORAGE_KEY = "ai-slides.conversations";
const UNTITLED_CONVERSATION = "Untitled conversation";

const createEmptyConversation = (): Conversation => {
  const timestamp = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    title: UNTITLED_CONVERSATION,
    messages: [],
    created_at: timestamp,
    updated_at: timestamp,
  };
};

const deriveConversationTitle = (messages: ChatMessage[]): string => {
  const firstUserMessage = messages.find(
    (message) => message.role === "user" && message.content.trim().length > 0
  );

  if (!firstUserMessage) {
    return UNTITLED_CONVERSATION;
  }

  const trimmed = firstUserMessage.content.trim();
  return trimmed.length <= 60 ? trimmed : `${trimmed.slice(0, 57)}…`;
};

const sortConversations = (items: Conversation[]): Conversation[] => {
  return [...items].sort((a, b) => {
    const getTime = (value?: string) => {
      if (!value) return 0;
      const time = Date.parse(value);
      return Number.isNaN(time) ? 0 : time;
    };

    return getTime(b.updated_at ?? b.created_at) - getTime(a.updated_at ?? a.created_at);
  });
};

export default function Home() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [historyReady, setHistoryReady] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditingSlide, setIsEditingSlide] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;

    let isInitialised = false;

    try {
      const stored = window.localStorage.getItem(HISTORY_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Conversation[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          const normalised = sortConversations(parsed);
          setConversations(normalised);
          setActiveConversationId(normalised[0]?.id ?? null);
          isInitialised = true;
        }
      }
    } catch (error) {
      console.error("Failed to load conversation history:", error);
    }

    if (!isInitialised) {
      const newConversation = createEmptyConversation();
      setConversations([newConversation]);
      setActiveConversationId(newConversation.id);
    }

    setHistoryReady(true);
  }, []);

  useEffect(() => {
    if (!historyReady || typeof window === "undefined") {
      return;
    }
    try {
      window.localStorage.setItem(
        HISTORY_STORAGE_KEY,
        JSON.stringify(conversations)
      );
    } catch (error) {
      console.error("Failed to persist conversation history:", error);
    }
  }, [conversations, historyReady]);

  const activeConversation = conversations.find(
    (conversation) => conversation.id === activeConversationId
  );

  const messages = activeConversation?.messages ?? [];

  const updateConversationById = (
    conversationId: string,
    updater: (conversation: Conversation) => Conversation
  ) => {
    setConversations((prev) => {
      const updated = prev.map((conversation) =>
        conversation.id === conversationId
          ? updater(conversation)
          : conversation
      );

      return sortConversations(updated);
    });
  };

  const ensureConversationId = (): string => {
    if (activeConversationId) {
      return activeConversationId;
    }

    const newConversation = createEmptyConversation();
    setConversations((prev) => sortConversations([newConversation, ...prev]));
    setActiveConversationId(newConversation.id);
    return newConversation.id;
  };

  const handleNewConversation = () => {
    const conversation = createEmptyConversation();
    setConversations((prev) => sortConversations([conversation, ...prev]));
    setActiveConversationId(conversation.id);
    setIsGenerating(false);
    setIsEditingSlide(false);
  };

  const handleSelectConversation = (conversationId: string) => {
    setActiveConversationId(conversationId);
    setIsGenerating(false);
    setIsEditingSlide(false);
  };

  const handleDeleteConversation = (conversationId: string) => {
    setConversations((prev) => {
      const filtered = prev.filter((conv) => conv.id !== conversationId);

      // If we deleted the active conversation, switch to the first available one
      if (conversationId === activeConversationId) {
        if (filtered.length > 0) {
          setActiveConversationId(filtered[0].id);
        } else {
          // No conversations left, create a new one
          const newConversation = createEmptyConversation();
          setActiveConversationId(newConversation.id);
          return [newConversation];
        }
      }

      return filtered;
    });
  };

  const handleGenerate = async (input: string, files?: File[]) => {
    void files;

    const conversationId = ensureConversationId();

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: input,
      created_at: new Date().toISOString(),
    };

    updateConversationById(conversationId, (conversation) => {
      const nextMessages = [...conversation.messages, userMessage];
      const nextTitle =
        conversation.title && conversation.title !== UNTITLED_CONVERSATION
          ? conversation.title
          : deriveConversationTitle(nextMessages);

      return {
        ...conversation,
        title: nextTitle,
        messages: nextMessages,
        updated_at: new Date().toISOString(),
      };
    });

    setIsGenerating(true);

    const assistantMessageId = crypto.randomUUID();
    const assistantMessage: ChatMessage = {
      id: assistantMessageId,
      role: "assistant",
      content: "Generating presentation...",
      reasoning: [],
      created_at: new Date().toISOString(),
    };

    updateConversationById(conversationId, (conversation) => {
      const nextMessages = [...conversation.messages, assistantMessage];
      return {
        ...conversation,
        messages: nextMessages,
        updated_at: new Date().toISOString(),
      };
    });

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
          if (!line.startsWith("data: ")) {
            continue;
          }

          const data = line.slice(6);

          if (data === "[DONE]") {
            setIsGenerating(false);
            continue;
          }

          try {
            const parsed = JSON.parse(data);

            if (parsed.type === "reasoning") {
              updateConversationById(conversationId, (conversation) => {
                const nextMessages = conversation.messages.map((message) =>
                  message.id === assistantMessageId
                    ? {
                        ...message,
                        reasoning: [...(message.reasoning || []), parsed.step],
                      }
                    : message
                );

                return {
                  ...conversation,
                  messages: nextMessages,
                  updated_at: new Date().toISOString(),
                };
              });
            } else if (parsed.type === "progress") {
              updateConversationById(conversationId, (conversation) => {
                const progressStep: ReasoningStep = {
                  type: "generating",
                  title: "",
                  content: parsed.message,
                };

                const nextMessages = conversation.messages.map((message) =>
                  message.id === assistantMessageId
                    ? {
                        ...message,
                        reasoning: [
                          ...(message.reasoning || []),
                          progressStep,
                        ],
                      }
                    : message
                );

                return {
                  ...conversation,
                  messages: nextMessages,
                  updated_at: new Date().toISOString(),
                };
              });
            } else if (parsed.type === "presentation") {
              updateConversationById(conversationId, (conversation) => {
                const nextMessages = conversation.messages.map((message) =>
                  message.id === assistantMessageId
                    ? {
                        ...message,
                        presentation: parsed.presentation,
                        content: "Generated presentation",
                      }
                    : message
                );

                return {
                  ...conversation,
                  messages: nextMessages,
                  updated_at: new Date().toISOString(),
                };
              });
            } else if (parsed.type === "error") {
              throw new Error(parsed.error);
            }
          } catch (error) {
            console.error("Error parsing stream:", error);
          }
        }
      }
    } catch (error) {
      console.error("Error:", error);
      updateConversationById(conversationId, (conversation) => {
        const nextMessages = conversation.messages.map((message) =>
          message.id === assistantMessageId
            ? {
                ...message,
                content:
                  "Sorry, I encountered an error generating your presentation. Please try again.",
                reasoning: [],
              }
            : message
        );

        return {
          ...conversation,
          messages: nextMessages,
          updated_at: new Date().toISOString(),
        };
      });
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

    const conversationId = activeConversationId;

    if (!conversationId) {
      throw new Error("No active conversation");
    }

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: `Edit slide ${slideIndex + 1}: ${instruction}`,
      created_at: new Date().toISOString(),
    };

    updateConversationById(conversationId, (conversation) => {
      const nextMessages = [...conversation.messages, userMessage];
      return {
        ...conversation,
        messages: nextMessages,
        updated_at: new Date().toISOString(),
      };
    });

    const assistantMessageId = crypto.randomUUID();
    const editStep: ReasoningStep = {
      type: "generating",
      title: "",
      content: `Updating slide ${slideIndex + 1} based on your prompt...`,
    };

    const assistantMessage: ChatMessage = {
      id: assistantMessageId,
      role: "assistant",
      content: "Applying your slide edits...",
      reasoning: [editStep],
      created_at: new Date().toISOString(),
    };

    updateConversationById(conversationId, (conversation) => {
      const nextMessages = [...conversation.messages, assistantMessage];
      return {
        ...conversation,
        messages: nextMessages,
        updated_at: new Date().toISOString(),
      };
    });

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

      updateConversationById(conversationId, (conversation) => {
        const successStep: ReasoningStep = {
          type: "generating",
          title: "",
          content: "Applied your slide edits.",
        };

        const nextMessages = conversation.messages.map((message) =>
          message.id === assistantMessageId
            ? {
                ...message,
                content: `Updated slide ${slideIndex + 1}`,
                reasoning: [successStep],
                presentation: updatedPresentation,
              }
            : message
        );

        return {
          ...conversation,
          messages: nextMessages,
          updated_at: new Date().toISOString(),
        };
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to edit slide";

      updateConversationById(conversationId, (conversation) => {
        const nextMessages = conversation.messages.map((message) =>
          message.id === assistantMessageId
            ? {
                ...message,
                content: `Sorry, I could not apply that edit: ${message}`,
                reasoning: [],
              }
            : message
        );

        return {
          ...conversation,
          messages: nextMessages,
          updated_at: new Date().toISOString(),
        };
      });

      throw new Error(message);
    } finally {
      setIsEditingSlide(false);
    }
  };

  const latestPresentation = messages
    .slice()
    .reverse()
    .find((msg) => msg.presentation)?.presentation;

  const hasMessages = messages.length > 0;

  return (
    <div className="flex h-screen bg-white">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Conversation History Sidebar */}
      <div className="w-64 flex-shrink-0">
        <ConversationHistory
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleNewConversation}
          onDeleteConversation={handleDeleteConversation}
        />
      </div>

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
