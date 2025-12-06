"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Star, Heart, TrendingUp, Filter, Plus, ChevronRight } from 'lucide-react';
import { Button, Card, Badge, Avatar, PageHeader, LoadingSpinner } from '@/components/ui';
import { getSuccessStories, likeStory, SuccessStory } from '@/src/api/successStories';

const CATEGORIES = ['all', 'Entrepreneurship', 'Career', 'Research', 'Social Impact', 'Innovation'];

export default function SuccessStoriesPage() {
  const [stories, setStories] = useState<SuccessStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getSuccessStories();
        setStories(data?.items || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLike = async (id: string) => {
    try {
      await likeStory(id);
      setStories(prev => prev.map(s => s.id === id ? { ...s, likes: s.likes + 1, isLiked: true } : s));
    } catch (error) {
      console.error(error);
    }
  };

  const filteredStories = filter === 'all' ? stories : stories.filter(s => s.category === filter);
  const featuredStories = stories.filter(s => s.isFeatured);

  if (loading) return <LoadingSpinner fullScreen text="Loading stories..." />;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Success Stories"
        subtitle="Inspiring journeys from our alumni community"
        action={
          <Link href="/success-stories/submit">
            <Button leftIcon={<Plus size={18} />}>Share Your Story</Button>
          </Link>
        }
      />

      {/* Featured Stories */}
      {featuredStories.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-[#001145] mb-4 flex items-center gap-2">
            <Star size={20} className="text-yellow-500" />Featured Stories
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredStories.slice(0, 2).map((story) => (
              <Link key={story.id} href={`/success-stories/${story.id}`}>
                <Card className="h-full hover:shadow-lg transition-shadow overflow-hidden group">
                  <div className="h-48 bg-gradient-to-br from-[#001145] to-[#001339] -m-6 mb-4 flex items-center justify-center">
                    <TrendingUp className="w-16 h-16 text-white/20 group-hover:scale-110 transition-transform" />
                  </div>
                  <Badge variant="info" className="mb-2">{story.category}</Badge>
                  <h3 className="text-xl font-bold text-[#001145] mb-2 line-clamp-2">{story.title}</h3>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-3">{story.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar name={story.author.name} src={story.author.avatarUrl} size="sm" />
                      <div>
                        <p className="font-medium text-[#001145] text-sm">{story.author.name}</p>
                        <p className="text-xs text-gray-500">Batch of {story.author.gradYear}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500">
                      <Heart size={14} className={story.isLiked ? 'fill-red-500 text-red-500' : ''} />
                      <span className="text-sm">{story.likes}</span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <Filter size={18} className="text-gray-400 flex-shrink-0" />
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filter === cat ? 'bg-[#001145] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat === 'all' ? 'All Stories' : cat}
          </button>
        ))}
      </div>

      {/* All Stories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStories.map((story) => (
          <Card key={story.id} className="hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-3">
              <Badge size="sm">{story.category}</Badge>
              {story.isFeatured && <Star size={14} className="text-yellow-500" />}
            </div>
            <h3 className="font-bold text-[#001145] mb-2 line-clamp-2">{story.title}</h3>
            <p className="text-gray-500 text-sm mb-4 line-clamp-3">{story.excerpt}</p>
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <Avatar name={story.author.name} src={story.author.avatarUrl} size="sm" />
                <div>
                  <p className="font-medium text-[#001145] text-sm">{story.author.name}</p>
                  <p className="text-xs text-gray-500">{story.author.gradYear}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => { e.preventDefault(); handleLike(story.id); }}
                  className="flex items-center gap-1 text-gray-500 hover:text-red-500 transition-colors"
                >
                  <Heart size={14} className={story.isLiked ? 'fill-red-500 text-red-500' : ''} />
                  <span className="text-sm">{story.likes}</span>
                </button>
                <Link href={`/success-stories/${story.id}`} className="text-[#001145] hover:underline text-sm font-medium flex items-center gap-1">
                  Read <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* CTA */}
      <Card className="bg-gradient-to-r from-[#001145] to-[#001339] text-white text-center">
        <h3 className="text-2xl font-bold mb-2">Have a Story to Share?</h3>
        <p className="text-blue-200 mb-6">Inspire fellow alumni with your journey and achievements</p>
        <Link href="/success-stories/submit">
          <Button variant="secondary">Share Your Story</Button>
        </Link>
      </Card>
    </div>
  );
}
