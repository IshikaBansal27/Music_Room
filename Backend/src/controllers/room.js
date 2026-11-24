const Room = require('../models/rooms');

//Creating a room
async function CreateRoom(req , res)
{
    try
    {
        const {name} = req.body;

        if(!name)
            return res.status(400).json({message: 'Room name is required'});

        const room = await Room.create({
            name, 
            host: req.user.id,
            members: [req.user.id]
        });

        await room.populate('host' , 'username email');
        await room.populate('members' , 'username email');

        res.status(201).json({ message: 'Room created', room });
    } catch(error)
    {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

//Join a room by code
async function JoiningRoom(req , res){
    try
    {
        const room = await Room.findOne({
            code: req.params.code.toUpperCase(),
            isActive: true
        });

        if(!room)
            return res.status(404).json({ message: 'Room not found or inactive' })

        console.log(room.members);
        const alreadyMember = room.members.includes(req.user.id);
        if(!alreadyMember)
        {
            room.members.push(req.user.id);
            await room.save();
        }

        await room.populate('host', 'username email');
        await room.populate('members', 'username email');

        res.json({ message: 'Joined room', room });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

//Leave a room
async function LeavingRoom(req , res)
{
    try
    {
        const room = await Room.findById(req.params.roomId);

        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        if(room.host.toString() === req.user.id){
            room.isActive = false;
            await room.save();
            return res.json({ message: 'Room closed as host left' });
        }

        // Remove member
        room.members = room.members.filter(
        (memberId) => memberId.toString() !== req.user.id
        );
        await room.save();

        res.json({ message: 'Left room successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

//Get room details 
async function GetRoomDetails(req , res)
{
    try
    {
       const room = await Room.findById(req.params.roomId)
        .populate('host', 'username email')
        .populate('members', 'username email');

        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        const isMember = room.members.some(
            (member) => member._id.toString() === req.user.id
        );

        if (!isMember) 
            return res.status(403).json({ message: 'You are not a member of this room' });

        res.json({ room });

    }   catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

// Add song to Queue

async function AddSong(req , res)
{
    try
    {
        const {videoId , title} = req.body;
        if (!videoId || !title) 
            return res.status(400).json({ message: 'videoId and title are required' });

        const room = await Room.findById(req.params.roomId);

        if (!room) 
            return res.status(404).json({ message: 'Room not found' });
        
        room.queue.push({ videoId, title, addedBy: req.user.username });
        await room.save();

        res.json({ message: 'Song added to queue', queue: room.queue });

    } catch(err)
    {
        res.status(500).json({message: 'Server error', error: error.message });
    }
}

module.exports = {CreateRoom , JoiningRoom , LeavingRoom , GetRoomDetails , AddSong};