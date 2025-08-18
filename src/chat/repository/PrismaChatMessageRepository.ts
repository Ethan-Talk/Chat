import { MemberId } from "@/member/domain/MemberId";
import { IChatMessageRepository } from "../domain/IChatMessageRepository";
import { ChatRoomId } from "../domain/ChatRoom";
import { MessageType, PrismaClient } from "@prisma/client";
import { ChatMessage } from "../domain/ChatMessage";

export class PrismaChatMessageRepository implements IChatMessageRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(message: ChatMessage): Promise<ChatMessage> {
    const prismaChatMessage = await this.prisma.chatMessage.create({
      data: {
        id: message.id,
        content: message.content,
        messageType: message.messageType,
        createdAt: message.createdAt,
        senderId: message.senderId,
        chatRoomId: message.chatRoomId,
      },
    });

    return ChatMessage.fromPersistence(prismaChatMessage);
  }
}
