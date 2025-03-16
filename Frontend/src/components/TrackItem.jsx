// frontend/src/components/TrackItem.jsx
import React from 'react';
import axios from 'axios';

const TrackItem = ({ track, onTrackDelete }) => {
    const handleDelete = async () => {
        if (window.confirm(`Are you sure you want to delete "${track.title}"?`)) {
            try {
                await axios.delete(`/api/tracks/${track._id}`, { // API endpoint for track deletion (to be created in backend)
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    }
                });
                if (onTrackDelete) {
                    onTrackDelete(track._id); // Callback to notify parent component to refresh track list
                }
            } catch (error) {
                console.error('Error deleting track:', error);
                alert('Failed to delete track.');
            }
        }
    };

    return (
        <li className="py-4 flex items-center justify-between">
            <div>
                <h4 className="text-lg font-semibold text-white">{track.title}</h4>
                <p className="text-gray-400">{track.artist} - {track.album || 'Unknown Album'}</p>
            </div>
            <div className="flex space-x-2">
                <button className="neon-button bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" onClick={handleDelete}>
                    Delete
                </button>
                {/* Add Play button here later */}
            </div>
        </li>
    );
};

export default TrackItem;