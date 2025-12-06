/**
 * Gemini AI Service
 * For chatbot and AI-powered features
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;
let model = null;

/**
 * Initialize Gemini AI
 */
const initializeGemini = () => {
    if (!genAI && process.env.GEMINI_API_KEY) {
        genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    }
    return model;
};

/**
 * Chat with Gemini for alumni directory assistance
 * @param {string} userMessage - User's message
 * @param {Object} context - Context about visited profiles, search history, etc.
 * @returns {Promise<Object>} AI response
 */
const chatWithAlumniAssistant = async (userMessage, context = {}) => {
    try {
        const gemini = initializeGemini();
        if (!gemini) {
            return {
                success: false,
                error: 'Gemini AI not configured'
            };
        }

        const systemPrompt = `You are an AI assistant for an alumni network platform. 
Your role is to help users:
- Find relevant alumni based on their interests
- Suggest connections
- Answer questions about the alumni network
- Provide networking tips
- Help with job searching within the alumni network

Context about the user:
- Recently viewed profiles: ${JSON.stringify(context.viewedProfiles || [])}
- Search history: ${JSON.stringify(context.searchHistory || [])}
- User profile: ${JSON.stringify(context.userProfile || {})}

Be helpful, professional, and concise. Provide actionable suggestions when possible.`;

        const chat = gemini.startChat({
            history: [
                {
                    role: 'user',
                    parts: [{ text: systemPrompt }]
                },
                {
                    role: 'model',
                    parts: [{ text: 'I understand. I\'m here to help you navigate the alumni network and find valuable connections. How can I assist you today?' }]
                }
            ]
        });

        const result = await chat.sendMessage(userMessage);
        const response = await result.response;

        return {
            success: true,
            message: response.text()
        };
    } catch (error) {
        console.error('Gemini chat error:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Generate profile suggestions based on user data
 * @param {Object} userProfile - User's profile data
 * @param {Array} availableAlumni - List of available alumni profiles
 * @returns {Promise<Object>} Suggested connections with reasons
 */
const suggestConnections = async (userProfile, availableAlumni) => {
    try {
        const gemini = initializeGemini();
        if (!gemini) {
            return {
                success: false,
                error: 'Gemini AI not configured'
            };
        }

        const prompt = `Based on this user profile:
${JSON.stringify(userProfile, null, 2)}

And these available alumni:
${JSON.stringify(availableAlumni.slice(0, 20), null, 2)}

Suggest the top 5 most relevant connections and explain why they would be valuable connections. 
Return as JSON array with format: [{ "alumniId": "...", "reason": "..." }]`;

        const result = await gemini.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Try to parse JSON from response
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            return {
                success: true,
                suggestions: JSON.parse(jsonMatch[0])
            };
        }

        return {
            success: true,
            rawSuggestions: text
        };
    } catch (error) {
        console.error('Connection suggestion error:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Analyze profile for completeness and suggestions
 * @param {Object} profile - Alumni profile
 * @returns {Promise<Object>} Profile analysis
 */
const analyzeProfile = async (profile) => {
    try {
        const gemini = initializeGemini();
        if (!gemini) {
            return {
                success: false,
                error: 'Gemini AI not configured'
            };
        }

        const prompt = `Analyze this alumni profile and provide:
1. Completeness score (0-100)
2. Missing important fields
3. Suggestions to improve the profile
4. Keywords that could help with networking

Profile:
${JSON.stringify(profile, null, 2)}

Return as JSON with format:
{
  "completenessScore": number,
  "missingFields": ["..."],
  "suggestions": ["..."],
  "keywords": ["..."]
}`;

        const result = await gemini.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return {
                success: true,
                analysis: JSON.parse(jsonMatch[0])
            };
        }

        return {
            success: false,
            error: 'Could not parse response'
        };
    } catch (error) {
        console.error('Profile analysis error:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Generate success story summary
 * @param {string} storyContent - Full story content
 * @returns {Promise<Object>} Generated summary
 */
const generateStorySummary = async (storyContent) => {
    try {
        const gemini = initializeGemini();
        if (!gemini) {
            return {
                success: false,
                error: 'Gemini AI not configured'
            };
        }

        const prompt = `Generate a compelling 2-3 sentence summary for this success story. Make it engaging and highlight the key achievement:

${storyContent}`;

        const result = await gemini.generateContent(prompt);
        const response = await result.response;

        return {
            success: true,
            summary: response.text()
        };
    } catch (error) {
        console.error('Story summary error:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

module.exports = {
    initializeGemini,
    chatWithAlumniAssistant,
    suggestConnections,
    analyzeProfile,
    generateStorySummary
};
