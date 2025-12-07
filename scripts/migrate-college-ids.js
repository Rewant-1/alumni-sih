/**
 * Migration Script: Add collegeId to existing records
 * 
 * This script migrates existing data to add collegeId field where missing.
 * It extracts collegeId from related User records.
 * 
 * Usage: node scripts/migrate-college-ids.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const UserModel = require('../src/model/model.user');
const PostModel = require('../src/model/model.post');
const EventModel = require('../src/model/model.event');
const SuccessStoryModel = require('../src/model/model.successStory');
const DonationModel = require('../src/model/model.donation');
const NotificationModel = require('../src/model/model.notification');
const ConnectionModel = require('../src/model/model.connections');
const ActivityModel = require('../src/model/model.activity');
const CampaignModel = require('../src/model/model.campaign');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/alumni-sih';

async function connectDB() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
}

async function migratePosts() {
    console.log('\n📝 Migrating Posts...');
    try {
        const posts = await PostModel.find({ collegeId: { $exists: false } });
        console.log(`Found ${posts.length} posts without collegeId`);
        
        let updated = 0;
        for (const post of posts) {
            if (post.postedBy) {
                const user = await UserModel.findById(post.postedBy).select('collegeId');
                if (user && user.collegeId) {
                    post.collegeId = user.collegeId;
                    await post.save();
                    updated++;
                }
            }
        }
        console.log(`✅ Updated ${updated} posts with collegeId`);
    } catch (error) {
        console.error('❌ Error migrating posts:', error.message);
    }
}

async function migrateEvents() {
    console.log('\n🎉 Migrating Events...');
    try {
        const events = await EventModel.find({ collegeId: { $exists: false } });
        console.log(`Found ${events.length} events without collegeId`);
        
        let updated = 0;
        for (const event of events) {
            if (event.createdBy) {
                const user = await UserModel.findById(event.createdBy).select('collegeId');
                if (user && user.collegeId) {
                    event.collegeId = user.collegeId;
                    await event.save();
                    updated++;
                }
            }
        }
        console.log(`✅ Updated ${updated} events with collegeId`);
    } catch (error) {
        console.error('❌ Error migrating events:', error.message);
    }
}

async function migrateSuccessStories() {
    console.log('\n⭐ Migrating Success Stories...');
    try {
        const stories = await SuccessStoryModel.find({ collegeId: { $exists: false } });
        console.log(`Found ${stories.length} success stories without collegeId`);
        
        let updated = 0;
        for (const story of stories) {
            let collegeId = null;
            
            // Try to get from createdBy
            if (story.createdBy) {
                const user = await UserModel.findById(story.createdBy).select('collegeId');
                if (user && user.collegeId) {
                    collegeId = user.collegeId;
                }
            }
            
            // If not found, try from alumniId
            if (!collegeId && story.alumniId) {
                const AlumniModel = require('../src/model/model.alumni');
                const alumni = await AlumniModel.findById(story.alumniId).populate('userId', 'collegeId');
                if (alumni && alumni.userId && alumni.userId.collegeId) {
                    collegeId = alumni.userId.collegeId;
                }
            }
            
            if (collegeId) {
                story.collegeId = collegeId;
                await story.save();
                updated++;
            }
        }
        console.log(`✅ Updated ${updated} success stories with collegeId`);
    } catch (error) {
        console.error('❌ Error migrating success stories:', error.message);
    }
}

async function migrateDonations() {
    console.log('\n💰 Migrating Donations...');
    try {
        const donations = await DonationModel.find({ collegeId: { $exists: false } });
        console.log(`Found ${donations.length} donations without collegeId`);
        
        let updated = 0;
        for (const donation of donations) {
            let collegeId = null;
            
            // Get from campaign
            if (donation.campaignId) {
                const campaign = await CampaignModel.findById(donation.campaignId).select('collegeId');
                if (campaign && campaign.collegeId) {
                    collegeId = campaign.collegeId;
                }
            }
            
            // Fallback: get from donor
            if (!collegeId && donation.donorId) {
                const user = await UserModel.findById(donation.donorId).select('collegeId');
                if (user && user.collegeId) {
                    collegeId = user.collegeId;
                }
            }
            
            if (collegeId) {
                donation.collegeId = collegeId;
                await donation.save();
                updated++;
            }
        }
        console.log(`✅ Updated ${updated} donations with collegeId`);
    } catch (error) {
        console.error('❌ Error migrating donations:', error.message);
    }
}

async function migrateNotifications() {
    console.log('\n🔔 Migrating Notifications...');
    try {
        const notifications = await NotificationModel.find({ collegeId: { $exists: false } });
        console.log(`Found ${notifications.length} notifications without collegeId`);
        
        let updated = 0;
        for (const notification of notifications) {
            if (notification.userId) {
                const user = await UserModel.findById(notification.userId).select('collegeId');
                if (user && user.collegeId) {
                    notification.collegeId = user.collegeId;
                    await notification.save();
                    updated++;
                }
            }
        }
        console.log(`✅ Updated ${updated} notifications with collegeId`);
    } catch (error) {
        console.error('❌ Error migrating notifications:', error.message);
    }
}

async function migrateConnections() {
    console.log('\n🤝 Migrating Connections...');
    try {
        const connections = await ConnectionModel.find({ collegeId: { $exists: false } });
        console.log(`Found ${connections.length} connections without collegeId`);
        
        let updated = 0;
        const StudentModel = require('../src/model/model.student');
        
        for (const connection of connections) {
            if (connection.studentId) {
                const student = await StudentModel.findById(connection.studentId).populate('userId', 'collegeId');
                if (student && student.userId && student.userId.collegeId) {
                    connection.collegeId = student.userId.collegeId;
                    await connection.save();
                    updated++;
                }
            }
        }
        console.log(`✅ Updated ${updated} connections with collegeId`);
    } catch (error) {
        console.error('❌ Error migrating connections:', error.message);
    }
}

async function migrateActivities() {
    console.log('\n📊 Migrating Activities...');
    try {
        const activities = await ActivityModel.find({ collegeId: { $exists: false } });
        console.log(`Found ${activities.length} activities without collegeId`);
        
        let updated = 0;
        for (const activity of activities) {
            if (activity.userId) {
                const user = await UserModel.findById(activity.userId).select('collegeId');
                if (user && user.collegeId) {
                    activity.collegeId = user.collegeId;
                    await activity.save();
                    updated++;
                }
            }
        }
        console.log(`✅ Updated ${updated} activities with collegeId`);
    } catch (error) {
        console.error('❌ Error migrating activities:', error.message);
    }
}

async function verifyMigration() {
    console.log('\n🔍 Verifying Migration...');
    
    const checks = [
        { model: PostModel, name: 'Posts' },
        { model: EventModel, name: 'Events' },
        { model: SuccessStoryModel, name: 'Success Stories' },
        { model: DonationModel, name: 'Donations' },
        { model: NotificationModel, name: 'Notifications' },
        { model: ConnectionModel, name: 'Connections' },
        { model: ActivityModel, name: 'Activities' }
    ];
    
    for (const check of checks) {
        const withoutCollege = await check.model.countDocuments({ collegeId: { $exists: false } });
        const withCollege = await check.model.countDocuments({ collegeId: { $exists: true } });
        console.log(`${check.name}: ${withCollege} with collegeId, ${withoutCollege} without`);
    }
}

async function main() {
    console.log('🚀 Starting College ID Migration...\n');
    console.log('This script will add collegeId to existing records.');
    console.log('Database:', MONGODB_URI);
    
    await connectDB();
    
    // Run migrations
    await migratePosts();
    await migrateEvents();
    await migrateSuccessStories();
    await migrateDonations();
    await migrateNotifications();
    await migrateConnections();
    await migrateActivities();
    
    // Verify
    await verifyMigration();
    
    console.log('\n✅ Migration completed!');
    console.log('\n⚠️  IMPORTANT: Review the results above.');
    console.log('Records without collegeId may need manual intervention.');
    
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
}

// Run migration
main().catch(error => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
});
