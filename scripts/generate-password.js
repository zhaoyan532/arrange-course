const bcrypt = require('bcryptjs');

async function generatePassword() {
  const password = '123456';
  const hash = await bcrypt.hash(password, 10);
  console.log('Password hash for "123456":', hash);
}

generatePassword();
