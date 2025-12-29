const User = require("../models/User");
const bcrypt = require("bcryptjs");

async function isDoubleHashed(passwordHash) {
  if (passwordHash.length > 60) {
    return true;
  }

  if (!passwordHash.startsWith('$2a$') && !passwordHash.startsWith('$2b$')) {
    return true;
  }
  return false;
}

async function fixUserPassword(userId, newPassword) {
  try {
    const user = await User.findById(userId);
    if (!user) {
      console.log(`User ${userId} not found`);
      return false;
    }
    const isDouble = await isDoubleHashed(user.password);
    
    if (isDouble) {
      console.log(`Fixing double-hashed password for user: ${user.username}`);
      user.password = newPassword; 
      await user.save();
      console.log(`Password fixed for user: ${user.username}`);
      return true;
    } else {
      console.log(`Password for user ${user.username} appears to be correctly hashed`);
      return false;
    }
  } catch (err) {
    console.error(`Error fixing password for user ${userId}:`, err);
    return false;
  }
}

async function fixAllUsers() {
  console.log('Checking for users with double-hashed passwords...');
  const users = await User.find({ isActive: true });
  
  for (const user of users) {
    const isDouble = await isDoubleHashed(user.password);
    if (isDouble) {
      console.log(`User ${user.username} (${user.role}) has a double-hashed password`);
      console.log(`   Password hash length: ${user.password.length}`);
      console.log(`   Please reset this user's password through the admin panel`);
    }
  }
  
  console.log('Done checking users.');
}

module.exports = {
  fixUserPassword,
  fixAllUsers,
  isDoubleHashed
};

