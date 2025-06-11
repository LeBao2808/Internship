// socket.ts
import { io, Socket } from "socket.io-client";


let socket: Socket | null = null;

const SERVER_URL = "http://localhost:3001";

export const connectSocket = (): Socket => {
  if (!socket) {
    socket = io(SERVER_URL, {
      reconnection: true,
      reconnectionAttempts: Infinity,
      randomizationFactor: 0.5,
      transports: ["websocket", "polling"], // thử cả 2 loại transport
    });

    // Bắt lỗi kết nối
    socket.on("connect_error", (err) => {
      console.error("🔌 Connect error:", err.message);
    });

    socket.on("disconnect", (reason) => {
      console.warn("🔌 Disconnected:", reason);
    });

    socket.on("connect", () => {
      console.log("🟢 Kết nối thành công!");
    });
  }

  return socket;
};

// Hàm giúp client lắng nghe sự kiện
export const listenToNewComment = (
    callback: (comment: any) => void
  ): (() => void) => {
    const socket = connectSocket();
    console.log(socket);
    
    const handler = (comment: any) => callback(comment);
    console.log(handler);
    socket.on("comment_received", handler);
 
    // Trả về hàm để remove listener
    return () => {
      socket.off("comment_received", handler);
    };
  }