"use client";
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { User, Mail, Lock, Calendar, FileText } from 'lucide-react';
import { registerAlumni } from '@/src/api/auth';

export default function RegisterPage() {
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    password: '',
    graduationYear: '',
    degreeUrl: 'http://example.com/degree.pdf', // Placeholder or implement file upload
    collegeId: ''
  });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!formData.collegeId) {
        setError('Please provide a valid College ID.');
        setLoading(false);
        return;
      }

      await registerAlumni({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        graduationYear: Number(formData.graduationYear),
        degreeUrl: formData.degreeUrl,
        collegeId: formData.collegeId
      });
      // Redirect or show success
      window.location.href = '/login';
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen w-full flex items-center justify-center relative font-sans">
      {/* Background Split */}
      <div className="absolute inset-0 z-0 flex">
        {/* Left side white with subtle gradient/shadow effect */}
        <div className="w-1/2 h-full bg-white relative hidden md:block">
          <div className="absolute right-0 top-0 h-full w-24 bg-linear-to-l from-gray-100 to-transparent opacity-50"></div>
        </div>
        {/* Right side dark navy */}
        <div className="w-full md:w-1/2 h-full bg-[#020c25]"></div>
      </div>

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-[1000px] h-screen md:h-[600px] bg-white md:rounded-[40px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] flex flex-col md:flex-row overflow-hidden">
        
        {/* Left Column: Logo Area */}
        <div className="w-full md:w-1/2 bg-white flex flex-col items-center justify-center relative p-8 order-1 md:order-0 border-b md:border-b-0 border-slate-100">
          <div className="grow flex items-center justify-center w-full">
            {/* Logo Placeholder */}
            <Image 
              src="/sarthak.png" 
              alt="Sarthak Logo" 
              width={450}
              height={200}
              className="w-full max-w-[300px] md:max-w-[450px] object-contain mb-8"
              priority
            />
          </div>
          
          {/* Footer Text */}
          <div className="absolute bottom-4 md:bottom-8 text-[#0f172a] font-bold text-[11px] tracking-wide">
            Sarthak © 2025 | Built at SIH | De-bugs_
          </div>
        </div>

        {/* Right Column: Form Area */}
        <div className="w-full md:w-1/2 bg-[#f6f9fc] p-8 md:p-10 flex flex-col justify-center text-[#1e293b] order-0 md:order-1">
          <div className="w-full max-w-[380px] mx-auto">
            {/* Headers */}
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-[#051025] mb-1">
                Join Sarthak !
                </h2>
                <p className="text-sm text-slate-500">
                Connect with your legacy. Build your future.
                </p>
            </div>

            {/* Grid Form */}
            <form className="grid grid-cols-2 gap-3" onSubmit={handleSubmit}>
              
              {error && <div className="col-span-2 text-red-500 text-sm text-center">{error}</div>}

              {/* 1. Name (Full Width) */}
              <div className="col-span-2 relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <User size={16} />
                </div>
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  className="w-full pl-10 pr-4 py-2.5 bg-transparent border border-slate-400 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:border-[#001245] focus:ring-1 focus:ring-[#001245] transition-all"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* 2. Email (Full Width) */}
              <div className="col-span-2 relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <Mail size={16} />
                </div>
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  className="w-full pl-10 pr-4 py-2.5 bg-transparent border border-slate-400 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:border-[#001245] focus:ring-1 focus:ring-[#001245] transition-all"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* 3. Password (Half Width) */}
              <div className="col-span-1 relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <Lock size={16} />
                </div>
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  className="w-full pl-10 pr-4 py-2.5 bg-transparent border border-slate-400 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:border-[#001245] focus:ring-1 focus:ring-[#001245] transition-all"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* 4. Graduation Year (Half Width) */}
              <div className="col-span-1 relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <Calendar size={16} />
                </div>
                <input
                  type="number"
                  name="graduationYear"
                  min="1950"
                  max="2030"
                  placeholder="Grad. Year"
                  className="w-full pl-10 pr-4 py-2.5 bg-transparent border border-slate-400 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:border-[#001245] focus:ring-1 focus:ring-[#001245] transition-all"
                  value={formData.graduationYear}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* 5. College ID (Half Width) */}
              <div className="col-span-1 relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <FileText size={16} />
                </div>
                <input
                  type="text"
                  name="collegeId"
                  placeholder="College ID"
                  className="w-full pl-10 pr-4 py-2.5 bg-transparent border border-slate-400 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:border-[#001245] focus:ring-1 focus:ring-[#001245] transition-all"
                  value={formData.collegeId}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* 6. Degree URL (Half Width - Visual Drop Zone) */}
              <div className="col-span-2 md:col-span-1 mt-1">
                 <label className="flex flex-col items-center justify-center w-full h-20 px-4 bg-white border-2 border-slate-300 border-dashed rounded-xl cursor-pointer hover:border-[#001245] hover:bg-slate-50 transition-all group">
                    <div className="flex items-center gap-3 text-slate-500 group-hover:text-[#001245] transition-colors">
                        <FileText size={24} strokeWidth={1.5} />
                        <span className="text-sm font-medium">Upload Degree Certificate</span>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1">Supports PDF, JPG, PNG</span>
                    <input type="file" className="hidden" />
                 </label>
              </div>

              {/* Sign Up Button */}
              <div className="col-span-2 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="block w-40 mx-auto bg-[#051025] text-white font-bold py-2.5 rounded-full hover:bg-[#061637] transition-colors shadow-lg disabled:opacity-50"
                >
                  {loading ? 'Signing Up...' : 'Sign Up'}
                </button>
              </div>
            </form>

            {/* Bottom Link */}
            <p className="text-center text-xs text-slate-600 mt-6">
              Already have an account? <Link href="/login" className="font-bold text-[#051025] hover:underline">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
