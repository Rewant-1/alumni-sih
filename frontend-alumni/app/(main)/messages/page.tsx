'use client';

import { useState } from 'react';
import ChatList from '@/components/chat/ChatList';
import ChatWindow from '@/components/chat/ChatWindow';

export default function MessagesPage() {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  return (
    <div className="h-[calc(100vh-200px)] flex bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {/* Chat List Sidebar */}
      <div className="w-80 border-r border-gray-200 flex-shrink-0">
        <ChatList
          onChatSelect={setSelectedChatId}
          selectedChatId={selectedChatId || undefined}
        />
      </div>

      {/* Chat Window */}
      <div className="flex-1">
        {selectedChatId ? (
          <ChatWindow chatId={selectedChatId} />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            <div className="text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Select a conversation
              </h3>
              <p className="text-sm text-gray-500">
                Choose a chat from the list to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
