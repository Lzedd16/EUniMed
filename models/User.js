const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        unique: true,
        sparse: true,
        validate: {
            validator: function(value) {
                return this.role !== 'student' || (value != null && /\S+@\S+\.\S+/.test(value));
            },
            message: 'Valid email is required for students',
        },
    },
    password: { 
        type: String, 
        required: true 
    },
    role: { 
        type: String, 
        default: 'clinic_admin' 
    },
    department: {
        type: String,
        enum: ['CCMS', 'CHITM', 'CNHAS', 'CENG', 'CAFA', 'CAS', 'CCJC', 'CME'],
        validate: {
            validator: function(value) {
                return this.role === 'student' && value != null;
            },
            message: 'Department is required for students',
        },
    },
    course: {
        type: String,
        required: function() { return this.department != null; },
        validate: {
            validator: function(course) {
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
                return coursesByDepartment[this.department].includes(course);
            },
            message: 'Selected course is not valid for the specified department'
        }
    },
    studId: {
        type: String,
        unique: true,
        sparse: true,
        validate: {
            validator: function(value) {
                return this.role !== 'clinic_admin' || value != null;
            },
            message: 'Student ID is required for students',
        },
    },
    studName: {
        type: String,
        validate: {
            validator: function(value) {
                return this.role !== 'clinic_admin' || value != null;
            },
            message: 'Student name is required for students',
        },
    },
    empId: {
        type: String,
        unique: true,
        sparse: true,
        validate: {
            validator: function(value) {
                return this.role !== 'clinic_admin' || value != null;
            },
            message: 'Employee ID is required for employees',
        },
    },
    empName: {
        type: String,
        validate: {
            validator: function(value) {
                return this.role !== 'clinic_admin' || value != null;
            },
            message: 'Employee name is required for employees',
        },
    },
    medicalHistory: {
        type: [String],
        enum: [
            'allergies', 'asthma', 'chicken pox', 'diabetes', 'dengue', 
            'measles', 'heart disorders', 'fracture', 'lung disease', 
            'tonsilitis', 'anemia', 'behavioral problem', 'convulsion', 
            'eye problem', 'epilepsy', 'mumps', 'fainting', 
            'kidney disease', 'spine problem', 'vision problem'
        ],
        default: [],
    },
});

module.exports = mongoose.model('User', userSchema);
