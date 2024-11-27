import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../components/TableDesign.css';  // Ensure this path is correct

const DentalScheduling = () => {
    const [studId, setStudId] = useState('');
    const [creationDate, setCreationDate] = useState(new Date().toISOString().split('T')[0]); // Default to today for creation
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // Default to today for filtering
    const [time, setTime] = useState('');
    const [notes, setNotes] = useState('');
    const [schedules, setSchedules] = useState([]);

    // Function to format the date to Philippines timezone
    const formattedDate = (dateString) => {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-PH', options);
    };

    // Fetch schedules when the component mounts
    useEffect(() => {
        fetchSchedules();
    }, []);

    const fetchSchedules = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/dentalschedule');
            setSchedules(response.data);
        } catch (error) {
            console.error('Error fetching schedules:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/dentalschedule', {
                studId,
                date: creationDate, // Use creation date for scheduling
                time,
                procedure: 'Tooth Extraction',
                notes,
            });
            setStudId('');
            setCreationDate(new Date().toISOString().split('T')[0]); // Reset to today's date
            setTime('');
            setNotes('');
            fetchSchedules();
        } catch (error) {
            console.error('Error creating schedule:', error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/dentalschedule/${id}`);
            fetchSchedules(); // Refresh the schedule list after deletion
        } catch (error) {
            console.error('Error deleting schedule:', error);
        }
    };

    // Function to format time in 12-hour format
    const formatTime = (time) => {
        const [hours, minutes] = time.split(':');
        const formattedHours = hours % 12 || 12; // Convert to 12-hour format
        const ampm = hours >= 12 ? 'PM' : 'AM';
        return `${formattedHours}:${minutes} ${ampm}`;
    };

    // Filter schedules based on selected date
    const filteredSchedules = schedules.filter(schedule => schedule.date === selectedDate);

    return (
        <div style={{ display: 'flex', height: '100vh', margin: '0', padding: '0' }}>
            {/* Input section on the left side */}
            <div className="table-container">
                <div style={{ flex: 1, padding: '20px', borderRight: '1px solid #ccc', boxSizing: 'border-box' }}>
                    <h2>Create Dental Schedule</h2>
                    <form onSubmit={handleSubmit} style={{ marginBottom: '0' }}>
                        <div>
                            <label>Student ID:</label>
                            <input
                                type="text"
                                value={studId}
                                onChange={(e) => setStudId(e.target.value)}
                                required
                                style={{ width: '100%', padding: '5px', marginBottom: '10px' }}
                            />
                        </div>
                        <div>
                            <label>Date:</label>
                            <input
                                type="date"
                                value={creationDate}
                                onChange={(e) => setCreationDate(e.target.value)}
                                required
                                style={{ width: '100%', padding: '5px', marginBottom: '10px' }}
                            />
                        </div>
                        <div>
                            <label>Time:</label>
                            <input
                                type="time"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                required
                                style={{ width: '100%', padding: '5px', marginBottom: '10px' }}
                            />
                        </div>
                        <div>
                            <label>Notes:</label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                style={{ width: '100%', padding: '5px', marginBottom: '10px' }}
                            />
                        </div>
                        <button type="submit">Create Schedule</button>
                    </form>
                </div>
            </div>
            {/* Main section displaying the schedule table */}
            <div style={{ flex: 2, padding: '20px', boxSizing: 'border-box' }}>
                <h2>Dental Schedules for {formattedDate(selectedDate)}</h2>
                {/* Date picker for filtering */}
                <div style={{ marginBottom: '20px' }}>
                    <label>Select Date:</label>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        required
                        style={{ marginLeft: '10px', padding: '5px' }}
                    />
                </div>
                <div className="table-wrapper">
                    <table className="table-wrapper">
                        <thead className="table-header">
                            <tr>
                                <th>Student ID</th>
                                <th>Student Name</th>
                                <th>Department</th>
                                <th>Time</th>
                                <th>Procedure</th>
                                <th>Notes</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSchedules.map((schedule) => (
                                <tr key={schedule._id}>
                                    <td className="table-cell">{schedule.studId}</td>
                                    <td className="table-cell">{schedule.user ? schedule.user.studName : 'N/A'}</td>
                                    <td className="table-cell">{schedule.user ? schedule.user.department : 'N/A'}</td>
                                    <td className="table-cell">{formatTime(schedule.time)}</td>
                                    <td className="table-cell">{schedule.procedure}</td>
                                    <td className="table-cell">{schedule.notes}</td>
                                    <td className="table-cell details-cell">
                                        <div className="button-group">
                                            <button onClick={() => handleDelete(schedule._id)}>Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredSchedules.length === 0 && <p>No schedules found for this date.</p>}
                </div>
            </div>
        </div>
    );
};

export default DentalScheduling;
