import { MessageType } from "@prisma/client";
import { MemberId } from "@/member/domain/MemberId";
import { ChatRoom, ChatRoomId } from "@/chat/domain/ChatRoom"; //TODO: ID들은 한 파일에 모으는 것을 고려
import { ChatMessage as PrismaChatMessage } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "@/lib/prisma";

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
    senderId: MemberId;
    messageType: MessageType;
    content: string;
    chatRoomId: ChatRoomId;
  }): ChatMessage {
    const id = ChatMessageId(uuidv4());
    const createdAt = new Date();

    if (!props.content || !props.content.trim()) {
      throw new Error("Message content cannot be empty.");
    }

    return new ChatMessage(
      id,
      props.senderId,
      props.messageType,
      props.content,
      props.chatRoomId,
      createdAt
    );
  }

  public static fromPersistence(prismaChatMessage: PrismaChatMessage) {
    const id = ChatMessageId(prismaChatMessage.id);
    const senderId = MemberId(prismaChatMessage.senderId);
    const messageType = prismaChatMessage.messageType;
    const content = prismaChatMessage.content;
    const chatRoomId = ChatRoomId(prismaChatMessage.chatRoomId);
    const createdAt = prismaChatMessage.createdAt;

    return new ChatMessage(
      id,
      senderId,
      messageType,
      content,
      chatRoomId,
      createdAt
    );
  }
}
