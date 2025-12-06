"use client";

import React, { useState, useEffect } from 'react';
import { Briefcase, MapPin, Clock, Building2, Search, Filter, Plus, DollarSign } from 'lucide-react';
// import { getAllJobs, applyToJob } from '@/src/api/jobs';

// Mock data for now
const MOCK_JOBS = [
  {
    _id: '1',
    title: 'Senior Software Engineer',
    company: 'Google',
    location: 'Bangalore, India',
    type: 'Full-time',
    salary: '₹25-35 LPA',
    description: 'We are looking for a senior software engineer to join our team...',
    postedAt: '2 days ago',
    skills: ['React', 'Node.js', 'TypeScript'],
  },
  {
    _id: '2',
    title: 'Product Manager',
    company: 'Microsoft',
    location: 'Hyderabad, India',
    type: 'Full-time',
    salary: '₹30-40 LPA',
    description: 'Lead product development for our cloud services team...',
    postedAt: '1 week ago',
    skills: ['Product Strategy', 'Agile', 'Analytics'],
  },
  {
    _id: '3',
    title: 'Data Scientist',
    company: 'Amazon',
    location: 'Remote',
    type: 'Full-time',
    salary: '₹20-30 LPA',
    description: 'Work on ML models for recommendation systems...',
    postedAt: '3 days ago',
    skills: ['Python', 'TensorFlow', 'SQL'],
  },
];

export default function JobsPage() {
  const [jobs, setJobs] = useState(MOCK_JOBS);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJob, setSelectedJob] = useState<typeof MOCK_JOBS[0] | null>(null);

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#001145]">Job Board</h1>
          <p className="text-gray-500">Find your next career opportunity</p>
        </div>
        <button className="flex items-center gap-2 bg-[#001145] text-white px-6 py-3 rounded-full font-medium hover:bg-[#001339] transition-colors">
          <Plus size={20} />
          Post a Job
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search jobs by title or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#001145]/20 focus:border-[#001145]"
          />
        </div>
        <button className="flex items-center gap-2 px-6 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
          <Filter size={20} />
          Filters
        </button>
      </div>

      {/* Job Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Job List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">Loading...</div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No jobs found</div>
          ) : (
            filteredJobs.map((job) => (
              <div
                key={job._id}
                onClick={() => setSelectedJob(job)}
                className={`bg-white p-6 rounded-2xl border cursor-pointer transition-all ${
                  selectedJob?._id === job._id 
                    ? 'border-[#001145] shadow-lg' 
                    : 'border-gray-100 hover:border-gray-200 hover:shadow-md'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-[#001145]">{job.title}</h3>
                    <div className="flex items-center gap-2 text-gray-600 mt-1">
                      <Building2 size={16} />
                      <span>{job.company}</span>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full font-medium">
                    {job.type}
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <MapPin size={14} />
                    {job.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign size={14} />
                    {job.salary}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    {job.postedAt}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill) => (
                    <span key={skill} className="px-3 py-1 bg-[#e4f0ff] text-[#001145] text-xs rounded-full font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Job Details */}
        <div className="hidden lg:block">
          {selectedJob ? (
            <div className="bg-white p-8 rounded-2xl border border-gray-100 sticky top-8">
              <h2 className="text-2xl font-bold text-[#001145] mb-2">{selectedJob.title}</h2>
              <p className="text-lg text-gray-600 mb-6">{selectedJob.company}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium text-[#001145]">{selectedJob.location}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-500">Salary</p>
                  <p className="font-medium text-[#001145]">{selectedJob.salary}</p>
                </div>
              </div>

              <h3 className="font-bold text-[#001145] mb-3">Description</h3>
              <p className="text-gray-600 mb-6">{selectedJob.description}</p>

              <h3 className="font-bold text-[#001145] mb-3">Required Skills</h3>
              <div className="flex flex-wrap gap-2 mb-8">
                {selectedJob.skills.map((skill) => (
                  <span key={skill} className="px-4 py-2 bg-[#e4f0ff] text-[#001145] rounded-full font-medium">
                    {skill}
                  </span>
                ))}
              </div>

              <button className="w-full bg-[#001145] text-white py-4 rounded-xl font-bold hover:bg-[#001339] transition-colors">
                Apply Now
              </button>
            </div>
          ) : (
            <div className="bg-gray-50 p-12 rounded-2xl border border-dashed border-gray-300 flex items-center justify-center">
              <p className="text-gray-500">Select a job to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
