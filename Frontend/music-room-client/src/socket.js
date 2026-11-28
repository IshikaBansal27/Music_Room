import {io} from 'socket.io-client'

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

let socket = null;

export const connectSocket =  () => {
    const token = localStorage.getItem('token');

    socket = io(API_URL , {
        auth : { token },
        transports: ['websocket' , 'polling']
    });

    return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
    if(socket) {
        socket.disconnect();
        socket = null;
    }
};