// backend/controllers/trackController.js
const Track = require('../models/Track');
const User = require('../models/User'); // Import User model to verify user existence
const fs = require('fs').promises; // For file system operations

// @route   POST api/tracks/upload
// @desc    Upload a new music track
// @access  Private (Authenticated users only)
exports.uploadTrack = async (req, res) => {
    try {
        const { title, artist, album, genre } = req.body;
        const userId = req.user.id; // User ID from auth middleware
        const audioFile = req.files['audio'] ? req.files['audio'][0] : null;
        const artworkFile = req.files['artwork'] ? req.files['artwork'][0] : null;

        if (!audioFile) {
            return res.status(400).json({ errors: [{ msg: 'Audio file is required' }] });
        }

        const track = new Track({
            title,
            artist,
            album,
            genre,
            duration: 0, // You might want to calculate duration on the server or frontend
            filePath: audioFile.path, // Save the path to the uploaded audio file
            artworkPath: artworkFile ? artworkFile.path : '/default-artwork.png', // Save artwork path if provided
            uploadedBy: userId
        });

        await track.save();

        res.json({ track, message: 'Track uploaded successfully' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// @route   GET api/tracks
// @desc    Get all tracks
// @access  Public (or Private - decide based on your app's needs)
exports.getAllTracks = async (req, res) => {
    try {
        const tracks = await Track.find().populate('uploadedBy', 'username'); // Populate uploader's username
        res.json({ tracks });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};


// @route   DELETE api/tracks/:trackId
// @desc    Delete a track by ID
// @access  Private (Authenticated users, and maybe only uploader or admin)
exports.deleteTrack = async (req, res) => {
    try {
        const trackId = req.params.trackId;
        const track = await Track.findById(trackId);

        if (!track) {
            return res.status(404).json({ msg: 'Track not found' });
        }

        // Authorization check: Optionally, ensure only the uploader or admin can delete
        // if (track.uploadedBy.toString() !== req.user.id) {
        //     return res.status(401).json({ msg: 'User not authorized to delete this track' });
        // }

        // Delete the track's audio file from the filesystem (optional - you might want to keep files and just remove DB entry in some cases)
        try {
            await fs.unlink(track.filePath); // Delete audio file
            if (track.artworkPath && track.artworkPath !== '/default-artwork.png') { // Check if it's not the default artwork
                await fs.unlink(track.artworkPath); // Delete artwork file
            }
        } catch (fileDeleteErr) {
            console.error("Error deleting track file:", fileDeleteErr);
            // Log the error, but don't necessarily fail the DB deletion if file deletion fails.
            // You can decide how critical file deletion is for your app.
        }


        await Track.findByIdAndDelete(trackId);

        res.json({ msg: 'Track deleted successfully' });

    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') { // For invalid track ID format
            return res.status(404).json({ msg: 'Track not found' });
        }
        res.status(500).send('Server error');
    }
};