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

  async getAllMessageByChatRoomId(
    chatRoomId: ChatRoomId
  ): Promise<ChatMessage[]> {
    const prismaMessages = await this.prisma.chatMessage.findMany({
      where: { chatRoomId: chatRoomId },
      orderBy: {
        createdAt: "asc", // 오래된 메시지부터 순서대로 정렬
      },
    });

    return prismaMessages.map(ChatMessage.fromPersistence);
  }
}
