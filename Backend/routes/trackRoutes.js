// backend/routes/trackRoutes.js
const express = require('express');
const router = express.Router();
const trackController = require('../controllers/trackController');
const authMiddleware = require('../middleware/authMiddleware');
const uploadMiddleware = require('../middleware/multerMiddleware'); // Import multer middleware

// Route for track upload - protected, requires authentication and file upload middleware
router.post('/upload', authMiddleware, uploadMiddleware.fields([{ name: 'audio', maxCount: 1 }, { name: 'artwork', maxCount: 1 }]), trackController.uploadTrack);

// Route to get all tracks - public (or adjust access as needed)
router.get('/', trackController.getAllTracks);

// Route to delete a track - protected, requires authentication
router.delete('/:trackId', authMiddleware, trackController.deleteTrack);


module.exports = router;