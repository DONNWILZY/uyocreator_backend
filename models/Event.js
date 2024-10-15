const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const eventSchema = new Schema({
    
    title: { type: String, required: true },
    eventNumber: { type: String, unique: true },
    theme: {type: String},
    image: { type: String },
    waterMark: { type: String,},
    venue: { type: String,},
    description: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date }, // Optional for multi-day events
    isFree: { type: Boolean, default: true },
    price: { type: Number }, // For paid events
    displayVolunteers: { type: Boolean, default: true },
    attendees: [
        {
            userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
            status: { type: String, enum: ['booked', 'waitlisted'], default: 'booked' },
            ticketNumber: { type: String, required: true },
            seatNumber: { type: Number, required: true },
        }
    ],
    reservedSeats: [{ type: Number }], // Reserved seat numbers to skip
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
            userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
            role: { type: String }
        }
    ],
    speakers: [
        {
            
            photo: String,
            name: String,
            topic: String
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
            userId: { type: Schema.Types.ObjectId, ref: 'User'},
            department: { type: String }
        }
    ],
    maxAttendees: { type: Number }, // Maximum number of attendees
    status: { type: String, enum: ['upcoming', 'ongoing', 'ended'], default: 'upcoming' },
    payments: [{ 
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        amountPaid: Number,
        paymentMethod: { type: String, enum: ['Paystack', 'Offline'] },
        paymentStatus: { type: String, enum: ['pending', 'confirmed', 'rejected'], default: 'pending' }
    }],
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
