// frontend/src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import TrackUploadForm from '../components/TrackUploadForm';
import TrackList from '../components/TrackList';
import axios from 'axios';

const DashboardPage = () => {
    const [tracks, setTracks] = useState([]);
    const [loadingTracks, setLoadingTracks] = useState(true);
    const [errorLoadingTracks, setErrorLoadingTracks] = useState('');

    useEffect(() => {
        fetchTracks();
    }, []);

    const fetchTracks = async () => {
        setLoadingTracks(true);
        setErrorLoadingTracks('');
        try {
            const response = await axios.get('/api/tracks', { // API endpoint to get all tracks (to be created in backend)
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                }
            });
            setTracks(response.data.tracks);
        } catch (err) {
            console.error('Error fetching tracks:', err);
            setErrorLoadingTracks('Failed to load tracks.');
        } finally {
            setLoadingTracks(false);
        }
    };

    const handleTrackUploadSuccess = (newTrack) => {
        // Optimistically update the track list by adding the new track
        setTracks(prevTracks => [...prevTracks, newTrack]);
    };

    const handleTrackDeleteSuccess = (deletedTrackId) => {
        // Update track list after deletion
        setTracks(prevTracks => prevTracks.filter(track => track._id !== deletedTrackId));
    };


    return (
        <div className="container mx-auto px-4 py-8">
            <h2 className="text-3xl font-bold text-purple-400 mb-6 neon-text-shadow text-center">Music Dashboard</h2>
            <TrackUploadForm onTrackUpload={handleTrackUploadSuccess} />

            {loadingTracks ? (
                <p className="text-gray-300 mt-8 text-center">Loading music library...</p>
            ) : errorLoadingTracks ? (
                <p className="text-red-400 mt-8 text-center">{errorLoadingTracks}</p>
            ) : (
                <TrackList tracks={tracks} onTrackDelete={handleTrackDeleteSuccess} />
            )}
        </div>
    );
};

export default DashboardPage;