"use client";

import React from 'react';
import Link from 'next/link';
import { 
  Users, 
  Briefcase, 
  Calendar, 
  MessageSquare, 
  UserCircle, 
  Heart,
  TrendingUp,
  Bell,
  BookOpen
} from 'lucide-react';

const quickLinks = [
  { name: 'Alumni Directory', href: '/alumni', icon: Users, color: 'bg-blue-500', description: 'Connect with fellow alumni' },
  { name: 'Job Board', href: '/jobs', icon: Briefcase, color: 'bg-green-500', description: 'Find career opportunities' },
  { name: 'Events', href: '/events', icon: Calendar, color: 'bg-purple-500', description: 'Upcoming alumni events' },
  { name: 'Feed', href: '/feed', icon: BookOpen, color: 'bg-orange-500', description: 'Latest posts and updates' },
  { name: 'Messages', href: '/messages', icon: MessageSquare, color: 'bg-pink-500', description: 'Chat with connections' },
  { name: 'My Profile', href: '/profile', icon: UserCircle, color: 'bg-indigo-500', description: 'View and edit your profile' },
];

const stats = [
  { label: 'Total Alumni', value: '12,450', icon: Users },
  { label: 'Active Jobs', value: '234', icon: Briefcase },
  { label: 'Upcoming Events', value: '8', icon: Calendar },
  { label: 'Your Connections', value: '156', icon: Heart },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-[#001145] to-[#001339] rounded-3xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back! 👋</h1>
        <p className="text-blue-200 text-lg">Stay connected with your alumni network</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <stat.icon className="w-8 h-8 text-[#001145] mb-3" />
            <p className="text-3xl font-bold text-[#001145]">{stat.value}</p>
            <p className="text-gray-500 text-sm">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="text-2xl font-bold text-[#001145] mb-6">Quick Access</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href}
              className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-[#001145]/20 transition-all duration-300"
            >
              <div className={`w-12 h-12 ${link.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <link.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-[#001145] mb-1">{link.name}</h3>
              <p className="text-gray-500 text-sm">{link.description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[#001145]">Recent Activity</h2>
          <Bell className="w-5 h-5 text-gray-400" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 bg-[#e4f0ff] rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-[#001145]" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-[#001145]">New job posting from Alumni Network</p>
                <p className="text-sm text-gray-500">2 hours ago</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
