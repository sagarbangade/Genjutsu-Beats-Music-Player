// backend/models/Track.js
const mongoose = require('mongoose');

const trackSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    artist: {
        type: String,
        required: true,
        trim: true
    },
    album: {
        type: String,
        trim: true,
        default: 'Unknown Album' // Default if album is not provided
    },
    genre: {
        type: String,
        trim: true,
        default: 'Unknown Genre' // Default if genre is not provided
    },
    duration: {
        type: Number,
        required: true, // Duration in seconds or milliseconds - decide on unit consistency
        min: 0
    },
    filePath: {
        type: String,
        required: true, // Path or URL to the audio file
        trim: true
    },
    artworkPath: {
        type: String, // Optional path or URL to artwork
        trim: true,
        default: '/default-artwork.png' // Optional default artwork URL or path
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
        required: true
    },
    uploadDate: {
        type: Date,
        default: Date.now
    }
});

// Corrected:
const Track = mongoose.model('Track', trackSchema); // Use 'trackSchema'