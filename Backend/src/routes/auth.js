const express = require('express');
const {registerUser , loginUser , getCurrentUser} = require('../controllers/login');
const authMiddleware = require('../middleware/auth');

const authRoutes = express.Router();

//register
authRoutes.post('/register' , registerUser);

//login
authRoutes.post('/login' , loginUser);

//Get Current user (protected route test)
authRoutes.get('/me' , authMiddleware, getCurrentUser);

module.exports = authRoutes;
