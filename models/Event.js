const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const eventSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date }, // Optional for multi-day events
    isFree: { type: Boolean, default: true },
    price: { type: Number }, // For paid events
    attendees: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    waitlist: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    agenda: [
        {
            day: Number,
            activities: [
                {
                    time: String, // e.g. "10:40 - 11:00"
                    title: String,
                    duration: String, // e.g. "20 mins"
                    speaker: { type: Schema.Types.ObjectId, ref: 'User' }, // Optional if speakers are enabled
                }
            ]
        }
    ],
    organizers: [
        {
            name: String,
            role: String,
        }
    ],
    sponsors: [
        {
            company: String,
            logoUrl: String,
        }
    ],
    volunteers: [
        {
            name: String,
            department: String,
        }
    ],
    status: { type: String, enum: ['upcoming', 'ongoing', 'ended'], default: 'upcoming' },
    // Payment details if event is paid
    payments: [{ 
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        amountPaid: Number,
        paymentMethod: { type: String, enum: ['Paystack', 'Offline'] },
        paymentStatus: { type: String, enum: ['pending', 'confirmed', 'rejected'], default: 'pending' }
    }],
    // Post-event details
    feedback: [
        {
            userId: { type: Schema.Types.ObjectId, ref: 'User' },
            comment: String,
            rating: Number, // Out of 5 stars
        }
    ],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const Event = mongoose.model('Event', eventSchema);
module.exports = Event;
