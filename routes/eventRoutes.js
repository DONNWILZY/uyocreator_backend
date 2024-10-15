const express = require('express');
const eventController = require('../controllers/eventController');
const router = express.Router();
const cors = require('cors');
router.use(cors());

// Create event
router.post('/create', eventController.createEvent);

// Add/Update activities
router.put('/activities', eventController.addOrUpdateActivities);

// Add/Update sponsors
router.put('/sponsors', eventController.addOrUpdateSponsors);

// Add/Update volunteers
router.put('/volunteers', eventController.addOrUpdateVolunteers);

// Book attendee
router.post('/book', eventController.bookAttendee);

// Get all events
router.get('/', eventController.getAllEvents);

// Get event by ID
router.get('/:eventId', eventController.getEventById);

// Get events for a specific user
router.get('/user/:userId', eventController.getEventsByUser);

// Get single event for a specific user
router.get('/:eventId/user/:userId', eventController.getSingleEventByUser);

// get event with event numnber
router.get('/reserve/:eventNumber', eventController.getEventByEventNumber);


module.exports = router;
