const { io } = require('socket.io-client');

// paste a real JWT token from your login response here
const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhNDNlNTdhODNjMzljNzYxNzM3NmUwYiIsInVzZXJuYW1lIjoiaXNoaWthMTIiLCJpYXQiOjE3ODI4MzQ1NTUsImV4cCI6MTc4MzQzOTM1NX0.iJscYPXUxgu1gO9iewRv8XIFDtgRrxhSDPhIWhB1sGo";
const ROOM_ID = "6a43e69183c39c7617376e0c";

const socket = io('http://127.0.0.1:5000', {
  auth: { token: TOKEN },
});

socket.on('connect', () => {
  console.log('Connected to socket server');

  socket.emit('join-room', { roomId: ROOM_ID });
});

// This fires if connection itself fails
socket.on('connect_error', (err) => {
  console.log('❌ Connection failed:', err.message);
});


socket.on('room-state', (state) => {
  console.log('Room state received:', state);
});

socket.on('play', (data) => {
  console.log('Play event:', data);
});

socket.on('pause', (data) => {
  console.log('Pause event:', data);
});

socket.on('song-changed', (data) => {
  console.log('Song changed:', data);
});

socket.on('chat-message', (data) => {
  console.log('Chat:', data);
});

socket.on('error', (err) => {
  console.error('Socket error:', err);
});


socket.on('error', (err) => {
  console.error('❌ Socket error:', err);
});

setTimeout(() => {
  if (!socket.connected) {
    console.log('❌ Still not connected after 3 seconds');
  }
}, 3000);

// Test: emit a play event after 2 seconds
setTimeout(() => {
  socket.emit('play', { roomId: ROOM_ID, timestamp: 0 });
}, 2000);