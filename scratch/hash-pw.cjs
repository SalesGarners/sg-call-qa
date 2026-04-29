const bcrypt = require('bcryptjs');

const password = process.argv[2];

if (!password) {
  console.log('Usage: node hash-pw.js <password>');
  process.exit(1);
}

bcrypt.hash(password, 10, (err, hash) => {
  if (err) {
    console.error('Error hashing password:', err);
    process.exit(1);
  }
  console.log('\n-----------------------------------');
  console.log('Original Password:', password);
  console.log('Hashed Password:  ', hash);
  console.log('-----------------------------------\n');
});
