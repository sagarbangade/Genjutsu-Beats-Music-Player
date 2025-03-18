import React, { createContext, useState, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Import axios

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('authToken')); // Check for token on init
    const [username, setUsername] = useState(localStorage.getItem('username') || null);
    const [userId, setUserId] = useState(localStorage.getItem('userId') || null);
    const [authToken, setAuthToken] = useState(localStorage.getItem('authToken') || null); // Add authToken to state

    const login = useCallback(async (username, password) => {
        try {
            const response = await axios.post('/api/auth/login', { username, password });
            const { token, username: loggedInUsername, userId: loggedInUserId } = response.data;
            localStorage.setItem('authToken', token);
            localStorage.setItem('username', loggedInUsername);
            localStorage.setItem('userId', loggedInUserId);
            setAuthToken(token); // Set authToken in state
            setIsLoggedIn(true);
            setUsername(loggedInUsername);
            setUserId(loggedInUserId);
            navigate('/music'); // Redirect after login
            return true; // Indicate successful login
        } catch (error) {
            console.error("Login failed:", error);
            // Handle login error (e.g., display error message)
            return false; // Indicate failed login
        }
    }, [navigate]);

    const register = useCallback(async (username, password, email) => {
        try {
            await axios.post('/api/auth/register', { username, password, email });
            navigate('/login'); // Redirect to login after registration
            return true; // Indicate successful registration
        } catch (error) {
            console.error("Registration failed:", error);
            // Handle registration error
            return false; // Indicate failed registration
        }
    }, [navigate]);

    const logout = useCallback(() => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('username');
        localStorage.removeItem('userId');
        setAuthToken(null); // Clear authToken from state
        setIsLoggedIn(false);
        setUsername(null);
        setUserId(null);
        navigate('/'); // Redirect to home page after logout
    }, [navigate]);

    const contextValue = {
        isLoggedIn,
        username,
        userId,
        authToken, // Expose authToken in context
        login,
        register,
        logout,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);