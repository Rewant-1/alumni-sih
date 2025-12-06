"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Briefcase, Calendar, Users, Heart, Star, UserPlus, Filter } from 'lucide-react';
import { Card, Badge, Avatar, PageHeader, LoadingSpinner, EmptyState } from '@/components/ui';
import { getActivities, Activity } from '@/src/api/activities';

const ACTIVITY_ICONS = {
  job_posted: Briefcase,
  event_created: Calendar,
  connection_made: Users,
  donation_made: Heart,
  story_shared: Star,
  profile_updated: UserPlus,
};

const ACTIVITY_COLORS = {
  job_posted: 'bg-green-100 text-green-600',
  event_created: 'bg-purple-100 text-purple-600',
  connection_made: 'bg-blue-100 text-blue-600',
  donation_made: 'bg-pink-100 text-pink-600',
  story_shared: 'bg-yellow-100 text-yellow-600',
  profile_updated: 'bg-gray-100 text-gray-600',
};

const FILTERS = [
  { value: 'all', label: 'All Activities' },
  { value: 'job_posted', label: 'Jobs' },
  { value: 'event_created', label: 'Events' },
  { value: 'connection_made', label: 'Connections' },
  { value: 'donation_made', label: 'Donations' },
  { value: 'story_shared', label: 'Stories' },
];

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getActivities({ type: filter === 'all' ? undefined : filter as Activity['type'] });
        setActivities(data.items);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filter]);

  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString();
  };

  const getTargetLink = (activity: Activity) => {
    if (!activity.target) return null;
    switch (activity.target.type) {
      case 'job': return `/jobs/${activity.target.id}`;
      case 'event': return `/events/${activity.target.id}`;
      case 'user': return `/profile/${activity.target.id}`;
      case 'campaign': return `/campaigns/${activity.target.id}`;
      case 'story': return `/success-stories/${activity.target.id}`;
      default: return null;
    }
  };

  if (loading) return <LoadingSpinner fullScreen text="Loading activities..." />;

  return (
    <div className="space-y-6">
      <PageHeader title="Activity Feed" subtitle="See what's happening in your alumni network" />

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <Filter size={18} className="text-gray-400 flex-shrink-0" />
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filter === f.value ? 'bg-[#001145] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Activity Timeline */}
      <div className="space-y-4">
        {activities.length === 0 ? (
          <EmptyState icon={Calendar} title="No activities yet" description="Activities from your network will appear here" />
        ) : (
          activities.map((activity) => {
            const Icon = ACTIVITY_ICONS[activity.type];
            const colorClass = ACTIVITY_COLORS[activity.type];
            const targetLink = getTargetLink(activity);

            return (
              <Card key={activity.id} className="hover:shadow-md transition-shadow">
                <div className="flex gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                    <Icon size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium text-[#001145]">{activity.title}</p>
                        <p className="text-gray-600 text-sm mt-1">{activity.description}</p>
                        {activity.target && targetLink && (
                          <Link href={targetLink} className="inline-block mt-2">
                            <Badge variant="info" size="sm">{activity.target.title}</Badge>
                          </Link>
                        )}
                      </div>
                      <span className="text-xs text-gray-400 whitespace-nowrap">{formatDate(activity.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <Avatar name={activity.actor.name} src={activity.actor.avatarUrl} size="sm" />
                      <Link href={`/profile/${activity.actor.id}`} className="text-sm text-gray-500 hover:text-[#001145]">
                        {activity.actor.name}
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Load More */}
      {activities.length > 0 && (
        <div className="text-center">
          <button className="text-[#001145] font-medium hover:underline">Load More</button>
        </div>
      )}
    </div>
  );
}
