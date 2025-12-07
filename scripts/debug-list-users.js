require('dotenv').config();
const mongoose = require('mongoose');
const UserModel = require('../src/model/model.user');

async function main(){
  const uri = process.env.MONGODB_URI;
  if(!uri){
    console.error('MONGODB_URI not found in .env');
    process.exit(1);
  }
  await mongoose.connect(uri);
  const users = await UserModel.find().limit(10).select('email userType profileDetails');
  console.log('Found users:');
  users.forEach(u => console.log('-', u.email, u.userType, u.profileDetails ? u.profileDetails.toString() : 'no-profile'));
  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
