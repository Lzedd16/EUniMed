const mongoose = require('mongoose');

const dentalScheduleSchema = new mongoose.Schema({
    studId: {
        type: String, // Change this to String
        required: true,
        ref: 'User' // Ensure this references the correct model
    },
    date: {
        type: String, // 'YYYY-MM-DD' format or Date type
        required: true
    },
    time: {
        type: String, // 'HH:MM AM/PM'
        required: true
    },
    procedure: {
        type: String,
        default: 'Tooth Extraction'
    },
    notes: {
        type: String,
        default: ''
    }
});

const DentalSchedule = mongoose.model('DentalSchedule', dentalScheduleSchema);
module.exports = DentalSchedule;
