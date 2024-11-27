// src/components/Header.js
import React from 'react';
import { useAuth } from '../context/AuthContext'; // Adjust the path as necessary
import { useNavigate } from 'react-router-dom';

const Header = () => {
    const { logout } = useAuth(); // Use the logout function from context
    const navigate = useNavigate();

    const handleLogout = () => {
        logout(); // Perform logout
        navigate('/'); // Redirect to login page
    };

    const handleHomeClick = () => {
        navigate('/dashboard'); // Navigate back to the dashboard
    };

    const handleDentalSchedulingClick = () => {
        navigate('/dentalscheduling'); // Navigate to the Dental Scheduling screen
    };

    return (
        <header style={{ backgroundColor: '#680000', color: '#fff', padding: '10px', textAlign: 'right' }}>
            <button 
                style={{ marginLeft: '20px', background: 'none', color: '#fff', border: 'none', cursor: 'pointer',  fontSize: '16px' }} 
                onClick={handleHomeClick}
            >
                Home
            </button>
            <button 
                style={{ marginLeft: '20px', background: 'none', color: '#fff', border: 'none', cursor: 'pointer',  fontSize: '16px' }} 
                onClick={handleDentalSchedulingClick} // Add navigation for Dental Scheduling
            >
                Dental Scheduling
            </button>
            <button
                onClick={handleLogout} 
                style={{ marginLeft: '20px', background: 'none', color: '#fff', border: 'none', cursor: 'pointer',  fontSize: '16px'  }}
            >
                Logout
            </button>
        </header>
    );
};

export default Header;
