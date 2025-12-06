"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { login } from '@/src/api/auth';
// import { useRouter } from 'next/navigation'; // Enable later for redirection

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  // const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login({ email, password });
      window.location.href = '/profile';
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.response?.data?.error || 'Invalid email or password';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* =============================== */}
      {/*        LOADING OVERLAY          */}
      {/* =============================== */}
      {loading && (
        <div className="fixed inset-0 bg-white flex flex-col justify-center items-center z-[999] animate-fadeInCentered">

          {/* Circular Loader */}
          <div className="relative w-50 h-50 mb-6 w-[200px] h-[200px]">
            <div className="absolute inset-0 border-4 border-transparent border-t-[#001245] border-r-[#001245] rounded-full animate-spin-slow"></div>

            {/* Center Logo */}
            <div className="absolute inset-0 flex items-center justify-center">
                 <Image
                  src="/sarthak_clear.png"
                  alt="sarthak Logo"
                  width={184}
                  height={184}
                  className="object-contain"
                />
            </div>
          </div>

          {/* Loading Text */}
          <p className="text-slate-600 text-sm tracking-wide">
            Logging you in...
          </p>
        </div>
      )}

      {/* =============================== */}
      {/*        NORMAL SCREEN UI         */}
      {/* =============================== */}
      {!loading && (
        <div className="min-h-screen w-full flex items-center justify-center relative font-sans">
          
          {/* Background Split */}
          <div className="absolute inset-0 z-0 flex">
            <div className="w-1/2 h-full bg-white relative hidden md:block">
              <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-gray-100 to-transparent opacity-50"></div>
            </div>

            <div className="w-full md:w-1/2 h-full bg-[#020c25]"></div>
          </div>

          {/* MAIN CARD */}
          <div className="relative z-10 w-full max-w-[1000px] h-screen md:h-[600px] bg-white md:rounded-[40px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] flex flex-col md:flex-row overflow-hidden">
            
            {/* LEFT SIDE (Branding) */}
            <div className="w-full md:w-1/2 bg-white flex flex-col items-center justify-center relative p-8 order-1 md:order-0 border-b md:border-b-0 border-slate-100">
              <div className="flex-grow flex items-center justify-center w-full">
                <Image 
                  src="/sarthak.png" 
                  alt="Sarthak Logo" 
                  width={450}
                  height={200}
                  className="w-full max-w-[300px] md:max-w-[450px] object-contain mb-8"
                  priority
                />
              </div>

              <div className="absolute bottom-4 md:bottom-8 text-[#0f172a] font-bold text-[11px] tracking-wide">
                Sarthak © 2025 | Built at SIH | De-bugs_
              </div>
            </div>

            {/* RIGHT SIDE (Form) */}
            <div className="w-full md:w-1/2 bg-[#f6f9fc] p-8 md:p-12 flex flex-col justify-center items-center text-[#1e293b] order-0 md:order-1">
              <div className="w-full max-w-sm">

                <h2 className="text-2xl font-bold text-[#051025] mb-2">
                  Welcome to Sarthak !
                </h2>
                <p className="text-sm text-slate-500 mb-8">
                  Your network. Your opportunities. Your legacy.
                </p>

                <p className="text-sm font-semibold text-[#051025] mb-6">
                  Sign in to access your alumni network.
                </p>

                <form className="space-y-5" onSubmit={handleLogin}>

                  {error && (
                    <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
                  )}

                  <input
                    type="email"
                    placeholder="Enter Your Email Here"
                    className="w-full px-4 py-3 bg-transparent border border-slate-400 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:border-[#001245] focus:ring-1 focus:ring-[#001245] transition-all"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />

                  <input
                    type="password"
                    placeholder="Your Password Here"
                    className="w-full px-4 py-3 bg-transparent border border-slate-400 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:border-[#001245] focus:ring-1 focus:ring-[#001245] transition-all"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />

                  <div className="flex items-center justify-between text-xs text-[#0f172a]">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="w-3 h-3 cursor-pointer" />
                      Remember Me
                    </label>
                    <a href="#" className="font-medium hover:underline">Forgot Password?</a>
                  </div>

                  <button
                    type="submit"
                    className="block w-40 mx-auto bg-[#051025] text-white font-bold py-2.5 rounded-full hover:bg-[#061637] transition shadow-lg"
                  >
                    Sign In
                  </button>
                </form>

                <p className="text-center text-xs text-slate-600 mt-8">
                  Don&apos;t have an account?{" "}
                  <Link href="/register" className="font-bold text-[#051025] hover:underline">
                    Join Sarthak
                  </Link>
                </p>

              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
