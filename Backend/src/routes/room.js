const express = require('express');
const authMiddleware = require('../middleware/auth');
const {CreateRoom , JoiningRoom , LeavingRoom , GetRoomDetails , AddSong} = require('../controllers/room');

const roomRouter = express.Router();

//Create a Room
roomRouter.post('/create' , authMiddleware , CreateRoom);

//Join a room by code
roomRouter.post('/join/:code' , authMiddleware , JoiningRoom);

//Leave a room 
roomRouter.post('/leave/:roomId' , authMiddleware , LeavingRoom);

//Get room details
roomRouter.get('/:roomId' , authMiddleware , GetRoomDetails)

//Add song to queue
roomRouter.post('/:roomId/queue' , authMiddleware, AddSong );

module.exports = roomRouter;