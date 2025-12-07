const bcrypt = require('bcryptjs');
const hash = '$2b$10$odz3.iPqKyPTc46oz8mw5OrCCC7xZnIr1S.54N6uJvkkx149rB3c.';
(async()=>{
  const ok = await bcrypt.compare('Password123!', hash);
  console.log('match?', ok);
})();
