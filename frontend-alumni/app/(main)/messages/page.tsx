"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { Search, Send, Phone, Video, MoreVertical, Paperclip, Smile } from 'lucide-react';

const MOCK_CHATS = [
  {
    _id: '1',
    name: 'Rahul Sharma',
    avatar: '/profile.jpeg',
    lastMessage: 'Sure, let me know when you are free!',
    timestamp: '2:30 PM',
    unread: 2,
    online: true,
  },
  {
    _id: '2',
    name: 'Priya Patel',
    avatar: '/profile.jpeg',
    lastMessage: 'Thanks for the referral!',
    timestamp: '11:45 AM',
    unread: 0,
    online: true,
  },
  {
    _id: '3',
    name: 'Amit Kumar',
    avatar: '/profile.jpeg',
    lastMessage: 'The meeting was great.',
    timestamp: 'Yesterday',
    unread: 0,
    online: false,
  },
];

const MOCK_MESSAGES = [
  { _id: '1', senderId: 'other', text: 'Hey! How are you doing?', timestamp: '2:25 PM' },
  { _id: '2', senderId: 'me', text: 'I am doing great! Just finished a big project.', timestamp: '2:27 PM' },
  { _id: '3', senderId: 'other', text: 'That is awesome! Would love to hear more about it.', timestamp: '2:28 PM' },
  { _id: '4', senderId: 'me', text: 'Sure, are you free for a quick call?', timestamp: '2:29 PM' },
  { _id: '5', senderId: 'other', text: 'Sure, let me know when you are free!', timestamp: '2:30 PM' },
];

export default function MessagesPage() {
  const [chats, setChats] = useState(MOCK_CHATS);
  const [selectedChat, setSelectedChat] = useState(MOCK_CHATS[0]);
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const handleSend = () => {
    if (!newMessage.trim()) return;
    setMessages([...messages, {
      _id: Date.now().toString(),
      senderId: 'me',
      text: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    setNewMessage('');
  };

  return (
    <div className="h-[calc(100vh-200px)] flex bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {/* Chat List */}
      <div className="w-80 border-r border-gray-100 flex flex-col">
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#001145]/20"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {chats.map((chat) => (
            <div
              key={chat._id}
              onClick={() => setSelectedChat(chat)}
              className={`flex items-center gap-3 p-4 cursor-pointer transition-colors ${
                selectedChat._id === chat._id ? 'bg-[#e4f0ff]' : 'hover:bg-gray-50'
              }`}
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                  <Image src={chat.avatar} alt={chat.name} width={48} height={48} className="w-full h-full object-cover" />
                </div>
                {chat.online && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-[#001145] truncate">{chat.name}</h4>
                  <span className="text-xs text-gray-400">{chat.timestamp}</span>
                </div>
                <p className="text-sm text-gray-500 truncate">{chat.lastMessage}</p>
              </div>
              {chat.unread > 0 && (
                <div className="w-5 h-5 bg-[#001145] text-white text-xs rounded-full flex items-center justify-center">
                  {chat.unread}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
              <Image src={selectedChat.avatar} alt={selectedChat.name} width={40} height={40} className="w-full h-full object-cover" />
            </div>
            <div>
              <h4 className="font-semibold text-[#001145]">{selectedChat.name}</h4>
              <p className="text-xs text-green-500">{selectedChat.online ? 'Online' : 'Offline'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-400 hover:text-[#001145] hover:bg-gray-100 rounded-lg transition-colors">
              <Phone size={20} />
            </button>
            <button className="p-2 text-gray-400 hover:text-[#001145] hover:bg-gray-100 rounded-lg transition-colors">
              <Video size={20} />
            </button>
            <button className="p-2 text-gray-400 hover:text-[#001145] hover:bg-gray-100 rounded-lg transition-colors">
              <MoreVertical size={20} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg._id} className={`flex ${msg.senderId === 'me' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                msg.senderId === 'me' 
                  ? 'bg-[#001145] text-white rounded-br-none' 
                  : 'bg-gray-100 text-[#001145] rounded-bl-none'
              }`}>
                <p>{msg.text}</p>
                <p className={`text-xs mt-1 ${msg.senderId === 'me' ? 'text-blue-200' : 'text-gray-400'}`}>
                  {msg.timestamp}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <button className="p-2 text-gray-400 hover:text-[#001145] hover:bg-gray-100 rounded-lg transition-colors">
              <Paperclip size={20} />
            </button>
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#001145]/20"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#001145]">
                <Smile size={20} />
              </button>
            </div>
            <button 
              onClick={handleSend}
              className="p-3 bg-[#001145] text-white rounded-xl hover:bg-[#001339] transition-colors"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
