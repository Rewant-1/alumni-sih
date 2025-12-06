"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Briefcase, Clock, MapPin, Building2, ExternalLink, Check, X, Eye } from 'lucide-react';
import { Button, Card, Badge, EmptyState, PageHeader, LoadingSpinner } from '@/components/ui';
import { getMyApplications, getMyJobPostings, getJobApplications, updateApplicationStatus, JobApplication, Job } from '@/src/api/jobs';

export default function ApplicationsPage() {
  const [activeTab, setActiveTab] = useState<'my-applications' | 'received'>('my-applications');
  const [myApplications, setMyApplications] = useState<JobApplication[]>([]);
  const [myPostings, setMyPostings] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [jobApplications, setJobApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [apps, postings] = await Promise.all([getMyApplications(), getMyJobPostings()]);
        setMyApplications(apps);
        setMyPostings(postings);
        if (postings.length > 0) {
          setSelectedJob(postings[0]);
          const jobApps = await getJobApplications(postings[0].id);
          setJobApplications(jobApps);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSelectJob = async (job: Job) => {
    setSelectedJob(job);
    const apps = await getJobApplications(job.id);
    setJobApplications(apps);
  };

  const handleUpdateStatus = async (appId: string, status: JobApplication['status']) => {
    try {
      await updateApplicationStatus(appId, status);
      setJobApplications(prev => prev.map(a => a.id === appId ? { ...a, status } : a));
    } catch (error) {
      console.error(error);
    }
  };

  const getStatusColor = (status: JobApplication['status']) => {
    switch (status) {
      case 'pending': return 'default';
      case 'reviewed': return 'info';
      case 'shortlisted': return 'success';
      case 'rejected': return 'error';
      case 'hired': return 'success';
    }
  };

  if (loading) return <LoadingSpinner fullScreen text="Loading..." />;

  return (
    <div className="space-y-6">
      <PageHeader title="Applications" subtitle="Track your job applications and manage applicants" />

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('my-applications')}
          className={`px-5 py-2.5 rounded-full text-sm font-medium transition-colors ${
            activeTab === 'my-applications' ? 'bg-[#001145] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          My Applications ({myApplications.length})
        </button>
        <button
          onClick={() => setActiveTab('received')}
          className={`px-5 py-2.5 rounded-full text-sm font-medium transition-colors ${
            activeTab === 'received' ? 'bg-[#001145] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Applications Received ({myPostings.length} jobs)
        </button>
      </div>

      {/* My Applications */}
      {activeTab === 'my-applications' && (
        <div className="space-y-4">
          {myApplications.length === 0 ? (
            <EmptyState icon={Briefcase} title="No applications yet" description="Start applying to jobs to track them here" actionLabel="Browse Jobs" onAction={() => window.location.href = '/jobs'} />
          ) : (
            myApplications.map((app) => (
              <Card key={app.id}>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <Link href={`/jobs/${app.job.id}`} className="font-bold text-[#001145] hover:underline text-lg">
                      {app.job.title}
                    </Link>
                    <div className="flex items-center gap-2 text-gray-600 mt-1">
                      <Building2 size={16} />{app.job.company}
                      <span className="text-gray-300">•</span>
                      <MapPin size={16} />{app.job.location}
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                      <Clock size={14} />
                      Applied {new Date(app.appliedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={getStatusColor(app.status)}>{app.status}</Badge>
                    <Link href={`/jobs/${app.job.id}`}>
                      <Button variant="outline" size="sm" leftIcon={<ExternalLink size={14} />}>View Job</Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Received Applications */}
      {activeTab === 'received' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Job List */}
          <div className="space-y-3">
            <h3 className="font-bold text-[#001145]">Your Job Postings</h3>
            {myPostings.length === 0 ? (
              <Card><p className="text-gray-500 text-center py-4">No job postings yet</p></Card>
            ) : (
              myPostings.map((job) => (
                <Card
                  key={job.id}
                  className={`cursor-pointer transition-all ${selectedJob?.id === job.id ? 'border-[#001145] shadow-md' : 'hover:shadow-md'}`}
                  onClick={() => handleSelectJob(job)}
                >
                  <h4 className="font-bold text-[#001145]">{job.title}</h4>
                  <p className="text-gray-500 text-sm">{job.applicantsCount} applicants</p>
                </Card>
              ))
            )}
          </div>

          {/* Applicants */}
          <div className="lg:col-span-2 space-y-4">
            {selectedJob ? (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-[#001145]">Applicants for {selectedJob.title}</h3>
                  <Badge>{jobApplications.length} total</Badge>
                </div>
                {jobApplications.length === 0 ? (
                  <Card><EmptyState icon={Briefcase} title="No applicants yet" description="Share this job to get applicants" /></Card>
                ) : (
                  jobApplications.map((app) => (
                    <Card key={app.id}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-[#001145] rounded-full flex items-center justify-center text-white font-bold">
                            {app.applicant.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <Link href={`/profile/${app.applicant.id}`} className="font-bold text-[#001145] hover:underline">
                              {app.applicant.name}
                            </Link>
                            <p className="text-gray-500 text-sm">{app.applicant.email}</p>
                            <p className="text-gray-400 text-xs">Applied {new Date(app.appliedAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <Badge variant={getStatusColor(app.status)}>{app.status}</Badge>
                      </div>
                      {app.coverLetter && (
                        <p className="mt-3 text-gray-600 text-sm bg-gray-50 p-3 rounded-lg">{app.coverLetter}</p>
                      )}
                      <div className="flex gap-2 mt-4">
                        <Button variant="outline" size="sm" leftIcon={<Eye size={14} />}>View Resume</Button>
                        {app.status === 'pending' && (
                          <>
                            <Button size="sm" leftIcon={<Check size={14} />} onClick={() => handleUpdateStatus(app.id, 'shortlisted')}>Shortlist</Button>
                            <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleUpdateStatus(app.id, 'rejected')}><X size={14} /></Button>
                          </>
                        )}
                      </div>
                    </Card>
                  ))
                )}
              </>
            ) : (
              <Card><p className="text-gray-500 text-center py-8">Select a job posting to view applicants</p></Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
