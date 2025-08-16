import { Server, Socket } from "socket.io";
import { validateAccessToken } from "@/auth/auth.utils";

export class ChatGateway {
  private io: Server;
  private userSocketMap = new Map<string, string>();

  constructor(io: Server) {
    this.io = io;
  }

  // 게이트웨이 초기 설정
  public initialize() {
    this.io.use(this.authMiddleware);
    this.io.on("connection", this.handleConnection);
  }

  // 인증 미들웨어
  private authMiddleware = (socket: Socket, next: (err?: Error) => void) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("액세스 토큰이 없습니다."));
    try {
      const decoded = validateAccessToken(token);
      socket.data = { memberId: decoded.memberId };
      next();
    } catch (error) {
      return next(new Error("유효하지 않은 액세스 토큰"));
    }
  };

  // 연결 처리 핸들러
  private handleConnection = (socket: Socket) => {
    const memberId = socket.data.memberId;
    console.log(`✅ User connected: ${socket.id}, Member ID: ${memberId}`);
    this.userSocketMap.set(memberId, socket.id);

    socket.join("lobby");

    // 각 이벤트에 대한 핸들러를 등록
    socket.on("public", (message: string) =>
      this.handlePublicMessage(socket, message)
    );
    socket.on("private", (data) => this.handlePrivateMessage(socket, data));
    socket.on("disconnect", () => this.handleDisconnect(socket));
  };

  // 전체 메시지 처리
  private handlePublicMessage = (socket: Socket, message: string) => {
    this.io.emit("public", {
      senderId: socket.data.memberId,
      message: message,
      timestamp: new Date(),
    });
  };

  // 1:1 메시지 처리
  private handlePrivateMessage = (
    socket: Socket,
    data: { recipientId: string; message: string }
  ) => {
    const recipientSocketId = this.userSocketMap.get(data.recipientId);
    const senderId = socket.data.memberId;

    const messagePayload = {
      senderId: senderId,
      message: data.message,
      timestamp: new Date(),
    };

    if (recipientSocketId) {
      this.io.to(recipientSocketId).emit("private", messagePayload); //받는 사람
      socket.emit("private", messagePayload); //보낸 사람.
    } else {
      socket.emit("deliveryFailed", {
        recipientId: data.recipientId,
        message: "상대방이 오프라인 상태입니다.",
      });
    }
  };

  // 연결 종료 처리
  private handleDisconnect = (socket: Socket) => {
    console.log(`❌ User disconnected: ${socket.id}`);
    this.userSocketMap.delete(socket.data.memberId);
  };
}
