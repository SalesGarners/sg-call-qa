import bcrypt from 'bcryptjs';

const password = process.argv[2];

if (!password) {
  console.error("Please provide a password to hash.");
  console.log("Usage: node hashPassword.js <your_password>");
  process.exit(1);
}

const saltRounds = 10;
const hash = bcrypt.hashSync(password, saltRounds);

console.log("\nPassword:", password);
console.log("Hashed Password:", hash);
console.log("\nUse this hashed password when manually creating users in your MongoDB 'Users' collection.\n");
