const SurveyModel = require("../model/model.survey");
const SurveyResponseModel = require("../model/model.surveyResponse");

/**
 * Get all active surveys
 */
const getSurveys = async (req, res) => {
    try {
        const { status, targetAudience } = req.query;
        const userType = req.user.userType;
        
        const query = {};
        
        // Filter by status (default to active)
        query.status = status || 'active';
        
        // Filter by target audience
        if (targetAudience) {
            query.targetAudience = targetAudience;
        } else {
            // Show surveys relevant to user type
            query.$or = [
                { targetAudience: 'all' },
                { targetAudience: userType.toLowerCase() }
            ];
        }
        
        // Check date range
        const now = new Date();
        query.$or = [
            { startDate: { $lte: now }, endDate: { $gte: now } },
            { startDate: { $exists: false }, endDate: { $exists: false } }
        ];
        
        const surveys = await SurveyModel.find(query)
            .select('-createdBy -collegeId')
            .sort({ createdAt: -1 })
            .lean();
        
        // Check if user has already responded
        const userId = req.user.userId;
        const surveyIds = surveys.map(s => s._id);
        const responses = await SurveyResponseModel.find({
            surveyId: { $in: surveyIds },
            userId
        }).select('surveyId');
        
        const respondedIds = responses.map(r => r.surveyId.toString());
        
        const surveysWithStatus = surveys.map(survey => ({
            ...survey,
            hasResponded: respondedIds.includes(survey._id.toString())
        }));
        
        res.json({ 
            success: true, 
            data: surveysWithStatus,
            count: surveysWithStatus.length
        });
    } catch (error) {
        console.error("Error fetching surveys:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get survey by ID
 */
const getSurveyById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        
        const survey = await SurveyModel.findById(id).lean();
        
        if (!survey) {
            return res.status(404).json({ 
                success: false, 
                message: "Survey not found" 
            });
        }
        
        // Check if user has already responded
        const existingResponse = await SurveyResponseModel.findOne({
            surveyId: id,
            userId
        });
        
        res.json({ 
            success: true, 
            data: {
                ...survey,
                hasResponded: !!existingResponse,
                responseId: existingResponse?._id
            }
        });
    } catch (error) {
        console.error("Error fetching survey:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Submit survey response
 */
const submitResponse = async (req, res) => {
    try {
        const { answers, timeSpent } = req.body;
        const surveyId = req.params.id;
        const userId = req.user.userId;
        
        // Validate survey exists and is active
        const survey = await SurveyModel.findById(surveyId);
        if (!survey) {
            return res.status(404).json({ 
                success: false, 
                message: "Survey not found" 
            });
        }
        
        if (survey.status !== 'active') {
            return res.status(400).json({ 
                success: false, 
                message: "Survey is not active" 
            });
        }
        
        // Check if already responded
        const existing = await SurveyResponseModel.findOne({ 
            surveyId, 
            userId 
        });
        
        if (existing) {
            return res.status(400).json({ 
                success: false, 
                message: 'You have already responded to this survey' 
            });
        }
        
        // Validate required questions
        const requiredQuestions = survey.questions.filter(q => q.required);
        const answeredQuestionIds = answers.map(a => a.questionId.toString());
        
        const missingRequired = requiredQuestions.filter(
            q => !answeredQuestionIds.includes(q._id.toString())
        );
        
        if (missingRequired.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Please answer all required questions',
                missingQuestions: missingRequired.map(q => q.questionText)
            });
        }
        
        // Create response
        const response = await SurveyResponseModel.create({
            surveyId,
            userId: survey.isAnonymous ? undefined : userId,
            answers,
            timeSpent
        });
        
        // Update survey stats
        await SurveyModel.findByIdAndUpdate(surveyId, {
            $inc: { responseCount: 1, 'stats.totalResponses': 1 }
        });
        
        res.json({ 
            success: true, 
            message: 'Survey response submitted successfully',
            data: response 
        });
    } catch (error) {
        console.error("Error submitting survey response:", error);
        
        if (error.code === 11000) {
            return res.status(400).json({ 
                success: false, 
                message: 'You have already responded to this survey' 
            });
        }
        
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get my survey responses
 */
const getMyResponses = async (req, res) => {
    try {
        const userId = req.user.userId;
        
        const responses = await SurveyResponseModel.find({ userId })
            .populate('surveyId', 'title description createdAt')
            .sort({ submittedAt: -1 })
            .lean();
        
        res.json({ 
            success: true, 
            data: responses,
            count: responses.length
        });
    } catch (error) {
        console.error("Error fetching responses:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { 
    getSurveys, 
    getSurveyById, 
    submitResponse,
    getMyResponses
};
