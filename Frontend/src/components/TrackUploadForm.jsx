// frontend/src/components/TrackUploadForm.jsx
import React, { useState } from 'react';
import axios from 'axios';

const TrackUploadForm = ({ onTrackUpload }) => {
    const [title, setTitle] = useState('');
    const [artist, setArtist] = useState('');
    const [album, setAlbum] = useState('');
    const [genre, setGenre] = useState('');
    const [audioFile, setAudioFile] = useState(null);
    const [artworkFile, setArtworkFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setUploading(true);

        if (!audioFile) {
            setError('Please select an audio file.');
            setUploading(false);
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('artist', artist);
        formData.append('album', album);
        formData.append('genre', genre);
        formData.append('audio', audioFile);
        if (artworkFile) {
            formData.append('artwork', artworkFile);
        }

        try {
            const response = await axios.post('/api/tracks/upload', formData, { // API endpoint for track upload (to be created in backend)
                headers: {
                    'Content-Type': 'multipart/form-data', // Important for file uploads
                    'Authorization': `Bearer ${localStorage.getItem('token')}`, // Assuming JWT auth
                }
            });

            setSuccessMessage('Track uploaded successfully!');
            setTitle('');
            setArtist('');
            setAlbum('');
            setGenre('');
            setAudioFile(null);
            setArtworkFile(null);
            if (onTrackUpload) {
                onTrackUpload(response.data.track); // Callback to notify parent component about new track
            }
        } catch (err) {
            console.error('Track upload error:', err);
            setError('Failed to upload track. Please try again.');
            if (err.response && err.response.data && err.response.data.errors) {
                setError(err.response.data.errors[0].msg || 'Upload failed.'); // Display backend error message if available
            }
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="bg-gray-700 p-6 rounded-md shadow-md">
            <h3 className="text-xl font-semibold text-blue-400 mb-4 neon-text-shadow">Upload New Track</h3>
            {error && <div className="bg-red-800 border border-red-600 text-red-400 px-4 py-3 rounded relative mb-4" role="alert">
                <strong className="font-bold">Error!</strong>
                <span className="block sm:inline"> {error}</span>
            </div>}
            {successMessage && <div className="bg-green-800 border border-green-600 text-green-400 px-4 py-3 rounded relative mb-4" role="alert">
                <strong className="font-bold">Success!</strong>
                <span className="block sm:inline"> {successMessage}</span>
            </div>}
            <form onSubmit={handleSubmit} encType="multipart/form-data">
                <div className="mb-4">
                    <label htmlFor="title" className="block text-gray-300 text-sm font-bold mb-2">Title</label>
                    <input type="text" id="title" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-800 text-white" placeholder="Track Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>
                <div className="mb-4">
                    <label htmlFor="artist" className="block text-gray-300 text-sm font-bold mb-2">Artist</label>
                    <input type="text" id="artist" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-800 text-white" placeholder="Artist Name" value={artist} onChange={(e) => setArtist(e.target.value)} required />
                </div>
                <div className="mb-4">
                    <label htmlFor="album" className="block text-gray-300 text-sm font-bold mb-2">Album (Optional)</label>
                    <input type="text" id="album" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-800 text-white" placeholder="Album Name" value={album} onChange={(e) => setAlbum(e.target.value)} />
                </div>
                <div className="mb-4">
                    <label htmlFor="genre" className="block text-gray-300 text-sm font-bold mb-2">Genre (Optional)</label>
                    <input type="text" id="genre" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-800 text-white" placeholder="Genre" value={genre} onChange={(e) => setGenre(e.target.value)} />
                </div>
                <div className="mb-4">
                    <label htmlFor="audioFile" className="block text-gray-300 text-sm font-bold mb-2">Audio File</label>
                    <input type="file" id="audioFile" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-800 text-white" accept="audio/*" onChange={(e) => setAudioFile(e.target.files[0])} required />
                </div>
                <div className="mb-6">
                    <label htmlFor="artworkFile" className="block text-gray-300 text-sm font-bold mb-2">Artwork (Optional)</label>
                    <input type="file" id="artworkFile" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-800 text-white" accept="image/*" onChange={(e) => setArtworkFile(e.target.files[0])} />
                </div>
                <div className="flex items-center justify-end">
                    <button className="neon-button bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit" disabled={uploading}>
                        {uploading ? 'Uploading...' : 'Upload Track'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TrackUploadForm;