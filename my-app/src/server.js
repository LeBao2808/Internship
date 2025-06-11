// server.ts
import express from "express";
import { createServer } from "http";

import { Server } from "socket.io";

const expressApp = express();
const httpServer = createServer(expressApp);
const io = new Server(httpServer,{
  cors: {
    origin: "*", // Cho phép mọi domain kết nối
    methods: ["GET", "POST"], // Các phương thức HTTP được cho phép
    credentials: true, // Nếu bạn dùng cookie/token xác thực
  },
});

// Lắng nghe kết nối socket
io.on("connection", (socket) => {
  console.log("Client connected");

  socket.on("clientMessage", (msg) => {
    console.log("Received:", msg);
    io.emit("message", `Server received: ${msg}`);
  });
  socket.on("sendComment", (data) => {
    console.log("Nhận được bình luận từ client:", data);
    socket.broadcast.emit("receiveComment", data);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// Khởi động server
const PORT = parseInt(process.env.PORT || "3001", 10);
httpServer.listen(PORT, () => {
  console.log(`Socket.IO & Next.js server running on port ${PORT}`);
});