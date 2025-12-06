"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, Eye, Edit } from 'lucide-react';
import { Button, Card, Input, Textarea, Select, Badge } from '@/components/ui';
import { submitSuccessStory, CreateStoryData } from '@/src/api/successStories';

const CATEGORIES = [
  { value: 'Entrepreneurship', label: 'Entrepreneurship' },
  { value: 'Career', label: 'Career' },
  { value: 'Research', label: 'Research' },
  { value: 'Social Impact', label: 'Social Impact' },
  { value: 'Innovation', label: 'Innovation' },
];

export default function SubmitStoryPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateStoryData>({
    title: '',
    content: '',
    category: 'Career',
    image: '',
  });

  const updateField = (field: keyof CreateStoryData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await submitSuccessStory(formData);
      router.push('/success-stories');
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const isValid = formData.title && formData.content && formData.category;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-[#001145]">Share Your Story</h1>
        </div>
        <div className="flex gap-2">
          <Button
            variant={mode === 'edit' ? 'secondary' : 'ghost'}
            size="sm"
            leftIcon={<Edit size={16} />}
            onClick={() => setMode('edit')}
          >
            Edit
          </Button>
          <Button
            variant={mode === 'preview' ? 'secondary' : 'ghost'}
            size="sm"
            leftIcon={<Eye size={16} />}
            onClick={() => setMode('preview')}
          >
            Preview
          </Button>
        </div>
      </div>

      {mode === 'edit' ? (
        <div className="space-y-6">
          <Card>
            <h2 className="font-bold text-[#001145] mb-6">Story Details</h2>
            <div className="space-y-4">
              <Input
                label="Title *"
                value={formData.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="Give your story a compelling title..."
              />
              <Select
                label="Category *"
                options={CATEGORIES}
                value={formData.category}
                onChange={(e) => updateField('category', e.target.value)}
              />
            </div>
          </Card>

          <Card>
            <h2 className="font-bold text-[#001145] mb-6">Your Story *</h2>
            <Textarea
              rows={15}
              value={formData.content}
              onChange={(e) => updateField('content', e.target.value)}
              placeholder={`Share your journey with the alumni community...

Some prompts to get you started:
• What was your path after graduation?
• What challenges did you face and how did you overcome them?
• What achievements are you most proud of?
• What advice would you give to current students?

Feel free to use markdown formatting for better readability.`}
            />
            <p className="text-sm text-gray-500 mt-2">Tip: Use paragraphs to make your story easier to read.</p>
          </Card>

          <Card>
            <h2 className="font-bold text-[#001145] mb-6">Cover Image (Optional)</h2>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-[#001145] transition-colors cursor-pointer">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">Click to upload or drag and drop</p>
              <p className="text-xs text-gray-400">PNG, JPG or WEBP (max. 2MB)</p>
            </div>
          </Card>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button onClick={handleSubmit} isLoading={submitting} disabled={!isValid}>Submit Story</Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <Card>
            <div className="text-center mb-6">
              <Badge className="mb-4">{formData.category || 'Category'}</Badge>
              <h1 className="text-3xl font-bold text-[#001145] mb-4">{formData.title || 'Your Story Title'}</h1>
              <div className="flex items-center justify-center gap-2 text-gray-500">
                <span>By You</span>
                <span>•</span>
                <span>{new Date().toLocaleDateString()}</span>
              </div>
            </div>
            <div className="prose prose-lg max-w-none text-gray-600">
              {formData.content ? (
                formData.content.split('\n').map((para, i) => (
                  para.trim() ? <p key={i}>{para}</p> : <br key={i} />
                ))
              ) : (
                <p className="text-gray-400 italic">Your story content will appear here...</p>
              )}
            </div>
          </Card>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setMode('edit')}>Back to Edit</Button>
            <Button onClick={handleSubmit} isLoading={submitting} disabled={!isValid}>Submit Story</Button>
          </div>
        </div>
      )}

      {/* Guidelines */}
      <Card className="bg-[#e4f0ff] border-[#d0e4ff]">
        <h3 className="font-bold text-[#001145] mb-3">Submission Guidelines</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li>• Be authentic and share your genuine experiences</li>
          <li>• Keep it professional and respectful</li>
          <li>• Stories will be reviewed before publishing</li>
          <li>• Include specific details that others can learn from</li>
          <li>• You can edit your story after submission if needed</li>
        </ul>
      </Card>
    </div>
  );
}
