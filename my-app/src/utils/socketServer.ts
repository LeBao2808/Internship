// // utils/socketServer.ts
// import { Server } from "socket.io";
// import { httpServer } from "@/server";

// let io: Server | null = null;

// export const initSocketIO = () => {
//   if (!io) {
//     io = new Server(httpServer, {
//       cors: {
//         origin: "*", // Cho phép tất cả trong dev
//       },
//     });

//     io.on("connection", (socket) => {
//       console.log("🔵 Một client đã kết nối");

//       socket.on("disconnect", () => {
//         console.log("⚪ Một client đã ngắt kết nối");
//       });
//     });
//   }

//   return io;
// };