import { MessageType } from "@prisma/client";
import { MemberId } from "@/member/domain/MemberId";
import { ChatRoom, ChatRoomId } from "@/chat/domain/ChatRoom"; //TODO: ID들은 한 파일에 모으는 것을 고려
import { Member } from "@/member/domain/Member";
import { v4 as uuidv4 } from "uuid";

export type ChatMessageId = string & { readonly __brand: "ChatMessageId" };
export function ChatMessageId(value: string): ChatMessageId {
  if (!/^[0-9a-fA-F-]{36}$/.test(value)) {
    throw new Error("Invalid ChatMessageId format");
  }
  return value as ChatMessageId;
}

export class ChatMessage {
  private constructor(
    public readonly id: ChatMessageId,
    public readonly senderId: MemberId,
    public readonly messageType: MessageType,
    public readonly content: string, //TODO: type에 따라 다르게 해야할 수도
    public readonly chatRoomId: ChatRoomId,
    public readonly createdAt: Date
  ) {}

  public static create(props: {
    sender: Member;
    messageType: MessageType;
    content: string;
    chatRoom: ChatRoom;
  }): ChatMessage {
    const id = ChatMessageId(uuidv4());
    const createdAt = new Date();

    if (!props.content) {
      throw new Error("Message content cannot be empty.");
    }

    return new ChatMessage(
      id,
      props.sender.id,
      props.messageType,
      props.content,
      props.chatRoom.id,
      createdAt
    );
  }
}
