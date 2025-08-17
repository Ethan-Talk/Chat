import { IMemberRepository } from "@/member/domain/IMemberRepository";
import { IChatMessageRepository } from "../domain/IChatMessageRepository";
import { ChatMessageDto, SendMessageDto } from "../web/dto/ChatMessage.dto";
import { MemberId } from "@/member/domain/MemberId";
import { ChatMessage } from "../domain/ChatMessage";
import { MessageType } from "@prisma/client";
import { ChatRoomId } from "../domain/ChatRoom";
import { IChatRoomRepository } from "../domain/IChatRoomRepository";

export class ChatMessageService {
  constructor(
    private readonly chatMessageRepository: IChatMessageRepository,
    private readonly memberRepository: IMemberRepository,
    private readonly chatRoomRepository: IChatRoomRepository
  ) {}

  public async createChatMessage(
    senderId: MemberId,
    dto: SendMessageDto
  ): Promise<ChatMessageDto> {
    //Don't need to check if member exists

    //need to check if chatRoom exists

    const chatRoomId = ChatRoomId(dto.chatRoomId);

    const chatRoom = await this.chatRoomRepository.findById(chatRoomId);
    if (!chatRoom) {
      throw new Error("채팅방을 찾을 수 없습니다.");
    }

    const chatMessage = ChatMessage.create({
      senderId: senderId,
      messageType: dto.messageType as MessageType,
      content: dto.content,
      chatRoomId: chatRoomId,
    });

    const createdChatMessage = await this.chatMessageRepository.create(
      chatMessage
    );

    return ChatMessageDto.fromDomain(createdChatMessage);
  }
}
