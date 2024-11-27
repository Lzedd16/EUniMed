import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaUser, FaInfoCircle } from 'react-icons/fa'; // Importing the icons
import '../components/TableDesign.css'; // Import the CSS file for table styles
import '../components/ButtonDesign.css'; // Import the new button design CSS file

const AdminDashboard = () => {
    const [students, setStudents] = useState([]);
    const [availability, setAvailability] = useState([]);
    const [error, setError] = useState('');
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [expandedSlots, setExpandedSlots] = useState({});
    const [searchTerm, setSearchTerm] = useState(''); // State for search term

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/');
        } else {
            const fetchStudents = async () => {
                try {
                    const response = await axios.get('http://localhost:5000/api/students');
                    setStudents(response.data);
                } catch (err) {
                    setError('Failed to fetch students');
                }
            };

            const fetchAvailability = async () => {
                try {
                    setError('');
                    const dateStr = selectedDate.toISOString().split('T')[0];
                    const response = await axios.get(`http://localhost:5000/api/admin/availability?date=${dateStr}`);
                    setAvailability(response.data);
                } catch (err) {
                    setError('Failed to fetch availability');
                }
            };

            fetchStudents();
            fetchAvailability();
        }
    }, [isAuthenticated, navigate, selectedDate]);

    const handleStudentClick = (studId) => {
        navigate(`/students/${studId}`);
    };

    const toggleSlotDetails = (index) => {
        setExpandedSlots((prev) => ({ ...prev, [index]: !prev[index] }));
    };

    const handleStatusChange = async (appointmentId, newStatus) => {
        try {
            await axios.patch(`http://localhost:5000/api/admin/appointments/${appointmentId}`, { status: newStatus });
            refreshAvailability();
        } catch (error) {
            setError('Failed to update appointment status');
        }
    };

    const handleBulkStatusChange = async (bookedStudents, newStatus) => {
        try {
            await Promise.all(
                bookedStudents.map(student =>
                    axios.patch(`http://localhost:5000/api/admin/appointments/${student._id}`, { status: newStatus })
                )
            );
            refreshAvailability();
        } catch (error) {
            setError('Failed to update bulk appointment status');
        }
    };

    const refreshAvailability = async () => {
        const dateStr = selectedDate.toISOString().split('T')[0];
        const updatedAvailability = await axios.get(`http://localhost:5000/api/admin/availability?date=${dateStr}`);
        setAvailability(updatedAvailability.data);
    };

    // Filter students based on search term
    const filteredStudents = students.filter(student =>
        (student.studName && student.studName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (student.studId && student.studId.toString().includes(searchTerm))
    );

    return (
        <div className="table-container">
            <div style={{ width: '250px', borderRight: '1px solid #ccc', paddingRight: '20px' }}>
                <h3>Student List</h3>
                <input
                    type="text"
                    placeholder="Search by ID or name"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: '100%', padding: '5px', marginBottom: '10px' }}
                />
                <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                    {filteredStudents.length > 0 ? (
                        filteredStudents.map((student) => (
                            <div
                                key={student._id}
                                onClick={() => handleStudentClick(student.studId)}
                                style={{
                                    cursor: 'pointer',
                                    padding: '10px',
                                    marginBottom: '10px',
                                    borderRadius: '8px',
                                    border: '0.5px solid black',
                                    backgroundColor: '#f9f9f9',
                                    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '5px',
                                }}
                            >
                                <h4 style={{ margin: '5px 0', fontSize: '1rem', fontWeight: 'bold' }}>
                                    <FaUser style={{ marginRight: '8px', color: '#680000' }} />
                                    {student.studName}
                                </h4>
                                <p style={{ margin: '0', fontSize: '0.9rem', color: '#555' }}>
                                    <FaInfoCircle style={{ marginRight: '8px', color: '#680000' }} />
                                    {student.studId} - {student.department}
                                </p>
                            </div>
                        ))
                    ) : (
                        <p>No students found</p>
                    )}
                </div>
            </div>

            <div style={{ marginLeft: '20px', flex: 1 }}>
                <h3>Appointment Availability</h3>
                {error && <p className="error-message">{error}</p>}

                <div className="date-picker">
                    <label>Select Date: </label>
                    <DatePicker
                        selected={selectedDate}
                        onChange={(date) => setSelectedDate(date)}
                        dateFormat="yyyy-MM-dd"
                    />
                </div>

                {availability.length > 0 ? (
                    <table className="table-wrapper">
                        <thead className="table-header">
                            <tr>
                                <th>Time Slot</th>
                                <th>Remaining Slots</th>
                                <th>Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {availability.map((slot, index) => (
                                <React.Fragment key={index}>
                                    <tr>
                                        <td className="table-cell">{slot.timeSlot}</td>
                                        <td className="table-cell">{slot.slotsRemaining}</td>
                                        <td className="table-cell">
                                            <button className="button-design" onClick={() => toggleSlotDetails(index)}>
                                                {expandedSlots[index] ? 'Hide Details' : 'Show Details'}
                                            </button>
                                        </td>
                                    </tr>
                                    {expandedSlots[index] && (
                                        <tr>
                                            <td colSpan="3" className="table-cell details-cell">
                                                {slot.bookedStudents && slot.bookedStudents.length > 0 ? (
                                                    <>
                                                        <div className="button-group">
                                                            <button
                                                                className="button-design"
                                                                onClick={() => handleBulkStatusChange(slot.bookedStudents, 'done')}
                                                            >
                                                                Mark All as Done
                                                            </button>
                                                            <button
                                                                className="button-design"
                                                                onClick={() => handleBulkStatusChange(slot.bookedStudents, 'cancelled')}
                                                            >
                                                                Mark All as Cancelled
                                                            </button>
                                                        </div>
                                                        <ul>
                                                            {slot.bookedStudents.map((student, i) => (
                                                                <li key={i}>
                                                                    {student.name} - {student.studId} ({student.status})
                                                                    <button
                                                                        className="button-design"
                                                                        onClick={() => handleStatusChange(student._id, 'done')}
                                                                    >
                                                                        Mark as Done
                                                                    </button>
                                                                    <button
                                                                        className="button-design"
                                                                        onClick={() => handleStatusChange(student._id, 'cancelled')}
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </>
                                                ) : (
                                                    <p>No bookings</p>
                                                )}
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>No availability data found</p>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
