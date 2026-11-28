const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const Room = require("../models/rooms");

const HOST_DISCONNECT_GRACE_MS = 45_000;
const PRESENCE_RECONNECT_GRACE_MS = 10_000;

const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket", "polling"], // add this line
  });

  // roomId -> timeout handle for a pending close, so a brief drop (sleep, wifi blip)
  // doesn't kill the room if the host reconnects within the grace period
  const pendingRoomClosures = new Map();

  // roomId -> Map(userId -> number of live sockets that user currently has open
  // in that room), so "user-joined"/"user-left" fire once per real presence
  // change, not once per socket connection (multiple tabs, reconnects, etc.)
  const roomPresence = new Map();
  // "roomId:userId" -> timeout handle for a delayed "user-left" broadcast, so
  // a brief disconnect (sleep, wifi blip) doesn't spam the room with a
  // "left" followed by a "joined" a moment later
  const pendingUserLeaves = new Map();

  const addPresence = (roomId, userId) => {
    let counts = roomPresence.get(roomId);
    if (!counts) {
      counts = new Map();
      roomPresence.set(roomId, counts);
    }
    const next = (counts.get(userId) || 0) + 1;
    counts.set(userId, next);
    return next;
  };

  const removePresence = (roomId, userId) => {
    const counts = roomPresence.get(roomId);
    if (!counts || !counts.has(userId)) return 0;
    const next = counts.get(userId) - 1;
    if (next <= 0) {
      counts.delete(userId);
      if (counts.size === 0) roomPresence.delete(roomId);
      return 0;
    }
    counts.set(userId, next);
    return next;
  };

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
        socket.data.roomId = roomId;
        console.log(`${socket.user.username} joined room ${roomId}`);

        // Host reconnected in time — call off the scheduled closure
        if (pendingRoomClosures.has(roomId)) {
          clearTimeout(pendingRoomClosures.get(roomId));
          pendingRoomClosures.delete(roomId);
          console.log(`Host reconnected — cancelled pending closure for room ${roomId}`);
        }

        // If this is a reconnect within the grace window (sleep/wifi blip),
        // cancel the delayed "left" we scheduled and don't announce a "joined"
        // either — nothing actually changed from the room's point of view.
        const presenceKey = `${roomId}:${socket.user.id}`;
        const pendingLeave = pendingUserLeaves.get(presenceKey);
        const isReconnectWithinGrace = Boolean(pendingLeave);
        if (isReconnectWithinGrace) {
          clearTimeout(pendingLeave);
          pendingUserLeaves.delete(presenceKey);
        }

        // Send current room state to the late joiner
        // This is how they sync to the correct song + timestamp instantly
        socket.emit("room-state", {
          currentSong: room.currentSong,
          queue: room.queue,
          host: room.host.username,
          members: room.members.map((m) => m.username),
        });

        // Only announce a genuinely new presence (first live connection for
        // this user in this room), not every reconnect or extra tab.
        const liveCount = addPresence(roomId, socket.user.id);
        if (liveCount === 1 && !isReconnectWithinGrace) {
          socket.to(roomId).emit("user-joined", {
            username: socket.user.username,
          });
        }
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
        room.currentSong.lastUpdateAt = Date.now();
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
        room.currentSong.lastUpdateAt = Date.now();
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
        room.currentSong.lastUpdateAt = Date.now();
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
          lastUpdateAt: Date.now(),
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
      socket.data.roomId = null;

      // Explicit leave is intentional — no grace period, but cancel any
      // stray pending one and only announce if this was their last tab/connection.
      const presenceKey = `${roomId}:${socket.user.id}`;
      const pendingLeave = pendingUserLeaves.get(presenceKey);
      if (pendingLeave) {
        clearTimeout(pendingLeave);
        pendingUserLeaves.delete(presenceKey);
      }

      const remaining = removePresence(roomId, socket.user.id);
      if (remaining === 0) {
        socket.to(roomId).emit("user-left", {
          username: socket.user.username,
        });
      }
      console.log(`${socket.user.username} left room ${roomId}`);
    });

    //---Disconnect---
    socket.on("disconnect", async () => {
      console.log(`User disconnected: ${socket.user.username}`);

      // Abrupt disconnect (tab closed, wifi dropped, laptop slept) — don't
      // announce "left" right away. Wait a bit in case they reconnect; if
      // they do, join-room cancels this and nothing is ever shown to others.
      if (socket.data.roomId) {
        const roomId = socket.data.roomId;
        const remaining = removePresence(roomId, socket.user.id);
        if (remaining === 0) {
          const presenceKey = `${roomId}:${socket.user.id}`;
          const timeoutId = setTimeout(() => {
            pendingUserLeaves.delete(presenceKey);
            io.to(roomId).emit("user-left", { username: socket.user.username });
          }, PRESENCE_RECONNECT_GRACE_MS);
          pendingUserLeaves.set(presenceKey, timeoutId);
        }
      }

      try {
        // Find any active rooms where this user is the host
        const hostedRooms = await Room.find({
          host: socket.user.id,
          isActive: true,
        });

        for (const room of hostedRooms) {
          const roomId = room._id.toString();

          // Don't close immediately — give the host a chance to reconnect
          // (sleep/wake, brief wifi drop, etc.) before tearing down the room
          const timeoutId = setTimeout(async () => {
            pendingRoomClosures.delete(roomId);
            try {
              const freshRoom = await Room.findById(roomId);
              if (!freshRoom || !freshRoom.isActive) return;

              freshRoom.isActive = false;
              await freshRoom.save();

              io.to(roomId).emit("room-closed", {
                message: "Host disconnected. Room has been closed.",
              });
            } catch (err) {
              console.error("Delayed room closure error:", err.message);
            }
          }, HOST_DISCONNECT_GRACE_MS);

          pendingRoomClosures.set(roomId, timeoutId);
        }
      } catch (err) {
        console.error("Cleanup error:", err.message);
      }
    });
  });
};

module.exports = initSocket;
