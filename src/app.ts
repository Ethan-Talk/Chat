import express from "express";
import { memberRouter } from "@/member/web/member.router";
import swaggerUi from "swagger-ui-express"; // 👈 1. swagger-ui-express 임포트
import { specs } from "./config/swagger"; // 👈 2. 우리가 만든 설정 파일 임포트
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import { ChatGateway } from "./chat/ChatGateway";
import { instrument } from "@socket.io/admin-ui";
import { chatRoomRouter } from "./chat/web/controller/chatRoom.router";
import { PrismaChatMessageRepository } from "./chat/repository/PrismaChatMessageRepository";
import { prisma } from "./lib/prisma";
import { ChatMessageId } from "./chat/domain/ChatMessage";
import { ChatMessageService } from "./chat/service/ChatMessageService";
import { PrismaChatRoomRepository } from "./chat/repository/PrismaChatRoomRepository";
import { PrismaMemberRepository } from "./member/repository/PrismaMemberRepository";
import { chatMessageRouter } from "./chat/web/controller/chatMessage.router";

// 1. Express 앱 생성
const app = express();
const port = 8080; // 서버를 실행할 포트
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ["https://admin.socket.io"], // Admin UI의 출처를 명시적으로 허용
    credentials: true,
  },
});

const ChatMessageRepository = new PrismaChatMessageRepository(prisma);
const chatRoomRepository = new PrismaChatRoomRepository(prisma);
const memberRepository = new PrismaMemberRepository(prisma);

const chatMessageService = new ChatMessageService(
  ChatMessageRepository,
  chatRoomRepository
);

instrument(io, {
  auth: false,
  mode: "development",
});

const chatGateway = new ChatGateway(io, chatMessageService, chatRoomRepository);
chatGateway.initialize();

app.use(
  cors({
    exposedHeaders: ["Authorization"],
  })
);

app.use(express.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
app.use("/api/v1/members", memberRouter);
app.use("/api/v1/chatRooms", chatRoomRouter);
app.use("/api/v1/chatMessages", chatMessageRouter);

httpServer.listen(port, () => {
  console.log(`🚀 Server is running at http://localhost:${port}`);
});
