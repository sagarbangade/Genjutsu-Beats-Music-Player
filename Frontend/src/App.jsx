import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import Navbar from './components/Navbar';

const App = () => {
    const isLoggedIn = () => {
        return !!localStorage.getItem('token');
    };

    const PrivateRoute = ({ children }) => {
        return isLoggedIn() ? children : <Navigate to="/login" />;
    };

    return (
        <Router>
            <Navbar />
            <div className="container mx-auto px-4 pt-16"> {/* Added padding below navbar */}
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;