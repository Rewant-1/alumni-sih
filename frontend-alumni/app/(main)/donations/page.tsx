"use client";

import React, { useState } from 'react';
import { Heart, Target, Trophy, GraduationCap, Building2, Users } from 'lucide-react';

const DONATION_CAUSES = [
  {
    _id: '1',
    title: 'Student Scholarship Fund',
    description: 'Help deserving students achieve their academic dreams with financial support.',
    raised: 450000,
    goal: 1000000,
    donors: 234,
    icon: GraduationCap,
    color: 'bg-blue-500',
  },
  {
    _id: '2',
    title: 'Infrastructure Development',
    description: 'Contribute to building state-of-the-art facilities for future students.',
    raised: 780000,
    goal: 2000000,
    donors: 156,
    icon: Building2,
    color: 'bg-green-500',
  },
  {
    _id: '3',
    title: 'Research & Innovation',
    description: 'Support groundbreaking research projects and innovation labs.',
    raised: 320000,
    goal: 500000,
    donors: 89,
    icon: Trophy,
    color: 'bg-purple-500',
  },
];

const DONATION_AMOUNTS = [1000, 5000, 10000, 25000, 50000];

export default function DonationsPage() {
  const [selectedCause, setSelectedCause] = useState<string | null>(null);
  const [amount, setAmount] = useState<number>(5000);
  const [customAmount, setCustomAmount] = useState('');

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR',
      maximumFractionDigits: 0 
    }).format(num);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Heart className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-3xl font-bold text-[#001145] mb-3">Give Back to Your Alma Mater</h1>
        <p className="text-gray-500">Your contribution helps shape the future of education and empowers the next generation of leaders.</p>
      </div>

      {/* Causes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {DONATION_CAUSES.map((cause) => {
          const progress = (cause.raised / cause.goal) * 100;
          
          return (
            <div 
              key={cause._id}
              onClick={() => setSelectedCause(cause._id)}
              className={`bg-white rounded-2xl p-6 border-2 cursor-pointer transition-all ${
                selectedCause === cause._id 
                  ? 'border-[#001145] shadow-lg' 
                  : 'border-gray-100 hover:border-gray-200 hover:shadow-md'
              }`}
            >
              <div className={`w-12 h-12 ${cause.color} rounded-xl flex items-center justify-center mb-4`}>
                <cause.icon className="w-6 h-6 text-white" />
              </div>

              <h3 className="text-xl font-bold text-[#001145] mb-2">{cause.title}</h3>
              <p className="text-gray-500 text-sm mb-6">{cause.description}</p>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-bold text-[#001145]">{formatCurrency(cause.raised)}</span>
                  <span className="text-gray-400">of {formatCurrency(cause.goal)}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${cause.color} rounded-full transition-all`}
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <Users size={14} />
                <span>{cause.donors} donors</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Donation Form */}
      {selectedCause && (
        <div className="max-w-lg mx-auto bg-white rounded-2xl p-8 border border-gray-100">
          <h2 className="text-xl font-bold text-[#001145] mb-6 text-center">Select Amount</h2>
          
          <div className="grid grid-cols-3 gap-3 mb-6">
            {DONATION_AMOUNTS.map((amt) => (
              <button
                key={amt}
                onClick={() => {
                  setAmount(amt);
                  setCustomAmount('');
                }}
                className={`py-3 rounded-xl font-medium transition-colors ${
                  amount === amt && !customAmount
                    ? 'bg-[#001145] text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {formatCurrency(amt)}
              </button>
            ))}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-600 mb-2">Or enter custom amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
              <input
                type="number"
                placeholder="Enter amount"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setAmount(0);
                }}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#001145]/20 focus:border-[#001145]"
              />
            </div>
          </div>

          <button className="w-full bg-[#001145] text-white py-4 rounded-xl font-bold hover:bg-[#001339] transition-colors">
            Donate {formatCurrency(customAmount ? parseInt(customAmount) : amount)}
          </button>

          <p className="text-center text-xs text-gray-400 mt-4">
            Your donation is tax-deductible under Section 80G
          </p>
        </div>
      )}
    </div>
  );
}
