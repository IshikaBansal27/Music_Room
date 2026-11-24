require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const roomRoutes = require('./routes/room');
const initSocket = require('./socket');

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});

const app = express();
const server = http.createServer(app);
connectDB();

initSocket(server);

app.use(cors());
app.use(express.json());

app.use('/api/auth' , authRoutes);
app.use('/api/rooms' , roomRoutes);

app.get('/', (req, res) => res.send('Music Room API running'));

const PORT = process.env.PORT || 5000;
server.listen(5000, () => console.log(`Server running on port ${PORT}`));  