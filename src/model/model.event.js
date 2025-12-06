const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  date: { type: Date, required: true },
  venue: { type: String },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  registeredUsers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],

  createdAt: { type: Date, default: Date.now },
  event_id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  status: { type: String, enum: ["scheduled", "completed", "cancelled"], default: "scheduled" },
  event_type: { type: String },
  location: { type: String },
  organizer: { type: String },
  audience: { type: String },
  registration_link: { type: String },
});

module.exports = mongoose.model("Event", eventSchema);
