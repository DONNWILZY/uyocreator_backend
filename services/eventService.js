// Import required modules
const fs = require('fs'); // File system module
const path = require('path');
const puppeteer = require('puppeteer');
const { generatePdfFromHtml } = require('./pdfService'); 

// Import models
const User = require('../models/User');
const Event = require('../models/Event');

// Import utilities
const AppError = require('../utilities/appError');
const generateCode = require('../utilities/autoGenCode'); // Import code generator

// Import email helper
const { sendEmail } = require('../mailHelpers/emailHelper');

const eventService = {
  // Create a new event
  async createEvent(eventData) {
    try {
      eventData.eventNumber = generateCode.generateAlpha(5).toUpperCase();
      const event = new Event(eventData);
      await event.save();
      return event;
    } catch (error) {
      throw new AppError('Error creating event', 500);
    }
  },

  // Add or update activities in the event
  async addOrUpdateActivities(eventId, day, activities) {
    const event = await Event.findById(eventId);
    if (!event) throw new AppError('Event not found', 404);

    const agendaItem = event.agenda.find((item) => item.day === day);
    if (agendaItem) {
      // Update activities for the given day
      agendaItem.activities = activities;
    } else {
      // Add new day with activities
      event.agenda.push({ day, activities });
    }

    await event.save();
    return event;
  },

  // Add or update sponsors
  async addOrUpdateSponsors(eventId, sponsors) {
    const event = await Event.findById(eventId);
    if (!event) throw new AppError('Event not found', 404);

    event.sponsors = sponsors;
    await event.save();
    return event;
  },

  // Add or update volunteers
  async addOrUpdateVolunteers(eventId, volunteers) {
    const event = await Event.findById(eventId);
    if (!event) throw new AppError('Event not found', 404);

    event.volunteers = volunteers;
    await event.save();
    return event;
  },


// Book an attendee and auto-assign seat number, generate ticket
async  bookAttendee(eventId, userId) {
    try {
      // Step 1: Find the event
      const event = await Event.findById(eventId);
      if (!event) throw new AppError('Event not found', 404);
  
      if (event.attendees.length >= event.maxAttendees) {
        throw new AppError('Event is fully booked', 400);
      }
  
      // Step 2: Check if the user has already booked
      const existingBooking = event.attendees.find(attendee => attendee.userId.toString() === userId.toString());
      if (existingBooking) {
        throw new AppError('You have already booked for this event', 400);
      }
  
      // Step 3: Find the next available seat number
      const reservedSeats = event.reservedSeats || [];
      const allSeats = [...event.attendees.map(att => att.seatNumber), ...reservedSeats];
      let seatNumber = 1;
      while (allSeats.includes(seatNumber)) {
        seatNumber++;
      }
  
      // Step 4: Generate a ticket number
      const ticketNumber = `${generateCode.generateAlpha(8).toUpperCase()}`;
  
      // Step 5: Get user's email and name
      const user = await User.findById(userId);
      if (!user) throw new AppError('User not found', 404);
      const { email, name } = user;
  
      // Step 6: Add the booking to the event
      event.attendees.push({ userId, status: 'booked', ticketNumber, seatNumber });
      await event.save();
  
      console.log('Event saved:', event);
  
      // Step 7: Read HTML template
      let htmlTemplate = fs.readFileSync(path.join(__dirname, '../resources/ticket.html'), 'utf-8');
  
      // Step 8: Replace placeholders in the HTML template with actual values
      htmlTemplate = htmlTemplate
      .replace('{{date}}', event.startDate)  
      .replace('{{title}}', event.title)
        .replace('{{ticketNumber}}', ticketNumber)
        .replace('{{seatNumber}}', seatNumber)
        .replace('{{attendeeName}}', name);
  
      // Step 9: Convert the filled HTML to a PDF using Puppeteer
      const pdfBuffer = await generatePdfFromHtml(htmlTemplate);
  
      // Step 10: Prepare email data and attachments
      const emailData = {
        email,
        subject: 'Ticket Confirmation',
        templateName: 'eventTicket',
        variables: {
          name,
          eventTitle: event.title,
          ticketNumber,
          seatNumber,
        }
      };
  
      const attachments = [
        {
          filename: 'Uyo Creators Week.pdf',
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ];
  
      console.log('Email data:', emailData); // Log email data for debugging
  
      // Step 11: Send email with PDF attachment
      await sendEmail(emailData.email, emailData.subject, emailData.templateName, emailData.variables, attachments);
  
      console.log('Email sent successfully');
      
      
      // Return the event data along with the attendee's data
    return {
      event: {
        ...event.toObject(),
        attendees: event.attendees.find(attendee => attendee.userId.toString() === userId.toString())
      }
    };

    } catch (error) {
      console.error('Error booking attendee:', error);
      throw error;
    }
  }
  ,
  


  // Update reserved seats
  async updateReservedSeats(eventId, reservedSeats) {
    const event = await Event.findById(eventId);
    if (!event) throw new AppError('Event not found', 404);

    event.reservedSeats = reservedSeats;
    await event.save();
    return event;
  },

  // Get event by ID
  async getEventById(eventId) {
    const event = await Event.findById(eventId).populate('attendees.userId', 'name email');
    if (!event) throw new AppError('Event not found', 404);
    return event;
  },

  // Get all events
  async getAllEvents() {
    return await Event.find().populate('attendees.userId', 'name email');
  },

  // Get events for a specific user
  async getEventsByUser(userId) {
    return await Event.find({ 'attendees.userId': userId }).populate('attendees.userId', 'name email');
  },

  // Get a single event by user
  async getSingleEventByUser(eventId, userId) {
    const event = await Event.findById(eventId).populate({
      path: 'attendees.userId',
      match: { _id: userId },
      select: 'name email'
    });
    if (!event) throw new AppError('Event not found', 404);
    return event;
  },

  // Get event by event number

async getEventByEventNumber(eventNumber) {
  const event = await Event.findOne({ eventNumber })
    .populate('attendees.userId', 'name avatar')
    .populate('organizers.userId', 'name avatar')
    .populate('volunteers.userId', 'name avatar');
  
  if (!event) throw new AppError('Event not found', 404);
  return event;
}


};

module.exports = eventService;
