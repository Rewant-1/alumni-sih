"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Download, Share2, RefreshCw, QrCode, Shield, Calendar, GraduationCap } from 'lucide-react';
import { Button, Card, Badge, LoadingSpinner } from '@/components/ui';
import { getAlumniCard, AlumniCard } from '@/src/api/alumniCard';

export default function AlumniCardPage() {
  const [card, setCard] = useState<AlumniCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    const fetchCard = async () => {
      try {
        const data = await getAlumniCard();
        setCard(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchCard();
  }, []);

  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short' });

  if (loading) return <LoadingSpinner fullScreen text="Loading card..." />;
  if (!card) return <div className="text-center py-12">Card not found</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-[#001145] mb-2">Your Alumni Card</h1>
        <p className="text-gray-500">Your digital identity as a verified alumnus</p>
      </div>

      {/* Card */}
      <div className="perspective-1000 relative h-[280px] cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
        <div
          className={`relative w-full h-full transition-transform duration-700 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}
          style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
        >
          {/* Front */}
          <div
            className="absolute w-full h-full rounded-3xl overflow-hidden shadow-2xl"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div className="h-full bg-gradient-to-br from-[#001145] via-[#001339] to-[#000d35] p-6 text-white">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold tracking-wide">{card.university}</h2>
                  <p className="text-blue-300 text-sm">Alumni Association</p>
                </div>
                <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full">
                  <Shield size={14} />
                  <span className="text-xs font-medium">{card.status === 'active' ? 'Verified' : 'Pending'}</span>
                </div>
              </div>

              <div className="flex gap-5">
                <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-white/30 bg-white/10">
                  {card.avatarUrl ? (
                    <Image src={card.avatarUrl} alt={card.name} width={96} height={96} className="object-cover w-full h-full" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl font-bold">
                      {card.name.split(' ').map(n => n[0]).join('')}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-1">{card.name}</h3>
                  <p className="text-blue-200 text-sm mb-3">{card.degree}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-blue-300">Department</p>
                      <p className="font-medium">{card.department}</p>
                    </div>
                    <div>
                      <p className="text-blue-300">Batch</p>
                      <p className="font-medium">{card.gradYear}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                <div className="text-xs">
                  <p className="text-blue-300">Card No.</p>
                  <p className="font-mono font-medium tracking-wider">{card.cardNumber}</p>
                </div>
                <div className="text-xs text-right">
                  <p className="text-blue-300">Valid Till</p>
                  <p className="font-medium">{formatDate(card.expiryDate)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Back */}
          <div
            className="absolute w-full h-full rounded-3xl overflow-hidden shadow-2xl"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <div className="h-full bg-white p-6">
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-40 h-40 mx-auto mb-4 bg-gray-100 rounded-2xl flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={card.qrCode} alt="QR Code" className="w-32 h-32" />
                  </div>
                  <p className="text-[#001145] font-bold mb-1">Scan to Verify</p>
                  <p className="text-gray-500 text-sm">{card.cardNumber}</p>
                </div>
              </div>
              <div className="absolute bottom-6 left-6 right-6 text-center text-xs text-gray-400">
                This card is the property of {card.university}. If found, please return.
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="text-center text-sm text-gray-500">Click on the card to flip</p>

      {/* Actions */}
      <div className="flex justify-center gap-3">
        <Button variant="outline" leftIcon={<Download size={18} />}>Download</Button>
        <Button variant="outline" leftIcon={<Share2 size={18} />}>Share</Button>
        <Button variant="outline" leftIcon={<RefreshCw size={18} />}>Refresh</Button>
      </div>

      {/* Card Details */}
      <Card>
        <h3 className="font-bold text-[#001145] mb-4">Card Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#e4f0ff] rounded-lg flex items-center justify-center">
              <QrCode className="text-[#001145]" size={18} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Card Number</p>
              <p className="font-medium text-[#001145] font-mono">{card.cardNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#e4f0ff] rounded-lg flex items-center justify-center">
              <Shield className="text-[#001145]" size={18} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <Badge variant={card.status === 'active' ? 'success' : 'warning'}>{card.status}</Badge>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#e4f0ff] rounded-lg flex items-center justify-center">
              <Calendar className="text-[#001145]" size={18} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Issue Date</p>
              <p className="font-medium text-[#001145]">{formatDate(card.issueDate)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#e4f0ff] rounded-lg flex items-center justify-center">
              <GraduationCap className="text-[#001145]" size={18} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Batch</p>
              <p className="font-medium text-[#001145]">{card.gradYear}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Benefits */}
      <Card className="bg-gradient-to-r from-[#e4f0ff] to-white">
        <h3 className="font-bold text-[#001145] mb-4">Card Benefits</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-center gap-2">✓ Access to alumni events and reunions</li>
          <li className="flex items-center gap-2">✓ Library and campus facility access</li>
          <li className="flex items-center gap-2">✓ Discounts at partner establishments</li>
          <li className="flex items-center gap-2">✓ Priority booking for university facilities</li>
          <li className="flex items-center gap-2">✓ Verification for job applications</li>
        </ul>
      </Card>
    </div>
  );
}
