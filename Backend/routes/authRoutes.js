// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// @route   POST api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', authController.registerUser);

// @route   POST api/auth/login
// @desc    Login user / Authenticate user
// @access  Public
router.post('/login', authController.loginUser);

module.exports = router;