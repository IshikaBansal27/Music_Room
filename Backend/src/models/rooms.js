const mongoose = require('mongoose');
const {v4: uuidv4} = require('uuid');

const roomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    code: {
        type: String , 
        unique: true,
        default: () => uuidv4().slice(0,6).toUpperCase()
    },
    host: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
     members: [
        {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        }
    ],
    queue: [
        {
            videoId: String,   //Youtube video ID
            title: String, 
            addedBy: String
        }
    ],
    currentSong: {
        videoId: {type: String , default: null},
        title: {type:String , default: null},
        timestamp: {type: Number , default: 0},
        isPlaying: {type: Boolean , default: false},
        // wall-clock time (ms) when `timestamp` was last recorded — lets late
        // joiners compute the actual live position instead of a stale one
        lastUpdateAt: {type: Number , default: () => Date.now()}
    },
    isActive: {
        type: Boolean,
        default: true
    }
} , {timestamps: true});

module.exports = mongoose.model('Room' , roomSchema);