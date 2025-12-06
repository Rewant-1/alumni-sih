const JobModel = require("../model/model.job.js");
const AlumniModel = require("../model/model.alumni.js");
const JobApplicationsModel = require("../model/model.jobApplication.js");
const NotificationModel = require("../model/model.notification.js");

const createJob = async (req, res) => {
    const {
        title,
        company,
        location,
        type,
        isOpen,
        description,
        skillsRequired,
    } = req.body;
    if (!title || !company || !type) {
        return res.status(400).json({
            success: false,
            message: "Title, Company, and Type are required fields.",
        });
    }
    try {
        const job = new JobModel({
            title,
            company,
            location,
            type,
            isOpen,
            description,
            skillsRequired,
            postedBy: req.user.userId,
        });
        const savedJob = await job.save();
        return res.status(201).json({
            success: true,
            message: "Job created successfully.",
            data: { job: savedJob },
        });
    } catch (error) {
        console.error("Error creating job:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const getJobs = async (req, res) => {
    const user = req.user;
    const { filters, search } = req.query;
    try {
        const alumniIds = await AlumniModel.find({
            collegeId: user.collegeId,
        }).distinct("_id");
        const query = { postedBy: { $in: alumniIds } };

        if (filters) {
            const parsedFilters = JSON.parse(filters);
            Object.assign(query, parsedFilters);
        }
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { company: { $regex: search, $options: "i" } },
            ];
        }
        const jobs = await JobModel.find(query);
        res.status(200).json({
            success: true,
            message: "Jobs fetched successfully",
            data: { jobs },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getJobById = async (req, res) => {
    const { id } = req.params;
    try {
        const job = await JobModel.findById(id).populate(
            "postedBy",
            "-passwordHash"
        );
        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found.",
            });
        }
        const alumniIds = await AlumniModel.find({
            collegeId: req.user.collegeId,
        }).distinct("_id");
        if (!alumniIds.includes(job.postedBy._id.toString())) {
            return res.status(403).json({
                success: false,
                message: "Access denied to this job.",
            });
        }
        res.status(200).json({
            success: true,
            message: "Job fetched successfully",
            data: { job },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateJob = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({
            success: false,
            message: "Job ID is required.",
        });
    }
    try {
        const job = await JobModel.findById(id);
        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found.",
            });
        }
        if (job.postedBy.toString() !== req.user.userId) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized to update this job.",
            });
        }
        if (job.draft === false) {
            return res.status(400).json({
                success: false,
                message: "Cannot update a posted job.",
            });
        }
        Object.assign(job, req.body);
        const updatedJob = await job.save();
        res.status(200).json({
            success: true,
            message: "Job updated successfully.",
            data: { job: updatedJob },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteJob = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({
            success: false,
            message: "Job ID is required.",
        });
    }
    try {
        const job = await JobModel.findById(id);
        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found.",
            });
        }
        if (job.postedBy.toString() !== req.user.userId) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized to delete this job.",
            });
        }
        await JobModel.findByIdAndDelete(id);
        await JobApplicationsModel.deleteMany({ jobId: id });
        res.status(200).json({
            success: true,
            message: "Job deleted successfully.",
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const closeJobApplications = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({
            success: false,
            message: "Job ID is required.",
        });
    }
    try {
        const job = await JobModel.findById(id);
        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found.",
            });
        }
        if (job.postedBy.toString() !== req.user.userId) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized to close applications for this job.",
            });
        }
        job.isOpen = false;
        await job.save();
        res.status(200).json({
            success: true,
            message: "Job applications closed successfully.",
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Apply to job
const applyToJob = async (req, res) => {
    try {
        const { id } = req.params;
        const { resumeUrl, coverLetter } = req.body;
        const userId = req.user.userId;

        const job = await JobModel.findById(id);
        if (!job) {
            return res.status(404).json({ success: false, message: "Job not found" });
        }

        if (!job.isOpen) {
            return res.status(400).json({ success: false, message: "Job applications are closed" });
        }

        // Check if already applied
        const existingApplication = job.applications.find(
            app => app.applicantId.toString() === userId
        );
        if (existingApplication) {
            return res.status(400).json({ success: false, message: "Already applied to this job" });
        }

        // Get alumni profile
        const alumni = await AlumniModel.findOne({ userId });
        
        job.applications.push({
            applicantId: userId,
            applicantAlumniId: alumni?._id,
            resumeUrl,
            coverLetter,
            status: 'applied'
        });

        job.applicationCount = job.applications.length;
        await job.save();

        res.status(200).json({
            success: true,
            message: "Application submitted successfully",
            data: { applicationId: job.applications[job.applications.length - 1]._id }
        });
    } catch (error) {
        console.error("Error applying to job:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get my posted jobs
const getMyPostedJobs = async (req, res) => {
    try {
        const userId = req.user.userId;
        const alumni = await AlumniModel.findOne({ userId });
        
        if (!alumni) {
            return res.status(404).json({
                success: false,
                message: "Alumni profile not found"
            });
        }

        const jobs = await JobModel.find({ postedBy: alumni._id })
            .populate('postedByUser', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: { jobs },
            count: jobs.length
        });
    } catch (error) {
        console.error("Error fetching posted jobs:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get my applications
const getMyApplications = async (req, res) => {
    try {
        const userId = req.user.userId;
        const jobs = await JobModel.find({
            'applications.applicantId': userId
        })
        .populate('postedBy', 'name')
        .populate('postedByUser', 'name email')
        .select('title company location type applications createdAt status')
        .sort({ 'applications.appliedAt': -1 });

        const applications = jobs.map(job => {
            const myApp = job.applications.find(
                app => app.applicantId.toString() === userId
            );
            return {
                _id: myApp._id,
                job: {
                    _id: job._id,
                    title: job.title,
                    company: job.company,
                    location: job.location,
                    type: job.type,
                    status: job.status,
                    postedBy: job.postedByUser
                },
                application: {
                    status: myApp.status,
                    appliedAt: myApp.appliedAt,
                    resumeUrl: myApp.resumeUrl,
                    coverLetter: myApp.coverLetter,
                    lastUpdatedAt: myApp.lastUpdatedAt
                }
            };
        });

        res.status(200).json({
            success: true,
            data: { applications },
            count: applications.length
        });
    } catch (error) {
        console.error("Error fetching applications:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Request referral for a job
const requestReferral = async (req, res) => {
    try {
        const { id } = req.params; // job id
        const { message } = req.body;
        const userId = req.user.userId;

        const job = await JobModel.findById(id).populate('postedByUser', 'name');
        if (!job) {
            return res.status(404).json({ success: false, message: "Job not found" });
        }

        // Create notification to job poster
        await NotificationModel.create({
            userId: job.postedByUser,
            type: 'general',
            title: 'Referral Request',
            message: `Someone requested a referral for ${job.title}`,
            reference: {
                model: 'Job',
                id: id
            }
        });

        res.status(200).json({
            success: true,
            message: "Referral request sent successfully"
        });
    } catch (error) {
        console.error("Error requesting referral:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Provide referral for a job
const provideReferral = async (req, res) => {
    try {
        const { id } = req.params; // job id
        const { referredUserId, message } = req.body;
        const userId = req.user.userId;

        if (!referredUserId) {
            return res.status(400).json({ 
                success: false, 
                message: "Referred user ID is required" 
            });
        }

        const job = await JobModel.findById(id);
        if (!job) {
            return res.status(404).json({ success: false, message: "Job not found" });
        }

        // Check if user is the job poster
        const alumni = await AlumniModel.findOne({ userId });
        if (job.postedBy.toString() !== alumni._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Only job poster can provide referrals"
            });
        }

        // Add referral
        job.referrals.push({
            referredBy: userId,
            referredUser: referredUserId,
            status: 'pending'
        });

        await job.save();

        // Create notification to referred user
        await NotificationModel.create({
            userId: referredUserId,
            type: 'general',
            title: 'Job Referral',
            message: `You received a referral for ${job.title}`,
            reference: {
                model: 'Job',
                id: id
            }
        });

        res.status(200).json({
            success: true,
            message: "Referral provided successfully"
        });
    } catch (error) {
        console.error("Error providing referral:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get my referrals (given and received)
const getMyReferrals = async (req, res) => {
    try {
        const userId = req.user.userId;
        
        // Referrals given by me
        const given = await JobModel.find({
            'referrals.referredBy': userId
        })
        .select('title company location type referrals')
        .populate('referrals.referredUser', 'name email');

        // Referrals received by me
        const received = await JobModel.find({
            'referrals.referredUser': userId
        })
        .select('title company location type referrals')
        .populate('referrals.referredBy', 'name email')
        .populate('postedBy', 'name');

        // Format the data
        const givenFormatted = given.map(job => {
            const myReferrals = job.referrals.filter(
                ref => ref.referredBy.toString() === userId
            );
            return {
                job: {
                    _id: job._id,
                    title: job.title,
                    company: job.company,
                    location: job.location,
                    type: job.type
                },
                referrals: myReferrals
            };
        });

        const receivedFormatted = received.map(job => {
            const myReferral = job.referrals.find(
                ref => ref.referredUser.toString() === userId
            );
            return {
                job: {
                    _id: job._id,
                    title: job.title,
                    company: job.company,
                    location: job.location,
                    type: job.type,
                    postedBy: job.postedBy
                },
                referral: myReferral
            };
        });

        res.status(200).json({
            success: true,
            data: { 
                given: givenFormatted, 
                received: receivedFormatted 
            }
        });
    } catch (error) {
        console.error("Error fetching referrals:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    createJob,
    getJobs,
    getJobById,
    updateJob,
    deleteJob,
    closeJobApplications,
    applyToJob,
    getMyPostedJobs,
    getMyApplications,
    requestReferral,
    provideReferral,
    getMyReferrals,
};
