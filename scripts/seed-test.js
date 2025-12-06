/*
  Minimal Test Seed Script
*/

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserModel = require('../src/model/model.user');
const AlumniModel = require('../src/model/model.alumni');

const { MONGO_URI } = require('../config');

async function main() {
    console.log('Starting minimal seed test...\n');

    try {
        console.log('1. Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('   ✓ Connected\n');

        console.log('2. Hashing password...');
        const passwordHash = await bcrypt.hash('Password123!', 10);
        console.log('   ✓ Password hashed\n');

        console.log('3. Cleaning up test user...');
        await UserModel.deleteOne({ email: 'test.alumni@example.com' });
        console.log('   ✓ Cleaned\n');

        console.log('4. Creating test user...');
        const user = await UserModel.create({
            name: 'Test Alumni',
            email: 'test.alumni@example.com',
            passwordHash: passwordHash,
            userType: 'Alumni'
        });
        console.log('   ✓ User created:', user._id, '\n');

        console.log('5. Creating alumni profile...');
        const alumni = await AlumniModel.create({
            userId: user._id,
            graduationYear: 2024,
            degreeUrl: 'https://example.com/degree.pdf',
            skills: ['JavaScript', 'Python'],
            verified: true
        });
        console.log('   ✓ Alumni profile created:', alumni._id, '\n');

        console.log('6. Linking profile to user...');
        user.profileDetails = alumni._id;
        await user.save();
        console.log('   ✓ Linked\n');

        console.log('═══════════════════════════════════════');
        console.log('        🎉 TEST PASSED! 🎉');
        console.log('═══════════════════════════════════════\n');
        console.log('Login: test.alumni@example.com / Password123!\n');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ ERROR at step above:');
        console.error('   Message:', error.message);
        console.error('   Name:', error.name);
        if (error.errors) {
            console.error('   Validation errors:', JSON.stringify(error.errors, null, 2));
        }
        console.error('\nFull error:', error);
        process.exit(1);
    }
}

main();
