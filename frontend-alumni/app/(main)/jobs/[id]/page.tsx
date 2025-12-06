"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Clock, Building2, DollarSign, ArrowLeft, Bookmark, Share2, ExternalLink, CheckCircle } from 'lucide-react';
import { Button, Card, Badge, Modal, Textarea, LoadingSpinner } from '@/components/ui';
import { getJob, applyToJob, bookmarkJob, Job } from '@/src/api/jobs';

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const data = await getJob(id);
        setJob(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  const handleApply = async () => {
    setApplying(true);
    try {
      await applyToJob(id, { resumeUrl: '/resume.pdf', coverLetter });
      setApplied(true);
      setShowApplyModal(false);
    } catch (error) {
      console.error(error);
    } finally {
      setApplying(false);
    }
  };

  const handleBookmark = async () => {
    try {
      await bookmarkJob(id);
      setJob(prev => prev ? { ...prev, isBookmarked: !prev.isBookmarked } : null);
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <LoadingSpinner fullScreen text="Loading job..." />;
  if (!job) return <div className="text-center py-12">Job not found</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-600 hover:text-[#001145] transition-colors">
        <ArrowLeft size={20} />
        <span>Back to Jobs</span>
      </button>

      {/* Job Header */}
      <Card>
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-[#001145]">{job.title}</h1>
              <Badge variant={job.status === 'active' ? 'success' : 'default'}>{job.status}</Badge>
            </div>
            <div className="flex items-center gap-2 text-gray-600 mb-4">
              <Building2 size={18} />
              <span className="font-medium">{job.company}</span>
              {job.postedBy.isAlumni && <Badge variant="info" size="sm">Posted by Alumni</Badge>}
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1"><MapPin size={14} />{job.location}</span>
              <span className="flex items-center gap-1"><Clock size={14} />{job.type}</span>
              {job.salary && <span className="flex items-center gap-1"><DollarSign size={14} />{job.salary}</span>}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleBookmark} leftIcon={<Bookmark size={16} className={job.isBookmarked ? 'fill-current' : ''} />}>
              {job.isBookmarked ? 'Saved' : 'Save'}
            </Button>
            <Button variant="outline" leftIcon={<Share2 size={16} />}>Share</Button>
          </div>
        </div>
      </Card>

      {/* Actions */}
      <Card>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="text-sm text-gray-500">
            <span>{job.applicantsCount} applicants</span>
            {job.deadline && <span> • Apply by {new Date(job.deadline).toLocaleDateString()}</span>}
          </div>
          {applied ? (
            <Button variant="secondary" leftIcon={<CheckCircle size={18} />} disabled>Applied</Button>
          ) : (
            <Button onClick={() => setShowApplyModal(true)} size="lg">Apply Now</Button>
          )}
        </div>
      </Card>

      {/* Job Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <h2 className="font-bold text-[#001145] mb-4">About the Role</h2>
            <p className="text-gray-600 whitespace-pre-line">{job.description}</p>
          </Card>

          <Card>
            <h2 className="font-bold text-[#001145] mb-4">Requirements</h2>
            <ul className="space-y-2">
              {job.requirements.map((req, i) => (
                <li key={i} className="flex items-start gap-2 text-gray-600">
                  <span className="w-1.5 h-1.5 bg-[#001145] rounded-full mt-2 flex-shrink-0" />
                  {req}
                </li>
              ))}
            </ul>
          </Card>

          {job.benefits && job.benefits.length > 0 && (
            <Card>
              <h2 className="font-bold text-[#001145] mb-4">Benefits</h2>
              <div className="flex flex-wrap gap-2">
                {job.benefits.map((benefit, i) => (
                  <Badge key={i} variant="success">{benefit}</Badge>
                ))}
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <h3 className="font-bold text-[#001145] mb-4">Required Skills</h3>
            <div className="flex flex-wrap gap-2">
              {job.skills.map((skill) => (
                <Badge key={skill}>{skill}</Badge>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="font-bold text-[#001145] mb-4">Experience</h3>
            <p className="text-gray-600">{job.experience}</p>
          </Card>

          <Card>
            <h3 className="font-bold text-[#001145] mb-4">Posted By</h3>
            <Link href={`/profile/${job.postedBy.id}`} className="flex items-center gap-3 hover:bg-gray-50 p-2 -m-2 rounded-lg transition-colors">
              <div className="w-10 h-10 bg-[#001145] rounded-full flex items-center justify-center text-white font-bold">
                {job.postedBy.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <p className="font-medium text-[#001145]">{job.postedBy.name}</p>
                {job.postedBy.isAlumni && <p className="text-sm text-gray-500">Alumni</p>}
              </div>
              <ExternalLink size={14} className="ml-auto text-gray-400" />
            </Link>
          </Card>
        </div>
      </div>

      {/* Apply Modal */}
      <Modal isOpen={showApplyModal} onClose={() => setShowApplyModal(false)} title="Apply for this position">
        <div className="space-y-4">
          <div>
            <p className="font-medium text-[#001145]">{job.title}</p>
            <p className="text-gray-500">{job.company}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-600">Your resume will be attached automatically from your profile.</p>
          </div>
          <Textarea label="Cover Letter (Optional)" rows={6} value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} placeholder="Tell the recruiter why you're a great fit..." />
          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={() => setShowApplyModal(false)}>Cancel</Button>
            <Button className="flex-1" onClick={handleApply} isLoading={applying}>Submit Application</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
