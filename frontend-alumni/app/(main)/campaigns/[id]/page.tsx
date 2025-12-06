"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Heart, Target, Users, Calendar, Share2, Check } from 'lucide-react';
import { Button, Card, Badge, Avatar, Input, Modal, LoadingSpinner } from '@/components/ui';
import { getCampaign, getCampaignDonations, donate, Campaign, Donation } from '@/src/api/campaigns';

const DONATION_TIERS = [
  { amount: 500, label: '₹500' },
  { amount: 1000, label: '₹1,000' },
  { amount: 5000, label: '₹5,000' },
  { amount: 10000, label: '₹10,000' },
  { amount: 25000, label: '₹25,000' },
];

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [donating, setDonating] = useState(false);
  const [donated, setDonated] = useState(false);
  const [donationAmount, setDonationAmount] = useState(1000);
  const [customAmount, setCustomAmount] = useState('');
  const [donationMessage, setDonationMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [campaignData, donationsData] = await Promise.all([
          getCampaign(id),
          getCampaignDonations(id),
        ]);
        setCampaign(campaignData);
        setDonations(donationsData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleDonate = async () => {
    const amount = customAmount ? parseInt(customAmount) : donationAmount;
    if (!amount || amount < 100) return;
    
    setDonating(true);
    try {
      await donate(id, { amount, message: donationMessage, isAnonymous });
      setDonated(true);
      setShowDonateModal(false);
      setCampaign(prev => prev ? { ...prev, raisedAmount: prev.raisedAmount + amount, donorsCount: prev.donorsCount + 1 } : null);
    } catch (error) {
      console.error(error);
    } finally {
      setDonating(false);
    }
  };

  const getProgress = (raised: number, goal: number) => Math.min((raised / goal) * 100, 100);

  if (loading) return <LoadingSpinner fullScreen text="Loading campaign..." />;
  if (!campaign) return <div className="text-center py-12">Campaign not found</div>;

  const progress = getProgress(campaign.raisedAmount, campaign.goalAmount);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-600 hover:text-[#001145]">
        <ArrowLeft size={20} />Back to Campaigns
      </button>

      {/* Hero */}
      <div className="relative h-56 bg-gradient-to-br from-[#001145] to-[#001339] rounded-2xl overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <Heart className="w-24 h-24 text-white/10" />
        </div>
        <div className="absolute bottom-6 left-6 right-6">
          <Badge className="mb-2">{campaign.category}</Badge>
          <h1 className="text-2xl font-bold text-white">{campaign.title}</h1>
        </div>
      </div>

      {/* Progress Card */}
      <Card>
        <div className="space-y-4">
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-[#001145]">₹{(campaign.raisedAmount / 100000).toFixed(1)}L</p>
              <p className="text-sm text-gray-500">raised</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[#001145]">{Math.round(progress)}%</p>
              <p className="text-sm text-gray-500">of goal</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[#001145]">{campaign.donorsCount}</p>
              <p className="text-sm text-gray-500">donors</p>
            </div>
          </div>
          <div className="flex gap-2">
            {donated ? (
              <Button variant="secondary" className="flex-1" leftIcon={<Check size={18} />} disabled>Thank You!</Button>
            ) : (
              <Button className="flex-1" leftIcon={<Heart size={18} />} onClick={() => setShowDonateModal(true)}>Donate Now</Button>
            )}
            <Button variant="outline" leftIcon={<Share2 size={18} />}>Share</Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <h2 className="font-bold text-[#001145] mb-4">About this Campaign</h2>
            <div className="prose prose-sm text-gray-600 max-w-none" dangerouslySetInnerHTML={{ __html: campaign.description.replace(/\n/g, '<br/>').replace(/##\s(.+)/g, '<h3>$1</h3>').replace(/-\s(.+)/g, '<li>$1</li>') }} />
          </Card>

          {/* Updates */}
          {campaign.updates.length > 0 && (
            <Card>
              <h2 className="font-bold text-[#001145] mb-4">Updates</h2>
              <div className="space-y-4">
                {campaign.updates.map((update) => (
                  <div key={update.id} className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-[#001145]">{update.title}</h4>
                      <span className="text-xs text-gray-500">{new Date(update.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-gray-600 text-sm">{update.content}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {/* Info */}
          <Card>
            <h3 className="font-bold text-[#001145] mb-4">Campaign Info</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Target size={16} />Goal: ₹{(campaign.goalAmount / 100000).toFixed(1)} Lakhs
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Users size={16} />{campaign.donorsCount} donors
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar size={16} />Ends: {new Date(campaign.endDate).toLocaleDateString()}
              </div>
            </div>
          </Card>

          {/* Organizer */}
          <Card>
            <h3 className="font-bold text-[#001145] mb-4">Organizer</h3>
            <Link href={`/profile/${campaign.organizer.id}`} className="flex items-center gap-3 hover:bg-gray-50 p-2 -m-2 rounded-lg">
              <Avatar name={campaign.organizer.name} src={campaign.organizer.avatarUrl} />
              <span className="font-medium text-[#001145]">{campaign.organizer.name}</span>
            </Link>
          </Card>

          {/* Recent Donors */}
          <Card>
            <h3 className="font-bold text-[#001145] mb-4">Recent Donors</h3>
            <div className="space-y-3">
              {donations.slice(0, 5).map((d) => (
                <div key={d.id} className="flex items-center gap-3">
                  <Avatar name={d.donor.isAnonymous ? 'A' : d.donor.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#001145] text-sm truncate">{d.donor.isAnonymous ? 'Anonymous' : d.donor.name}</p>
                    <p className="text-xs text-gray-500">₹{d.amount.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Donate Modal */}
      <Modal isOpen={showDonateModal} onClose={() => setShowDonateModal(false)} title="Make a Donation">
        <div className="space-y-6">
          <div>
            <p className="font-medium text-[#001145] mb-3">Select Amount</p>
            <div className="grid grid-cols-3 gap-2">
              {DONATION_TIERS.map((tier) => (
                <button
                  key={tier.amount}
                  onClick={() => { setDonationAmount(tier.amount); setCustomAmount(''); }}
                  className={`p-3 rounded-xl border-2 font-medium transition-colors ${
                    donationAmount === tier.amount && !customAmount ? 'border-[#001145] bg-[#e4f0ff] text-[#001145]' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {tier.label}
                </button>
              ))}
            </div>
            <div className="mt-3">
              <Input
                label="Or enter custom amount"
                type="number"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="₹"
              />
            </div>
          </div>
          <Input label="Message (Optional)" value={donationMessage} onChange={(e) => setDonationMessage(e.target.value)} placeholder="Leave a message of support..." />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} className="rounded" />
            Donate anonymously
          </label>
          <Button className="w-full" onClick={handleDonate} isLoading={donating}>
            Donate ₹{customAmount || donationAmount}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
