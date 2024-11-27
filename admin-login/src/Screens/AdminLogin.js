// src/Screens/AdminLogin.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard'); // Redirect to dashboard if already authenticated
        }
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        try {
            const response = await axios.post('http://localhost:5000/api/admin/login', {
                username,
                password,
            });

            const token = response.data.token;
            login(token); // Call the login function from context
            setMessage('Login successful!');
            navigate('/dashboard'); // Navigate to dashboard after successful login
        } catch (err) {
            setError(err.response ? err.response.data.message : 'Login failed');
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.leftText}>
                <h2>UniMed</h2>
            </div>
            <div style={styles.formContainer}>
                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.formGroup}>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Username"
                            required
                            style={styles.input}
                        />
                    </div>
                    <div style={styles.formGroup}>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            required
                            style={styles.input}
                        />
                    </div>
                    <button type="submit" style={styles.button}>Login</button>
                    {error && <p style={styles.error}>{error}</p>}
                    {message && <p style={styles.success}>{message}</p>}
                </form>
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',  // Full height of the viewport
        padding: '20px',
        textAlign: 'center', // Center text horizontally
    },
    leftText: {
        marginRight: '20px',
        display: 'flex',
        alignItems: 'center',
        fontSize: '48px',
        fontWeight: 'bold',
        paddingRight: '40px'
    },
    formContainer: {
        maxWidth: '400px',
        width: '100%',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center', // Ensures everything is vertically centered
    },
    formGroup: {
        marginBottom: '10px',
    },
    input: {
        padding: '10px',
        fontSize: '16px',
        width: '100%',
        marginTop: '5px',
        marginBottom: '5px',
        boxSizing: 'border-box', 
        borderRadius: '8px',
        border: '1px solid gray'
    },
    button: {
        padding: '10px',
        fontSize: '16px',
        fontWeight: 'bold',
        backgroundColor: '#680000',
        color: 'white',
        border: 'none',
        cursor: 'pointer',
        marginTop: '10px',
        width: '100%', 
        borderRadius: '8px'
    },
    error: {
        color: 'red',
        textAlign: 'center',
    },
    success: {
        color: 'green',
        textAlign: 'center',
    },
};

export default AdminLogin;
