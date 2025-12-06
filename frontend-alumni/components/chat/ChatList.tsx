'use client';

import { useState, useEffect } from 'react';
import { useSocket } from '@/lib/socket-provider';
import { formatDistanceToNow } from 'date-fns';

interface Chat {
  _id: string;
  participants: Array<{
    _id: string;
    name: string;
    profilePicture?: string;
  }>;
  lastMessage?: {
    content: string;
    createdAt: string;
    sender: string;
  };
  unreadCount?: number;
}

interface ChatListProps {
  onChatSelect: (chatId: string) => void;
  selectedChatId?: string;
}

export default function ChatList({ onChatSelect, selectedChatId }: ChatListProps) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const { socket, isConnected, onlineUsers } = useSocket();

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    if (!socket) return;

    // Listen for new messages to update chat list
    socket.on('newMessage', (message: any) => {
      setChats((prevChats) => {
        const updatedChats = prevChats.map((chat) => {
          if (chat._id === message.chatId) {
            return {
              ...chat,
              lastMessage: {
                content: message.content,
                createdAt: message.createdAt,
                sender: message.sender._id,
              },
            };
          }
          return chat;
        });
        // Sort by most recent message
        return updatedChats.sort((a, b) => {
          const aTime = a.lastMessage?.createdAt || '';
          const bTime = b.lastMessage?.createdAt || '';
          return new Date(bTime).getTime() - new Date(aTime).getTime();
        });
      });
    });

    return () => {
      socket.off('newMessage');
    };
  }, [socket]);

  const fetchChats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/v1/chats', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setChats(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getOtherParticipant = (chat: Chat) => {
    const userId = localStorage.getItem('userId');
    return chat.participants.find((p) => p._id !== userId);
  };

  const isUserOnline = (userId: string) => {
    return onlineUsers.has(userId);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-gray-500">Loading chats...</div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
        <h2 className="text-xl font-bold text-gray-800">Messages</h2>
        <div className="flex items-center gap-2 mt-2 text-sm">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-gray-600">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {chats.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          No conversations yet. Start chatting!
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {chats.map((chat) => {
            const otherUser = getOtherParticipant(chat);
            if (!otherUser) return null;

            const isOnline = isUserOnline(otherUser._id);
            const isSelected = chat._id === selectedChatId;

            return (
              <button
                key={chat._id}
                onClick={() => onChatSelect(chat._id)}
                className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors ${
                  isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                }`}
              >
                <div className="relative flex-shrink-0">
                  {otherUser.profilePicture ? (
                    <img
                      src={otherUser.profilePicture}
                      alt={otherUser.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                      {otherUser.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  {isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                  )}
                </div>

                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-baseline justify-between mb-1">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {otherUser.name}
                    </h3>
                    {chat.lastMessage && (
                      <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                        {formatDistanceToNow(new Date(chat.lastMessage.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    )}
                  </div>
                  {chat.lastMessage && (
                    <p className="text-sm text-gray-600 truncate">
                      {chat.lastMessage.content}
                    </p>
                  )}
                  {chat.unreadCount && chat.unreadCount > 0 && (
                    <span className="inline-block mt-1 px-2 py-0.5 text-xs font-semibold text-white bg-blue-500 rounded-full">
                      {chat.unreadCount}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
