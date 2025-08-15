import express from "express";
import { memberRouter } from "@/member/web/member.router";
import swaggerUi from "swagger-ui-express"; // 👈 1. swagger-ui-express 임포트
import { specs } from "./config/swagger"; // 👈 2. 우리가 만든 설정 파일 임포트
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import { setupChatGateway } from "./chat/chat.gateway";

// 1. Express 앱 생성
const app = express();
const port = 3000; // 서버를 실행할 포트
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

setupChatGateway(io);

app.use(
  cors({
    exposedHeaders: ["Authorization"],
  })
);

app.use(express.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
app.use("/api/v1/members", memberRouter);

httpServer.listen(port, () => {
  console.log(`🚀 Server is running at http://localhost:${port}`);
});
