import { ChatMessage, ChatMessageId } from "@/chat/domain/ChatMessage";
import { ChatRoomId } from "@/chat/domain/ChatRoom";
import { MemberId } from "@/member/domain/MemberId";
import { MessageType } from "@prisma/client";

export class ChatMessageDto {
  readonly id: ChatMessageId;
  readonly messageType: MessageType;
  readonly content: string;
  readonly senderId: MemberId;
  readonly chatRoomId: ChatRoomId;
  readonly createdAt: Date;

  private constructor(props: ChatMessage) {
    this.id = props.id;
    this.content = props.content;
    this.messageType = props.messageType;
    this.senderId = props.senderId;
    this.chatRoomId = props.chatRoomId;
    this.createdAt = props.createdAt;
  }

  public static fromDomain(message: ChatMessage): ChatMessageDto {
    return new ChatMessageDto(message);
  }
}
