"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Target, TrendingUp, Filter } from 'lucide-react';
import { Card, Badge, PageHeader, LoadingSpinner } from '@/components/ui';
import { getAllCampaigns, Campaign } from '@/src/api/campaigns';

const CATEGORIES = ['all', 'Scholarship', 'Infrastructure', 'Research', 'Sports', 'Community', 'Emergency'];

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAllCampaigns();
        setCampaigns(data?.items || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredCampaigns = filter === 'all' 
    ? campaigns 
    : campaigns.filter(c => c.category === filter);

  const featuredCampaigns = campaigns.filter(c => c.isFeatured);

  const getProgress = (raised: number, goal: number) => Math.min((raised / goal) * 100, 100);

  if (loading) return <LoadingSpinner fullScreen text="Loading campaigns..." />;

  return (
    <div className="space-y-8">
      <PageHeader title="Donation Campaigns" subtitle="Support causes that matter to our alumni community" />

      {/* Featured Campaigns */}
      {featuredCampaigns.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-[#001145] mb-4 flex items-center gap-2">
            <TrendingUp size={20} />Featured Campaigns
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredCampaigns.slice(0, 2).map((campaign) => (
              <Link key={campaign.id} href={`/campaigns/${campaign.id}`}>
                <Card className="h-full hover:shadow-lg transition-shadow overflow-hidden group">
                  <div className="h-40 bg-gradient-to-br from-[#001145] to-[#001339] -m-6 mb-4 flex items-center justify-center">
                    <Heart className="w-16 h-16 text-white/20 group-hover:scale-110 transition-transform" />
                  </div>
                  <Badge variant="info" className="mb-2">{campaign.category}</Badge>
                  <h3 className="text-xl font-bold text-[#001145] mb-2">{campaign.title}</h3>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2">{campaign.shortDescription}</p>
                  <div className="space-y-2">
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${getProgress(campaign.raisedAmount, campaign.goalAmount)}%` }} />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-bold text-[#001145]">₹{(campaign.raisedAmount / 100000).toFixed(1)}L raised</span>
                      <span className="text-gray-500">of ₹{(campaign.goalAmount / 100000).toFixed(1)}L</span>
                    </div>
                    <p className="text-xs text-gray-400">{campaign.donorsCount} donors</p>
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
            {cat === 'all' ? 'All Campaigns' : cat}
          </button>
        ))}
      </div>

      {/* All Campaigns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCampaigns.map((campaign) => (
          <Link key={campaign.id} href={`/campaigns/${campaign.id}`}>
            <Card className="h-full hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-3">
                <Badge size="sm">{campaign.category}</Badge>
                {campaign.status === 'completed' && <Badge variant="success" size="sm">Completed</Badge>}
              </div>
              <h3 className="font-bold text-[#001145] mb-2">{campaign.title}</h3>
              <p className="text-gray-500 text-sm mb-4 line-clamp-2">{campaign.shortDescription}</p>
              <div className="space-y-2">
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: `${getProgress(campaign.raisedAmount, campaign.goalAmount)}%` }} />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-[#001145]">₹{(campaign.raisedAmount / 100000).toFixed(1)}L</span>
                  <span className="text-gray-500">{Math.round(getProgress(campaign.raisedAmount, campaign.goalAmount))}%</span>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 text-sm text-gray-500">
                <span className="flex items-center gap-1"><Target size={14} />₹{(campaign.goalAmount / 100000).toFixed(1)}L goal</span>
                <span>{campaign.donorsCount} donors</span>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
