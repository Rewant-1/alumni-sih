"use client";

import React, { useState } from 'react';
import { Linkedin, Github, Twitter, Globe, Camera } from 'lucide-react';
import Image from 'next/image';

// --- Types for Backend Data ---
interface SocialLinks {
    linkedin?: string;
    github?: string;
    twitter?: string;
    portfolio?: string;
}

interface UserProfile {
    id: string;
    name: string;
    degree: string;
    major: string;
    faculty: string;
    gradYear: string;
    bio?: string;
    avatarUrl?: string;
    socials: SocialLinks;

    currentRole?: string;
    currentCompany?: string;
    email: string;
    alumniRelation: {
        department: string;
        faculty: string;
        university: string;
        batch: string;
    };
    latestDegree?: string;
    interests: string[];
}

// --- Mock Data ---
const INITIAL_DATA: UserProfile = {
    id: '',
    name: '',
    degree: '',
    major: '',
    faculty: '',
    gradYear: '',
    bio: '',
    avatarUrl: '/profile.jpeg',
    socials: {},
    currentRole: '',
    currentCompany: '',
    email: '',
    alumniRelation: {
        department: '',
        faculty: '',
        university: '',
        batch: '',
    },
    latestDegree: '',
    interests: [],
};

import { getAlumniProfile } from '@/src/api/alumni';
import { verifyAlumni } from '@/src/api/auth';
import { useRouter } from 'next/navigation';

export default function AlumniProfile() {
    const [data, setData] = useState<UserProfile>(INITIAL_DATA);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('Overview');
    const router = useRouter();

    const menuItems = ['Overview', 'Experience', 'Education', 'Connections', 'Message', 'Activities'];

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Verify Auth & Get User ID (Assuming verify returns user object with _id or id)
                // If verify implementation only returns valid/invalid, we might need a different approach.
                // For now, let's assume verifyAlumni returns { user: { id: ... } } or similar.
                // If not, we might fail here.
                const authData = await verifyAlumni();
                // console.log("Auth Data:", authData);
                
                // ADJUST THIS based on actual backend response structure
                const userId = authData?.user?.id || authData?.id || authData?._id; 

                if (!userId) {
                    throw new Error("User ID not found in verification");
                }

                // 2. Fetch Profile Details
                const profileData = await getAlumniProfile(userId);
                setData(profileData);
            } catch (err) {
                console.error(err);
                setError('Failed to load profile. Please log in again.');
                // router.push('/login'); 
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [router]);

    if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
    if (error) return <div className="flex h-screen items-center justify-center text-red-500">{error}</div>;


    return (
        <div className="bg-white font-sans text-[#001145]">
            
            {/* Note: Navbar is handled by MainLayout */}

            {/* GLOBAL FONT STYLES - Ideally move to globals.css */}
             <style jsx global>{`
              @font-face {
                font-family: "TAN PEARL";
                src: url("data:font/otf;base64,T1RUTwANAIAAAwBQQ0ZGIM/ekjkAAA0cAAB1pkRTSUcAAAABAACmsAAAAAhHREVGAAABCAAAACRsb2NhAAABMAAAABRtYXhwAAABUAAAACBuYW1lAAABaAAAAYJwb3N0AAACqAAAACcAAQQBAAEGcmFICAAIABAArwAABa4BKwQNAgkACQElJxYUFg4DAgAFBAIDAgEMAAEKLiwFJCISChkYGxUdHR4jIiYiJSgZGxgdGxkbGxQYGBAZFhgYFhZZGxsZGxsqHyAdCh8SAAECAgrafEgEAQABAAAAAAABAAQAAAABAAMAAQAAAAEABAAAAAEAAAAEAAAAAQAEAAEABAAAAAQAAAAFAAAABgAAAAEABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABgY21hcDb1DukAAAdYAAAFwmhlYWQdCpxoAAAA3AAAADZoaGVhCtgG6wAAAPQAAAAkaG10eALgAwMAAAEkAAAAGGxvY2EAFgCeAAABOAAAABRtYXhwABUANgAAAQgAAAAgbmFtZQBBASwAAAGCAAABgnBvc3QAAwAAAAAQAAIBAAAAAAAAAgEAAAAAAAAAAAACAAAAAAAAAAEAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA") format("opentype");
                font-weight: 400;
                font-style: normal;
                font-display: swap;
              }
            `}</style>

            {/* MAIN CONTENT */}
            <main className="max-w-[1280px] mx-auto px-6 py-10">

                {/* --- Header Section (Centered) --- */}
                <div className="flex flex-col md:flex-row gap-12 items-center justify-center mb-12">

                    {/* Profile Image */}
                    <div className="flex-shrink-0 relative group">
                        <div className="w-48 h-48 md:w-60 md:h-60 rounded-[35px] overflow-hidden shadow-sm border-[6px] border-[#f6f9fe] relative">
                             {/* Fallback image logic handled by Next.js if configured, or just standard img */}
                            <Image 
                              src={data.avatarUrl || '/profile.jpeg'} 
                              alt={data.name} 
                              width={240} 
                              height={240} 
                              className="w-full h-full object-cover" 
                              priority
                            />
                        </div>
                    </div>

                    {/* Profile Info */}
                    <div className="flex-1 pt-4 text-center md:text-left">
                        <h1 className="text-4xl md:text-[3.5rem] font-tan-pearl text-[#001439] mb-4 uppercase tracking-wide font-serif">
                            {data.name}
                        </h1>

                        <p className="text-[#7088aa] text-lg font-semibold mb-5 tracking-wide">
                            {data.degree} • {data.major} • {data.faculty} • {data.gradYear}
                        </p>

                        <p className="text-[#001439] font-bold text-lg leading-relaxed max-w-3xl mb-8 mx-auto md:mx-0">
                            {data.bio}
                        </p>

                        {/* Social Buttons */}
                        <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                            <SocialButton icon={<Linkedin size={18} strokeWidth={2.5} />} label="LinkedIn" href={data.socials.linkedin} />
                            <SocialButton icon={<Github size={18} strokeWidth={2.5} />} label="Github" href={data.socials.github} />
                            <SocialButton icon={<Twitter size={18} strokeWidth={2.5} />} label="Twitter" href={data.socials.twitter} />
                            <SocialButton icon={<Globe size={18} strokeWidth={2.5} />} label="Portfolio" href={data.socials.portfolio} />
                        </div>
                    </div>
                </div>

                <div className="w-full border-t-[3px] border-dotted border-[#dbeaff] mb-12"></div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-12">

                    {/* Left Sidebar */}
                    <div className="md:col-span-3 pl-4">
                        <nav className="flex flex-col gap-7">
                            {menuItems.map((item) => (
                                <button
                                    key={item}
                                    onClick={() => setActiveTab(item)}
                                    className={`text-left text-[17px] font-bold transition-all duration-200 ${activeTab === item
                                        ? 'text-[#001145] translate-x-1'
                                        : 'text-[#4a5f7c] hover:text-[#001145] hover:translate-x-1'
                                        }`}
                                >
                                    {item}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Right Side */}
                    <div className="md:col-span-9 space-y-7">

                        <InfoCard label="Currently:">
                            <p className="font-bold text-[#001439] text-[17px]">{data.currentRole}</p>
                        </InfoCard>

                        <InfoCard label="Contact:">
                            <a href={`mailto:${data.email}`} className="font-bold text-[#001439] text-[17px] hover:underline">
                                {data.email}
                            </a>
                        </InfoCard>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-7">

                            <InfoCard label="Alumni Relation:">
                                <div className="flex flex-col gap-1 font-bold text-[#001439] text-[17px] leading-relaxed">
                                    <span>{data.alumniRelation.department}</span>
                                    <span>{data.alumniRelation.faculty}</span>
                                    <span>{data.alumniRelation.university}</span>
                                    <span>{data.alumniRelation.batch}</span>
                                </div>
                            </InfoCard>

                            <InfoCard label="Latest Degree:">
                                <p className="font-bold text-[#001439] text-[17px]">{data.latestDegree}</p>
                            </InfoCard>
                        </div>

                        <InfoCard label="Areas of Interest:">
                            <p className="font-bold text-[#001439] text-[17px] tracking-wide">
                                {data.interests.join(', ')}
                            </p>
                        </InfoCard>

                    </div>
                </div>
            </main>
        </div>
    );
}

// --- Helper Components ---
function SocialButton({ icon, label, href }: { icon: React.ReactNode, label: string, href?: string }) {
    return (
        <a
            href={href}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#a5bcdc] hover:bg-[#8caecf] text-[#001439] font-bold text-sm transition-all shadow-sm hover:shadow-md active:translate-y-0.5"
        >
            {icon}
            <span>{label}</span>
        </a>
    );
}

function InfoCard({ label, children }: { label: string, children: React.ReactNode }) {
    return (
        <div className="bg-[#e4f0ff] rounded-2xl p-7 w-full border border-[#dbeaff] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
            <h3 className="text-[#4a5f7c] font-bold text-sm mb-3 uppercase tracking-wider opacity-80">
                {label}
            </h3>
            {children}
        </div>
    );
}
