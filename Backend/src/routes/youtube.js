const express = require('express');
const authMiddleware = require('../middleware/auth');
const { searchSongs } = require('../controllers/youtube');

const youtubeRouter = express.Router();

youtubeRouter.get('/search', authMiddleware, searchSongs);

module.exports = youtubeRouter;
