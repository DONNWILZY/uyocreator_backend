const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { 
        type: String, 
        enum: ['inApp', 'push', 'email'], 
        required: true 
    },  // Can be inApp, push, or email
    title: { type: String, required: true },
    message: { type: String, required: true },
    status: { 
        type: String, 
        enum: ['unread', 'read'], 
        default: 'unread' 
    },
    sentAt: { type: Date, default: Date.now },
    isPushSent: { type: Boolean, default: false }, // Push notification status
    isEmailSent: { type: Boolean, default: false }, // Email status
});

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
