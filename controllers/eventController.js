const eventService = require('../services/eventService');
const AppError = require('../utilities/appError');

const eventController = {
  // Create event
  async createEvent(req, res, next) {
    try {
      const event = await eventService.createEvent(req.body);
      res.status(201).json({
        status: 'success',
        message: 'Event created successfully',
        data: event,
      });
    } catch (error) {
      next(error);
    }
  },

  // Add or update activities
  async addOrUpdateActivities(req, res, next) {
    const { eventId, day, activities } = req.body;
    try {
      const event = await eventService.addOrUpdateActivities(eventId, day, activities);
      res.status(200).json({
        status: 'success',
        message: 'Activities updated successfully',
        data: event,
      });
    } catch (error) {
      next(error);
    }
  },

  // Add or update sponsors
  async addOrUpdateSponsors(req, res, next) {
    const { eventId, sponsors } = req.body;
    try {
      const event = await eventService.addOrUpdateSponsors(eventId, sponsors);
      res.status(200).json({
        status: 'success',
        message: 'Sponsors updated successfully',
        data: event,
      });
    } catch (error) {
      next(error);
    }
  },

  // Add or update volunteers
  async addOrUpdateVolunteers(req, res, next) {
    const { eventId, volunteers } = req.body;
    try {
      const event = await eventService.addOrUpdateVolunteers(eventId, volunteers);
      res.status(200).json({
        status: 'success',
        message: 'Volunteers updated successfully',
        data: event,
      });
    } catch (error) {
      next(error);
    }
  },

  // Book attendee
// Book attendee controller
async  bookAttendee(req, res, next) {
  const { eventId, userId } = req.body;
  try {
      const event = await eventService.bookAttendee(eventId, userId);
      res.status(200).json({
          status: 'success',
          message: 'Attendee booked successfully',
          data: event,
      });
  } catch (error) {
      // If it's an instance of AppError, return the error message and status code
      if (error instanceof AppError) {
          return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);  // For other errors, pass to global error handler
  }
},


  // Get event by ID
  async getEventById(req, res, next) {
    const { eventId } = req.params;
    try {
      const event = await eventService.getEventById(eventId);
      res.status(200).json({
        status: 'success',
        data: event,
      });
    } catch (error) {
      next(error);
    }
  },

  // Get all events
  async getAllEvents(req, res, next) {
    try {
      const events = await eventService.getAllEvents();
      res.status(200).json({
        status: 'success',
        data: events,
      });
    } catch (error) {
      next(error);
    }
  },

  // Get events for a specific user
  async getEventsByUser(req, res, next) {
    const { userId } = req.params;
    try {
      const events = await eventService.getEventsByUser(userId);
      res.status(200).json({
        status: 'success',
        data: events,
      });
    } catch (error) {
      next(error);
    }
  },

  // Get single event by a specific user
  async getSingleEventByUser(req, res, next) {
    const { eventId, userId } = req.params;
    try {
      const event = await eventService.getSingleEventByUser(eventId, userId);
      res.status(200).json({
        status: 'success',
        data: event,
      });
    } catch (error) {
      next(error);
    }
  },

  // Get event by event number
async getEventByEventNumber(req, res, next) {
  const { eventNumber } = req.params;
  try {
    const event = await eventService.getEventByEventNumber(eventNumber);
    res.status(200).json({
      status: 'success',
      data: event,
    });
  } catch (error) {
    next(error);
  }
}
};

module.exports = eventController;
