import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
    return (
        <div className="container mx-auto px-4 py-8 text-center">
            <h1 className="text-4xl font-bold text-blue-400 mb-6 neon-text-shadow">Welcome to Music Neon!</h1>
            <p className="text-gray-300 mb-8">
                Experience music in a vibrant new way. Upload, organize, and stream your tracks with our neon-themed music player.
            </p>
            <div className="flex justify-center space-x-6">
                <Link to="/login" className="neon-button bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full focus:outline-none focus:shadow-outline">
                    Login
                </Link>
                <Link to="/register" className="neon-button bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-full focus:outline-none focus:shadow-outline">
                    Register
                </Link>
            </div>
        </div>
    );
};

export default HomePage;