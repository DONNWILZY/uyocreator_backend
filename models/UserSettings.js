//models\UserSettings.js

const mongoose = require('mongoose');

const UserSettingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  lockUntil: {
    type: Date,
  },
  mfaEnabled: {
    type: Boolean,
    default: false,
  },
  mfaMethod: {
    type: String,
    enum: ['email', 'sms'],
  },
}, {
  timestamps: true,
});

const UserSettings = mongoose.model('UserSettings', UserSettingsSchema);

module.exports = UserSettings;
