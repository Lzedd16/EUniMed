const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const appointmentSchema = new Schema({
    studId: { 
        type: String, 
        required: true,
        ref: 'User', // Reference to User model
    },
    studName: { // Add studName field
        type: String,
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    timeSlot: {
        type: String,
        enum: [
            '8:00 AM - 9:00 AM', 
            '9:00 AM - 10:00 AM', 
            '1:00 PM - 2:00 PM', 
            '2:00 PM - 3:00 PM', 
            '3:00 PM - 4:00 PM'
        ],
        required: true,
    },
    status: {
        type: String,
        enum: ['booked', 'cancelled', 'done'],
        default: 'booked',
    },
});

// Static method to check if a slot is available for a specific date and time slot
appointmentSchema.statics.isSlotAvailable = async function(date, timeSlot) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const count = await this.countDocuments({
        date: { $gte: startOfDay, $lt: endOfDay },
        timeSlot,
    });

    return count < 5;
};

module.exports = mongoose.model('Appointment', appointmentSchema);
