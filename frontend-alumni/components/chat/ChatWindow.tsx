'use client';

import { useState, useEffect, useRef } from 'react';
import { useSocket } from '@/lib/socket-provider';
import { format, isSameDay } from 'date-fns';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';

interface Message {
  _id: string;
  content: string;
  sender: {
    _id: string;
    name: string;
    profilePicture?: string;
  };
  createdAt: string;
  isRead: boolean;
}

interface Chat {
  _id: string;
  participants: Array<{
    _id: string;
    name: string;
    profilePicture?: string;
  }>;
}

interface ChatWindowProps {
  chatId: string;
}

export default function ChatWindow({ chatId }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [chat, setChat] = useState<Chat | null>(null);
  const [loading, setLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { socket, onlineUsers } = useSocket();
  const currentUserId = localStorage.getItem('userId');

  useEffect(() => {
    if (chatId) {
      fetchChatData();
      fetchMessages();
    }
  }, [chatId]);

  useEffect(() => {
    if (!socket || !chatId) return;

    // Join chat room
    socket.emit('joinChat', { chatId });

    // Listen for new messages
    socket.on('newMessage', (message: Message) => {
      if (message && typeof message === 'object') {
        setMessages((prev) => [...prev, message]);
        scrollToBottom();
        
        // Mark as read if not sender
        if (message.sender._id !== currentUserId) {
          socket.emit('markAsRead', { chatId, messageId: message._id });
        }
      }
    });

    // Listen for typing indicators
    socket.on('userTyping', (data: { userId: string; isTyping: boolean }) => {
      if (data.userId !== currentUserId) {
        setTypingUsers((prev) => {
          const newSet = new Set(prev);
          if (data.isTyping) {
            newSet.add(data.userId);
          } else {
            newSet.delete(data.userId);
          }
          return newSet;
        });
      }
    });

    return () => {
      socket.emit('leaveChat', { chatId });
      socket.off('newMessage');
      socket.off('userTyping');
    };
  }, [socket, chatId, currentUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchChatData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/v1/chats/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setChat(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch chat:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:5000/api/v1/chats/${chatId}/messages`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMessages(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getOtherParticipant = () => {
    if (!chat) return null;
    return chat.participants.find((p) => p._id !== currentUserId);
  };

  const isUserOnline = (userId: string) => {
    return onlineUsers.has(userId);
  };

  const renderDateSeparator = (currentMsg: Message, prevMsg: Message | null) => {
    if (!prevMsg || !isSameDay(new Date(currentMsg.createdAt), new Date(prevMsg.createdAt))) {
      return (
        <div className="flex items-center justify-center my-4">
          <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
            {format(new Date(currentMsg.createdAt), 'MMMM d, yyyy')}
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-gray-500">Loading messages...</div>
      </div>
    );
  }

  const otherUser = getOtherParticipant();

  return (
    <div className="h-full flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 bg-white flex items-center gap-3">
        {otherUser && (
          <>
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                {otherUser.name.charAt(0).toUpperCase()}
              </div>
              {isUserOnline(otherUser._id) && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{otherUser.name}</h3>
              <p className="text-xs text-gray-500">
                {isUserOnline(otherUser._id) ? 'Online' : 'Offline'}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-500">
            No messages yet. Start the conversation!
          </div>
        ) : (
          <>
            {messages.map((message, index) => {
              const isOwnMessage = message.sender._id === currentUserId;
              const prevMessage = index > 0 ? messages[index - 1] : null;

              return (
                <div key={message._id}>
                  {renderDateSeparator(message, prevMessage)}
                  <div
                    className={`flex ${
                      isOwnMessage ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                        isOwnMessage
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-900'
                      }`}
                    >
                      <p className="break-words">{message.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                        }`}
                      >
                        {format(new Date(message.createdAt), 'h:mm a')}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Typing Indicator */}
      {typingUsers.size > 0 && otherUser && (
        <div className="px-4 pb-2">
          <TypingIndicator userName={otherUser.name} />
        </div>
      )}

      {/* Message Input */}
      <MessageInput chatId={chatId} />
    </div>
  );
}
