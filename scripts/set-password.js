require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const UserModel = require('../src/model/model.user');

async function main(){
  const email = process.argv[2];
  const newPass = process.argv[3];
  if(!email || !newPass){
    console.error('Usage: node scripts/set-password.js <email> <newPassword>');
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGODB_URI);
  const hash = await bcrypt.hash(newPass, 10);
  const r = await UserModel.findOneAndUpdate({ email }, { passwordHash: hash });
  console.log('Updated:', !!r);
  await mongoose.disconnect();
}

main().catch(e=>{console.error(e); process.exit(1)});
