"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { Button, Card, Input, Textarea, Select, LoadingSpinner } from '@/components/ui';
import { getMyProfile, updateAlumniProfile, AlumniProfile, Experience, Education } from '@/src/api/alumni';

export default function EditProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('personal');
  const [profile, setProfile] = useState<Partial<AlumniProfile>>({});

  const sections = [
    { id: 'personal', label: 'Personal Info' },
    { id: 'work', label: 'Work Experience' },
    { id: 'education', label: 'Education' },
    { id: 'social', label: 'Social Links' },
  ];

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getMyProfile();
        setProfile(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateAlumniProfile(profile.id!, profile);
      router.push('/profile');
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: string, value: string | string[]) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const updateSocial = (field: string, value: string) => {
    setProfile(prev => ({ ...prev, socials: { ...prev.socials, [field]: value } }));
  };

  const addExperience = () => {
    const newExp: Experience = { id: Date.now().toString(), company: '', role: '', startDate: '', current: false };
    setProfile(prev => ({ ...prev, experiences: [...(prev.experiences || []), newExp] }));
  };

  const updateExperience = (id: string, field: string, value: string | boolean) => {
    setProfile(prev => ({
      ...prev,
      experiences: prev.experiences?.map(exp => exp.id === id ? { ...exp, [field]: value } : exp),
    }));
  };

  const removeExperience = (id: string) => {
    setProfile(prev => ({ ...prev, experiences: prev.experiences?.filter(exp => exp.id !== id) }));
  };

  const addEducation = () => {
    const newEdu: Education = { id: Date.now().toString(), institution: '', degree: '', field: '', startYear: new Date().getFullYear(), current: false };
    setProfile(prev => ({ ...prev, education: [...(prev.education || []), newEdu] }));
  };

  const updateEducation = (id: string, field: string, value: string | number | boolean) => {
    setProfile(prev => ({
      ...prev,
      education: prev.education?.map(edu => edu.id === id ? { ...edu, [field]: value } : edu),
    }));
  };

  const removeEducation = (id: string) => {
    setProfile(prev => ({ ...prev, education: prev.education?.filter(edu => edu.id !== id) }));
  };

  if (loading) return <LoadingSpinner fullScreen text="Loading profile..." />;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-[#001145]">Edit Profile</h1>
        </div>
        <Button onClick={handleSave} isLoading={saving} leftIcon={<Save size={18} />}>Save Changes</Button>
      </div>

      {/* Section Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeSection === section.id ? 'bg-[#001145] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {section.label}
          </button>
        ))}
      </div>

      {/* Personal Info */}
      {activeSection === 'personal' && (
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Full Name" value={profile.name || ''} onChange={(e) => updateField('name', e.target.value)} />
            <Input label="Email" type="email" value={profile.email || ''} onChange={(e) => updateField('email', e.target.value)} />
            <Input label="Phone" value={profile.phone || ''} onChange={(e) => updateField('phone', e.target.value)} />
            <Input label="Location" value={profile.location || ''} onChange={(e) => updateField('location', e.target.value)} />
            <Input label="Current Role" value={profile.currentRole || ''} onChange={(e) => updateField('currentRole', e.target.value)} />
            <Input label="Current Company" value={profile.currentCompany || ''} onChange={(e) => updateField('currentCompany', e.target.value)} />
            <div className="md:col-span-2">
              <Textarea label="Bio" rows={4} value={profile.bio || ''} onChange={(e) => updateField('bio', e.target.value)} placeholder="Tell us about yourself..." />
            </div>
            <div className="md:col-span-2">
              <Input label="Interests (comma-separated)" value={profile.interests?.join(', ') || ''} onChange={(e) => updateField('interests', e.target.value.split(',').map(s => s.trim()))} />
            </div>
            <div className="md:col-span-2">
              <Input label="Skills (comma-separated)" value={profile.skills?.join(', ') || ''} onChange={(e) => updateField('skills', e.target.value.split(',').map(s => s.trim()))} />
            </div>
          </div>
        </Card>
      )}

      {/* Work Experience */}
      {activeSection === 'work' && (
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-[#001145]">Work Experience</h3>
            <Button variant="outline" size="sm" leftIcon={<Plus size={16} />} onClick={addExperience}>Add</Button>
          </div>
          <div className="space-y-6">
            {profile.experiences?.map((exp) => (
              <div key={exp.id} className="p-4 bg-gray-50 rounded-xl space-y-4">
                <div className="flex justify-between">
                  <h4 className="font-medium text-[#001145]">Experience</h4>
                  <button onClick={() => removeExperience(exp.id)} className="text-red-500 hover:text-red-700"><Trash2 size={18} /></button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Company" value={exp.company} onChange={(e) => updateExperience(exp.id, 'company', e.target.value)} />
                  <Input label="Role" value={exp.role} onChange={(e) => updateExperience(exp.id, 'role', e.target.value)} />
                  <Input label="Start Date" type="month" value={exp.startDate} onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)} />
                  <Input label="End Date" type="month" value={exp.endDate || ''} onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)} disabled={exp.current} />
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={exp.current} onChange={(e) => updateExperience(exp.id, 'current', e.target.checked)} className="rounded" />
                  Currently working here
                </label>
                <Textarea label="Description" rows={2} value={exp.description || ''} onChange={(e) => updateExperience(exp.id, 'description', e.target.value)} />
              </div>
            ))}
            {(!profile.experiences || profile.experiences.length === 0) && (
              <p className="text-gray-500 text-center py-4">No work experience added yet.</p>
            )}
          </div>
        </Card>
      )}

      {/* Education */}
      {activeSection === 'education' && (
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-[#001145]">Education</h3>
            <Button variant="outline" size="sm" leftIcon={<Plus size={16} />} onClick={addEducation}>Add</Button>
          </div>
          <div className="space-y-6">
            {profile.education?.map((edu) => (
              <div key={edu.id} className="p-4 bg-gray-50 rounded-xl space-y-4">
                <div className="flex justify-between">
                  <h4 className="font-medium text-[#001145]">Education</h4>
                  <button onClick={() => removeEducation(edu.id)} className="text-red-500 hover:text-red-700"><Trash2 size={18} /></button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Institution" value={edu.institution} onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)} />
                  <Input label="Degree" value={edu.degree} onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)} />
                  <Input label="Field of Study" value={edu.field} onChange={(e) => updateEducation(edu.id, 'field', e.target.value)} />
                  <Input label="Start Year" type="number" value={edu.startYear} onChange={(e) => updateEducation(edu.id, 'startYear', parseInt(e.target.value))} />
                  <Input label="End Year" type="number" value={edu.endYear || ''} onChange={(e) => updateEducation(edu.id, 'endYear', parseInt(e.target.value))} disabled={edu.current} />
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={edu.current} onChange={(e) => updateEducation(edu.id, 'current', e.target.checked)} className="rounded" />
                  Currently studying here
                </label>
              </div>
            ))}
            {(!profile.education || profile.education.length === 0) && (
              <p className="text-gray-500 text-center py-4">No education added yet.</p>
            )}
          </div>
        </Card>
      )}

      {/* Social Links */}
      {activeSection === 'social' && (
        <Card>
          <h3 className="font-bold text-[#001145] mb-6">Social Links</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="LinkedIn URL" value={profile.socials?.linkedin || ''} onChange={(e) => updateSocial('linkedin', e.target.value)} placeholder="https://linkedin.com/in/..." />
            <Input label="GitHub URL" value={profile.socials?.github || ''} onChange={(e) => updateSocial('github', e.target.value)} placeholder="https://github.com/..." />
            <Input label="Twitter URL" value={profile.socials?.twitter || ''} onChange={(e) => updateSocial('twitter', e.target.value)} placeholder="https://twitter.com/..." />
            <Input label="Portfolio URL" value={profile.socials?.portfolio || ''} onChange={(e) => updateSocial('portfolio', e.target.value)} placeholder="https://..." />
          </div>
        </Card>
      )}
    </div>
  );
}
