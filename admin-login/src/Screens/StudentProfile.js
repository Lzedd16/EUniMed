import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaInfoCircle } from 'react-icons/fa';

const medicalHistoryOptions = [
    'allergies', 'asthma', 'chicken pox', 'diabetes', 'dengue', 
    'measles', 'heart disorders', 'fracture', 'lung disease', 
    'tonsilitis', 'anemia', 'behavioral problem', 'convulsion', 
    'eye problem', 'epilepsy', 'mumps', 'fainting', 
    'kidney disease', 'spine problem', 'vision problem'
];

const StudentProfile = () => {
    const { studId } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [students, setStudents] = useState([]);
    const [student, setStudent] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState('');
    const [medicalHistory, setMedicalHistory] = useState([]);
    const [isEditing, setIsEditing] = useState(false);

    // Fetch all students for the sidebar
    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/students');
                setStudents(response.data);
            } catch (err) {
                console.error('Failed to fetch students:', err);
            }
        };

        fetchStudents();
    }, []);

    // Fetch individual student details
    useEffect(() => {
        const fetchStudent = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/students/${studId}`);
                setStudent(response.data);
                setMedicalHistory(response.data.medicalHistory || []);
            } catch (err) {
                setError(err.response ? err.response.data.message : 'Failed to fetch student data');
            }
        };

        if (isAuthenticated) {
            fetchStudent();
        } else {
            navigate('/');
        }
    }, [studId, isAuthenticated, navigate]);

    const handleCheckboxChange = (option) => {
        setMedicalHistory(prevHistory => 
            prevHistory.includes(option) 
                ? prevHistory.filter(item => item !== option) 
                : [...prevHistory, option]
        );
    };

    const handleSaveMedicalHistory = async () => {
        try {
            const response = await axios.patch(`http://localhost:5000/api/users/${student._id}/medical-history`, {
                medicalHistory,
            });
            alert(response.data.message);
            setIsEditing(false);
        } catch (err) {
            alert('Failed to update medical history');
        }
    };

    const handleStudentClick = (id) => {
        navigate(`/students/${id}`);
    };

    // Filtered students based on search term
    const filteredStudents = students.filter(student =>
        (student.studName && student.studName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (student.studId && student.studId.toString().includes(searchTerm))
    );

    if (error) {
        return <p style={{ color: 'red' }}>{error}</p>;
    }

    return (
        <div style={{ display: 'flex', padding: '20px' }}>
            {/* Sidebar for Student List with Search */}
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
                        filteredStudents.map(student => (
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
                                    gap: '5px'
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

            {/* Student Profile Details */}
            <div style={{ marginLeft: '20px', flex: 1 }}>
                {student ? (
                    <>
                        <h2>Student Profile</h2>
                        <p><strong>Name:</strong> {student.studName}</p>
                        <p><strong>ID:</strong> {student.studId}</p>
                        <p><strong>Department:</strong> {student.department}</p>
                        <p><strong>Course:</strong> {student.course}</p>

                        <h3>Medical History</h3>
                        {medicalHistory.length > 0 ? (
                            <ul style={{ listStyleType: 'none', padding: 0 }}>
                                {medicalHistory.map((item, index) => (
                                    <li key={index} style={{ padding: '10px', border: '1px solid #ccc', margin: '5px 0', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No medical history recorded.</p>
                        )}

                        {isEditing ? (
                            <form>
                                {medicalHistoryOptions.map(option => (
                                    <label key={option} style={{ display: 'block', margin: '5px 0' }}>
                                        <input
                                            type="checkbox"
                                            checked={medicalHistory.includes(option)}
                                            onChange={() => handleCheckboxChange(option)}
                                        />
                                        {option}
                                    </label>
                                ))}
                                <button type="button" onClick={handleSaveMedicalHistory}>Save Medical History</button>
                                <button type="button" onClick={() => setIsEditing(false)}>Cancel</button>
                            </form>
                        ) : (
                            <button onClick={() => setIsEditing(true)}>Edit Medical History</button>
                        )}
                    </>
                ) : (
                    <p>Loading student data...</p>
                )}
            </div>
        </div>
    );
};

export default StudentProfile;