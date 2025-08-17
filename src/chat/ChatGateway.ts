import { Server, Socket } from "socket.io";
import { validateAccessToken } from "@/auth/auth.utils";
import { ChatMessage } from "./domain/ChatMessage";
import { ChatRoomId } from "./domain/ChatRoom";

import {
  ChatMessageDto,
  SendMessageDto,
  SendPublicMessageDto,
} from "./web/dto/ChatMessage.dto";
import { ChatMessageService } from "./service/ChatMessageService";
import { IChatRoomRepository } from "./domain/IChatRoomRepository";

//TODO: 파일 네이밍 변경
export class ChatGateway {
  private io: Server;
  private chatMessageService: ChatMessageService;
  private chatRoomRepository: IChatRoomRepository;
  private userSocketMap = new Map<string, string>();

  constructor(
    io: Server,
    chatMessageService: ChatMessageService,
    chatRoomRepository: IChatRoomRepository
  ) {
    this.io = io;
    this.chatMessageService = chatMessageService;
    this.chatRoomRepository = chatRoomRepository;
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

    /*
    // 각 이벤트에 대한 핸들러를 등록
    socket.on("public", (dto: SendPublicMessageDto) =>
      this.handlePublicMessage(socket, dto)
    );
    socket.on("private", (data) => this.handlePrivateMessage(socket, data));
    */
    socket.on("sendMessage", (dto: SendMessageDto) =>
      this.handleSendMessage(socket, dto)
    );
    socket.on("disconnect", () => this.handleDisconnect(socket));
  };

  /*
  // 전체 메시지 처리
  private handlePublicMessage = (socket: Socket, dto: SendPublicMessageDto) => {
    const senderId = socket.data.memberId;


    //TODO 메시지 도메인, DTO 생성은 로직이 private,public 겹침 리팩토링 ㄱㄱ
    const chatMessage = ChatMessage.create({
      content: dto.content,
      senderId: senderId,
      messageType: dto.messageType as MessageType,
      chatRoomId: this.lobbyRoomId,
    });

    const messageDto = ChatMessageDto.fromDomain(chatMessage);

    this.io.to('lobby').emit('newMessage', messageDto)

    //전송은 OK 근데 DB에 저장하는 건?
  };

  // 1:1 메시지 처리
  private handlePrivateMessage = (
    socket: Socket,
    dto : SendMessageDto
  ) => {
    //상대 소켓을 알아야함... 소켓이 연결된 상태면 바로 보내면 되는데 안되면 DB에 저장하고 나중에 상대방이 확인할 수 있도록 해야함.
    //그럼 ChatRoomId => 상대방의 ID => 상대방의 소켓 ID를 알아내는 로직을 구현해야 함

    const recipientSocketId = this.userSocketMap.get(data.recipientId);
    const senderId = socket.data.memberId;

    const chatMessage = ChatMessage.create({
      content: dto.content,
      senderId : senderId,
      messageType : dto.messageType as MessageType,
      chatRoomId: dto.chatRoomId as ChatRoomId,
    })

    const messageDto = ChatMessageDto.fromDomain(chatMessage);

    if (recipientSocketId) {
      this.io.to(recipientSocketId).emit("private", messageDto); //받는 사람
      socket.emit("private", messageDto); //보낸 사람.
    } else {
      socket.emit("deliveryFailed", {
        message: "상대방이 오프라인 상태입니다.",
      });
      //DB에 저장...
    }
  };
  */

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
    console.log(`❌ User disconnected: ${socket.id}`);
    this.userSocketMap.delete(socket.data.memberId);
  };
}
