const Event = require("../model/model.event.js");

const createEvent = async (eventData, collegeId) => {
  try {
    const newEvent = new Event({
      ...eventData,
      collegeId: collegeId
    });
    const savedEvent = await newEvent.save();
    return savedEvent;
  } catch (error) {
    throw error;
  }
};

const getEvents = async (collegeId, filters = {}) => {
  try {
    // Always filter by collegeId
    const query = { collegeId, ...filters };
    const events = await Event.find(query)
      .populate("createdBy", "name email")
      .populate("registeredUsers", "name email")
      .sort({ date: 1 });
    return events;
  } catch (error) {
    throw error;
  }
};

const getEventById = async (eventId, collegeId) => {
  try {
    // Must match both eventId and collegeId
    const event = await Event.findOne({ _id: eventId, collegeId })
      .populate("createdBy", "name email")
      .populate("registeredUsers", "name email");
    return event;
  } catch (error) {
    throw error;
  }
};

const updateEvent = async (eventId, eventData, collegeId) => {
  try {
    // Only update if event belongs to college
    const updatedEvent = await Event.findOneAndUpdate(
      { _id: eventId, collegeId },
      eventData,
      { new: true }
    );
    return updatedEvent;
  } catch (error) {
    throw error;
  }
};

const deleteEvent = async (eventId, collegeId) => {
  try {
    // Only delete if event belongs to college
    const deletedEvent = await Event.findOneAndDelete({ 
      _id: eventId, 
      collegeId 
    });
    return deletedEvent;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
};
