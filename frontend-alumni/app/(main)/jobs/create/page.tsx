"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, Check } from 'lucide-react';
import { Button, Card, Input, Textarea, Select, Badge } from '@/components/ui';
import { createJob, CreateJobData } from '@/src/api/jobs';

const JOB_TYPES = [
  { value: 'Full-time', label: 'Full-time' },
  { value: 'Part-time', label: 'Part-time' },
  { value: 'Contract', label: 'Contract' },
  { value: 'Internship', label: 'Internship' },
  { value: 'Remote', label: 'Remote' },
];

const EXPERIENCE_LEVELS = [
  { value: 'Fresher', label: 'Fresher / Entry Level' },
  { value: '1-2 years', label: '1-2 years' },
  { value: '2-5 years', label: '2-5 years' },
  { value: '5+ years', label: '5+ years' },
  { value: '10+ years', label: '10+ years' },
];

export default function CreateJobPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [reqInput, setReqInput] = useState('');
  const [formData, setFormData] = useState<CreateJobData>({
    title: '',
    company: '',
    location: '',
    type: 'Full-time',
    salary: '',
    description: '',
    requirements: [],
    skills: [],
    benefits: [],
    experience: '',
    deadline: '',
  });

  const updateField = (field: keyof CreateJobData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      updateField('skills', [...formData.skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    updateField('skills', formData.skills.filter(s => s !== skill));
  };

  const addRequirement = () => {
    if (reqInput.trim()) {
      updateField('requirements', [...formData.requirements, reqInput.trim()]);
      setReqInput('');
    }
  };

  const removeRequirement = (index: number) => {
    updateField('requirements', formData.requirements.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await createJob(formData);
      router.push('/jobs');
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const isStep1Valid = formData.title && formData.company && formData.location && formData.type;
  const isStep2Valid = formData.description && formData.requirements.length > 0;
  const isStep3Valid = formData.skills.length > 0 && formData.experience;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-[#001145]">Post a Job</h1>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-4">
        {[1, 2, 3, 4].map((s) => (
          <React.Fragment key={s}>
            <button
              onClick={() => setStep(s)}
              className={`w-10 h-10 rounded-full font-bold flex items-center justify-center transition-colors ${
                step === s ? 'bg-[#001145] text-white' : step > s ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
              }`}
            >
              {step > s ? <Check size={18} /> : s}
            </button>
            {s < 4 && <div className={`flex-1 h-1 rounded ${step > s ? 'bg-green-500' : 'bg-gray-200'}`} />}
          </React.Fragment>
        ))}
      </div>

      {/* Step 1: Basic Info */}
      {step === 1 && (
        <Card>
          <h2 className="font-bold text-[#001145] mb-6">Basic Information</h2>
          <div className="space-y-4">
            <Input label="Job Title *" value={formData.title} onChange={(e) => updateField('title', e.target.value)} placeholder="e.g. Senior Software Engineer" />
            <Input label="Company Name *" value={formData.company} onChange={(e) => updateField('company', e.target.value)} placeholder="e.g. Google" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Location *" value={formData.location} onChange={(e) => updateField('location', e.target.value)} placeholder="e.g. Bangalore, India" />
              <Select label="Job Type *" options={JOB_TYPES} value={formData.type} onChange={(e) => updateField('type', e.target.value)} />
            </div>
            <Input label="Salary Range" value={formData.salary || ''} onChange={(e) => updateField('salary', e.target.value)} placeholder="e.g. ₹15-25 LPA" />
          </div>
          <div className="flex justify-end mt-6">
            <Button onClick={() => setStep(2)} disabled={!isStep1Valid}>Next</Button>
          </div>
        </Card>
      )}

      {/* Step 2: Description & Requirements */}
      {step === 2 && (
        <Card>
          <h2 className="font-bold text-[#001145] mb-6">Job Description</h2>
          <div className="space-y-6">
            <Textarea label="Description *" rows={6} value={formData.description} onChange={(e) => updateField('description', e.target.value)} placeholder="Describe the role, responsibilities, and what makes it exciting..." />
            <div>
              <label className="block text-sm font-medium text-[#001145] mb-2">Requirements *</label>
              <div className="flex gap-2 mb-3">
                <Input value={reqInput} onChange={(e) => setReqInput(e.target.value)} placeholder="Add a requirement..." onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())} />
                <Button variant="outline" onClick={addRequirement}><Plus size={18} /></Button>
              </div>
              <ul className="space-y-2">
                {formData.requirements.map((req, i) => (
                  <li key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">{req}</span>
                    <button onClick={() => removeRequirement(i)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
            <Button onClick={() => setStep(3)} disabled={!isStep2Valid}>Next</Button>
          </div>
        </Card>
      )}

      {/* Step 3: Skills & Experience */}
      {step === 3 && (
        <Card>
          <h2 className="font-bold text-[#001145] mb-6">Skills & Experience</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#001145] mb-2">Required Skills *</label>
              <div className="flex gap-2 mb-3">
                <Input value={skillInput} onChange={(e) => setSkillInput(e.target.value)} placeholder="Add a skill..." onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())} />
                <Button variant="outline" onClick={addSkill}><Plus size={18} /></Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill) => (
                  <Badge key={skill} className="flex items-center gap-1">
                    {skill}
                    <button onClick={() => removeSkill(skill)} className="ml-1 hover:text-red-500"><Trash2 size={12} /></button>
                  </Badge>
                ))}
              </div>
            </div>
            <Select label="Experience Level *" options={EXPERIENCE_LEVELS} value={formData.experience} onChange={(e) => updateField('experience', e.target.value)} />
            <Input label="Application Deadline" type="date" value={formData.deadline || ''} onChange={(e) => updateField('deadline', e.target.value)} />
          </div>
          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
            <Button onClick={() => setStep(4)} disabled={!isStep3Valid}>Next</Button>
          </div>
        </Card>
      )}

      {/* Step 4: Preview */}
      {step === 4 && (
        <Card>
          <h2 className="font-bold text-[#001145] mb-6">Preview & Publish</h2>
          <div className="space-y-4 p-4 bg-gray-50 rounded-xl">
            <div>
              <h3 className="text-xl font-bold text-[#001145]">{formData.title}</h3>
              <p className="text-gray-600">{formData.company} • {formData.location}</p>
              <div className="flex gap-2 mt-2">
                <Badge>{formData.type}</Badge>
                {formData.salary && <Badge variant="success">{formData.salary}</Badge>}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-[#001145]">Description</h4>
              <p className="text-gray-600 text-sm">{formData.description}</p>
            </div>
            <div>
              <h4 className="font-medium text-[#001145]">Requirements</h4>
              <ul className="list-disc list-inside text-gray-600 text-sm">
                {formData.requirements.map((req, i) => <li key={i}>{req}</li>)}
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-[#001145]">Skills</h4>
              <div className="flex flex-wrap gap-1">
                {formData.skills.map((skill) => <Badge key={skill} size="sm">{skill}</Badge>)}
              </div>
            </div>
          </div>
          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={() => setStep(3)}>Back</Button>
            <Button onClick={handleSubmit} isLoading={submitting}>Publish Job</Button>
          </div>
        </Card>
      )}
    </div>
  );
}
