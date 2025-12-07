"use client";

import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { X, Heart, ShieldCheck } from 'lucide-react';
import CheckoutForm from './CheckoutForm';
import apiClient from '@/src/api/apiClient'; // Adjust based on your API client path
import toast from 'react-hot-toast';

// Make sure to set this in your frontend .env.local
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId: string;
  campaignTitle: string;
}

export default function DonationModal({ isOpen, onClose, campaignId, campaignTitle }: DonationModalProps) {
  const [clientSecret, setClientSecret] = useState("");
  const [amount, setAmount] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'amount' | 'payment'>('amount');

  useEffect(() => {
    if (!isOpen) {
      setClientSecret("");
      setAmount("");
      setStep('amount');
    }
  }, [isOpen]);

  const handleAmountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    
    if (!numAmount || numAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setLoading(true);

    try {
      // Call your new isolated backend endpoint
      const response = await apiClient.post('/stripe/create-donation-intent', {
        campaignId,
        amount: numAmount
      });

      if (response.data.success) {
        setClientSecret(response.data.data.clientSecret);
        setStep('payment');
      } else {
        toast.error("Failed to initialize payment");
      }
    } catch (error) {
      console.error("Payment initialization error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const appearance = {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#001145',
    },
  };

  const options = {
    clientSecret,
    appearance,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        
        {/* Header */}
        <div className="bg-[#001145] p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
              <Heart className="text-pink-400 fill-pink-400" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Donate to Campaign</h2>
              <p className="text-blue-200 text-sm truncate max-w-[250px]">{campaignTitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'amount' ? (
            <form onSubmit={handleAmountSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Enter Donation Amount (₹)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₹</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g. 5000"
                    className="w-full pl-10 pr-4 py-4 text-2xl font-bold text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#001145] focus:border-transparent outline-none transition-all"
                    min="1"
                    autoFocus
                  />
                </div>
                <div className="flex gap-2">
                  {[1000, 2000, 5000, 10000].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAmount(val.toString())}
                      className="flex-1 py-2 text-sm font-medium text-[#001145] bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-100"
                    >
                      ₹{val.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl flex items-start gap-3">
                <ShieldCheck className="text-green-600 shrink-0 mt-0.5" size={20} />
                <p className="text-xs text-gray-500">
                  Your donation is handled securely by Stripe. We verify every transaction to ensure your contribution reaches the campaign directly.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || !amount}
                className="w-full bg-[#001145] text-white py-4 px-6 rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-blue-900/20 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Initializing..." : "Proceed to Pay"}
              </button>
            </form>
          ) : (
            <>
              {clientSecret && (
                <Elements options={options} stripe={stripePromise}>
                  <CheckoutForm 
                    amount={parseFloat(amount)} 
                    onSuccess={() => {
                      setTimeout(onClose, 2000); // Close after success delay
                    }}
                  />
                </Elements>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
