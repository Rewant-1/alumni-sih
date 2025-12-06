/*
  Complete Seed Script for Alumni Management System
  
  FIXES:
  1. Uses bcryptjs (same as auth controller) for password hashing
  2. Creates ALL collections: users, alumni, events, jobs, campaigns, donations, stories, cards, activities, connections
  
  Run: node scripts/seed-complete.js
*/

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');  // IMPORTANT: Same as auth controller!
const { MONGO_URI } = require('../config');

const DEFAULT_PASSWORD = 'Password123!';

// ============================================================================
// ALUMNI DATA - Indian Context (Faculty of Technology, Delhi University)
// ============================================================================

const alumniProfiles = [
    {
        name: 'Satyam Singh',
        email: 'satyam.singh@example.com',
        graduationYear: 2024,
        skills: ['Deep Learning', 'Python', 'TensorFlow', 'PyTorch', 'Computer Vision'],
        headline: 'AI/ML Engineer at NVIDIA',
        bio: 'AI/ML Engineer passionate about building intelligent systems. Working on cutting-edge GPU-accelerated computing.',
        department: 'Computer Science & Engineering',
        location: { city: 'Bengaluru', state: 'Karnataka', country: 'India' }
    },
    {
        name: 'Rewant Bhriguvanshi',
        email: 'rewant.b@example.com',
        graduationYear: 2023,
        skills: ['C++', 'Cloud Computing', 'System Design', 'Distributed Systems', 'Go'],
        headline: 'Software Engineer at Google',
        bio: 'Software Engineer at Google Cloud Platform. Love solving complex distributed systems problems.',
        department: 'Computer Science & Engineering',
        location: { city: 'Hyderabad', state: 'Telangana', country: 'India' }
    },
    {
        name: 'Krishna Yadav',
        email: 'krishna.yadav@example.com',
        graduationYear: 2025,
        skills: ['React', 'Node.js', 'AI Integration', 'Startup Management', 'Product Development'],
        headline: 'Founder & CEO at NeuraCore Tech',
        bio: 'Startup founder building AI-powered enterprise solutions. Believe in creating impact through technology.',
        department: 'Computer Science & Engineering',
        location: { city: 'Noida', state: 'Uttar Pradesh', country: 'India' }
    },
    {
        name: 'Garvit Gupta',
        email: 'garvit.gupta@example.com',
        graduationYear: 2025,
        skills: ['Python', 'Django', 'PostgreSQL', 'Redis', 'Backend Development'],
        headline: 'Software Engineer at Flipkart',
        bio: 'Backend developer at Flipkart. Passionate about building high-performance systems.',
        department: 'Computer Science & Engineering',
        location: { city: 'Bengaluru', state: 'Karnataka', country: 'India' }
    },
    {
        name: 'Shubhika Sinha',
        email: 'shubhika.sinha@example.com',
        graduationYear: 2023,
        skills: ['Machine Learning', 'NLP', 'Model Deployment', 'Python', 'AWS'],
        headline: 'ML Engineer at TCS Research',
        bio: 'ML Engineer at TCS Research. Published researcher in NLP domain.',
        department: 'Computer Science & Engineering',
        location: { city: 'Pune', state: 'Maharashtra', country: 'India' }
    },
    {
        name: 'Prayas Yadav',
        email: 'prayas.yadav@example.com',
        graduationYear: 2024,
        skills: ['Go', 'Microservices', 'API Development', 'Kubernetes', 'Docker'],
        headline: 'Software Engineer at Uber',
        bio: 'Software Engineer at Uber working on ride-sharing platform. Love building scalable microservices.',
        department: 'Computer Science & Engineering',
        location: { city: 'Gurgaon', state: 'Haryana', country: 'India' }
    },
    {
        name: 'Shreyas Singh',
        email: 'shreyas.singh@example.com',
        graduationYear: 2022,
        skills: ['Verilog', 'Physical Design', 'RTL', 'ASIC Design', 'Cadence'],
        headline: 'VLSI Engineer at Qualcomm',
        bio: 'VLSI Engineer at Qualcomm. Working on 5G chipset design.',
        department: 'Electronics & Communication',
        location: { city: 'Hyderabad', state: 'Telangana', country: 'India' }
    },
    {
        name: 'Kirti Yadav',
        email: 'kirti.yadav@example.com',
        graduationYear: 2021,
        skills: ['FPGA', 'ASIC', 'Static Timing Analysis', 'Synopsys', 'Verilog'],
        headline: 'Senior VLSI Engineer at AMD',
        bio: 'Senior VLSI Engineer at AMD. Three years of experience in chip design.',
        department: 'Electronics & Communication',
        location: { city: 'Bengaluru', state: 'Karnataka', country: 'India' }
    },
    {
        name: 'Raghav Agrawal',
        email: 'raghav.agrawal@example.com',
        graduationYear: 2025,
        skills: ['LLM Embeddings', 'Vector Databases', 'Semantic Search', 'Python', 'FastAPI'],
        headline: 'Research Intern at IIT Delhi',
        bio: 'Research Intern at IIT Delhi working on LLM embeddings and semantic search.',
        department: 'Computer Science & Engineering',
        location: { city: 'Delhi', state: 'Delhi', country: 'India' }
    },
    {
        name: 'Simran Kaur',
        email: 'simran.kaur@example.com',
        graduationYear: 2021,
        skills: ['Product Strategy', 'AI UX', 'Analytics', 'Figma', 'User Research'],
        headline: 'AI Product Manager at Adobe',
        bio: 'AI Product Manager at Adobe. Building the future of creative tools.',
        department: 'Computer Science & Engineering',
        location: { city: 'Noida', state: 'Uttar Pradesh', country: 'India' }
    },
    {
        name: 'Ishita Sharma',
        email: 'ishita.sharma@example.com',
        graduationYear: 2022,
        skills: ['React', 'Next.js', 'UI/UX', 'TypeScript', 'Tailwind CSS'],
        headline: 'Frontend Engineer at Swiggy',
        bio: 'Frontend Engineer at Swiggy. Building delightful user experiences.',
        department: 'Information Technology',
        location: { city: 'Bengaluru', state: 'Karnataka', country: 'India' }
    },
    {
        name: 'Mehul Jain',
        email: 'mehul.jain@example.com',
        graduationYear: 2025,
        skills: ['Solidity', 'Smart Contracts', 'DeFi', 'Web3', 'Ethereum'],
        headline: 'Blockchain Developer at Polygon Labs',
        bio: 'Blockchain Developer at Polygon Labs. Building Web3 infrastructure.',
        department: 'Computer Science & Engineering',
        location: { city: 'Mumbai', state: 'Maharashtra', country: 'India' }
    }
];

// EVENTS DATA
const eventsData = [
    {
        title: 'Annual Alumni Meet 2025',
        description: 'Join us for the grand annual alumni gathering! Network with fellow alumni from across batches, meet current students, and celebrate our shared legacy. Featuring keynote speakers, panel discussions, and a cultural evening.',
        date: new Date('2025-02-15T10:00:00'),
        venue: 'Faculty of Technology Main Auditorium, Delhi University',
        type: 'offline',
        category: 'networking',
        maxCapacity: 500,
        isPaid: false,
        tags: ['Alumni Meet', 'Networking', 'Annual Event']
    },
    {
        title: 'Tech Talk: AI in 2025 and Beyond',
        description: 'An exclusive tech talk on the future of AI/ML. Learn about the latest advancements in deep learning, LLMs, and how to build a career in AI.',
        date: new Date('2025-01-20T15:00:00'),
        venue: 'Online - Google Meet',
        type: 'online',
        category: 'workshop',
        maxCapacity: 200,
        isPaid: false,
        tags: ['AI', 'Tech Talk', 'Career']
    },
    {
        title: 'Startup Showcase & Pitch Night',
        description: 'Alumni founders showcase their startups and share their entrepreneurship journey. Great opportunity for students looking to start their own ventures.',
        date: new Date('2025-01-25T18:00:00'),
        venue: 'Innovation Hub, Faculty of Technology',
        type: 'hybrid',
        category: 'networking',
        maxCapacity: 100,
        isPaid: true,
        ticketPrice: 199,
        tags: ['Startup', 'Entrepreneurship', 'Networking']
    },
    {
        title: 'Hackathon: Code for Change 2025',
        description: '24-hour hackathon focused on building solutions for social impact. Prizes worth ₹2 lakhs! Themes: Healthcare, Education, and Sustainability.',
        date: new Date('2025-02-08T09:00:00'),
        venue: 'Innovation Hub, Faculty of Technology',
        type: 'offline',
        category: 'hackathon',
        maxCapacity: 150,
        isPaid: true,
        ticketPrice: 299,
        tags: ['Hackathon', 'Coding', 'Social Impact']
    },
    {
        title: 'VLSI Career Guidance Session',
        description: 'Senior alumni from Qualcomm, AMD, and Intel share insights about careers in semiconductor industry.',
        date: new Date('2025-01-30T11:00:00'),
        venue: 'Electronics Lab, Faculty of Technology',
        type: 'offline',
        category: 'workshop',
        maxCapacity: 80,
        isPaid: false,
        tags: ['VLSI', 'Career', 'ECE']
    }
];

// JOBS DATA
const jobsData = [
    {
        title: 'Software Engineer - Full Stack',
        company: 'Google',
        location: 'Hyderabad, India',
        type: 'full-time',
        description: 'Join our Cloud Platform team to build next-generation services. Work on scalable distributed systems serving billions of users.',
        skillsRequired: ['Python', 'Java', 'Cloud', 'System Design', 'Distributed Systems'],
        experienceLevel: 'mid',
        salaryRange: { min: 2500000, max: 4500000, currency: 'INR' },
        applicationDeadline: new Date('2025-02-28'),
        isOpen: true,
        tags: ['Backend', 'Cloud', 'Full Stack']
    },
    {
        title: 'AI/ML Engineer - Computer Vision',
        company: 'NVIDIA',
        location: 'Bengaluru, India',
        type: 'full-time',
        description: 'Work on cutting-edge computer vision technologies for autonomous systems. Develop and optimize deep learning models.',
        skillsRequired: ['Deep Learning', 'PyTorch', 'Computer Vision', 'CUDA', 'Python'],
        experienceLevel: 'senior',
        salaryRange: { min: 3000000, max: 5500000, currency: 'INR' },
        applicationDeadline: new Date('2025-03-15'),
        isOpen: true,
        tags: ['AI', 'Deep Learning', 'Computer Vision']
    },
    {
        title: 'Backend Developer Intern',
        company: 'Flipkart',
        location: 'Bengaluru, India',
        type: 'internship',
        description: 'Join our backend team for a 6-month internship. Work on high-scale systems handling millions of transactions daily.',
        skillsRequired: ['Python', 'Django', 'REST APIs', 'SQL', 'Git'],
        experienceLevel: 'entry',
        salaryRange: { min: 50000, max: 80000, currency: 'INR' },
        applicationDeadline: new Date('2025-01-31'),
        isOpen: true,
        tags: ['Internship', 'Backend', 'Python']
    },
    {
        title: 'Frontend Engineer',
        company: 'Swiggy',
        location: 'Bengaluru, India',
        type: 'full-time',
        description: 'Build beautiful and performant user interfaces for our food delivery platform used by millions.',
        skillsRequired: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Redux'],
        experienceLevel: 'mid',
        salaryRange: { min: 1800000, max: 3000000, currency: 'INR' },
        applicationDeadline: new Date('2025-02-10'),
        isOpen: true,
        tags: ['Frontend', 'React', 'TypeScript']
    },
    {
        title: 'Blockchain Developer',
        company: 'Polygon Labs',
        location: 'Remote',
        type: 'full-time',
        description: 'Build the future of Web3! Work on Polygon network infrastructure and develop smart contracts.',
        skillsRequired: ['Solidity', 'Web3', 'Ethereum', 'Smart Contracts', 'DeFi'],
        experienceLevel: 'mid',
        salaryRange: { min: 2500000, max: 5000000, currency: 'INR' },
        applicationDeadline: new Date('2025-02-20'),
        isOpen: true,
        tags: ['Blockchain', 'Web3', 'DeFi']
    }
];

// CAMPAIGNS DATA
const campaignsData = [
    {
        title: 'AI Research Lab Setup Fund',
        description: 'Help us establish a state-of-the-art AI/ML research lab with high-performance GPU clusters and specialized software.',
        shortDescription: 'Building a world-class AI research facility for FoT students',
        category: 'research',
        goalAmount: 5000000,
        raisedAmount: 1250000,
        donorCount: 45,
        startDate: new Date('2024-12-01'),
        endDate: new Date('2025-06-30'),
        status: 'active',
        tags: ['AI', 'Research', 'GPU', 'Deep Learning']
    },
    {
        title: 'Merit Scholarship Fund 2025',
        description: 'Create a sustainable scholarship fund to support meritorious students from economically weaker sections.',
        shortDescription: 'Supporting talented students who need financial assistance',
        category: 'scholarship',
        goalAmount: 2000000,
        raisedAmount: 850000,
        donorCount: 32,
        startDate: new Date('2024-11-15'),
        endDate: new Date('2025-04-30'),
        status: 'active',
        tags: ['Scholarship', 'Education', 'Social Impact']
    },
    {
        title: 'Smart Classroom Initiative',
        description: 'Transform traditional classrooms into smart learning spaces with interactive boards and modern AV equipment.',
        shortDescription: 'Modernizing classrooms with technology for better learning',
        category: 'infrastructure',
        goalAmount: 2500000,
        raisedAmount: 500000,
        donorCount: 18,
        startDate: new Date('2024-12-01'),
        endDate: new Date('2025-05-31'),
        status: 'active',
        tags: ['Infrastructure', 'Education', 'Technology']
    }
];

// SUCCESS STORIES DATA
const storiesData = [
    {
        title: 'From Delhi University to NVIDIA: My AI Journey',
        content: 'When I joined Faculty of Technology in 2020, I had no idea that four years later, I would be working at NVIDIA on cutting-edge AI technologies. My journey has been filled with learning, failures, and eventual success.\n\nThe foundation at FoT was incredible. Our professors encouraged us to think beyond textbooks. The coding competitions and hackathons gave me the confidence to compete at national level.\n\nTo current students: Don\'t just study for exams. Build things. Fail. Learn. FoT gave me the platform to dream big!',
        category: 'career',
        tags: ['AI', 'NVIDIA', 'Deep Learning', 'Career'],
        authorIndex: 0
    },
    {
        title: 'Building NeuraCore Tech: From Student to Startup Founder',
        content: 'Three years ago, I was just another student at Faculty of Technology. Today, I\'m the founder of NeuraCore Tech, a startup valued at ₹10 crores.\n\nThe entrepreneurship bug bit me during my second year. FoT\'s innovation cell became my second home. What made the difference? Our seniors and alumni - they invested in our ideas and opened doors we didn\'t know existed.\n\nMy message to aspiring founders: Start while you\'re still in college. The risk is lower, the learning is faster!',
        category: 'entrepreneurship',
        tags: ['Startup', 'Entrepreneurship', 'AI', 'Founder Story'],
        authorIndex: 2
    },
    {
        title: 'Cracking Google: A Comprehensive Placement Guide',
        content: 'Getting into Google felt like a distant dream during my first year. But with the right strategy and support from FoT community, I made it happen.\n\nI solved over 600 DSA problems. But what truly differentiated me was my open-source contributions. The alumni network was crucial - senior FoT alumni at Google conducted mock interviews and reviewed my resume.\n\nKey advice: Start early, build real projects, and leverage the FoT alumni community!',
        category: 'career',
        tags: ['Google', 'Placements', 'DSA', 'Interview Preparation'],
        authorIndex: 1
    }
];

// POSTS DATA
const postsData = [
    {
        content: 'Just completed my first month at NVIDIA! The learning curve is steep but the team is incredibly supportive. Grateful for the foundation FoT gave me. #AIEngineering #NVIDIA',
        tags: ['AI', 'Career', 'NVIDIA'],
        authorIndex: 0
    },
    {
        content: 'We are hiring at Google Cloud! Looking for talented engineers passionate about distributed systems. DM me for referrals. #GoogleHiring #CloudComputing',
        tags: ['Hiring', 'Google', 'Referral'],
        authorIndex: 1
    },
    {
        content: 'NeuraCore Tech just closed our seed round! 🚀 Excited to share that we raised ₹2 Cr to scale our AI automation platform. FoT family, thank you for your support!',
        tags: ['Startup', 'Funding', 'AI'],
        authorIndex: 2
    },
    {
        content: 'Pro tip for placement season: Focus on system design, not just DSA. Companies like Flipkart value problem-solving approach over memorized patterns. Happy to help juniors prep!',
        tags: ['Placements', 'CareerAdvice', 'SystemDesign'],
        authorIndex: 3
    },
    {
        content: 'India is becoming a chip design hub! AMD, Qualcomm, Intel all expanding here. ECE students, now is the best time to get into VLSI. The semiconductor industry needs you! 🔌',
        tags: ['VLSI', 'Semiconductor', 'Career'],
        authorIndex: 7
    }
];

// ============================================================================
// MAIN SEED FUNCTION
// ============================================================================

async function main() {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('       🚀 COMPLETE SEED SCRIPT - ALL COLLECTIONS 🚀');
    console.log('═══════════════════════════════════════════════════════════════\n');

    if (!MONGO_URI) {
        console.error('❌ MONGODB_URI not found');
        process.exit(1);
    }

    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        const db = mongoose.connection.db;
        console.log('✅ Connected to:', db.databaseName, '\n');

        // Hash password using bcryptjs (SAME AS AUTH CONTROLLER!)
        console.log('🔐 Hashing password with bcryptjs...');
        const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
        console.log('✅ Password hashed\n');

        // Clear all collections
        console.log('🗑️  Clearing existing data...');
        const emails = alumniProfiles.map(a => a.email);
        await db.collection('users').deleteMany({ email: { $in: emails } });
        await db.collection('alumnis').deleteMany({});
        await db.collection('events').deleteMany({});
        await db.collection('jobs').deleteMany({});
        await db.collection('campaigns').deleteMany({});
        await db.collection('donations').deleteMany({});
        await db.collection('successstories').deleteMany({});
        await db.collection('posts').deleteMany({});
        await db.collection('alumnicards').deleteMany({});
        await db.collection('activities').deleteMany({});
        await db.collection('connections').deleteMany({});
        console.log('✅ All collections cleared\n');

        // Create Alumni Users
        console.log('🎓 Creating Alumni Users & Profiles...');
        const createdUsers = [];

        for (const profile of alumniProfiles) {
            const userResult = await db.collection('users').insertOne({
                name: profile.name,
                email: profile.email,
                passwordHash: passwordHash,
                userType: 'Alumni',
                createdAt: new Date()
            });
            const userId = userResult.insertedId;

            const alumniResult = await db.collection('alumnis').insertOne({
                userId: userId,
                graduationYear: profile.graduationYear,
                degreeUrl: `https://fot.du.ac.in/degrees/${profile.email.split('@')[0]}.pdf`,
                skills: profile.skills,
                verified: true,
                headline: profile.headline,
                bio: profile.bio,
                department: profile.department,
                degree: 'B.Tech',
                location: profile.location,
                createdAt: new Date(),
                updatedAt: new Date()
            });

            await db.collection('users').updateOne(
                { _id: userId },
                { $set: { profileDetails: alumniResult.insertedId } }
            );

            createdUsers.push({ userId, alumniId: alumniResult.insertedId, ...profile });
            console.log(`   ✓ ${profile.name}`);
        }
        console.log(`   Created ${createdUsers.length} alumni\n`);

        // Create Events
        console.log('📅 Creating Events...');
        for (const event of eventsData) {
            await db.collection('events').insertOne({
                ...event,
                createdBy: createdUsers[0].userId,
                status: 'approved',
                registeredUsers: [],
                createdAt: new Date(),
                updatedAt: new Date()
            });
            console.log(`   ✓ ${event.title}`);
        }
        console.log(`   Created ${eventsData.length} events\n`);

        // Create Jobs
        console.log('💼 Creating Jobs...');
        for (let i = 0; i < jobsData.length; i++) {
            const job = jobsData[i];
            await db.collection('jobs').insertOne({
                ...job,
                postedBy: createdUsers[i % createdUsers.length].userId,
                status: 'approved',
                applications: [],
                createdAt: new Date(),
                updatedAt: new Date()
            });
            console.log(`   ✓ ${job.title} at ${job.company}`);
        }
        console.log(`   Created ${jobsData.length} jobs\n`);

        // Create Campaigns
        console.log('💰 Creating Campaigns...');
        for (let i = 0; i < campaignsData.length; i++) {
            const campaign = campaignsData[i];
            await db.collection('campaigns').insertOne({
                ...campaign,
                createdBy: createdUsers[i].userId,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            console.log(`   ✓ ${campaign.title}`);
        }
        console.log(`   Created ${campaignsData.length} campaigns\n`);

        // Create Success Stories
        console.log('🌟 Creating Success Stories...');
        for (const story of storiesData) {
            const author = createdUsers[story.authorIndex];
            await db.collection('successstories').insertOne({
                alumniId: author.alumniId,
                title: story.title,
                content: story.content,
                excerpt: story.content.substring(0, 200) + '...',
                category: story.category,
                tags: story.tags,
                status: 'approved',
                isFeatured: true,
                publishedAt: new Date(),
                views: Math.floor(Math.random() * 500) + 100,
                likes: [],
                comments: [],
                createdAt: new Date(),
                updatedAt: new Date()
            });
            console.log(`   ✓ ${story.title}`);
        }
        console.log(`   Created ${storiesData.length} stories\n`);

        // Create Posts
        console.log('📝 Creating Posts...');
        for (const post of postsData) {
            const author = createdUsers[post.authorIndex];
            await db.collection('posts').insertOne({
                userId: author.userId,
                content: post.content,
                tags: post.tags,
                likes: [],
                comments: [],
                createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random time in last week
                updatedAt: new Date()
            });
        }
        console.log(`   Created ${postsData.length} posts\n`);

        // Create Connections
        console.log('🤝 Creating Connections...');
        let connectionCount = 0;
        for (let i = 0; i < createdUsers.length; i++) {
            for (let j = i + 1; j < Math.min(i + 3, createdUsers.length); j++) {
                await db.collection('connections').insertOne({
                    studentId: createdUsers[j].userId,  // Using schema field names
                    alumniId: createdUsers[i].alumniId,
                    status: 'accepted',
                    connectionDate: new Date()
                });
                connectionCount++;
            }
        }
        console.log(`   Created ${connectionCount} connections\n`);

        // Create Activities
        console.log('📊 Creating Activities...');
        const activityTypes = ['profile_updated', 'job_posted', 'event_created', 'connection_made'];
        for (const user of createdUsers.slice(0, 5)) {
            for (let i = 0; i < 3; i++) {
                await db.collection('activities').insertOne({
                    userId: user.userId,
                    type: activityTypes[Math.floor(Math.random() * activityTypes.length)],
                    title: 'Activity completed',
                    description: `${user.name} completed an activity`,
                    isPublic: true,
                    points: Math.floor(Math.random() * 50) + 10,
                    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
                });
            }
        }
        console.log('   Created activities for users\n');

        // Summary
        console.log('═══════════════════════════════════════════════════════════════');
        console.log('                    🎉 SEEDING COMPLETE! 🎉');
        console.log('═══════════════════════════════════════════════════════════════\n');

        console.log('📊 Created:');
        console.log(`   • ${createdUsers.length} Alumni users with profiles`);
        console.log(`   • ${eventsData.length} Events`);
        console.log(`   • ${jobsData.length} Jobs`);
        console.log(`   • ${campaignsData.length} Campaigns`);
        console.log(`   • ${storiesData.length} Success Stories`);
        console.log(`   • ${postsData.length} Posts`);
        console.log(`   • ${connectionCount} Connections`);
        console.log(`   • Activities for users\n`);

        console.log('🔐 Login Credentials (Password: Password123!)\n');
        createdUsers.slice(0, 5).forEach(u => {
            console.log(`   ${u.name}: ${u.email}`);
        });
        console.log('   ... and more\n');

        console.log('🌐 Access:');
        console.log('   Frontend: http://localhost:3001');
        console.log('   Backend:  http://localhost:5000/api/v1\n');

        console.log('═══════════════════════════════════════════════════════════════');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
        process.exit(1);
    }
}

main();
