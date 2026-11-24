const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const Room = require("../models/rooms");

const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket", "polling"], // add this line
  });

  // Middleware — verify JWT before allowing socket connection
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("Authentication required"));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.user.username}`);

    //Join Room
    socket.on("join-room", async ({ roomId }) => {
      try {
        const room = await Room.findById(roomId)
          .populate("host", "username")
          .populate("members", "username");

        if (!room) {
          socket.emit("error", { message: "Room not found" });
          return;
        }

        const isMember = room.members.some(
          (m) => m._id.toString() === socket.user.id,
        );

        if (!isMember) {
          socket.emit("error", {
            message: "You are not a member of this room",
          });
          return;
        }

        socket.join(roomId);
        console.log(`${socket.user.username} joined room ${roomId}`);

        // Send current room state to the late joiner
        // This is how they sync to the correct song + timestamp instantly
        socket.emit("room-state", {
          currentSong: room.currentSong,
          queue: room.queue,
          host: room.host.username,
          members: room.members.map((m) => m.username),
        });

        //Notify everyone else in the room
        socket.to(roomId).emit("user-joined", {
          username: socket.user.username,
        });
      } catch (err) {
        socket.emit("error", { message: "Failed to join room" });
      }
    });

    //--------Play----
    socket.on("play", async ({ roomId, timestamp }) => {
      try {
        const room = await Room.findById(roomId);
        if (!room) return;

        if (room.host.toString() !== socket.user.id) {
          socket.emit("error", {
            message: "Only the host can control playback",
          });
          return;
        }

        room.currentSong.isPlaying = true;
        room.currentSong.timestamp = timestamp;
        await room.save();

        //Broadcast to everyone else in the room
        socket.to(roomId).emit("play", { timestamp });
      } catch (err) {
        socket.emit("error", { message: "Play failed" });
      }
    });

    // ─── PAUSE ──────────────────────────────────────────────
    socket.on("pause", async ({ roomId, timestamp }) => {
      try {
        const room = await Room.findById(roomId);
        if (!room) return;

        if (room.host.toString() !== socket.user.id) {
          socket.emit("error", {
            message: "Only the host can control playback",
          });
          return;
        }

        room.currentSong.isPlaying = false;
        room.currentSong.timestamp = timestamp;
        await room.save();

        socket.to(roomId).emit("pause", { timestamp });
      } catch (err) {
        socket.emit("error", { message: "Pause failed" });
      }
    });

    // ─── SEEK ───────────────────────────────────────────────
    socket.on("seek", async ({ roomId, timestamp }) => {
      try {
        const room = await Room.findById(roomId);
        if (!room) return;

        if (room.host.toString() !== socket.user.id) {
          socket.emit("error", {
            message: "Only the host can control playback",
          });
          return;
        }

        room.currentSong.timestamp = timestamp;
        await room.save();

        socket.to(roomId).emit("seek", { timestamp });
      } catch (err) {
        socket.emit("error", { message: "Seek failed" });
      }
    });

    //---SKIP (play next song in queue)----
    socket.on("skip", async ({ roomId }) => {
      try {
        const room = await Room.findById(roomId);
        if (!room) return;

        if (room.host.toString() !== socket.user.id) {
          socket.emit("error", { message: "Only the host can skip" });
          return;
        }

        if (room.queue.length === 0) {
          socket.emit("error", { message: "Queue is empty" });
          return;
        }

        const nextSong = room.queue.shift();
        room.currentSong = {
          videoId: nextSong.videoId,
          title: nextSong.title,
          timestamp: 0,
          isPlaying: true,
        };

        await room.save();

        //Broadcast new song to everyone
        io.to(roomId).emit("song-changed", {
          currentSong: room.currentSong,
          queue: room.queue,
        });
      } catch (err) {
        socket.emit("error", { message: "Skip failed" });
      }
    });

    //---Add Song to queue
    socket.on("add-to-queue", async ({ roomId, videoId, title }) => {
      try {
        const room = await Room.findById(roomId);
        if (!room) return;

        room.queue.push({ videoId, title, addedBy: socket.user.username });
        await room.save();

        // Notify everyone in the room about the updated queue
        io.to(roomId).emit("queue-updated", { queue: room.queue });
      } catch (err) {
        socket.emit("error", { message: "Failed to add song" });
      }
    });

    //---Chat Message----
    socket.on("chat-message", ({ roomId, message }) => {
      if (!message || !roomId) return;

      io.to(roomId).emit("chat-message", {
        username: socket.user.username,
        message,
        timestamp: new Date().toISOString(),
      });
    });

    //---Leave Room---
    socket.on("leave-room", ({ roomId }) => {
      socket.leave(roomId);
      socket.to(roomId).emit("user-left", {
        username: socket.user.username,
      });
      console.log(`${socket.user.username} left room ${roomId}`);
    });

    //---Disconnect---
    socket.on("disconnect", async () => {
      console.log(`User disconnected: ${socket.user.username}`);

      try {
        // Find any active rooms where this user is the host
        const Room = require("../models/rooms");
        const hostedRooms = await Room.find({
          host: socket.user.id,
          isActive: true,
        });

        for (const room of hostedRooms) {
          room.isActive = false;
          await room.save();

          // Notify all members in the room
          io.to(room._id.toString()).emit("room-closed", {
            message: "Host disconnected. Room has been closed.",
          });
        }
      } catch (err) {
        console.error("Cleanup error:", err.message);
      }
    });
  });
};

module.exports = initSocket;
