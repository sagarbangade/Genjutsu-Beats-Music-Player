import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
    const navigate = useNavigate();
    const isLoggedIn = () => {
        return !!localStorage.getItem('token');
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    return (
        <nav className="bg-gray-800 p-4 fixed w-full top-0 z-50"> {/* Fixed navbar at top */}
            <div className="container mx-auto flex justify-between items-center">
                <div className="font-bold text-xl text-blue-400 neon-text-shadow"> {/* Neon text for brand */}
                    <Link to="/">Music Neon</Link>
                </div>
                <div className="flex space-x-4">
                    <Link to="/" className="hover:text-gray-300">Home</Link>
                    <Link to="/about" className="hover:text-gray-300">About</Link>
                    <Link to="/contact" className="hover:text-gray-300">Contact</Link>
                    {isLoggedIn() ? (
                        <button onClick={handleLogout} className="neon-button bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                            Logout
                        </button>
                    ) : (
                        <>
                            <Link to="/login" className="neon-button bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                                Login
                            </Link>
                            <Link to="/register" className="neon-button bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                                Register
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;