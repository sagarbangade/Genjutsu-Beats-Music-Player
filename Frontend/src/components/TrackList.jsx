// frontend/src/components/TrackList.jsx
import React from 'react';
import TrackItem from './TrackItem';

const TrackList = ({ tracks, onTrackDelete }) => {
    return (
        <div className="bg-gray-700 p-6 rounded-md shadow-md mt-8">
            <h3 className="text-xl font-semibold text-green-400 mb-4 neon-text-shadow">Music Library</h3>
            {tracks.length === 0 ? (
                <p className="text-gray-300">No tracks available yet. Upload some music!</p>
            ) : (
                <ul className="divide-y divide-gray-600">
                    {tracks.map(track => (
                        <TrackItem key={track._id} track={track} onTrackDelete={onTrackDelete} />
                    ))}
                </ul>
            )}
        </div>
    );
};

export default TrackList;