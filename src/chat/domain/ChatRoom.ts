//TODO: ChatRoomId 분리
export type ChatRoomId = string & { readonly __brand: "ChatRoomId" };
import { RoomType, ChatRoom as PrismaChatRoom } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

export function ChatRoomId(value: string): ChatRoomId {
  if (!/^[0-9a-fA-F-]{36}$/.test(value)) {
    throw new Error("Invalid ChatRoomId format");
  }
  return value as ChatRoomId;
}

export class ChatRoom {
  private constructor(
    public readonly id: ChatRoomId,
    public name: string | null, // 1:1은 null
    public readonly type: RoomType,
    public readonly createdAt: Date
  ) {}

  public static create(props: { name?: string; type: RoomType }): ChatRoom {
    const id = ChatRoomId(uuidv4());
    const name = props.name || null;
    const createdAt = new Date();

    if (props.type === RoomType.GROUP && !name) {
      throw new Error("Group chat rooms must have a name.");
    }

    return new ChatRoom(id, name, props.type, createdAt);
  }

  public static fromPersistence(prismaRoom: PrismaChatRoom): ChatRoom {
    const id = ChatRoomId(prismaRoom.id);
    const name = prismaRoom.name;
    const type = prismaRoom.type;
    const createdAt = prismaRoom.createdAt;

    return new ChatRoom(id, name, type, createdAt);
  }
}
