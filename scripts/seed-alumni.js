/*
  Complete Database Seeding Script for Alumni Management System
  
  College: Faculty of Technology
  University: Delhi University
  
  This script seeds all collections with realistic Indian context data to test the alumni portal.
  
  Usage:
    1. Make sure backend is running (npm start)
    2. Run: node scripts/seed-alumni.js
    
  Features Seeded:
    - Users (Alumni with detailed profiles)
    - Alumni Profiles (with experience, education, timeline, location)
    - Campaigns (with donations and milestones)
    - Success Stories (with likes and comments)
    - Alumni Cards (with QR codes)
    - Events (with registrations and tickets)
    - Jobs (with applications)
    - Connections
    - Activities (karma points)
    - Notifications
*/

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Import all models
const UserModel = require('../src/model/model.user');
const AlumniModel = require('../src/model/model.alumni');
const CampaignModel = require('../src/model/model.campaign');
const DonationModel = require('../src/model/model.donation');
const SuccessStoryModel = require('../src/model/model.successStory');
const AlumniCardModel = require('../src/model/model.alumniCard');
const EventModel = require('../src/model/model.event');
const JobModel = require('../src/model/model.job');
const ConnectionModel = require('../src/model/model.connections');
const ActivityModel = require('../src/model/model.activity');
const NotificationModel = require('../src/model/model.notification');

const { MONGO_URI } = require('../config');

// CLI args
const args = {
    clear: process.argv.includes('--clear'),
    force: process.argv.includes('--force')
};

// Default password
const DEFAULT_PASSWORD = 'Password123!';

// ============================================================================
// ALUMNI DATA - Indian Context
// ============================================================================

const alumniData = [
    {
        name: 'Satyam Singh',
        email: 'satyam.singh@alumni.fot.du.ac.in',
        graduationYear: 2024,
        department: 'Computer Science & Engineering',
        degree: 'B.Tech',
        skills: ['Deep Learning', 'Python', 'TensorFlow', 'PyTorch', 'Computer Vision'],
        verified: true,
        bio: 'AI/ML Engineer passionate about building intelligent systems. Currently working on cutting-edge GPU-accelerated computing platforms.',
        headline: 'AI/ML Engineer at NVIDIA | FoT CSE 2024',
        experience: [
            {
                title: 'AI/ML Engineer',
                company: 'NVIDIA',
                location: 'Bengaluru, Karnataka',
                startDate: new Date('2024-07-01'),
                current: true,
                description: 'Working on deep learning frameworks and GPU optimization for AI workloads.'
            }
        ],
        education: [
            {
                institution: 'Faculty of Technology, Delhi University',
                degree: 'B.Tech',
                field: 'Computer Science & Engineering',
                startYear: 2020,
                endYear: 2024,
                grade: '9.2 CGPA'
            }
        ],
        location: { city: 'Bengaluru', state: 'Karnataka', country: 'India', coordinates: { lat: 12.9716, lng: 77.5946 } },
        socialLinks: { linkedin: 'https://linkedin.com/in/satyam-singh', github: 'https://github.com/satyamsingh' }
    },
    {
        name: 'Rewant Bhriguvanshi',
        email: 'rewant.b@alumni.fot.du.ac.in',
        graduationYear: 2023,
        department: 'Computer Science & Engineering',
        degree: 'B.Tech',
        skills: ['C++', 'Cloud Computing', 'System Design', 'Distributed Systems', 'Go'],
        verified: true,
        bio: 'Software Engineer at Google working on cloud infrastructure. Love solving complex distributed systems problems.',
        headline: 'Software Engineer at Google | FoT CSE 2023',
        experience: [
            {
                title: 'Software Engineer',
                company: 'Google',
                location: 'Hyderabad, Telangana',
                startDate: new Date('2023-08-01'),
                current: true,
                description: 'Building scalable cloud services for Google Cloud Platform.'
            }
        ],
        education: [
            {
                institution: 'Faculty of Technology, Delhi University',
                degree: 'B.Tech',
                field: 'Computer Science & Engineering',
                startYear: 2019,
                endYear: 2023,
                grade: '9.5 CGPA'
            }
        ],
        location: { city: 'Hyderabad', state: 'Telangana', country: 'India', coordinates: { lat: 17.3850, lng: 78.4867 } },
        socialLinks: { linkedin: 'https://linkedin.com/in/rewant-bhriguvanshi', github: 'https://github.com/rewantb' }
    },
    {
        name: 'Krishna Yadav',
        email: 'krishna.yadav@alumni.fot.du.ac.in',
        graduationYear: 2025,
        department: 'Computer Science & Engineering',
        degree: 'B.Tech',
        skills: ['Product Development', 'AI Integration', 'Startup Management', 'React', 'Node.js'],
        verified: true,
        bio: 'Startup founder building AI-powered enterprise solutions. Believe in creating impact through technology.',
        headline: 'Founder & CEO at NeuraCore Tech | FoT CSE 2025',
        experience: [
            {
                title: 'Founder & CEO',
                company: 'NeuraCore Tech',
                location: 'Noida, Uttar Pradesh',
                startDate: new Date('2024-01-01'),
                current: true,
                description: 'Building AI-powered automation solutions for enterprises.'
            }
        ],
        education: [
            {
                institution: 'Faculty of Technology, Delhi University',
                degree: 'B.Tech',
                field: 'Computer Science & Engineering',
                startYear: 2021,
                endYear: 2025,
                grade: '8.8 CGPA'
            }
        ],
        location: { city: 'Noida', state: 'Uttar Pradesh', country: 'India', coordinates: { lat: 28.5355, lng: 77.3910 } },
        socialLinks: { linkedin: 'https://linkedin.com/in/krishna-yadav', twitter: 'https://twitter.com/krishnayadav' }
    },
    {
        name: 'Garvit Gupta',
        email: 'garvit.gupta@alumni.fot.du.ac.in',
        graduationYear: 2025,
        department: 'Computer Science & Engineering',
        degree: 'B.Tech',
        skills: ['Backend Development', 'Python', 'Django', 'PostgreSQL', 'Redis'],
        verified: true,
        bio: 'Backend developer at Flipkart. Passionate about building high-performance systems.',
        headline: 'Software Engineer at Flipkart | FoT CSE 2025',
        experience: [
            {
                title: 'Software Engineer',
                company: 'Flipkart',
                location: 'Bengaluru, Karnataka',
                startDate: new Date('2024-06-01'),
                current: true,
                description: 'Working on order management and payment systems.'
            }
        ],
        education: [
            {
                institution: 'Faculty of Technology, Delhi University',
                degree: 'B.Tech',
                field: 'Computer Science & Engineering',
                startYear: 2021,
                endYear: 2025,
                grade: '8.5 CGPA'
            }
        ],
        location: { city: 'Bengaluru', state: 'Karnataka', country: 'India', coordinates: { lat: 12.9716, lng: 77.5946 } },
        socialLinks: { linkedin: 'https://linkedin.com/in/garvit-gupta', github: 'https://github.com/garvitgupta' }
    },
    {
        name: 'Shubhika Sinha',
        email: 'shubhika.sinha@alumni.fot.du.ac.in',
        graduationYear: 2023,
        department: 'Computer Science & Engineering',
        degree: 'B.Tech',
        skills: ['Machine Learning', 'NLP', 'Model Deployment', 'Python', 'AWS'],
        verified: true,
        bio: 'ML Engineer at TCS Research. Published researcher in NLP domain.',
        headline: 'Machine Learning Engineer at TCS Research | FoT CSE 2023',
        experience: [
            {
                title: 'Machine Learning Engineer',
                company: 'TCS Research',
                location: 'Pune, Maharashtra',
                startDate: new Date('2023-07-01'),
                current: true,
                description: 'Research and development of NLP models for enterprise applications.'
            }
        ],
        education: [
            {
                institution: 'Faculty of Technology, Delhi University',
                degree: 'B.Tech',
                field: 'Computer Science & Engineering',
                startYear: 2019,
                endYear: 2023,
                grade: '9.1 CGPA'
            }
        ],
        location: { city: 'Pune', state: 'Maharashtra', country: 'India', coordinates: { lat: 18.5204, lng: 73.8567 } },
        socialLinks: { linkedin: 'https://linkedin.com/in/shubhika-sinha' }
    },
    {
        name: 'Prayas Yadav',
        email: 'prayas.yadav@alumni.fot.du.ac.in',
        graduationYear: 2024,
        department: 'Computer Science & Engineering',
        degree: 'B.Tech',
        skills: ['Go', 'Microservices', 'API Development', 'Kubernetes', 'Docker'],
        verified: true,
        bio: 'Software Engineer at Uber working on ride-sharing platform. Love building scalable microservices.',
        headline: 'Software Engineer at Uber | FoT CSE 2024',
        experience: [
            {
                title: 'Software Engineer',
                company: 'Uber',
                location: 'Gurgaon, Haryana',
                startDate: new Date('2024-07-01'),
                current: true,
                description: 'Building microservices for ride-matching and pricing systems.'
            }
        ],
        education: [
            {
                institution: 'Faculty of Technology, Delhi University',
                degree: 'B.Tech',
                field: 'Computer Science & Engineering',
                startYear: 2020,
                endYear: 2024,
                grade: '8.9 CGPA'
            }
        ],
        location: { city: 'Gurgaon', state: 'Haryana', country: 'India', coordinates: { lat: 28.4595, lng: 77.0266 } },
        socialLinks: { linkedin: 'https://linkedin.com/in/prayas-yadav', github: 'https://github.com/prayasyadav' }
    },
    {
        name: 'Shreyas Singh',
        email: 'shreyas.singh@alumni.fot.du.ac.in',
        graduationYear: 2022,
        department: 'Electronics & Communication',
        degree: 'B.Tech',
        skills: ['Verilog', 'Physical Design', 'RTL', 'ASIC Design', 'Cadence'],
        verified: true,
        bio: 'VLSI Engineer at Qualcomm. Working on 5G chipset design.',
        headline: 'VLSI Engineer at Qualcomm | FoT ECE 2022',
        experience: [
            {
                title: 'VLSI Engineer',
                company: 'Qualcomm',
                location: 'Hyderabad, Telangana',
                startDate: new Date('2022-07-01'),
                current: true,
                description: 'Physical design and timing analysis for 5G modem chips.'
            }
        ],
        education: [
            {
                institution: 'Faculty of Technology, Delhi University',
                degree: 'B.Tech',
                field: 'Electronics & Communication',
                startYear: 2018,
                endYear: 2022,
                grade: '8.7 CGPA'
            }
        ],
        location: { city: 'Hyderabad', state: 'Telangana', country: 'India', coordinates: { lat: 17.3850, lng: 78.4867 } },
        socialLinks: { linkedin: 'https://linkedin.com/in/shreyas-singh' }
    },
    {
        name: 'Kirti Yadav',
        email: 'kirti.yadav@alumni.fot.du.ac.in',
        graduationYear: 2021,
        department: 'Electronics & Communication',
        degree: 'B.Tech',
        skills: ['FPGA', 'ASIC', 'Static Timing Analysis', 'Synopsys', 'Verilog'],
        verified: true,
        bio: 'Senior VLSI Engineer at AMD. Three years of experience in chip design.',
        headline: 'Senior VLSI Engineer at AMD | FoT ECE 2021',
        experience: [
            {
                title: 'Senior VLSI Engineer',
                company: 'AMD',
                location: 'Bengaluru, Karnataka',
                startDate: new Date('2021-07-01'),
                current: true,
                description: 'Lead engineer for GPU physical design team.'
            }
        ],
        education: [
            {
                institution: 'Faculty of Technology, Delhi University',
                degree: 'B.Tech',
                field: 'Electronics & Communication',
                startYear: 2017,
                endYear: 2021,
                grade: '9.0 CGPA'
            }
        ],
        location: { city: 'Bengaluru', state: 'Karnataka', country: 'India', coordinates: { lat: 12.9716, lng: 77.5946 } },
        socialLinks: { linkedin: 'https://linkedin.com/in/kirti-yadav' }
    },
    {
        name: 'Raghav Agrawal',
        email: 'raghav.agrawal@alumni.fot.du.ac.in',
        graduationYear: 2025,
        department: 'Computer Science & Engineering',
        degree: 'B.Tech',
        skills: ['LLM Embeddings', 'Vector Databases', 'Semantic Search', 'Python', 'FastAPI'],
        verified: true,
        bio: 'Research Intern at IIT Delhi working on LLM embeddings and semantic search.',
        headline: 'Research Intern at IIT Delhi | FoT CSE 2025',
        experience: [
            {
                title: 'Research Intern',
                company: 'IIT Delhi AI Lab',
                location: 'Delhi',
                startDate: new Date('2024-06-01'),
                current: true,
                description: 'Research on efficient embeddings for domain-specific LLMs.'
            }
        ],
        education: [
            {
                institution: 'Faculty of Technology, Delhi University',
                degree: 'B.Tech',
                field: 'Computer Science & Engineering',
                startYear: 2021,
                endYear: 2025,
                grade: '9.3 CGPA'
            }
        ],
        location: { city: 'Delhi', state: 'Delhi', country: 'India', coordinates: { lat: 28.6139, lng: 77.2090 } },
        socialLinks: { linkedin: 'https://linkedin.com/in/raghav-agrawal', github: 'https://github.com/raghavagrawal' }
    },
    {
        name: 'Simran Kaur',
        email: 'simran.kaur@alumni.fot.du.ac.in',
        graduationYear: 2021,
        department: 'Computer Science & Engineering',
        degree: 'B.Tech',
        skills: ['Product Strategy', 'AI UX', 'Analytics', 'Figma', 'User Research'],
        verified: true,
        bio: 'AI Product Manager at Adobe. Building the future of creative tools.',
        headline: 'AI Product Manager at Adobe | FoT CSE 2021',
        experience: [
            {
                title: 'AI Product Manager',
                company: 'Adobe',
                location: 'Noida, Uttar Pradesh',
                startDate: new Date('2023-01-01'),
                current: true,
                description: 'Leading product strategy for AI-powered creative features.'
            },
            {
                title: 'Product Analyst',
                company: 'Adobe',
                location: 'Noida, Uttar Pradesh',
                startDate: new Date('2021-07-01'),
                endDate: new Date('2022-12-31'),
                current: false,
                description: 'Data analysis and feature optimization for Creative Cloud.'
            }
        ],
        education: [
            {
                institution: 'Faculty of Technology, Delhi University',
                degree: 'B.Tech',
                field: 'Computer Science & Engineering',
                startYear: 2017,
                endYear: 2021,
                grade: '8.6 CGPA'
            }
        ],
        location: { city: 'Noida', state: 'Uttar Pradesh', country: 'India', coordinates: { lat: 28.5355, lng: 77.3910 } },
        socialLinks: { linkedin: 'https://linkedin.com/in/simran-kaur', twitter: 'https://twitter.com/simrankaur' }
    },
    {
        name: 'Ishita Sharma',
        email: 'ishita.sharma@alumni.fot.du.ac.in',
        graduationYear: 2022,
        department: 'Information Technology',
        degree: 'B.Tech',
        skills: ['React', 'Next.js', 'UI/UX', 'TypeScript', 'Tailwind CSS'],
        verified: true,
        bio: 'Frontend Engineer at Swiggy. Building delightful user experiences.',
        headline: 'Frontend Engineer at Swiggy | FoT IT 2022',
        experience: [
            {
                title: 'Frontend Engineer',
                company: 'Swiggy',
                location: 'Bengaluru, Karnataka',
                startDate: new Date('2022-08-01'),
                current: true,
                description: 'Building responsive web interfaces for food delivery platform.'
            }
        ],
        education: [
            {
                institution: 'Faculty of Technology, Delhi University',
                degree: 'B.Tech',
                field: 'Information Technology',
                startYear: 2018,
                endYear: 2022,
                grade: '8.8 CGPA'
            }
        ],
        location: { city: 'Bengaluru', state: 'Karnataka', country: 'India', coordinates: { lat: 12.9716, lng: 77.5946 } },
        socialLinks: { linkedin: 'https://linkedin.com/in/ishita-sharma', github: 'https://github.com/ishitasharma' }
    },
    {
        name: 'Mehul Jain',
        email: 'mehul.jain@alumni.fot.du.ac.in',
        graduationYear: 2025,
        department: 'Computer Science & Engineering',
        degree: 'B.Tech',
        skills: ['Solidity', 'Smart Contracts', 'DeFi', 'Web3', 'Ethereum'],
        verified: true,
        bio: 'Blockchain Developer at Polygon Labs. Building Web3 infrastructure.',
        headline: 'Blockchain Developer at Polygon Labs | FoT CSE 2025',
        experience: [
            {
                title: 'Blockchain Developer',
                company: 'Polygon Labs',
                location: 'Remote',
                startDate: new Date('2024-03-01'),
                current: true,
                description: 'Smart contract development and DeFi protocol integration.'
            }
        ],
        education: [
            {
                institution: 'Faculty of Technology, Delhi University',
                degree: 'B.Tech',
                field: 'Computer Science & Engineering',
                startYear: 2021,
                endYear: 2025,
                grade: '8.4 CGPA'
            }
        ],
        location: { city: 'Mumbai', state: 'Maharashtra', country: 'India', coordinates: { lat: 19.0760, lng: 72.8777 } },
        socialLinks: { linkedin: 'https://linkedin.com/in/mehul-jain', github: 'https://github.com/mehuljain' }
    }
];

// ============================================================================
// CAMPAIGNS DATA
// ============================================================================

const campaignsData = [
    {
        title: 'AI Research Lab Setup Fund',
        description: 'Help us establish a state-of-the-art AI/ML research lab with high-performance GPU clusters, workstations, and specialized software. This lab will enable students to work on cutting-edge research in deep learning, NLP, and computer vision.',
        shortDescription: 'Building a world-class AI research facility for FoT students',
        category: 'research',
        goalAmount: 5000000,
        startDate: new Date('2024-12-01'),
        endDate: new Date('2025-06-30'),
        milestones: [
            { title: 'Purchase GPU Server Cluster (8x A100)', targetAmount: 2000000 },
            { title: 'Workstations and Development Machines', targetAmount: 1500000 },
            { title: 'Software Licenses (CUDA, TensorRT, etc.)', targetAmount: 1000000 },
            { title: 'Lab Infrastructure and Setup', targetAmount: 500000 }
        ],
        skillsNeeded: [
            { skill: 'NVIDIA GPU Setup', description: 'Help configure CUDA and deep learning frameworks', hoursNeeded: 40 },
            { skill: 'Network Infrastructure', description: 'High-speed network setup for distributed training', hoursNeeded: 20 }
        ],
        tags: ['AI', 'Research', 'GPU', 'Deep Learning']
    },
    {
        title: 'Merit Scholarship Fund 2025',
        description: 'Create a sustainable scholarship fund to support meritorious students from economically weaker sections. Each scholarship covers full tuition fees for one academic year. Help us ensure that financial constraints never stop a bright mind.',
        shortDescription: 'Supporting talented students who need financial assistance',
        category: 'scholarship',
        goalAmount: 2000000,
        startDate: new Date('2024-11-15'),
        endDate: new Date('2025-04-30'),
        milestones: [
            { title: 'Fund 10 Full Scholarships', targetAmount: 1000000 },
            { title: 'Fund 20 Half Scholarships', targetAmount: 700000 },
            { title: 'Emergency Fund Reserve', targetAmount: 300000 }
        ],
        skillsNeeded: [
            { skill: 'Mentorship', description: 'Mentor scholarship recipients throughout the year', hoursNeeded: 50 },
            { skill: 'Career Guidance', description: 'Help students with placement preparation', hoursNeeded: 30 }
        ],
        tags: ['Scholarship', 'Education', 'Social Impact']
    },
    {
        title: 'Smart Classroom Initiative',
        description: 'Transform traditional classrooms into smart learning spaces with interactive boards, high-speed WiFi, and modern AV equipment. This will enhance the learning experience for over 500 students.',
        shortDescription: 'Modernizing classrooms with technology for better learning',
        category: 'infrastructure',
        goalAmount: 2500000,
        startDate: new Date('2024-12-01'),
        endDate: new Date('2025-05-31'),
        milestones: [
            { title: 'Smart Boards for 10 Classrooms', targetAmount: 1000000 },
            { title: 'Campus-wide High-Speed WiFi', targetAmount: 800000 },
            { title: 'AV Equipment and Projectors', targetAmount: 500000 },
            { title: 'Installation and Setup', targetAmount: 200000 }
        ],
        skillsNeeded: [],
        tags: ['Infrastructure', 'Education', 'Technology']
    }
];

// ============================================================================
// SUCCESS STORIES DATA
// ============================================================================

const successStoriesData = [
    {
        title: 'From Delhi University to NVIDIA: My AI Journey',
        content: `When I joined Faculty of Technology in 2020, I had no idea that four years later, I would be working at NVIDIA on cutting-edge AI technologies. My journey has been filled with learning, failures, and eventual success.

The foundation at FoT was incredible. Our professors encouraged us to think beyond textbooks. I still remember Professor Kumar's advice: "Build projects, break things, learn constantly." This became my mantra.

During my second year, I started exploring deep learning. I built small projects, failed many times, but kept going. The coding competitions and hackathons at FoT gave me the confidence to compete at national level.

My internship at a Bengaluru startup taught me practical skills that no classroom could. By the time placements came, I was ready. NVIDIA's interview was tough, but my project experience helped me stand out.

To current students: Don't just study for exams. Build things. Fail. Learn. The journey is what matters. FoT gave me the platform to dream big - make the most of it!`,
        category: 'career_growth',
        authorIndex: 0,
        tags: ['AI', 'NVIDIA', 'Deep Learning', 'Career']
    },
    {
        title: 'Building NeuraCore Tech: From Student to Startup Founder',
        content: `Three years ago, I was just another student at Faculty of Technology. Today, I'm the founder of NeuraCore Tech, a startup valued at ₹10 crores. Here's my unconventional journey from college to entrepreneurship.

The entrepreneurship bug bit me during my second year. I was always more interested in building products than attending lectures. FoT's innovation cell became my second home - that's where I pitched my first idea and faced my first rejection.

What made the difference? Our seniors and alumni. They didn't just offer advice - they invested in our ideas, became our first customers, and opened doors we didn't know existed.

After failing twice with different startup ideas, NeuraCore came from a real problem. Enterprises were struggling to integrate AI into their workflows. We built a solution, and this time, it clicked.

My message to aspiring founders: Start while you're still in college. The risk is lower, the learning is faster, and the FoT network is an incredible safety net. Also, embrace failure - it's just feedback in disguise.`,
        category: 'entrepreneurship',
        authorIndex: 2,
        tags: ['Startup', 'Entrepreneurship', 'AI', 'Founder Story']
    },
    {
        title: 'Cracking Google: A Comprehensive Placement Guide',
        content: `Getting into Google felt like a distant dream during my first year. But with the right preparation strategy and support from the FoT community, I made it happen. Here's my detailed roadmap for aspiring Googlers.

The preparation started 18 months before placements. I created a structured plan:
- Months 1-6: Master data structures and algorithms
- Months 7-12: Build real-world projects and contribute to open source  
- Months 13-18: System design and mock interviews

I solved over 600 DSA problems on LeetCode and Codeforces. But what truly differentiated me was my open-source contributions. I contributed to Kubernetes and a few Google projects - this showed I could work with production-grade code.

The alumni network was crucial. Senior FoT alumni at Google conducted mock interviews, reviewed my resume, and gave insider tips about the interview process. Without their guidance, cracking 5 rounds would have been impossible.

Key advice: Start early, build real projects, and leverage the FoT alumni community. Everyone here wants to see you succeed.`,
        category: 'career_growth',
        authorIndex: 1,
        tags: ['Google', 'Placements', 'DSA', 'Interview Preparation']
    }
];

// ============================================================================
// EVENTS DATA
// ============================================================================

const eventsData = [
    {
        title: 'Annual Alumni Meet 2025',
        description: 'Join us for the grand annual alumni gathering! Network with fellow alumni from across batches, meet current students, and celebrate our shared legacy. Featuring keynote speakers, panel discussions, and a cultural evening.',
        shortDescription: 'The biggest alumni networking event of the year',
        date: new Date('2025-02-15T10:00:00'),
        endDate: new Date('2025-02-15T20:00:00'),
        venue: 'Faculty of Technology Main Auditorium, Delhi University',
        address: 'North Campus, University Enclave, Delhi - 110007',
        type: 'offline',
        category: 'networking',
        maxCapacity: 500,
        isPaid: false,
        tags: ['Alumni Meet', 'Networking', 'Annual Event']
    },
    {
        title: 'Tech Talk: AI in 2025 and Beyond',
        description: 'An exclusive tech talk by Satyam Singh (NVIDIA) on the future of AI/ML. Learn about the latest advancements in deep learning, LLMs, and how to build a career in AI. Q&A session with audience.',
        shortDescription: 'Learn about the future of AI from an NVIDIA engineer',
        date: new Date('2025-01-20T15:00:00'),
        endDate: new Date('2025-01-20T17:00:00'),
        venue: 'Online',
        type: 'online',
        meetingLink: 'https://meet.google.com/fot-ai-talk',
        platform: 'Google Meet',
        category: 'workshop',
        maxCapacity: 200,
        isPaid: false,
        speakers: [
            { name: 'Satyam Singh', designation: 'AI/ML Engineer, NVIDIA', bio: 'FoT 2024 alumnus, expert in deep learning' }
        ],
        tags: ['AI', 'Tech Talk', 'Career']
    },
    {
        title: 'Startup Showcase & Pitch Night',
        description: 'Alumni founders showcase their startups and share their entrepreneurship journey. Great opportunity for students looking to start their own ventures or join early-stage startups. Investors in attendance!',
        shortDescription: 'Meet successful alumni founders and their startups',
        date: new Date('2025-01-25T18:00:00'),
        endDate: new Date('2025-01-25T21:00:00'),
        venue: 'Innovation Hub, Faculty of Technology',
        address: 'Block A, Faculty of Technology, Delhi University',
        type: 'hybrid',
        meetingLink: 'https://meet.google.com/fot-startup-showcase',
        category: 'networking',
        maxCapacity: 100,
        isPaid: true,
        ticketPrice: 199,
        tags: ['Startup', 'Entrepreneurship', 'Networking']
    },
    {
        title: 'Hackathon: Code for Change 2025',
        description: '24-hour hackathon focused on building solutions for social impact. Prizes worth ₹2 lakhs! Mentorship from alumni throughout the event. Themes: Healthcare, Education, and Sustainability.',
        shortDescription: 'Build solutions for social good in 24 hours',
        date: new Date('2025-02-08T09:00:00'),
        endDate: new Date('2025-02-09T09:00:00'),
        venue: 'Innovation Hub, Faculty of Technology',
        address: 'Block A, Faculty of Technology, Delhi University',
        type: 'offline',
        category: 'hackathon',
        maxCapacity: 150,
        isPaid: true,
        ticketPrice: 299,
        tags: ['Hackathon', 'Coding', 'Social Impact']
    },
    {
        title: 'VLSI Career Guidance Session',
        description: 'Senior alumni from Qualcomm, AMD, and Intel share insights about careers in semiconductor industry. Learn about the booming chip design sector in India and how to prepare for VLSI roles.',
        shortDescription: 'Explore career opportunities in semiconductor industry',
        date: new Date('2025-01-30T11:00:00'),
        endDate: new Date('2025-01-30T13:00:00'),
        venue: 'Electronics Lab, Faculty of Technology',
        address: 'Block B, Faculty of Technology, Delhi University',
        type: 'offline',
        category: 'workshop',
        maxCapacity: 80,
        isPaid: false,
        speakers: [
            { name: 'Shreyas Singh', designation: 'VLSI Engineer, Qualcomm', bio: 'FoT ECE 2022' },
            { name: 'Kirti Yadav', designation: 'Senior VLSI Engineer, AMD', bio: 'FoT ECE 2021' }
        ],
        tags: ['VLSI', 'Career', 'ECE']
    }
];

// ============================================================================
// JOBS DATA
// ============================================================================

const jobsData = [
    {
        title: 'Software Engineer - Full Stack',
        company: 'Google',
        companyLogo: 'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_160x56dp.png',
        location: 'Hyderabad, India',
        locationType: 'hybrid',
        type: 'full-time',
        description: 'Join our Cloud Platform team to build next-generation services. You will work on scalable distributed systems serving billions of users worldwide.',
        responsibilities: [
            'Design and implement scalable microservices',
            'Write clean, maintainable code with comprehensive tests',
            'Participate in code reviews and architecture discussions',
            'Mentor junior engineers'
        ],
        requirements: [
            '3+ years of software development experience',
            'Strong knowledge of data structures and algorithms',
            'Experience with cloud platforms (GCP/AWS/Azure)',
            'Proficiency in Python, Java, or Go'
        ],
        skillsRequired: ['Python', 'Java', 'Cloud', 'System Design', 'Distributed Systems'],
        experienceLevel: 'mid',
        minExperience: 3,
        maxExperience: 6,
        salaryRange: { min: 2500000, max: 4500000, currency: 'INR' },
        applicationDeadline: new Date('2025-02-28'),
        status: 'approved',
        department: 'Engineering',
        tags: ['Backend', 'Cloud', 'Full Stack']
    },
    {
        title: 'AI/ML Engineer - Computer Vision',
        company: 'NVIDIA',
        companyLogo: 'https://www.nvidia.com/content/dam/en-zz/Solutions/about-nvidia/logo-and-brand/01-nvidia-logo-vert-500x200-2c50-d.png',
        location: 'Bengaluru, India',
        locationType: 'onsite',
        type: 'full-time',
        description: 'Work on cutting-edge computer vision technologies for autonomous systems. You will develop and optimize deep learning models for real-time inference on NVIDIA GPUs.',
        responsibilities: [
            'Design and train deep learning models for object detection and segmentation',
            'Optimize models for deployment on edge devices',
            'Collaborate with hardware teams for GPU acceleration',
            'Publish research papers at top AI conferences'
        ],
        requirements: [
            'MS/PhD in CS, EE, or related field',
            'Experience with PyTorch/TensorFlow',
            'Strong understanding of CNN architectures',
            'Publications in top AI venues preferred'
        ],
        skillsRequired: ['Deep Learning', 'PyTorch', 'Computer Vision', 'CUDA', 'Python'],
        experienceLevel: 'senior',
        minExperience: 2,
        maxExperience: 5,
        salaryRange: { min: 3000000, max: 5500000, currency: 'INR' },
        applicationDeadline: new Date('2025-03-15'),
        status: 'approved',
        department: 'AI Research',
        tags: ['AI', 'Deep Learning', 'Computer Vision']
    },
    {
        title: 'Backend Developer Intern',
        company: 'Flipkart',
        companyLogo: 'https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/fk-log0_623f8f.png',
        location: 'Bengaluru, India',
        locationType: 'onsite',
        type: 'internship',
        description: 'Join our backend team for a 6-month internship. Work on high-scale systems handling millions of transactions daily. Great opportunity for pre-final and final year students.',
        responsibilities: [
            'Develop REST APIs for e-commerce platform',
            'Write unit and integration tests',
            'Participate in agile sprints',
            'Document code and APIs'
        ],
        requirements: [
            'Currently pursuing B.Tech/M.Tech in CS/IT',
            'Strong DSA skills',
            'Knowledge of any backend framework',
            'Basic understanding of databases'
        ],
        skillsRequired: ['Python', 'Django', 'REST APIs', 'SQL', 'Git'],
        experienceLevel: 'entry',
        minExperience: 0,
        maxExperience: 0,
        salaryRange: { min: 50000, max: 80000, currency: 'INR' },
        applicationDeadline: new Date('2025-01-31'),
        status: 'approved',
        department: 'Engineering',
        tags: ['Internship', 'Backend', 'Python']
    },
    {
        title: 'Frontend Engineer',
        company: 'Swiggy',
        companyLogo: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/12/Swiggy_logo.svg/330px-Swiggy_logo.svg.png',
        location: 'Bengaluru, India',
        locationType: 'hybrid',
        type: 'full-time',
        description: 'Build beautiful and performant user interfaces for our food delivery platform used by millions. Join our growing frontend team!',
        responsibilities: [
            'Develop responsive web applications using React',
            'Implement pixel-perfect designs from Figma',
            'Optimize frontend performance',
            'Write reusable components and libraries'
        ],
        requirements: [
            '2+ years of React experience',
            'Strong CSS skills (Tailwind preferred)',
            'Experience with state management (Redux/Zustand)',
            'Knowledge of TypeScript'
        ],
        skillsRequired: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Redux'],
        experienceLevel: 'mid',
        minExperience: 2,
        maxExperience: 4,
        salaryRange: { min: 1800000, max: 3000000, currency: 'INR' },
        applicationDeadline: new Date('2025-02-10'),
        status: 'approved',
        department: 'Engineering',
        tags: ['Frontend', 'React', 'TypeScript']
    },
    {
        title: 'Blockchain Developer',
        company: 'Polygon Labs',
        companyLogo: 'https://polygon.technology/media-kit/PolygonLogo.png',
        location: 'Remote',
        locationType: 'remote',
        type: 'full-time',
        description: 'Build the future of Web3! Work on Polygon network infrastructure, develop smart contracts, and contribute to open-source blockchain projects.',
        responsibilities: [
            'Develop and audit smart contracts',
            'Build DeFi protocols and dApps',
            'Contribute to Polygon core infrastructure',
            'Conduct security audits'
        ],
        requirements: [
            '2+ years of Solidity experience',
            'Understanding of DeFi protocols',
            'Experience with Web3.js/Ethers.js',
            'Contributions to open-source projects'
        ],
        skillsRequired: ['Solidity', 'Web3', 'Ethereum', 'Smart Contracts', 'DeFi'],
        experienceLevel: 'mid',
        minExperience: 2,
        maxExperience: 5,
        salaryRange: { min: 2500000, max: 5000000, currency: 'INR' },
        applicationDeadline: new Date('2025-02-20'),
        status: 'approved',
        department: 'Engineering',
        tags: ['Blockchain', 'Web3', 'DeFi']
    }
];

// ============================================================================
// SEEDING FUNCTIONS
// ============================================================================

async function clearCollections() {
    console.log('🗑️  Clearing alumni-related collections...');

    await Promise.all([
        UserModel.deleteMany({ userType: 'Alumni' }),
        AlumniModel.deleteMany({}),
        CampaignModel.deleteMany({}),
        DonationModel.deleteMany({}),
        SuccessStoryModel.deleteMany({}),
        AlumniCardModel.deleteMany({}),
        EventModel.deleteMany({}),
        JobModel.deleteMany({}),
        ActivityModel.deleteMany({}),
        NotificationModel.deleteMany({})
    ]);

    console.log('✅ Collections cleared\n');
}

async function seedAlumni() {
    console.log('🎓 Seeding Alumni...');
    const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
    const createdAlumni = [];

    for (const data of alumniData) {
        // Create user
        let user = await UserModel.findOne({ email: data.email });
        if (!user) {
            user = await UserModel.create({
                name: data.name,
                email: data.email,
                passwordHash: passwordHash,
                userType: 'Alumni'
            });
            console.log(`   ✓ Created user: ${data.email}`);
        }

        // Create alumni profile
        let alumni = await AlumniModel.findOne({ userId: user._id });
        if (!alumni) {
            alumni = await AlumniModel.create({
                userId: user._id,
                graduationYear: data.graduationYear,
                degreeUrl: `https://fot.du.ac.in/degrees/${data.email.split('@')[0]}-${data.graduationYear}.pdf`,
                department: data.department,
                degree: data.degree,
                skills: data.skills,
                verified: data.verified,
                bio: data.bio,
                headline: data.headline,
                experience: data.experience,
                education: data.education,
                location: data.location,
                socialLinks: data.socialLinks
            });
            console.log(`   ✓ Created profile: ${data.name}`);
        }

        // Link profile to user
        if (!user.profileDetails) {
            user.profileDetails = alumni._id;
            await user.save();
        }

        createdAlumni.push({ user, alumni, ...data });
    }

    console.log(`   Created ${createdAlumni.length} alumni\n`);
    return createdAlumni;
}

async function seedCampaigns(alumni) {
    console.log('💰 Seeding Campaigns...');
    const createdCampaigns = [];

    for (let i = 0; i < campaignsData.length; i++) {
        const data = campaignsData[i];
        const creator = alumni[i % alumni.length];

        const campaign = await CampaignModel.create({
            ...data,
            createdBy: creator.user._id,
            status: 'active',
            raisedAmount: Math.floor(data.goalAmount * (0.2 + Math.random() * 0.3)),
            donorCount: Math.floor(Math.random() * 50) + 10
        });

        createdCampaigns.push(campaign);
        console.log(`   ✓ Created: ${data.title}`);

        // Add some donations
        for (let j = 0; j < 5; j++) {
            const donor = alumni[(i + j) % alumni.length];
            const amount = Math.floor(Math.random() * 50000) + 5000;

            await DonationModel.create({
                campaignId: campaign._id,
                donorId: donor.user._id,
                type: 'monetary',
                amount: amount,
                paymentDetails: {
                    orderId: `order_${Date.now()}_${j}`,
                    paymentId: `pay_${Date.now()}_${j}`,
                    method: 'UPI'
                },
                paymentStatus: 'completed',
                isAnonymous: Math.random() > 0.7,
                message: j === 0 ? 'Happy to support this cause!' : undefined
            });
        }
    }

    console.log(`   Created ${createdCampaigns.length} campaigns with donations\n`);
    return createdCampaigns;
}

async function seedSuccessStories(alumni) {
    console.log('🌟 Seeding Success Stories...');
    const createdStories = [];

    for (const data of successStoriesData) {
        const author = alumni[data.authorIndex];

        const story = await SuccessStoryModel.create({
            alumniId: author.alumni._id,
            title: data.title,
            content: data.content,
            excerpt: data.content.substring(0, 200) + '...',
            category: data.category,
            tags: data.tags,
            status: 'approved',
            isFeatured: true,
            publishedAt: new Date(),
            views: Math.floor(Math.random() * 500) + 100
        });

        // Add some likes
        for (let i = 0; i < 5; i++) {
            const liker = alumni[(data.authorIndex + i + 1) % alumni.length];
            story.likes.push({ userId: liker.user._id });
        }
        await story.save();

        createdStories.push(story);
        console.log(`   ✓ Created: ${data.title}`);
    }

    console.log(`   Created ${createdStories.length} stories\n`);
    return createdStories;
}

async function seedAlumniCards(alumni) {
    console.log('💳 Seeding Alumni Cards...');

    for (const alumnus of alumni.slice(0, 8)) { // First 8 get cards
        const cardNumber = await AlumniCardModel.generateCardNumber('ALM');

        const validUntil = new Date();
        validUntil.setFullYear(validUntil.getFullYear() + 5);

        await AlumniCardModel.create({
            alumniId: alumnus.alumni._id,
            userId: alumnus.user._id,
            cardNumber: cardNumber,
            qrCode: {
                data: `https://alumni.fot.du.ac.in/verify/${cardNumber}`,
                generatedAt: new Date()
            },
            validUntil: validUntil,
            status: 'active',
            cardType: 'digital',
            usageCount: Math.floor(Math.random() * 20)
        });

        console.log(`   ✓ Card: ${cardNumber} for ${alumnus.name}`);
    }

    console.log('   Created alumni cards\n');
}

async function seedEvents(alumni) {
    console.log('📅 Seeding Events...');
    const createdEvents = [];

    for (let i = 0; i < eventsData.length; i++) {
        const data = eventsData[i];
        const creator = alumni[i % alumni.length];

        const event = await EventModel.create({
            ...data,
            createdBy: creator.user._id,
            status: 'approved',
            currentRegistrations: Math.floor(Math.random() * 30) + 10,
            isFeatured: i < 2
        });

        createdEvents.push(event);
        console.log(`   ✓ Created: ${data.title}`);
    }

    console.log(`   Created ${createdEvents.length} events\n`);
    return createdEvents;
}

async function seedJobs(alumni) {
    console.log('💼 Seeding Jobs...');
    const createdJobs = [];

    for (let i = 0; i < jobsData.length; i++) {
        const data = jobsData[i];
        const poster = alumni[i % alumni.length];

        const job = await JobModel.create({
            ...data,
            postedBy: poster.user._id,
            postedByUser: poster.user._id,
            isOpen: true,
            viewCount: Math.floor(Math.random() * 200) + 50,
            applicationCount: Math.floor(Math.random() * 20),
            isFeatured: i < 2
        });

        createdJobs.push(job);
        console.log(`   ✓ Created: ${data.title} at ${data.company}`);
    }

    console.log(`   Created ${createdJobs.length} jobs\n`);
    return createdJobs;
}

async function seedActivities(alumni) {
    console.log('📊 Seeding Activities...');

    const activityTypes = ['profile_updated', 'job_posted', 'event_created', 'donation_made', 'story_submitted', 'connection_made'];

    for (const alumnus of alumni) {
        // Create 3-5 activities per alumni
        const numActivities = Math.floor(Math.random() * 3) + 3;

        for (let i = 0; i < numActivities; i++) {
            const type = activityTypes[Math.floor(Math.random() * activityTypes.length)];

            await ActivityModel.create({
                userId: alumnus.user._id,
                type: type,
                title: `Completed ${type.replace('_', ' ')}`,
                description: `${alumnus.name} completed a ${type.replace('_', ' ')} activity`,
                isPublic: Math.random() > 0.3
            });
        }
    }

    console.log('   Created activities for all alumni\n');
}

async function seedConnections(alumni) {
    console.log('🤝 Seeding Connections...');
    let count = 0;

    // Create some connections between alumni
    for (let i = 0; i < alumni.length; i++) {
        for (let j = i + 1; j < Math.min(i + 4, alumni.length); j++) {
            const existing = await ConnectionModel.findOne({
                $or: [
                    { senderId: alumni[i].user._id, receiverId: alumni[j].user._id },
                    { senderId: alumni[j].user._id, receiverId: alumni[i].user._id }
                ]
            });

            if (!existing) {
                await ConnectionModel.create({
                    senderId: alumni[i].user._id,
                    receiverId: alumni[j].user._id,
                    status: Math.random() > 0.2 ? 'accepted' : 'pending'
                });
                count++;
            }
        }
    }

    console.log(`   Created ${count} connections\n`);
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('       🚀 ALUMNI MANAGEMENT SYSTEM - DATABASE SEEDER 🚀');
    console.log('═══════════════════════════════════════════════════════════════\n');

    if (!MONGO_URI) {
        console.error('❌ Error: MONGODB_URI not set in .env file');
        process.exit(1);
    }

    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        if (args.clear) {
            await clearCollections();
        }

        const alumni = await seedAlumni();
        await seedCampaigns(alumni);
        await seedSuccessStories(alumni);
        await seedAlumniCards(alumni);
        await seedEvents(alumni);
        await seedJobs(alumni);
        await seedActivities(alumni);
        await seedConnections(alumni);

        // Print summary
        console.log('═══════════════════════════════════════════════════════════════');
        console.log('                    🎉 SEEDING COMPLETE! 🎉');
        console.log('═══════════════════════════════════════════════════════════════\n');

        console.log('📊 Summary:');
        console.log(`   • ${alumni.length} Alumni with detailed profiles`);
        console.log(`   • ${campaignsData.length} Campaigns with donations`);
        console.log(`   • ${successStoriesData.length} Success Stories`);
        console.log(`   • 8 Alumni Cards`);
        console.log(`   • ${eventsData.length} Events`);
        console.log(`   • ${jobsData.length} Jobs`);
        console.log(`   • Activities and Connections`);
        console.log('');

        console.log('🔐 Login Credentials (Password: Password123!)');
        console.log('');
        alumni.slice(0, 5).forEach(a => {
            console.log(`   ${a.name}: ${a.email}`);
        });
        console.log('');

        console.log('🌐 Access the app:');
        console.log('   Frontend: http://localhost:3001');
        console.log('   Backend:  http://localhost:5000/api/v1');
        console.log('');
        console.log('═══════════════════════════════════════════════════════════════');

        process.exit(0);

    } catch (error) {
        console.error('❌ Error during seeding:', error);
        process.exit(1);
    }
}

main();
