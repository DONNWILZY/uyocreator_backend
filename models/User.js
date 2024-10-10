const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    role: { 
        type: String, 
        enum: ['User', 'Admin', 'SuperAdmin'], 
        default: 'User' 
    },
    isMember: { type: Boolean, default: false },
    membershipDate: { type: Date },
    kyc: {
        areaOfSpecialty: String,
        brandName: String,
        gender: { type: String, enum: ['male', 'female', 'non-binary', 'prefer-not-to-say'] },
        city: String,
        facebookHandle: String,
        tiktokHandle: String,
        instagramHandle: String,
        twitterHandle: String,
        linkedInHandle: String,
        website: String,
        additionalInfo: String,
    },
    // Timestamps
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
module.exports = User;
