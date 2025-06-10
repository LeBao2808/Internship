// server/index.ts
import { createServer } from "http";
import { Server } from "socket.io";
import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*", // chỉnh đúng domain production
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("🟢 New user connected");

  socket.on("send-comment", (data) => {
    // Gửi comment mới đến tất cả client
    io.emit("new-comment", data);
  });

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected");
  });
});

httpServer.listen(4000, () => {
  console.log("🚀 Socket.IO server running at http://localhost:3000");
});
