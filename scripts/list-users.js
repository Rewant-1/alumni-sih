require('dotenv').config();
const mongoose = require('mongoose');
const UserModel = require('../src/model/model.user');

async function main(){
  console.log('Using MONGODB_URI:', process.env.MONGODB_URI ? process.env.MONGODB_URI.split('@')[1] : 'NO_URI');
  await mongoose.connect(process.env.MONGODB_URI);
  const users = await UserModel.find().lean().limit(100);
  if(!users || users.length === 0){
    console.log('No users found');
  } else {
    console.log(`Found ${users.length} users (showing email | passwordHash):`);
    users.forEach(u => {
      console.log(`${u.email} | ${u.passwordHash}`);
    });
  }
  await mongoose.disconnect();
}

main().catch(e=>{ console.error('Error listing users:', e); process.exit(1); });
