import { Server as SocketIOServer } from "socket.io";
import { createServer, Server as HttpServer } from "http";
import { createHttpTerminator, HttpTerminator } from "http-terminator";
import { MemberId } from "@/member/domain/MemberId";
import { generateAccessToken } from "@/auth/auth.utils";
import { PrismaMemberRepository } from "@/member/repository/PrismaMemberRepository";
import { PrismaChatRoomRepository } from "@/chat/repository/PrismaChatRoomRepository";
import { PrismaChatMessageRepository } from "@/chat/repository/PrismaChatMessageRepository";
import { ChatRoomService } from "@/chat/service/ChatRoomService";
import { ChatMessageService } from "@/chat/service/ChatMessageService";
import { ChatGateway } from "@/chat/ChatGateway";
import { io as Client, Socket as ClientSocket } from "socket.io-client";
import * as bcrypt from "bcrypt";
import express from "express";
import { chatRoomRouter } from "@/chat/web/controller/chatRoom.router";
import axios from "axios";
import { PrismaClient, RoomType } from "@prisma/client";
import { JoinRoomDto } from "@/chat/web/dto/ChatRoom.dto";

describe("1대1 채팅 기능 통합 테스트", () => {
  let io: SocketIOServer,
    server: HttpServer,
    httpTerminator: HttpTerminator,
    port: number;
  let client1: ClientSocket, client2: ClientSocket;
  let chatRoomId: string;
  let prisma: PrismaClient;

  const TEST_USER_1 = {
    id: MemberId("11111111-1111-4111-a111-111111111111"),
    token: generateAccessToken(
      MemberId("11111111-1111-4111-a111-111111111111")
    ),
  };
  const TEST_USER_2 = {
    id: MemberId("22222222-2222-4222-a222-222222222222"),
    token: generateAccessToken(
      MemberId("22222222-2222-4222-a222-222222222222")
    ),
  };

  beforeAll(async () => {
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL, // .env.test의 URL을 사용
        },
      },
    });

    const hashedPassword = await bcrypt.hash("password123", 10);
    await prisma.member.createMany({
      data: [
        {
          id: TEST_USER_1.id,
          loginId: "testuser1",
          nickname: "테스트유저1",
          password: hashedPassword,
        },
        {
          id: TEST_USER_2.id,
          loginId: "testuser2",
          nickname: "테스트유저2",
          password: hashedPassword,
        },
      ],
      skipDuplicates: true, //이 친구는 뭐고
    });

    // 테스트용 Express 앱 및 서버 설정
    const app = express();
    app.use(express.json());
    server = createServer(app);
    io = new SocketIOServer(server);
    httpTerminator = createHttpTerminator({ server });

    const memberRepo = new PrismaMemberRepository(prisma);
    const chatRoomRepository = new PrismaChatRoomRepository(prisma);
    const chatMessageRepository = new PrismaChatMessageRepository(prisma);
    const chatRoomService = new ChatRoomService(chatRoomRepository, memberRepo);
    const chatMessageService = new ChatMessageService(
      chatMessageRepository,
      memberRepo,
      chatRoomRepository
    );
    const chatGateway = new ChatGateway(
      io,
      chatMessageService,
      chatRoomRepository
    );

    app.use("/api/v1/rooms", chatRoomRouter); // 👈 API 테스트를 위해 라우터 연결
    chatGateway.initialize(); // 👈 게이트웨이 초기화

    await new Promise<void>((resolve) => {
      server.listen(() => {
        port = (server.address() as any).port;
        resolve();
      });
    });
  });

  afterAll(async () => {
    // 테스트용 데이터 정리
    await prisma.chatMessage.deleteMany({});
    await prisma.chatRoomMember.deleteMany({});
    await prisma.chatRoom.deleteMany({});
    await prisma.member.deleteMany({
      where: { id: { in: [TEST_USER_1.id, TEST_USER_2.id] } },
    });
    if (client1) client1.close();
    if (client2) client2.close();
    // 서버 및 클라이언트 연결 종료

    await httpTerminator.terminate();
  });

  test("1&2: 두 사용자가 각각 소켓에 연결할 수 있다", async () => {
    const connectPromise1 = new Promise<void>((resolve) => {
      client1 = Client(`http://localhost:${port}`, {
        auth: { token: TEST_USER_1.token },
      });
      client1.on("connect", resolve);
    });
    const connectPromise2 = new Promise<void>((resolve) => {
      client2 = Client(`http://localhost:${port}`, {
        auth: { token: TEST_USER_2.token },
      });
      client2.on("connect", resolve);
    });

    await Promise.all([connectPromise1, connectPromise2]);

    expect(client1.connected).toBe(true);
    expect(client2.connected).toBe(true);
  });

  test("3: API를 통해 1대1 채팅방이 생성되어야 한다", async () => {
    const res = await axios.post(
      `http://localhost:${port}/api/v1/rooms`,
      {
        type: RoomType.PRIVATE,
        memberIds: [TEST_USER_2.id],
      },
      {
        headers: { Authorization: `Bearer ${TEST_USER_1.token}` },
      }
    );

    expect(res.status).toBe(201);
    expect(res.data.type).toBe(RoomType.PRIVATE);
    chatRoomId = res.data.id; // 다음 테스트를 위해 ID 저장
  });

  test("4: 한 사용자가 보낸 1대1 메시지는 상대방에게 실시간으로 전달되어야 한다", (done) => {
    const testMessage = "1대1 메시지 테스트";

    client1.emit("joinRoom", { roomId: chatRoomId });
    client2.emit("joinRoom", { roomId: chatRoomId });

    client2.on("newMessage", (msg) => {
      expect(msg.content).toBe(testMessage);
      expect(msg.senderId).toBe(TEST_USER_1.id);
      done();
    });

    setTimeout(() => {
      client1.emit("sendMessage", {
        chatRoomId: chatRoomId,
        content: testMessage,
        messageType: "TEXT",
      });
    }, 100);
  });

  test("5: 전송된 메시지는 데이터베이스에 저장되어야 한다", async () => {
    const messageInDb = await prisma.chatMessage.findFirst({
      where: {
        chatRoomId: chatRoomId,
        senderId: TEST_USER_1.id,
      },
      orderBy: { createdAt: "desc" },
    });

    expect(messageInDb).toBeDefined();
    expect(messageInDb?.content).toBe("1대1 메시지 테스트");
  });
});
