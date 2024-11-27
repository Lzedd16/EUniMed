
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); 
const User = require('./models/User');
const Appointment = require('./models/Appointment');
const DentalSchedule = require('./models/DentalSchedule');
const cors = require('cors');
require('dotenv').config(); 
const bodyParser = require('body-parser');
const app = express();
const PORT = 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret'; 
const validator = require('validator');
const AppointmentHistory = require('./models/AppointmentHistory');

const allowedOrigins = [
    'http://localhost:3000',
    'http://192.168.18.4:3000',
    'http://localhost:8081',
    'http://localhost:5000' // Your local IP address
];

app.use(bodyParser.json());

const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Access token required' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Invalid or expired token' });
    }
};

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'], // Specify allowed methods
    credentials: true, // Allow credentials if needed
}));

app.use(express.json());

mongoose.connect('mongodb://localhost:27017/clinic_db')
  .then(() => {
    console.log('Connected to MongoDB');
    createDefaultClinicAdmin();
  })
  .catch(err => console.log('Database connection error:', err));


  app.get('/api/student/profile', authenticateToken, async (req, res) => {
    try {
        // Find the user by email in the decoded token
        const user = await User.findOne({ email: req.user.email, role: 'student' });
        
        if (!user) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        // Send the profile data as response, including the email
        res.json({
            studId: user.studId,
            studName: user.studName,
            email: user.email,
            department: user.department,
            course: user.course,
            medicalHistory: user.medicalHistory,
        });
    } catch (error) {
        console.error('Profile retrieval error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});


  app.post('/api/student/register', async (req, res) => {
    const { email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        return res.status(400).json({ message: 'Passwords do not match' });
    }

    try {
        const existingStudent = await User.findOne({ email, role: 'student' });
        if (existingStudent) {
            return res.status(400).json({ message: 'Email is already registered for a student' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const newStudent = new User({
            email,
            password: hashedPassword,
            role: "student",
        });
        
        await newStudent.save();
        res.json({ message: 'Registered successfully' });
    } catch (error) {
        console.error('Registration error:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

  app.put('/api/student/profile', async (req, res) => {
    const { email, studName, studId, department, course } = req.body;

    const coursesByDepartment = {
        CCMS: [
            "Bachelor of Science in Computer Science",
            "Bachelor of Science in Information Technology",
            "Bachelor of Science in Entertainment and Multimedia Computing"
        ],
        CHITM: [
            "Bachelor of Science in Tourism Management",
            "Bachelor of Science in Hospitality Management"
        ],
        CNAHS: [
            "Bachelor of Science in Nursing",
            "Bachelor of Science in Medical Technology"
        ],
        CENG: [
            "Bachelor of Science in Civil Engineering",
            "Bachelor of Science in Computer Engineering",
            "Bachelor of Science in Electric Engineering",
            "Bachelor of Science in Electronics Engineering",
            "Bachelor of Science in Geodetic Engineering",
            "Bachelor of Science in Industrial Engineering",
            "Bachelor of Science in Mechanical Engineering"
        ],
        CAFA: [
            "Bachelor of Science in Architecture",
            "Bachelor of Fine Arts"
        ],
        CAS: [
            "Bachelor of Arts in Communication",
            "Bachelor of Science in Psychology",
            "Bachelor of Arts in Political Science",
            "Bachelor of Arts in English Language",
            "Bachelor of Science in Biology",
            "Bachelor of Science in Economics",
            "Bachelor of Science in Environmental Sciences",
            "Bachelor of Science in Public Administration"
        ],
        CCJC: ["Bachelor of Science in Criminology"],
        CME: [
            "Bachelor of Science in Marine Engineering",
            "Bachelor of Science in Marine Transportation"
        ],
        CBA: [
            "Bachelor of Science in Accountancy",
            "Bachelor of Science in (BA-MM)",
            "Bachelor of Science in (BA-HRM)",
            "Bachelor of Science in (BA-FM)",
            "Bachelor of Science in (BA-OM)",
            "Bachelor of Science in Management Accounting"
        ]
    };

    try {
        // Check if user exists and has student role
        const user = await User.findOne({ email, role: 'student' });
        if (!user) {
            return res.status(400).json({ message: 'Student account not found' });
        }

        // Validate department and course match
        if (!coursesByDepartment[department] || !coursesByDepartment[department].includes(course)) {
            return res.status(400).json({ 
                message: 'Invalid course selection for department: ${department}'
            });
        }

        // Update user fields
        user.email = email;
        user.studName = studName;
        user.studId = studId;
        user.department = department;
        user.course = course;

        await user.save();
        res.json({ message: 'Profile setup successful' });
    } catch (error) {
        console.error('Profile setup error:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});







app.post('/api/student/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Check if the provided password matches the stored password hash
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Generate a JWT token for the user
        const token = jwt.sign(
            { email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Return success response with the token and user information
        res.json({
            message: 'Login successful',
            token,
            email: user.email,
            studId: user.studId,
            studName: user.studName,
            department: user.department,
            course: user.course,
        });
    } catch (error) {
        console.error('Login error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});



async function createDefaultClinicAdmin() {
    try {
        const existingAdmin = await User.findOne({ username: 'mseufclinic' });
        if (!existingAdmin) {
            const password = 'mseufclinic'; 
            const hashedPassword = await bcrypt.hash(password, 10);
            const clinicAdmin = new User({
                username: 'mseufclinic',
                password: hashedPassword,
                role: 'clinic_admin',
            });
            await clinicAdmin.save();
            console.log('Default clinic admin created.');
        } else {
            console.log('Clinic admin already exists.');
        }
    } catch (error) {
        console.error('Error creating clinic admin:', error.message);
    }
}

app.patch('/api/users/:id/medical-history', async (req, res) => {
    const { id } = req.params;
    const { medicalHistory } = req.body;

    try {
        const user = await User.findByIdAndUpdate(
            id,
            { medicalHistory },
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'Medical history updated successfully', user });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get('/api/students', async (req, res) => {
    try {
        const students = await User.find({ role: 'student' });
        res.json(students);
    } catch (error) {
        console.error('Error fetching students:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

app.post('/api/admin/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user || user.role !== 'clinic_admin') {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign(
            { username: user.username, role: user.role }, 
            JWT_SECRET, 
            { expiresIn: '1h' }
        
        );
        
        res.json({ message: "login successful" });
    } catch (error) {
        console.error('Login error:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

app.post('/api/admin/appointments', async (req, res) => {
    const { studId, date, timeSlot } = req.body;

    try {
        // Find the user with the given student ID
        const user = await User.findOne({ studId });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        // Check if the user already has an appointment for the selected date and time slot
        const existingAppointment = await Appointment.findOne({
            studId,
            date: new Date(date).toISOString().split('T')[0], // Compare date without time part (YYYY-MM-DD)
            status: 'booked', // Only check for 'booked' status appointments
        });

        if (existingAppointment) {
            return res.status(400).json({ message: 'You already have an appointment for this day and time.' });
        }

        // Check if the slot is available
        const slotAvailable = await Appointment.isSlotAvailable(new Date(date), timeSlot);
        if (!slotAvailable) {
            return res.status(400).json({ message: 'Time slot is full' });
        }

        // Create the appointment with studName included
        const appointment = new Appointment({
            studId,
            studName: user.studName,  // Include studName from the User document
            date,
            timeSlot,
        });

        await appointment.save();
        res.json({ message: 'Appointment booked successfully.', appointment });
    } catch (error) {
        console.error('Error creating appointment:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});


app.patch('/api/admin/appointments/:appointmentId', async (req, res) => {
    const { appointmentId } = req.params;
    const { status } = req.body;

    try {
        const appointment = await Appointment.findByIdAndUpdate(
            appointmentId,
            { status },
            { new: true }
        );

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        res.json({ message: 'Appointment updated successfully', appointment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to update appointment status' });
    }
});




// Endpoint to check availability of time slots for a specific date
app.get('/api/admin/availability', async (req, res) => {
    const { date } = req.query;

    if (!date) {
        return res.status(400).json({ message: 'Date is required' });
    }

    try {
        const formattedDate = new Date(date);
        formattedDate.setHours(0, 0, 0, 0);

        const timeSlots = [
            '8:00 AM - 9:00 AM', 
            '9:00 AM - 10:00 AM', 
            '1:00 PM - 2:00 PM', 
            '2:00 PM - 3:00 PM', 
            '3:00 PM - 4:00 PM'
        ];

        const availability = await Promise.all(timeSlots.map(async (timeSlot) => {
            // Query for appointments on the selected date and time slot
            const appointments = await Appointment.find({
                date: { $gte: formattedDate, $lt: new Date(formattedDate).setHours(23, 59, 59, 999) },
                timeSlot,
            });

            console.log(`Time Slot: ${timeSlot}, Appointments Found:`, appointments); // Debugging line

            const bookedStudents = appointments.map(app => ({
                _id: app._id,          // Include the appointment ID
                name: app.studName,     // Student's name
                studId: app.studId,     // Student's ID
                status: app.status      // Appointment status
            }));
            const slotsRemaining = 5 - appointments.length;

            return {
                timeSlot,
                slotsRemaining: slotsRemaining > 0 ? slotsRemaining : 0,
                isAvailable: slotsRemaining > 0,
                bookedStudents
            };
        }));

        res.json(availability);
    } catch (error) {
        console.error('Error fetching availability:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// Example of backend DELETE logic
app.delete('/api/admin/appointments', async (req, res) => {
    const { studId, date, timeSlot } = req.body;
  
    try {
      const appointment = await Appointment.findOneAndDelete({
        studId,
        date,
        timeSlot,
      });
  
      if (!appointment) {
        return res.status(404).json({ message: 'Appointment not found' });
      }
  
      // Optionally, reset the availability status for this time slot in the database if needed
      await Appointment.updateOne(
        { timeSlot, date },
        { $set: { isAvailable: true } } // Mark the time slot as available again
      );
  
      res.status(200).json({ message: 'Appointment deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to delete appointment' });
    }
  });
  






app.get('/api/admin/appointments/:studId', async (req, res) => {
    const { studId } = req.params;

    try {
        // Find appointments for the given student ID
        const appointments = await Appointment.find({ studId });
        if (!appointments.length) {
            return res.status(404).json({ message: 'No appointments found for this student' });
        }

        res.json(appointments);
    } catch (error) {
        console.error('Error fetching appointments:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});


async function createDefaultClinicAdmin() {
    try {
        const existingAdmin = await User.findOne({ username: 'mseufclinic' });
        if (!existingAdmin) {
            const password = 'mseufclinic'; 
            const hashedPassword = await bcrypt.hash(password, 10);
            const clinicAdmin = new User({
                username: 'mseufclinic',
                password: hashedPassword,
                role: 'clinic_admin',
            });
            await clinicAdmin.save();
            console.log('Default clinic admin created.');
        } else {
            console.log('Clinic admin already exists.');
        }
    } catch (error) {
        console.error('Error creating clinic admin:', error.message);
    }
}

app.get('/api/students/:studId', async (req, res) => {
    const { studId } = req.params;

    try {
        const student = await User.findOne({ studId, role: 'student' });

        if (student) {
            res.status(200).json(student);
        } else {
            res.status(404).json({ message: 'Student not found' });
        }
    } catch (error) {
        console.error('Error fetching student:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

app.post('/api/dentalschedule', async (req, res) => {
    const { studId, date, time, procedure, notes } = req.body;

    try {
        const newSchedule = new DentalSchedule({ studId, date, time, procedure, notes });
        await newSchedule.save();
        res.status(201).json(newSchedule);
    } catch (error) {
        console.error('Error creating dental schedule:', error.message);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Validation error', error: error.message });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get all dental schedules with student details
app.delete('/api/dentalschedule/:id', async (req, res) => {
    try {
        const scheduleId = req.params.id;
        const deletedSchedule = await DentalSchedule.findByIdAndDelete(scheduleId);
        if (!deletedSchedule) {
            return res.status(404).json({ message: 'Schedule not found' });
        }
        res.status(200).json({ message: 'Schedule deleted successfully' });
    } catch (error) {
        console.error('Error deleting dental schedule:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Fetch all dental schedules with student details
app.get('/api/dentalschedule', async (req, res) => {
    try {
        const schedules = await DentalSchedule.find().sort({ date: 1, time: 1 }); // Sort by date and time

        // Create an array of studIds to look up student details
        const studIds = schedules.map(schedule => schedule.studId);

        // Fetch all students based on the collected studIds
        const users = await User.find({ studId: { $in: studIds } }).select('studId studName department');

        // Create a mapping of studId to user details for easy access
        const userMap = {};
        users.forEach(user => {
            userMap[user.studId] = user;
        });

        // Map the schedules to include user details
        const schedulesWithDetails = schedules.map(schedule => ({
            ...schedule.toObject(),
            user: userMap[schedule.studId] || null,
        }));

        res.status(200).json(schedulesWithDetails);
    } catch (error) {
        console.error('Error fetching dental schedules:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

app.listen(PORT, () => {
    console.log('Listening on Port 5000');
});