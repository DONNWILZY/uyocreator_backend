const Event = require('../models/Event');
const AppError = require('../utilities/appError');
const generateCode = require('../utilities/autoGenCode'); // Import code generator

const eventService = {
  // Create a new event
  async createEvent(eventData) {
    try {
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
  async bookAttendee(eventId, userId) {
    const event = await Event.findById(eventId);
    if (!event) throw new AppError('Event not found', 404);

    if (event.attendees.length >= event.maxAttendees) {
      throw new AppError('Event is fully booked', 400);
    }

    // Get the next available seat number (excluding reserved seats)
    const reservedSeats = event.reservedSeats || [];
    const allSeats = [...event.attendees.map((att) => att.seatNumber), ...reservedSeats];
    let seatNumber = 1;
    while (allSeats.includes(seatNumber)) {
      seatNumber++;
    }

    // Generate a ticket number using the autoGenCode utility
    const ticketNumber = `TICKET-${generateCode.generateAlpha(8).toUpperCase()}`; // e.g., "TICKET-HGFedcba"
    event.attendees.push({ userId, status: 'booked', ticketNumber, seatNumber });

    await event.save();
    return event;
  },

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
  }
};

module.exports = eventService;
