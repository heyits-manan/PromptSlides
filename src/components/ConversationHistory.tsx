"use client";

import { useState } from "react";
import type { Conversation } from "@/types";

interface ConversationHistoryProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (conversationId: string) => void;
}

const formatRelativeTime = (value?: string) => {
  if (!value) return "";
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) return "";

  const date = new Date(timestamp);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / 60000);
  const diffInHours = Math.floor(diffInMs / 3600000);
  const diffInDays = Math.floor(diffInMs / 86400000);

  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays === 1) return "Yesterday";
  if (diffInDays < 7) return `${diffInDays}d ago`;

  try {
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
    }).format(date);
  } catch {
    return "";
  }
};

const groupConversationsByDate = (conversations: Conversation[]) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);

  const groups: {
    title: string;
    conversations: Conversation[];
  }[] = [
    { title: "Today", conversations: [] },
    { title: "Yesterday", conversations: [] },
    { title: "Previous 7 Days", conversations: [] },
    { title: "Older", conversations: [] },
  ];

  conversations.forEach((conv) => {
    const timestamp = conv.updated_at ?? conv.created_at;
    if (!timestamp) {
      groups[3].conversations.push(conv);
      return;
    }

    const date = new Date(timestamp);
    if (date >= today) {
      groups[0].conversations.push(conv);
    } else if (date >= yesterday) {
      groups[1].conversations.push(conv);
    } else if (date >= lastWeek) {
      groups[2].conversations.push(conv);
    } else {
      groups[3].conversations.push(conv);
    }
  });

  return groups.filter((group) => group.conversations.length > 0);
};

export default function ConversationHistory({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
}: ConversationHistoryProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const groupedConversations = groupConversationsByDate(conversations);

  const handleDelete = (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (deleteConfirm === conversationId) {
      onDeleteConversation(conversationId);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(conversationId);
      // Auto-cancel after 3 seconds
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 border-r border-gray-200">
      {/* Header */}
      <div className="px-4 py-4 border-b border-gray-200">
        <button
          type="button"
          onClick={onNewConversation}
          className="w-full px-4 py-2.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8 3.5V12.5M3.5 8H12.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          New Chat
        </button>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto px-3 py-3">
        {conversations.length === 0 ? (
          <div className="text-sm text-gray-500 text-center py-8 px-4">
            No conversations yet. Start a new chat to begin.
          </div>
        ) : (
          <div className="space-y-6">
            {groupedConversations.map((group) => (
              <div key={group.title}>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-2">
                  {group.title}
                </h3>
                <div className="space-y-1">
                  {group.conversations.map((conversation) => {
                    const isActive = conversation.id === activeConversationId;
                    const isDeleteMode = deleteConfirm === conversation.id;
                    const timestamp = formatRelativeTime(
                      conversation.updated_at ?? conversation.created_at
                    );

                    return (
                      <div
                        key={conversation.id}
                        className="group relative"
                      >
                        <button
                          type="button"
                          onClick={() => onSelectConversation(conversation.id)}
                          className={`w-full text-left rounded-lg px-3 py-2.5 transition-all ${
                            isActive
                              ? "bg-white shadow-sm border border-gray-200"
                              : "hover:bg-white/60"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-900 truncate pr-8">
                                {conversation.title || "Untitled conversation"}
                              </div>
                              {timestamp && (
                                <div className="text-xs text-gray-500 mt-0.5">
                                  {timestamp}
                                </div>
                              )}
                            </div>
                          </div>
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={(e) => handleDelete(conversation.id!, e)}
                          className={`absolute right-2 top-2.5 p-1.5 rounded transition-all ${
                            isDeleteMode
                              ? "bg-red-500 text-white"
                              : "text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100"
                          }`}
                          title={isDeleteMode ? "Click again to confirm" : "Delete conversation"}
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M6.5 3V2.5C6.5 1.94772 6.94772 1.5 7.5 1.5H8.5C9.05228 1.5 9.5 1.94772 9.5 2.5V3M3 3.5H13M11.5 3.5V12.5C11.5 13.0523 11.0523 13.5 10.5 13.5H5.5C4.94772 13.5 4.5 13.0523 4.5 12.5V3.5"
                              stroke="currentColor"
                              strokeWidth="1.2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
