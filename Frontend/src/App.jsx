import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ChakraProvider, Box } from '@chakra-ui/react';
import Navbar from './components/Layout/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import MusicPage from './pages/MusicPage';
import PlaylistsPage from './pages/PlaylistsPage';
import PlaylistDetailsPage from './pages/PlaylistDetailsPage';
import { AuthProvider } from './AuthContext'; // Import AuthProvider

function App() {
    return (
        <ChakraProvider>
            <Router>
                {/* **Move AuthProvider INSIDE Router Here** */}
                <AuthProvider>
                    <Navbar />
                    <Box as="main" py={8} bg="gray.100" minH="calc(100vh - 64px)">
                        <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/register" element={<RegisterPage />} />
                            <Route path="/profile" element={<ProfilePage />} />
                            <Route path="/music" element={<MusicPage />} />
                            <Route path="/playlists" element={<PlaylistsPage />} />
                            <Route path="/playlists/:playlistId" element={<PlaylistDetailsPage />} />
                            {/* Add more routes */}
                        </Routes>
                    </Box>
                </AuthProvider>
            </Router>
        </ChakraProvider>
    );
}

export default App;