"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Linkedin, Github, Twitter, Globe, Mail, MapPin, Briefcase, GraduationCap, UserPlus, MessageSquare, Check, Clock } from 'lucide-react';
import { Button, Card, Badge, LoadingSpinner } from '@/components/ui';
import { getAlumniProfile, AlumniProfile } from '@/src/api/alumni';
import { sendConnectionRequest } from '@/src/api/connections';

export default function ViewProfilePage() {
  const params = useParams();
  const id = params.id as string;
  const [profile, setProfile] = useState<AlumniProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Overview');
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'pending' | 'none'>('none');

  const tabs = ['Overview', 'Experience', 'Education', 'Skills'];

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getAlumniProfile(id);
        setProfile(data);
        setConnectionStatus(data.connectionStatus || 'none');
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  const handleConnect = async () => {
    try {
      await sendConnectionRequest(id);
      setConnectionStatus('pending');
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <LoadingSpinner fullScreen text="Loading profile..." />;
  if (!profile) return <div className="text-center py-12">Profile not found</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header Card */}
      <Card className="overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-[#001145] to-[#001339]" />
        <div className="px-8 pb-8">
          <div className="flex flex-col md:flex-row gap-6 -mt-16">
            <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-white shadow-lg bg-white">
              {profile.avatarUrl ? (
                <Image src={profile.avatarUrl} alt={profile.name} width={128} height={128} className="object-cover w-full h-full" />
              ) : (
                <div className="w-full h-full bg-[#001145] flex items-center justify-center text-white text-3xl font-bold">
                  {profile.name.split(' ').map(n => n[0]).join('')}
                </div>
              )}
            </div>
            <div className="flex-1 pt-4 md:pt-8">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-[#001145]">{profile.name}</h1>
                    {profile.isVerified && <Badge variant="success">Verified</Badge>}
                  </div>
                  <p className="text-gray-600 mt-1">{profile.currentRole} at {profile.currentCompany}</p>
                  <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                    {profile.location && <span className="flex items-center gap-1"><MapPin size={14} />{profile.location}</span>}
                    <span className="flex items-center gap-1"><GraduationCap size={14} />{profile.gradYear}</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  {connectionStatus === 'connected' ? (
                    <Button variant="secondary" leftIcon={<Check size={18} />}>Connected</Button>
                  ) : connectionStatus === 'pending' ? (
                    <Button variant="outline" leftIcon={<Clock size={18} />}>Pending</Button>
                  ) : (
                    <Button leftIcon={<UserPlus size={18} />} onClick={handleConnect}>Connect</Button>
                  )}
                  <Link href={`/messages?user=${id}`}>
                    <Button variant="outline" leftIcon={<MessageSquare size={18} />}>Message</Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab ? 'bg-[#001145] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'Overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <h3 className="font-bold text-[#001145] mb-3">About</h3>
              <p className="text-gray-600 leading-relaxed">{profile.bio || 'No bio available.'}</p>
            </Card>
            {profile.interests.length > 0 && (
              <Card>
                <h3 className="font-bold text-[#001145] mb-3">Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest) => (
                    <Badge key={interest} variant="info">{interest}</Badge>
                  ))}
                </div>
              </Card>
            )}
          </div>
          <div className="space-y-6">
            <Card>
              <h3 className="font-bold text-[#001145] mb-3">Contact</h3>
              <div className="space-y-3 text-sm">
                <a href={`mailto:${profile.email}`} className="flex items-center gap-2 text-gray-600 hover:text-[#001145]">
                  <Mail size={16} />{profile.email}
                </a>
              </div>
            </Card>
            <Card>
              <h3 className="font-bold text-[#001145] mb-3">Social Links</h3>
              <div className="space-y-2">
                {profile.socials.linkedin && <a href={profile.socials.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-600 hover:text-[#001145] text-sm"><Linkedin size={16} />LinkedIn</a>}
                {profile.socials.github && <a href={profile.socials.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-600 hover:text-[#001145] text-sm"><Github size={16} />GitHub</a>}
                {profile.socials.twitter && <a href={profile.socials.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-600 hover:text-[#001145] text-sm"><Twitter size={16} />Twitter</a>}
                {profile.socials.portfolio && <a href={profile.socials.portfolio} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-600 hover:text-[#001145] text-sm"><Globe size={16} />Portfolio</a>}
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'Experience' && (
        <Card>
          <h3 className="font-bold text-[#001145] mb-4">Work Experience</h3>
          <div className="space-y-6">
            {profile.experiences.map((exp) => (
              <div key={exp.id} className="flex gap-4 pb-6 border-b border-gray-100 last:border-0 last:pb-0">
                <div className="w-12 h-12 bg-[#e4f0ff] rounded-xl flex items-center justify-center flex-shrink-0">
                  <Briefcase className="text-[#001145]" size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-[#001145]">{exp.role}</h4>
                  <p className="text-gray-600">{exp.company}</p>
                  <p className="text-sm text-gray-500 mt-1">{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</p>
                  {exp.description && <p className="text-gray-600 mt-2 text-sm">{exp.description}</p>}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeTab === 'Education' && (
        <Card>
          <h3 className="font-bold text-[#001145] mb-4">Education</h3>
          <div className="space-y-6">
            {profile.education.map((edu) => (
              <div key={edu.id} className="flex gap-4 pb-6 border-b border-gray-100 last:border-0 last:pb-0">
                <div className="w-12 h-12 bg-[#e4f0ff] rounded-xl flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="text-[#001145]" size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-[#001145]">{edu.degree} in {edu.field}</h4>
                  <p className="text-gray-600">{edu.institution}</p>
                  <p className="text-sm text-gray-500 mt-1">{edu.startYear} - {edu.current ? 'Present' : edu.endYear}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeTab === 'Skills' && (
        <Card>
          <h3 className="font-bold text-[#001145] mb-4">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill) => (
              <Badge key={skill}>{skill}</Badge>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
