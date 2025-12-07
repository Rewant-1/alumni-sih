"use client";

import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, Users, Plus, Search, Filter } from 'lucide-react';
import { getAllEvents } from '@/src/api/events';

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#001145]">Events</h1>
          <p className="text-gray-500">Discover and join alumni events</p>
        </div>
        <button className="flex items-center gap-2 bg-[#001145] text-white px-6 py-3 rounded-full font-medium hover:bg-[#001339] transition-colors">
          <Plus size={20} />
          Create Event
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {['all', 'Reunion', 'Webinar', 'Networking', 'Workshop'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filter === cat 
                ? 'bg-[#001145] text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat === 'all' ? 'All Events' : cat}
          </button>
        ))}
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading events...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No events found.</p>
        </div>
      ) : null}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events
          .filter(e => filter === 'all' || e.category === filter)
          .map((event) => (
          <div key={event._id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
            {/* Image */}
            <div className="h-48 bg-gradient-to-br from-[#001145] to-[#001339] relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <Calendar className="w-16 h-16 text-white/20" />
              </div>
              <span className="absolute top-4 right-4 px-3 py-1 bg-white/90 text-[#001145] text-sm rounded-full font-medium">
                {event.category}
              </span>
            </div>

            {/* Content */}
            <div className="p-6">
              <h3 className="text-xl font-bold text-[#001145] mb-3">{event.title}</h3>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <Clock size={16} />
                  <span>{formatDate(event.date)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <MapPin size={16} />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <Users size={16} />
                  <span>{event.attendees} attending</span>
                </div>
              </div>

              <p className="text-gray-500 text-sm mb-6 line-clamp-2">{event.description}</p>

              <button className="w-full bg-[#e4f0ff] text-[#001145] py-3 rounded-xl font-bold hover:bg-[#d0e4ff] transition-colors">
                Register
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
