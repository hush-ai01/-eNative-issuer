const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [process.env.FRONTEND_URL || "http://localhost:5173", "https://*.vercel.app"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// User presence tracking
const onlineUsers = new Map(); // enumber -> socket.id

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", onlineUsers: onlineUsers.size });
});

io.on("connection", (socket) => {
  console.log(`[+] Client connected: ${socket.id}`);

  // User joins with their eNumber
  socket.on("join_room", ({ enumber }) => {
    if (!enumber) {
      socket.emit("error", { code: "INVALID_ENUMBER", message: "eNumber required" });
      return;
    }

    // Leave previous room if any
    const previousEnumber = [...onlineUsers.entries()].find(([k, v]) => v === socket.id)?.[0];
    if (previousEnumber) {
      socket.leave(previousEnumber);
      onlineUsers.delete(previousEnumber);
    }

    // Join new room and register presence
    socket.join(enumber);
    onlineUsers.set(enumber, socket.id);
    socket.enumber = enumber;

    console.log(`[JOIN] ${enumber} -> room:${enumber}`);
    socket.emit("room_joined", { enumber, onlineUsers: onlineUsers.size });
  });

  // Initiate a call
  socket.on("call_user", ({ callerEnumber, calleeEnumber, offer }) => {
    console.log(`[CALL] ${callerEnumber} -> ${calleeEnumber}`);

    // Validate presence
    if (!onlineUsers.has(calleeEnumber)) {
      socket.emit("error", { code: "USER_OFFLINE", message: `${calleeEnumber} is not online` });
      return;
    }

    // Forward offer to callee
    io.to(calleeEnumber).emit("incoming_call", {
      callerEnumber,
      callerSocketId: socket.id,
      offer
    });
  });

  // Answer a call
  socket.on("answer_call", ({ callerEnumber, calleeEnumber, answer }) => {
    console.log(`[ANSWER] ${calleeEnumber} -> ${callerEnumber}`);

    io.to(callerEnumber).emit("call_answered", {
      calleeEnumber,
      answer
    });
  });

  // ICE candidate exchange
  socket.on("ice_candidate", ({ callerEnumber, calleeEnumber, candidate }) => {
    console.log(`[ICE] ${callerEnumber} <-> ${calleeEnumber}`);

    // Route to the other peer
    const targetRoom = callerEnumber === socket.enumber ? calleeEnumber : callerEnumber;
    io.to(targetRoom).emit("ice_candidate", { candidate });
  });

  // End call
  socket.on("end_call", ({ enumber1, enumber2 }) => {
    console.log(`[END] ${enumber1} ended with ${enumber2}`);

    io.to(enumber1).emit("call_ended", { reason: "ended" });
    io.to(enumber2).emit("call_ended", { reason: "ended" });
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    if (socket.enumber) {
      onlineUsers.delete(socket.enumber);
      console.log(`[-] ${socket.enumber} disconnected`);
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`\n?? eNative Signaling Server running on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health`);
});
