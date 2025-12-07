"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Heart, MessageCircle, Share2, MoreHorizontal, Send, ImageIcon, Smile } from 'lucide-react';
import { getAllPosts, likePost, unlikePost, createPost } from '@/src/api/posts';

export default function FeedPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');

  const handleLike = async (postId: string) => {
    const post = posts.find(p => p._id === postId);
    if (!post) return;

    try {
      if (post.isLiked) {
        await unlikePost(postId);
      } else {
        await likePost(postId);
      }
      setPosts(posts.map(p => 
        p._id === postId 
          ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 }
          : p
      ));
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.trim()) return;
    try {
      const post = await createPost(newPost);
      setPosts([{
        _id: post._id,
        author: {
          name: post.author.name,
          avatar: post.author.avatar || '/profile.jpeg',
          title: post.author.title || 'Alumni',
        },
        content: post.content,
        timestamp: 'Just now',
        likes: 0,
        comments: 0,
        isLiked: false,
      }, ...posts]);
      setNewPost('');
    } catch (error) {
      console.error('Error creating post:', error);
    }
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
                <button className="p-2 text-gray-400 hover:text-[#001145] hover:bg-gray-100 rounded-lg transition-colors" title="Add image">
                  <ImageIcon size={20} />
                </button>
                <button className="p-2 text-gray-400 hover:text-[#001145] hover:bg-gray-100 rounded-lg transition-colors" title="Add emoji">
                  <Smile size={20} />
                </button>
              </div>
              <button onClick={handleCreatePost} disabled={!newPost.trim()} className="flex items-center gap-2 bg-[#001145] text-white px-6 py-2 rounded-full font-medium hover:bg-[#001339] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                <Send size={16} />
                Post
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Posts */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading posts...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No posts yet. Be the first to post!</p>
        </div>
      ) : null}
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
            <button className="p-2 text-gray-400 hover:text-[#001145] hover:bg-gray-100 rounded-lg transition-colors" title="More options">
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
