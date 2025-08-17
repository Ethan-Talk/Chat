import { PrismaClient } from "@prisma/client";
import { IChatRoomRepository } from "../domain/IChatRoomRepository";
import { ChatRoom, ChatRoomId } from "../domain/ChatRoom";
import { Member } from "@/member/domain/Member";
import { MemberId } from "@/member/domain/MemberId";

export class PrismaChatRoomRepository implements IChatRoomRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(
    room: ChatRoom,
    initialMemberIds: MemberId[]
  ): Promise<ChatRoom> {
    const prismaChatRoom = await this.prisma.chatRoom.create({
      data: {
        id: room.id,
        name: room.name,
        type: room.type,
        createdAt: room.createdAt,
        members: {
          create: initialMemberIds.map((memberId) => ({
            memberId: memberId,
          })),
        },
      },
    });
    return ChatRoom.fromPersistence(prismaChatRoom);
  }

  async findById(id: ChatRoomId): Promise<ChatRoom | null> {
    const prismaChatRoom = await this.prisma.chatRoom.findUnique({
      where: { id: id },
    });

    return prismaChatRoom ? ChatRoom.fromPersistence(prismaChatRoom) : null;
  }

  async findByAllByMemberId(memberId: MemberId): Promise<ChatRoom[]> {
    const prismaChatRooms = await this.prisma.chatRoom.findMany({
      where: {
        members: {
          some: {
            memberId: memberId,
          },
        },
      },
    });

    return prismaChatRooms.map(ChatRoom.fromPersistence);
  }

  async isMemberInRoom(
    senderId: MemberId,
    chatRoomId: ChatRoomId
  ): Promise<boolean> {
    // 중간테이블 조회
    const relation = await this.prisma.chatRoomMember.findFirst({
      where: {
        memberId: senderId,
        chatRoomId: chatRoomId,
      },
    });

    return !!relation;
  }
}
