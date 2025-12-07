require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const UserModel = require('../src/model/model.user');

async function main(){
  await mongoose.connect(process.env.MONGODB_URI);
  const users = await UserModel.find().lean().limit(10);
  if(!users || users.length === 0){
    console.log('No users found');
    await mongoose.disconnect();
    return;
  }

  const candidates = [
    'Password123!',
    'Password123',
    'Password@123',
    'Password1234!',
    'Password!123',
    'password123!',
    'Password123! ', // trailing space
    ' Password123!', // leading space
    'Password123!!',
    'Default123!',
  ];

  for(const user of users){
    console.log('\nChecking user:', user.email);
    const hash = user.passwordHash;
    for(const c of candidates){
      try{
        const ok = await bcrypt.compare(c, hash);
        if(ok){
          console.log(`  MATCH -> candidate: "${c}"`);
          break;
        }
      } catch(e){
        console.error('  compare error for candidate', c, e.message);
      }
    }
  }

  await mongoose.disconnect();
}

main().catch(e=>{ console.error('Error:', e); process.exit(1); });
