import { Server, Socket } from "socket.io";
import { validateAccessToken } from "@/auth/auth.utils";

export function setupChatGateway(io: Server) {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("액세스 토큰이 없습니다."));
    }
    try {
      const decoded = validateAccessToken(token);
      (socket as any).data = { memberId: decoded.memberId };
      next();
    } catch (error) {
      return next(new Error("유효하지 않은 액세스 토큰"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const memberId = (socket as any).data.memberId;
    console.log(`✅ User connected: ${socket.id}, Member ID: ${memberId}`);

    // 'sendMessage' 이벤트 리스너
    socket.on("sendMessage", (message: string) => {
      console.log(`Message received from ${memberId}: ${message}`);

      io.emit("newMessage", {
        senderId: memberId,
        message: message,
        timestamp: new Date(),
      });
    });

    // 연결 종료 이벤트 리스너
    socket.on("disconnect", () => {
      console.log(`❌ User disconnected: ${socket.id}`);
    });
  });
}
