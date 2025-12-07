"use client";

import React, { useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface CheckoutFormProps {
  amount: number;
  onSuccess: () => void;
}

export default function CheckoutForm({ amount, onSuccess }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();

  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      return;
    }

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Return URL is required, but we can handle completion on same page for some flows
        // For simplicity in this modal, we might just rely on the redirect or immediate success
        return_url: `${window.location.origin}/dashboard/donations/success`,
      },
      redirect: 'if_required' // Avoid redirect if possible
    });

    if (error) {
      if (error.type === "card_error" || error.type === "validation_error") {
        setMessage(error.message ?? "An unexpected error occurred.");
      } else {
        setMessage("An unexpected error occurred.");
      }
      toast.error(error.message ?? "Payment failed");
    } else {
      // Payment successful!
      toast.success("Donation successful! Thank you for your support.");
      onSuccess();
    }

    setIsLoading(false);
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg mb-4">
        <p className="text-sm text-gray-500 mb-1">Total Donation Amount</p>
        <p className="text-2xl font-bold text-[#001145]">₹ {amount.toLocaleString()}</p>
      </div>
      
      <PaymentElement id="payment-element" options={{ layout: "tabs" }} />
      
      {message && (
        <div id="payment-message" className="text-sm text-red-500 bg-red-50 p-3 rounded-md">
          {message}
        </div>
      )}

      <button
        disabled={isLoading || !stripe || !elements}
        id="submit"
        className="w-full bg-[#001145] text-white py-3 px-4 rounded-xl font-medium hover:bg-[#001145]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            Processing...
          </>
        ) : (
          "Pay Now"
        )}
      </button>
    </form>
  );
}
