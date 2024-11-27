// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext'; // Import the AuthProvider
import AdminLogin from './Screens/AdminLogin';
import AdminDashboard from './Screens/AdminDashboard';
import StudentProfile from './Screens/StudentProfile';
import DentalScheduling from './Screens/DentalScheduling'; // Import the DentalScheduling screen
import Header from './Header/Header'; // Import the Header component

const App = () => {
    return (
        <AuthProvider>
            <Router>
                <MainRoutes />
            </Router>
        </AuthProvider>
    );
};

// Create a component to handle the routes
const MainRoutes = () => {
    const location = useLocation();
    
    // Define which routes should render the header
    const showHeader = location.pathname === '/dashboard' || location.pathname.startsWith('/students/') || location.pathname === '/dentalscheduling';

    return (
        <>
            {showHeader && <Header />} {/* Conditionally render the Header */}
            <Routes>
                <Route path="/" element={<AdminLogin />} />
                <Route path="/dashboard" element={<AdminDashboard />} />
                <Route path="/students/:studId" element={<StudentProfile />} />
                <Route path="/dentalscheduling" element={<DentalScheduling />} /> {/* New route */}
            </Routes>
        </>
    );
};

export default App;
