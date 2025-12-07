"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Search, Filter, UserPlus, MapPin, Briefcase, GraduationCap, Mail } from 'lucide-react';
import { getAlumniDirectory } from '@/src/api/alumni';

export default function AlumniDirectoryPage() {
  const [alumni, setAlumni] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [batchFilter, setBatchFilter] = useState('all');

  const filteredAlumni = alumni.filter(a => 
    (a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     a.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
     a.department.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (batchFilter === 'all' || a.batch === batchFilter)
  );

  const batches = ['all', ...new Set(alumni.map(a => a.batch))].sort().reverse();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#001145]">Alumni Directory</h1>
        <p className="text-gray-500">Connect with your fellow alumni</p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by name, company, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#001145]/20 focus:border-[#001145]"
          />
        </div>
        <select
          value={batchFilter}
          onChange={(e) => setBatchFilter(e.target.value)}
          className="px-6 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#001145]/20 bg-white"
          aria-label="Filter alumni by batch"
        >
          {batches.map(batch => (
            <option key={batch} value={batch}>
              {batch === 'all' ? 'All Batches' : `Batch ${batch}`}
            </option>
          ))}
        </select>
      </div>

      {/* Alumni Grid */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading alumni...</p>
        </div>
      ) : alumni.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No alumni found. Try adjusting your filters.</p>
        </div>
      ) : null}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAlumni.map((person) => (
          <div key={person._id} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gray-200 overflow-hidden flex-shrink-0">
                <Image src={person.avatar} alt={person.name} width={64} height={64} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg text-[#001145] truncate">{person.name}</h3>
                <p className="text-gray-600 truncate">{person.title}</p>
              </div>
            </div>

            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <Briefcase size={14} />
                <span className="truncate">{person.company}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <MapPin size={14} />
                <span>{person.location}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <GraduationCap size={14} />
                <span>{person.department} • Batch {person.batch}</span>
              </div>
            </div>

            <div className="flex gap-2">
              {person.isConnected ? (
                <>
                  <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#e4f0ff] text-[#001145] rounded-xl font-medium hover:bg-[#d0e4ff] transition-colors">
                    <Mail size={16} />
                    Message
                  </button>
                </>
              ) : (
                <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#001145] text-white rounded-xl font-medium hover:bg-[#001339] transition-colors">
                  <UserPlus size={16} />
                  Connect
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
