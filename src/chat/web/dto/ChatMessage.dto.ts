import { ChatMessage, ChatMessageId } from "@/chat/domain/ChatMessage";
import { ChatRoomId } from "@/chat/domain/ChatRoom";
import { MemberId } from "@/member/domain/MemberId";
import { MessageType } from "@prisma/client";
import { IsEnum, IsNotEmpty, IsString, IsUUID } from "class-validator";

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

export class SendMessageDto {
  @IsUUID("4")
  @IsNotEmpty()
  readonly chatRoomId!: string;

  @IsString()
  @IsNotEmpty()
  readonly messageType!: string;
  @IsEnum(MessageType)
  @IsNotEmpty() // IsOptional 데코레이터를 추가하여 선택 사항으로 만듭니다.
  readonly content!: string;
}

export class SendPublicMessageDto {
  @IsString()
  @IsNotEmpty()
  readonly messageType!: string;
  @IsEnum(MessageType)
  @IsNotEmpty() // IsOptional 데코레이터를 추가하여 선택 사항으로 만듭니다.
  readonly content!: string;
}
