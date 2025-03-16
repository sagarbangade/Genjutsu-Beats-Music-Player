// backend/models/Playlist.js
const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true,
        default: '' // Default empty description
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    tracks: [{ // Array of track IDs
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Track' // Reference to the Track model
    }],
    isPublic: {
        type: Boolean,
        default: false
    },
    playlistArtworkPath: { // Optional playlist artwork
        type: String,
        trim: true,
        default: '/default-playlist-artwork.png' // Optional default playlist artwork
    }
});

// Corrected:
const Playlist = mongoose.model('Playlist', playlistSchema); // Use 'playlistSchema'