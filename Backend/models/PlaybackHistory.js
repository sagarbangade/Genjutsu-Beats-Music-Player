// backend/models/PlaybackHistory.js
const mongoose = require('mongoose');

const playbackHistorySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
        required: true
    },
    track: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Track', // Reference to the Track model
        required: true
    },
    playedAt: {
        type: Date,
        default: Date.now
    },
    playbackDuration: {
        type: Number, // Playback duration in seconds (or milliseconds)
        default: 0,
        min: 0
    }
});

// Corrected:
const PlaybackHistory = mongoose.model('PlaybackHistory', playbackHistorySchema); // Use 'playbackHistorySchema'