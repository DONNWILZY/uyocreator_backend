const User = require('../models/User');
const UserSettings = require('../models/UserSettings');

// Create a new user
const user = new User({
  name: 'John Doe',
  email: 'johndoe@example.com',
  password: 'hashedpassword',
  phoneNumber: '1234567890',
});

// Create user settings
const userSettings = new UserSettings({
  userId: user._id,
  mfaEnabled: true,
  mfaMethod: 'email',
});

// Save user and settings
user.save().then(() => {
  userSettings.save().then(() => {
    console.log('User and settings saved');
  });
});