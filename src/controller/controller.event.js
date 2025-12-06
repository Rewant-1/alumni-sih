const EventService = require("../service/service.event.js");
const EventModel = require("../model/model.event.js");

const createEvent = async (req, res) => {
  try {
    const event = await EventService.createEvent(req.body);
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getEvents = async (req, res) => {
  try {
    const events = await EventService.getEvents();
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getEventById = async (req, res) => {
  try {
    const event = await EventService.getEventById(req.params.id);
    if (event) {
      res.status(200).json(event);
    } else {
      res.status(404).json({ message: "Event not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateEvent = async (req, res) => {
  try {
    const event = await EventService.updateEvent(req.params.id, req.body);
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteEvent = async (req, res) => {
  try {
    await EventService.deleteEvent(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Register for event
const registerForEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const event = await EventModel.findById(id);
    if (!event) {
      return res.status(404).json({ 
        success: false, 
        message: "Event not found" 
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
    
    const events = await EventModel.find({
      registeredUsers: userId
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
