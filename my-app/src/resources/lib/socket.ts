// lib/socket.ts
import io from "socket.io-client";

const socket = io("https://devblog-z3ir.onrender.com", {
  reconnection: true,
  reconnectionAttempts: Infinity,
});

export default socket;