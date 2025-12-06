'use client';

import { useState, KeyboardEvent } from 'react';
import { useSocket } from '@/lib/socket-provider';
import { Send } from 'lucide-react';

interface MessageInputProps {
  chatId: string;
}

export default function MessageInput({ chatId }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { socket, isConnected } = useSocket();

  let typingTimeout: NodeJS.Timeout | null = null;

  const handleTyping = () => {
    if (!socket || !isConnected) return;

    socket.emit('typing', { chatId, isTyping: true });

    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    typingTimeout = setTimeout(() => {
      socket.emit('typing', { chatId, isTyping: false });
    }, 1000);
  };

  const handleSend = async () => {
    if (!message.trim() || !socket || !isConnected || isSending) return;

    setIsSending(true);

    try {
      socket.emit('sendMessage', {
        chatId,
        content: message.trim(),
      });

      setMessage('');
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
      socket.emit('typing', { chatId, isTyping: false });
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 border-t border-gray-200 bg-white">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            handleTyping();
          }}
          onKeyPress={handleKeyPress}
          placeholder={isConnected ? 'Type a message...' : 'Connecting...'}
          disabled={!isConnected || isSending}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        <button
          onClick={handleSend}
          disabled={!message.trim() || !isConnected || isSending}
          className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
}
