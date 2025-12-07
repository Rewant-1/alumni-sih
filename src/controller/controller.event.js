const EventService = require("../service/service.event.js");
const EventModel = require("../model/model.event.js");
const { sendSuccess, sendError, sendNotFound } = require("../../utils/response");

const createEvent = async (req, res) => {
  try {
    const collegeId = req.user.collegeId;
    const eventData = {
      ...req.body,
      createdBy: req.user.userId
    };
    const event = await EventService.createEvent(eventData, collegeId);
    return sendSuccess(res, event, "Event created successfully", 201);
  } catch (error) {
    console.error("Error creating event:", error);
    return sendError(res, "Failed to create event", 500, error.message);
  }
};

const getEvents = async (req, res) => {
  try {
    const collegeId = req.user.collegeId;
    const filters = {};
    
    // Optional status filter
    if (req.query.status) {
      filters.status = req.query.status;
    }
    
    const events = await EventService.getEvents(collegeId, filters);
    return sendSuccess(res, events, "Events fetched successfully");
  } catch (error) {
    console.error("Error fetching events:", error);
    return sendError(res, "Failed to fetch events", 500, error.message);
  }
};

const getEventById = async (req, res) => {
  try {
    const collegeId = req.user.collegeId;
    const event = await EventService.getEventById(req.params.id, collegeId);
    
    if (!event) {
      return sendNotFound(res, "Event not found or access denied");
    }
    
    return sendSuccess(res, event, "Event fetched successfully");
  } catch (error) {
    console.error("Error fetching event:", error);
    return sendError(res, "Failed to fetch event", 500, error.message);
  }
};

const updateEvent = async (req, res) => {
  try {
    const collegeId = req.user.collegeId;
    const event = await EventService.updateEvent(req.params.id, req.body, collegeId);
    
    if (!event) {
      return sendNotFound(res, "Event not found or access denied");
    }
    
    return sendSuccess(res, event, "Event updated successfully");
  } catch (error) {
    console.error("Error updating event:", error);
    return sendError(res, "Failed to update event", 500, error.message);
  }
};

const deleteEvent = async (req, res) => {
  try {
    const collegeId = req.user.collegeId;
    const event = await EventService.deleteEvent(req.params.id, collegeId);
    
    if (!event) {
      return sendNotFound(res, "Event not found or access denied");
    }
    
    return res.status(204).send();
  } catch (error) {
    console.error("Error deleting event:", error);
    return sendError(res, "Failed to delete event", 500, error.message);
  }
};

// Register for event
const registerForEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const collegeId = req.user.collegeId;

    const event = await EventModel.findOne({ _id: id, collegeId });
    if (!event) {
      return res.status(404).json({ 
        success: false, 
        message: "Event not found or access denied" 
      });
    }

    // Check if already registered
    const isRegistered = event.registeredUsers.some(
      regUserId => regUserId.toString() === userId
    );

    if (isRegistered) {
      return res.status(400).json({
        success: false,
        message: "Already registered for this event"
      });
    }

    // Check max capacity
    if (event.maxCapacity && event.currentRegistrations >= event.maxCapacity) {
      // Add to waitlist if enabled
      if (event.waitlistEnabled) {
        event.waitlist.push({ userId });
        await event.save();
        return res.status(200).json({
          success: true,
          message: "Event is full. Added to waitlist",
          waitlisted: true
        });
      }
      
      return res.status(400).json({
        success: false,
        message: "Event is full"
      });
    }

    // Register user
    event.registeredUsers.push(userId);
    event.currentRegistrations = event.registeredUsers.length;
    
    // If paid event, add to tickets with pending status
    if (event.isPaid) {
      event.tickets.push({
        userId,
        amount: event.ticketPrice,
        paymentStatus: 'pending'
      });
    }

    await event.save();

    res.status(200).json({
      success: true,
      message: "Successfully registered for event"
    });
  } catch (error) {
    console.error("Error registering for event:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Get my registered events
const getMyEvents = async (req, res) => {
  try {
    const userId = req.user.userId;
    const collegeId = req.user.collegeId;
    
    const events = await EventModel.find({
      registeredUsers: userId,
      collegeId: collegeId
    })
    .select('title description date endDate venue type category coverImage status')
    .sort({ date: 1 });

    res.status(200).json({
      success: true,
      data: events,
      count: events.length
    });
  } catch (error) {
    console.error("Error fetching my events:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  registerForEvent,
  getMyEvents,
};
