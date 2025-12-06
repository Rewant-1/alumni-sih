"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, Calendar, MapPin, Video } from 'lucide-react';
import { Button, Card, Input, Textarea, Select } from '@/components/ui';
import { createEvent, CreateEventData } from '@/src/api/events';

const EVENT_CATEGORIES = [
  { value: 'Reunion', label: 'Reunion' },
  { value: 'Webinar', label: 'Webinar' },
  { value: 'Networking', label: 'Networking' },
  { value: 'Workshop', label: 'Workshop' },
  { value: 'Conference', label: 'Conference' },
  { value: 'Social', label: 'Social' },
];

export default function CreateEventPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateEventData>({
    title: '',
    description: '',
    date: '',
    endDate: '',
    location: '',
    isOnline: false,
    meetingLink: '',
    category: 'Networking',
    capacity: undefined,
    agenda: [],
  });

  const updateField = (field: keyof CreateEventData, value: string | boolean | number | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addAgendaItem = () => {
    setFormData(prev => ({
      ...prev,
      agenda: [...(prev.agenda || []), { time: '', title: '', speaker: '', description: '' }],
    }));
  };

  const updateAgendaItem = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      agenda: prev.agenda?.map((item, i) => i === index ? { ...item, [field]: value } : item),
    }));
  };

  const removeAgendaItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      agenda: prev.agenda?.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await createEvent(formData);
      router.push('/events');
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const isValid = formData.title && formData.description && formData.date && (formData.isOnline ? formData.meetingLink : formData.location);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-[#001145]">Create Event</h1>
      </div>

      {/* Basic Info */}
      <Card>
        <h2 className="font-bold text-[#001145] mb-6">Event Details</h2>
        <div className="space-y-4">
          <Input label="Event Title *" value={formData.title} onChange={(e) => updateField('title', e.target.value)} placeholder="e.g. Annual Alumni Reunion 2025" />
          <Select label="Category *" options={EVENT_CATEGORIES} value={formData.category} onChange={(e) => updateField('category', e.target.value)} />
          <Textarea label="Description *" rows={5} value={formData.description} onChange={(e) => updateField('description', e.target.value)} placeholder="Describe your event..." />
        </div>
      </Card>

      {/* Date & Time */}
      <Card>
        <h2 className="font-bold text-[#001145] mb-6">Date & Time</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Start Date & Time *" type="datetime-local" value={formData.date} onChange={(e) => updateField('date', e.target.value)} leftIcon={<Calendar size={18} />} />
          <Input label="End Date & Time" type="datetime-local" value={formData.endDate || ''} onChange={(e) => updateField('endDate', e.target.value)} leftIcon={<Calendar size={18} />} />
        </div>
      </Card>

      {/* Location */}
      <Card>
        <h2 className="font-bold text-[#001145] mb-6">Location</h2>
        <div className="space-y-4">
          <div className="flex gap-4">
            <button
              onClick={() => updateField('isOnline', false)}
              className={`flex-1 p-4 rounded-xl border-2 transition-colors ${!formData.isOnline ? 'border-[#001145] bg-[#e4f0ff]' : 'border-gray-200 hover:border-gray-300'}`}
            >
              <MapPin className={`mx-auto mb-2 ${!formData.isOnline ? 'text-[#001145]' : 'text-gray-400'}`} size={24} />
              <p className={`font-medium ${!formData.isOnline ? 'text-[#001145]' : 'text-gray-500'}`}>In-Person</p>
            </button>
            <button
              onClick={() => updateField('isOnline', true)}
              className={`flex-1 p-4 rounded-xl border-2 transition-colors ${formData.isOnline ? 'border-[#001145] bg-[#e4f0ff]' : 'border-gray-200 hover:border-gray-300'}`}
            >
              <Video className={`mx-auto mb-2 ${formData.isOnline ? 'text-[#001145]' : 'text-gray-400'}`} size={24} />
              <p className={`font-medium ${formData.isOnline ? 'text-[#001145]' : 'text-gray-500'}`}>Online</p>
            </button>
          </div>
          {formData.isOnline ? (
            <Input label="Meeting Link *" value={formData.meetingLink || ''} onChange={(e) => updateField('meetingLink', e.target.value)} placeholder="https://zoom.us/j/..." leftIcon={<Video size={18} />} />
          ) : (
            <Input label="Venue Address *" value={formData.location} onChange={(e) => updateField('location', e.target.value)} placeholder="e.g. Main Campus Auditorium" leftIcon={<MapPin size={18} />} />
          )}
          <Input label="Capacity (Optional)" type="number" value={formData.capacity || ''} onChange={(e) => updateField('capacity', e.target.value ? parseInt(e.target.value) : undefined)} placeholder="Maximum attendees" />
        </div>
      </Card>

      {/* Agenda */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-[#001145]">Agenda (Optional)</h2>
          <Button variant="outline" size="sm" leftIcon={<Plus size={16} />} onClick={addAgendaItem}>Add Item</Button>
        </div>
        <div className="space-y-4">
          {formData.agenda?.map((item, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-xl space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Item {index + 1}</span>
                <button onClick={() => removeAgendaItem(index)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input label="Time" value={item.time} onChange={(e) => updateAgendaItem(index, 'time', e.target.value)} placeholder="e.g. 10:00 AM" />
                <Input label="Title" value={item.title} onChange={(e) => updateAgendaItem(index, 'title', e.target.value)} placeholder="Session title" />
                <Input label="Speaker (Optional)" value={item.speaker || ''} onChange={(e) => updateAgendaItem(index, 'speaker', e.target.value)} placeholder="Speaker name" />
              </div>
            </div>
          ))}
          {(!formData.agenda || formData.agenda.length === 0) && (
            <p className="text-gray-500 text-center py-4">No agenda items added yet.</p>
          )}
        </div>
      </Card>

      {/* Submit */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
        <Button onClick={handleSubmit} isLoading={submitting} disabled={!isValid}>Create Event</Button>
      </div>
    </div>
  );
}
