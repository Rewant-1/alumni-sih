"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { User, Bell, Menu, X, LogOut } from 'lucide-react';

const navItems = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Feed", href: "/feed" },
  { name: "Connections", href: "/connections" },
  { name: "Messages", href: "/messages" },
  { name: "Jobs", href: "/jobs" },
  { name: "Events", href: "/events" },
  { name: "Campaigns", href: "/campaigns" },
  { name: "Stories", href: "/success-stories" },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="w-full bg-white font-sans border-b border-gray-100 sticky top-0 z-50">
      <header className="max-w-7xl mx-auto w-full py-3 px-4 md:px-6 flex items-center justify-between">
        {/* Logo */}
        <div className="flex-shrink-0">
          <Link href="/dashboard">
            <Image
              src="/sarthak.png"
              alt="Sarthak Logo"
              width={140}
              height={60}
              className="h-14 w-auto object-contain"
              priority
            />
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden lg:block bg-[#001339] text-white rounded-full px-6 py-2.5 shadow-lg">
          <ul className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`px-4 py-2 rounded-full text-sm font-medium tracking-wide transition-all duration-200 ${
                      isActive 
                        ? 'bg-white/20 text-white' 
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          <button className="p-2 text-gray-500 hover:text-[#001145] hover:bg-gray-100 rounded-full transition-colors relative">
            <Bell size={22} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
          <Link href="/profile" className="hidden md:flex items-center gap-2 p-1.5 pr-4 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
            <div className="w-8 h-8 bg-[#001145] rounded-full flex items-center justify-center overflow-hidden">
              <User size={18} className="text-white" />
            </div>
            <span className="text-sm font-medium text-[#001145]">Profile</span>
          </Link>

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-[#001145] hover:bg-gray-100 rounded-lg"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 py-4 px-4">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-xl font-medium transition-colors ${
                    isActive 
                      ? 'bg-[#001145] text-white' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
            <Link
              href="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 rounded-xl font-medium text-gray-600 hover:bg-gray-100"
            >
              My Profile
            </Link>
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-4 py-3 rounded-xl font-medium text-red-500 hover:bg-red-50"
            >
              <LogOut size={18} />
              Logout
            </Link>
          </nav>
        </div>
      )}
    </div>
  );
}
