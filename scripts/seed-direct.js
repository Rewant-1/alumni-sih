/*
  Direct MongoDB Seed Script
  Bypasses Mongoose model issues by using MongoDB driver directly
*/

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { MONGO_URI } = require('../config');

const DEFAULT_PASSWORD = 'Password123!';

const alumniProfiles = [
    { name: 'Satyam Singh', email: 'satyam.singh@example.com', graduationYear: 2024, skills: ['Deep Learning', 'Python', 'PyTorch'], headline: 'AI/ML Engineer at NVIDIA' },
    { name: 'Rewant Bhriguvanshi', email: 'rewant.b@example.com', graduationYear: 2023, skills: ['C++', 'Cloud Computing', 'Go'], headline: 'Software Engineer at Google' },
    { name: 'Krishna Yadav', email: 'krishna.yadav@example.com', graduationYear: 2025, skills: ['React', 'Node.js', 'AI'], headline: 'Founder at NeuraCore Tech' },
    { name: 'Garvit Gupta', email: 'garvit.gupta@example.com', graduationYear: 2025, skills: ['Python', 'Django', 'PostgreSQL'], headline: 'Software Engineer at Flipkart' },
    { name: 'Shubhika Sinha', email: 'shubhika.sinha@example.com', graduationYear: 2023, skills: ['ML', 'NLP', 'AWS'], headline: 'ML Engineer at TCS Research' },
    { name: 'Prayas Yadav', email: 'prayas.yadav@example.com', graduationYear: 2024, skills: ['Go', 'Microservices', 'Kubernetes'], headline: 'Software Engineer at Uber' },
    { name: 'Shreyas Singh', email: 'shreyas.singh@example.com', graduationYear: 2022, skills: ['Verilog', 'ASIC', 'Cadence'], headline: 'VLSI Engineer at Qualcomm' },
    { name: 'Kirti Yadav', email: 'kirti.yadav@example.com', graduationYear: 2021, skills: ['FPGA', 'RTL', 'Synopsys'], headline: 'Senior VLSI Engineer at AMD' },
    { name: 'Raghav Agrawal', email: 'raghav.agrawal@example.com', graduationYear: 2025, skills: ['LLM', 'Vector DBs', 'FastAPI'], headline: 'Research Intern at IIT Delhi' },
    { name: 'Simran Kaur', email: 'simran.kaur@example.com', graduationYear: 2021, skills: ['Product Strategy', 'AI UX', 'Figma'], headline: 'AI Product Manager at Adobe' },
    { name: 'Ishita Sharma', email: 'ishita.sharma@example.com', graduationYear: 2022, skills: ['React', 'Next.js', 'TypeScript'], headline: 'Frontend Engineer at Swiggy' },
    { name: 'Mehul Jain', email: 'mehul.jain@example.com', graduationYear: 2025, skills: ['Solidity', 'Web3', 'DeFi'], headline: 'Blockchain Developer at Polygon' }
];

async function main() {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('       🚀 ALUMNI SEEDER - DIRECT MONGODB VERSION 🚀');
    console.log('═══════════════════════════════════════════════════════════════\n');

    if (!MONGO_URI) {
        console.error('❌ MONGODB_URI not found in .env');
        process.exit(1);
    }

    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        const db = mongoose.connection.db;
        console.log('✅ Connected to:', db.databaseName, '\n');

        console.log('🔐 Hashing password...');
        const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
        console.log('✅ Done\n');

        console.log('🗑️  Cleaning existing test data...');
        const emails = alumniProfiles.map(a => a.email);
        await db.collection('users').deleteMany({ email: { $in: emails } });
        console.log('✅ Cleaned users\n');

        console.log('🎓 Creating Alumni...');

        for (const profile of alumniProfiles) {
            // Insert user directly
            const userResult = await db.collection('users').insertOne({
                name: profile.name,
                email: profile.email,
                passwordHash: passwordHash,
                userType: 'Alumni',
                createdAt: new Date()
            });
            const userId = userResult.insertedId;

            // Insert alumni profile directly
            const alumniResult = await db.collection('alumnis').insertOne({
                userId: userId,
                graduationYear: profile.graduationYear,
                degreeUrl: `https://fot.du.ac.in/degrees/${profile.email.split('@')[0]}.pdf`,
                skills: profile.skills,
                verified: true,
                headline: profile.headline,
                bio: `Experienced professional from Faculty of Technology (Class of ${profile.graduationYear}).`,
                department: 'Computer Science & Engineering',
                degree: 'B.Tech',
                createdAt: new Date(),
                updatedAt: new Date()
            });

            // Link profile to user
            await db.collection('users').updateOne(
                { _id: userId },
                { $set: { profileDetails: alumniResult.insertedId } }
            );

            console.log(`   ✓ ${profile.name} (${profile.email})`);
        }

        console.log('\n═══════════════════════════════════════════════════════════════');
        console.log('                    🎉 SEEDING COMPLETE! 🎉');
        console.log('═══════════════════════════════════════════════════════════════\n');

        console.log('📊 Created:');
        console.log(`   • ${alumniProfiles.length} Alumni users with profiles\n`);

        console.log('🔐 Login Credentials (Password: Password123!)\n');
        alumniProfiles.slice(0, 5).forEach(a => {
            console.log(`   ${a.name}: ${a.email}`);
        });
        console.log('   ... and more\n');

        console.log('🌐 Access:');
        console.log('   Frontend: http://localhost:3001');
        console.log('   Backend:  http://localhost:5000/api/v1');
        console.log('');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
        process.exit(1);
    }
}

main();
