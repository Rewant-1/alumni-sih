require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const UserModel = require('../src/model/model.user');

async function main(){
  const email = process.argv[2];
  const pass = process.argv[3];
  if(!email || !pass){
    console.error('Usage: node scripts/verify-login.js <email> <password>');
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGODB_URI);
  const user = await UserModel.findOne({ email }).lean();
  if(!user){
    console.log('User not found');
    await mongoose.disconnect();
    process.exit(0);
  }
  console.log('User found:', { email: user.email, userType: user.userType, profileDetails: user.profileDetails ? user.profileDetails.toString() : null });
  console.log('Stored passwordHash:', user.passwordHash);
  const ok = await bcrypt.compare(pass, user.passwordHash);
  console.log('Password match:', ok);
  await mongoose.disconnect();
}

main().catch(e=>{ console.error(e); process.exit(1); });
