const NewsletterModel = require("../model/model.newsletter");

/**
 * Get all newsletters (sent ones for alumni)
 */
const getNewsletters = async (req, res) => {
    try {
        const { category, page = 1, limit = 10 } = req.query;
        
        const query = { status: 'sent' };
        
        if (category) {
            query.category = category;
        }
        
        const skip = (page - 1) * limit;
        
        const newsletters = await NewsletterModel.find(query)
            .sort({ sentAt: -1 })
            .select('title subject coverImage sentAt category tags isFeatured stats')
            .skip(skip)
            .limit(parseInt(limit))
            .lean();
        
        const total = await NewsletterModel.countDocuments(query);
        
        res.json({ 
            success: true, 
            data: newsletters,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error("Error fetching newsletters:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get newsletter by ID
 */
const getNewsletterById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const newsletter = await NewsletterModel.findById(id)
            .populate('comments.userId', 'name')
            .lean();
        
        if (!newsletter) {
            return res.status(404).json({ 
                success: false, 
                message: "Newsletter not found" 
            });
        }
        
        // Only show sent newsletters to regular users
        if (newsletter.status !== 'sent' && req.user.userType !== 'Admin') {
            return res.status(403).json({ 
                success: false, 
                message: "Access denied" 
            });
        }
        
        // Increment opened count
        await NewsletterModel.findByIdAndUpdate(id, {
            $inc: { 'stats.opened': 1 }
        });
        
        res.json({ 
            success: true, 
            data: newsletter
        });
    } catch (error) {
        console.error("Error fetching newsletter:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Add comment to newsletter
 */
const addComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { text } = req.body;
        const userId = req.user.userId;
        
        if (!text || text.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: "Comment text is required"
            });
        }
        
        const newsletter = await NewsletterModel.findById(id);
        
        if (!newsletter) {
            return res.status(404).json({ 
                success: false, 
                message: "Newsletter not found" 
            });
        }
        
        if (!newsletter.allowComments) {
            return res.status(403).json({ 
                success: false, 
                message: "Comments are not allowed on this newsletter" 
            });
        }
        
        newsletter.comments.push({
            userId,
            text: text.trim()
        });
        
        await newsletter.save();
        
        res.json({ 
            success: true, 
            message: "Comment added successfully",
            data: newsletter.comments[newsletter.comments.length - 1]
        });
    } catch (error) {
        console.error("Error adding comment:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get featured newsletters
 */
const getFeaturedNewsletters = async (req, res) => {
    try {
        const newsletters = await NewsletterModel.find({ 
            status: 'sent',
            isFeatured: true 
        })
            .sort({ sentAt: -1 })
            .limit(5)
            .select('title subject coverImage sentAt category')
            .lean();
        
        res.json({ 
            success: true, 
            data: newsletters
        });
    } catch (error) {
        console.error("Error fetching featured newsletters:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { 
    getNewsletters, 
    getNewsletterById,
    addComment,
    getFeaturedNewsletters
};
