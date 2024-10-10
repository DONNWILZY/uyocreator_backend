const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const membershipSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    fullName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    emailAddress: { type: String, required: true },
    specialty: { type: String, required: true },
    brandName: { type: String },
    gender: { type: String, enum: ['male', 'female', 'non-binary', 'prefer-not-to-say'] },
    city: { type: String },
    facebookHandle: { type: String },
    tiktokHandle: { type: String },
    instagramHandle: { type: String },
    twitterHandle: { type: String },
    linkedInHandle: { type: String },
    website: { type: String },
    additionalInfo: { type: String },
    // Approval status
    isApproved: { type: Boolean, default: false },
    // Timestamps
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const Membership = mongoose.model('Membership', membershipSchema);
module.exports = Membership;
