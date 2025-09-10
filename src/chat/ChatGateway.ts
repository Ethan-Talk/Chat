import { Server, Socket } from "socket.io";
import { validateAccessToken } from "@/auth/auth.utils";
import { ChatRoomId } from "./domain/ChatRoom";

import {
  ChatMessageDto,
  SendMessageDto,
  SendPublicMessageDto,
} from "./web/dto/ChatMessage.dto";
import { ChatMessageService } from "./service/ChatMessageService";
import { IChatRoomRepository } from "./domain/IChatRoomRepository";
import { JoinRoomDto } from "./web/dto/ChatRoom.dto";
import { MemberId } from "@/member/domain/MemberId";
import { Member } from "@/member/domain/Member";
import { PresenceService } from "./service/PresenceService";

//TODO: 파일 네이밍 변경
export class ChatGateway {
  private io: Server;
  private chatMessageService: ChatMessageService;
  private chatRoomRepository: IChatRoomRepository;
  private presenceService: PresenceService;

  constructor(
    io: Server,
    chatMessageService: ChatMessageService,
    chatRoomRepository: IChatRoomRepository,
    presenceService: PresenceService
  ) {
    this.io = io;
    this.chatMessageService = chatMessageService;
    this.chatRoomRepository = chatRoomRepository;
    this.presenceService = presenceService;

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
      socket.data = { memberId: MemberId(decoded.memberId) };
      next();
    } catch (error) {
      return next(new Error("유효하지 않은 액세스 토큰"));
    }
  };

  // 연결 처리 핸들러
  private handleConnection = (socket: Socket) => {
    const memberId = socket.data.memberId;
    console.log(`✅ User connected: ${socket.id}, Member ID: ${memberId}`);
    this.presenceService.addUser(memberId, socket.id);

    socket.on("sendMessage", (dto: SendMessageDto) =>
      this.handleSendMessage(socket, dto)
    );
    socket.on("disconnect", () => this.handleDisconnect(socket));
    socket.on("joinRoom", (dto) => this.handleJoinRoom(socket, dto));
  };

  private handleJoinRoom = async (socket: Socket, dto: JoinRoomDto) => {
    try {
      //TODO 유효성 검사...?

      const memberId = socket.data.memberId;
      const roomId = ChatRoomId(dto.roomId);

      const isMember = await this.chatRoomRepository.isMemberInRoom(
        memberId,
        roomId
      );
      if (!isMember) {
        throw new Error("You are not a member of this room.");
      }

      socket.join(roomId);
      socket.emit("joinedRoom", { roomId });
    } catch (error) {
      socket.emit("error", { message: (error as Error).message });
    }
  };

  private handleSendMessage = async (socket: Socket, dto: SendMessageDto) => {
    try {
      const senderId = socket.data.memberId;
      const chatRoomId = ChatRoomId(dto.chatRoomId);

      //보내는 사람이 채팅방의 멤버인가?
      const isMember = await this.chatRoomRepository.isMemberInRoom(
        senderId,
        chatRoomId
      );
      if (!isMember) {
        throw new Error(
          "해당 채팅방의 멤버가 아니거나, 채팅방이 존재하지 않습니다."
        );
      }

      const savedMessage = await this.chatMessageService.createChatMessage(
        senderId,
        dto
      );
      const messageDto = ChatMessageDto.fromDomain(savedMessage);

      this.io.to(dto.chatRoomId).emit("newMessage", messageDto);
    } catch (error) {
      socket.emit("error", { message: (error as Error).message });
    }
  };

  // 연결 종료 처리
  private handleDisconnect = (socket: Socket) => {
    const memberId = socket.data.memberId;
    if (memberId) {
      console.log(`❌ User disconnected: ${socket.id}, Member ID: ${memberId}`);
      // 👇 2. memberId가 있을 때만 map에서 삭제합니다.
      this.presenceService.removeUser(memberId);
    } else {
      // memberId가 없는 비정상적인 연결 종료 (예: 인증 실패 후)
      console.log(`❌ Socket disconnected: ${socket.id}`);
    }
  };
}
