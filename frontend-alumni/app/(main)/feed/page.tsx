"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { Heart, MessageCircle, Share2, MoreHorizontal, Send, ImageIcon, Smile } from 'lucide-react';

const MOCK_POSTS = [
  {
    _id: '1',
    author: {
      name: 'Rahul Sharma',
      avatar: '/profile.jpeg',
      title: 'Software Engineer at Google',
    },
    content: 'Excited to announce that I just completed my 5th year at Google! The journey has been incredible. Grateful to all my mentors and colleagues. 🎉',
    timestamp: '2 hours ago',
    likes: 156,
    comments: 23,
    isLiked: false,
  },
  {
    _id: '2',
    author: {
      name: 'Priya Patel',
      avatar: '/profile.jpeg',
      title: 'Product Manager at Microsoft',
    },
    content: 'Looking for talented software engineers to join our team at Microsoft! If you\'re interested or know someone who might be, please reach out. Great opportunity for FoT alumni.',
    timestamp: '5 hours ago',
    likes: 89,
    comments: 45,
    isLiked: true,
  },
  {
    _id: '3',
    author: {
      name: 'Amit Kumar',
      avatar: '/profile.jpeg',
      title: 'Founder & CEO at TechStartup',
    },
    content: 'Just closed our Series A funding round! 🚀 Thank you to everyone who believed in our vision. Special shoutout to my batch mates who have been incredibly supportive throughout this journey.',
    timestamp: 'Yesterday',
    likes: 312,
    comments: 67,
    isLiked: false,
  },
];

export default function FeedPage() {
  const [posts, setPosts] = useState(MOCK_POSTS);
  const [newPost, setNewPost] = useState('');

  const handleLike = (postId: string) => {
    setPosts(posts.map(post => 
      post._id === postId 
        ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 }
        : post
    ));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Create Post */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-full bg-[#e4f0ff] flex items-center justify-center overflow-hidden">
            <Image src="/profile.jpeg" alt="You" width={48} height={48} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1">
            <textarea
              placeholder="What's on your mind?"
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[#001145]/20"
              rows={3}
            />
            <div className="flex items-center justify-between mt-4">
              <div className="flex gap-2">
                <button className="p-2 text-gray-400 hover:text-[#001145] hover:bg-gray-100 rounded-lg transition-colors">
                  <ImageIcon size={20} />
                </button>
                <button className="p-2 text-gray-400 hover:text-[#001145] hover:bg-gray-100 rounded-lg transition-colors">
                  <Smile size={20} />
                </button>
              </div>
              <button className="flex items-center gap-2 bg-[#001145] text-white px-6 py-2 rounded-full font-medium hover:bg-[#001339] transition-colors">
                <Send size={16} />
                Post
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Posts */}
      {posts.map((post) => (
        <div key={post._id} className="bg-white rounded-2xl p-6 border border-gray-100">
          {/* Author */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex gap-3">
              <div className="w-12 h-12 rounded-full bg-[#e4f0ff] overflow-hidden">
                <Image src={post.author.avatar} alt={post.author.name} width={48} height={48} className="w-full h-full object-cover" />
              </div>
              <div>
                <h4 className="font-bold text-[#001145]">{post.author.name}</h4>
                <p className="text-sm text-gray-500">{post.author.title}</p>
                <p className="text-xs text-gray-400">{post.timestamp}</p>
              </div>
            </div>
            <button className="p-2 text-gray-400 hover:text-[#001145] hover:bg-gray-100 rounded-lg transition-colors">
              <MoreHorizontal size={20} />
            </button>
          </div>

          {/* Content */}
          <p className="text-gray-700 mb-6 leading-relaxed">{post.content}</p>

          {/* Stats */}
          <div className="flex items-center gap-6 text-sm text-gray-500 pb-4 border-b border-gray-100">
            <span>{post.likes} likes</span>
            <span>{post.comments} comments</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-4">
            <button 
              onClick={() => handleLike(post._id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl font-medium transition-colors ${
                post.isLiked 
                  ? 'text-red-500 bg-red-50' 
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <Heart size={20} fill={post.isLiked ? 'currentColor' : 'none'} />
              Like
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-gray-500 hover:bg-gray-50 font-medium transition-colors">
              <MessageCircle size={20} />
              Comment
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-gray-500 hover:bg-gray-50 font-medium transition-colors">
              <Share2 size={20} />
              Share
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
