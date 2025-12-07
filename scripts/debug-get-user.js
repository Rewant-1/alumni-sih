require('dotenv').config();
const mongoose = require('mongoose');
const UserModel = require('../src/model/model.user');

async function main(){
  await mongoose.connect(process.env.MONGODB_URI);
  const user = await UserModel.findOne({ email: 'rohan.verma0@gmail.com' }).lean();
  console.log(user);
  await mongoose.disconnect();
}

main().catch(e=>{console.error(e); process.exit(1)});
