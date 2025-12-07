require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const UserModel = require('../src/model/model.user');

async function main(){
  const outDir = path.join(__dirname);
  await mongoose.connect(process.env.MONGODB_URI);
  const total = await UserModel.countDocuments();
  console.log('Total users:', total);
  const users = await UserModel.find().select('email name userType profileDetails createdAt').lean();
  const jsonPath = path.join(outDir, 'users.json');
  const csvPath = path.join(outDir, 'users.csv');
  fs.writeFileSync(jsonPath, JSON.stringify(users, null, 2));
  const csvStream = fs.createWriteStream(csvPath);
  csvStream.write('email,name,userType,profileDetails,createdAt\n');
  users.forEach(u => {
    const line = [
      '"' + (u.email || '') + '"',
      '"' + (u.name || '') + '"',
      '"' + (u.userType || '') + '"',
      '"' + (u.profileDetails ? u.profileDetails.toString() : '') + '"',
      '"' + (u.createdAt ? new Date(u.createdAt).toISOString() : '') + '"'
    ].join(',') + '\n';
    csvStream.write(line);
  });
  csvStream.end();
  await mongoose.disconnect();
  console.log('Exported', users.length, 'users to', jsonPath, 'and', csvPath);
}

main().catch(err=>{ console.error(err); process.exit(1); });
