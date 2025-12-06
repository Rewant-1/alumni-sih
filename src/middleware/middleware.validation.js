/**
 * Validation Schemas using Joi
 * Input validation for API endpoints
 */
const Joi = require("joi");

/**
 * Auth Validation Schemas
 */
const authSchemas = {
    // Login validation
    login: Joi.object({
        email: Joi.string().email().required().messages({
            "string.email": "Please provide a valid email address",
            "any.required": "Email is required",
        }),
        password: Joi.string().min(6).required().messages({
            "string.min": "Password must be at least 6 characters",
            "any.required": "Password is required",
        }),
    }),

    // Alumni registration validation
    registerAlumni: Joi.object({
        name: Joi.string().min(2).max(100).required().messages({
            "string.min": "Name must be at least 2 characters",
            "string.max": "Name cannot exceed 100 characters",
            "any.required": "Name is required",
        }),
        email: Joi.string().email().required().messages({
            "string.email": "Please provide a valid email address",
            "any.required": "Email is required",
        }),
        password: Joi.string().min(6).max(100).required().messages({
            "string.min": "Password must be at least 6 characters",
            "string.max": "Password cannot exceed 100 characters",
            "any.required": "Password is required",
        }),
        graduationYear: Joi.number()
            .integer()
            .min(1950)
            .max(new Date().getFullYear() + 10)
            .required()
            .messages({
                "number.min": "Graduation year must be after 1950",
                "number.max": "Graduation year cannot be in the distant future",
                "any.required": "Graduation year is required",
            }),
        degreeUrl: Joi.string().uri().required().messages({
            "string.uri": "Please provide a valid degree document URL",
            "any.required": "Degree document is required",
        }),
        collegeId: Joi.string().required().messages({
            "any.required": "College ID is required",
        }),
    }),
};

/**
 * Alumni Validation Schemas
 */
const alumniSchemas = {
    // Update alumni profile
    updateProfile: Joi.object({
        bio: Joi.string().max(500).allow(""),
        headline: Joi.string().max(100).allow(""),
        department: Joi.string().max(100),
        degree: Joi.string().max(100),
        skills: Joi.array().items(Joi.string().max(50)),
        socialLinks: Joi.object({
            linkedin: Joi.string().uri().allow(""),
            github: Joi.string().uri().allow(""),
            twitter: Joi.string().uri().allow(""),
            portfolio: Joi.string().uri().allow(""),
        }),
        location: Joi.object({
            city: Joi.string().max(100),
            state: Joi.string().max(100),
            country: Joi.string().max(100),
        }),
    }).min(1), // At least one field required

    // Add experience
    addExperience: Joi.object({
        title: Joi.string().max(100).required(),
        company: Joi.string().max(100).required(),
        location: Joi.string().max(100),
        startDate: Joi.date().required(),
        endDate: Joi.date().min(Joi.ref("startDate")),
        current: Joi.boolean().default(false),
        description: Joi.string().max(1000),
        employmentType: Joi.string().valid(
            "full-time",
            "part-time",
            "contract",
            "internship",
            "freelance"
        ),
    }),

    // Add education
    addEducation: Joi.object({
        degree: Joi.string().max(100).required(),
        institution: Joi.string().max(100).required(),
        field: Joi.string().max(100),
        startYear: Joi.number()
            .integer()
            .min(1950)
            .max(new Date().getFullYear())
            .required(),
        endYear: Joi.number()
            .integer()
            .min(Joi.ref("startYear"))
            .max(new Date().getFullYear() + 10),
        current: Joi.boolean().default(false),
    }),
};

/**
 * Event Validation Schemas
 */
const eventSchemas = {
    // Create event
    createEvent: Joi.object({
        title: Joi.string().min(3).max(200).required(),
        description: Joi.string().min(10).max(5000).required(),
        date: Joi.date().greater("now").required(),
        endDate: Joi.date().greater(Joi.ref("date")),
        location: Joi.string().max(500).required(),
        isOnline: Joi.boolean().default(false),
        meetingLink: Joi.string().uri().when("isOnline", {
            is: true,
            then: Joi.required(),
            otherwise: Joi.optional(),
        }),
        category: Joi.string()
            .valid("Reunion", "Webinar", "Networking", "Workshop", "Conference", "Social")
            .required(),
        capacity: Joi.number().integer().min(1),
        image: Joi.string().uri(),
    }),

    // Update event
    updateEvent: Joi.object({
        title: Joi.string().min(3).max(200),
        description: Joi.string().min(10).max(5000),
        date: Joi.date().greater("now"),
        endDate: Joi.date(),
        location: Joi.string().max(500),
        isOnline: Joi.boolean(),
        meetingLink: Joi.string().uri(),
        category: Joi.string().valid(
            "Reunion",
            "Webinar",
            "Networking",
            "Workshop",
            "Conference",
            "Social"
        ),
        capacity: Joi.number().integer().min(1),
        image: Joi.string().uri(),
    }).min(1),
};

/**
 * Job Validation Schemas
 */
const jobSchemas = {
    // Create job
    createJob: Joi.object({
        title: Joi.string().min(3).max(200).required(),
        company: Joi.string().min(2).max(200).required(),
        description: Joi.string().min(10).max(10000).required(),
        location: Joi.string().max(200).required(),
        type: Joi.string()
            .valid("Full-time", "Part-time", "Contract", "Internship", "Remote")
            .required(),
        experience: Joi.string().max(100),
        salary: Joi.string().max(100),
        skills: Joi.array().items(Joi.string().max(50)),
        applyLink: Joi.string().uri(),
        deadline: Joi.date().greater("now"),
    }),

    // Update job
    updateJob: Joi.object({
        title: Joi.string().min(3).max(200),
        company: Joi.string().min(2).max(200),
        description: Joi.string().min(10).max(10000),
        location: Joi.string().max(200),
        type: Joi.string().valid(
            "Full-time",
            "Part-time",
            "Contract",
            "Internship",
            "Remote"
        ),
        experience: Joi.string().max(100),
        salary: Joi.string().max(100),
        skills: Joi.array().items(Joi.string().max(50)),
        applyLink: Joi.string().uri(),
        deadline: Joi.date().greater("now"),
    }).min(1),

    // Apply to job
    applyJob: Joi.object({
        resume: Joi.string().uri().required(),
        coverLetter: Joi.string().max(2000),
    }),
};

/**
 * Connection Validation Schemas
 */
const connectionSchemas = {
    sendRequest: Joi.object({
        alumniId: Joi.string().required(),
        message: Joi.string().max(500),
    }),
};

module.exports = {
    authSchemas,
    alumniSchemas,
    eventSchemas,
    jobSchemas,
    connectionSchemas,
};
