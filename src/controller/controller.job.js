const JobModel = require("../model/model.job.js");
const AlumniModel = require("../model/model.alumni.js");
const JobApplicationsModel = require("../model/model.jobApplication.js");

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

module.exports = {
    createJob,
    getJobs,
    getJobById,
    updateJob,
    deleteJob,
    closeJobApplications,
};
