"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar, MapPin, Clock, Users, ArrowLeft, Share2, Video, Check, ExternalLink } from 'lucide-react';
import { Button, Card, Badge, Avatar, LoadingSpinner } from '@/components/ui';
import { getEvent, registerForEvent, cancelRegistration, getEventAttendees, Event } from '@/src/api/events';

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [event, setEvent] = useState<Event | null>(null);
  const [attendees, setAttendees] = useState<{ id: string; name: string; avatarUrl?: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventData, attendeesData] = await Promise.all([
          getEvent(id),
          getEventAttendees(id),
        ]);
        setEvent(eventData);
        setAttendees(attendeesData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleRegister = async () => {
    setRegistering(true);
    try {
      await registerForEvent(id);
      setEvent(prev => prev ? { ...prev, isRegistered: true, attendeesCount: prev.attendeesCount + 1 } : null);
    } catch (error) {
      console.error(error);
    } finally {
      setRegistering(false);
    }
  };

  const handleCancel = async () => {
    try {
      await cancelRegistration(id);
      setEvent(prev => prev ? { ...prev, isRegistered: false, attendeesCount: prev.attendeesCount - 1 } : null);
    } catch (error) {
      console.error(error);
    }
  };

  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const formatTime = (date: string) => new Date(date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  if (loading) return <LoadingSpinner fullScreen text="Loading event..." />;
  if (!event) return <div className="text-center py-12">Event not found</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-600 hover:text-[#001145]">
        <ArrowLeft size={20} />Back to Events
      </button>

      {/* Hero */}
      <div className="relative h-64 bg-gradient-to-br from-[#001145] to-[#001339] rounded-2xl overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <Calendar className="w-24 h-24 text-white/10" />
        </div>
        <div className="absolute bottom-6 left-6 right-6">
          <Badge className="mb-2">{event.category}</Badge>
          <h1 className="text-3xl font-bold text-white">{event.title}</h1>
        </div>
      </div>

      {/* Quick Info */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#e4f0ff] rounded-lg flex items-center justify-center">
              <Calendar className="text-[#001145]" size={18} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Date</p>
              <p className="font-medium text-[#001145]">{formatDate(event.date)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#e4f0ff] rounded-lg flex items-center justify-center">
              <Clock className="text-[#001145]" size={18} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Time</p>
              <p className="font-medium text-[#001145]">{formatTime(event.date)}{event.endDate && ` - ${formatTime(event.endDate)}`}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#e4f0ff] rounded-lg flex items-center justify-center">
              {event.isOnline ? <Video className="text-[#001145]" size={18} /> : <MapPin className="text-[#001145]" size={18} />}
            </div>
            <div>
              <p className="text-sm text-gray-500">{event.isOnline ? 'Online' : 'Location'}</p>
              <p className="font-medium text-[#001145] truncate max-w-[150px]">{event.location}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#e4f0ff] rounded-lg flex items-center justify-center">
              <Users className="text-[#001145]" size={18} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Attendees</p>
              <p className="font-medium text-[#001145]">{event.attendeesCount}{event.capacity && ` / ${event.capacity}`}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Actions */}
      <Card>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            {event.status === 'upcoming' && event.capacity && (
              <p className="text-sm text-gray-500">{event.capacity - event.attendeesCount} spots remaining</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" leftIcon={<Share2 size={16} />}>Share</Button>
            {event.isRegistered ? (
              <Button variant="secondary" leftIcon={<Check size={16} />} onClick={handleCancel}>Registered</Button>
            ) : (
              <Button leftIcon={<Calendar size={16} />} onClick={handleRegister} isLoading={registering}>
                Register Now
              </Button>
            )}
          </div>
        </div>
        {event.isOnline && event.isRegistered && event.meetingLink && (
          <a href={event.meetingLink} target="_blank" rel="noopener noreferrer" className="mt-4 flex items-center gap-2 p-4 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition-colors">
            <Video size={18} />Join Meeting<ExternalLink size={14} className="ml-auto" />
          </a>
        )}
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <h2 className="font-bold text-[#001145] mb-4">About this Event</h2>
            <p className="text-gray-600 whitespace-pre-line">{event.description}</p>
          </Card>

          {/* Agenda */}
          {event.agenda && event.agenda.length > 0 && (
            <Card>
              <h2 className="font-bold text-[#001145] mb-4">Agenda</h2>
              <div className="space-y-4">
                {event.agenda.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b border-gray-100 last:border-0">
                    <div className="text-sm font-medium text-[#001145] w-16 flex-shrink-0">{item.time}</div>
                    <div>
                      <p className="font-medium text-[#001145]">{item.title}</p>
                      {item.speaker && <p className="text-gray-500 text-sm">Speaker: {item.speaker}</p>}
                      {item.description && <p className="text-gray-600 text-sm mt-1">{item.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {/* Organizer */}
          <Card>
            <h3 className="font-bold text-[#001145] mb-4">Organizer</h3>
            <Link href={`/profile/${event.organizer.id}`} className="flex items-center gap-3 hover:bg-gray-50 p-2 -m-2 rounded-lg">
              <Avatar name={event.organizer.name} src={event.organizer.avatarUrl} />
              <span className="font-medium text-[#001145]">{event.organizer.name}</span>
            </Link>
          </Card>

          {/* Attendees */}
          <Card>
            <h3 className="font-bold text-[#001145] mb-4">Attendees ({event.attendeesCount})</h3>
            <div className="flex flex-wrap gap-2">
              {attendees.slice(0, 8).map((a) => (
                <Link key={a.id} href={`/profile/${a.id}`} title={a.name}>
                  <Avatar name={a.name} src={a.avatarUrl} size="sm" />
                </Link>
              ))}
              {event.attendeesCount > 8 && (
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs text-gray-500">
                  +{event.attendeesCount - 8}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
