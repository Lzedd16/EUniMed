const mongoose = require('mongoose');

const AppointmentHistorySchema = new mongoose.Schema({
  studId: { type: String, required: true },
  studName: { type: String, required: true },
  date: { type: Date, required: true },
  timeSlot: { type: String, required: true },
  action: { type: String, required: true }, // Action (e.g., 'Done', 'Cancelled', 'Deleted')
}, { timestamps: true });

module.exports = mongoose.model('AppointmentHistory', AppointmentHistorySchema);
