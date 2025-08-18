import { ChatRoom, ChatRoomId } from "@/chat/domain/ChatRoom";
import { RoomType } from "@prisma/client";
import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  IsNotEmpty,
  ArrayMinSize,
} from "class-validator";

export class ChatRoomCreateRequestDTO {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(RoomType)
  type!: RoomType;

  @IsArray()
  @IsUUID("4", { each: true, message: "각 멤버 ID는 UUID 형식이어야 합니다." })
  memberIds!: string[];
}
//TODO: Union vs 부모자식
class ChatRoomBaseDto {
  readonly id: ChatRoomId;
  readonly type: RoomType;
  readonly createdAt: Date;

  protected constructor(props: {
    id: ChatRoomId;
    type: RoomType;
    createdAt: Date;
  }) {
    this.id = props.id;
    this.type = props.type;
    this.createdAt = props.createdAt;
  }
}

// 1:1 채팅방 DTO (이름이 없음)
export class PrivateChatRoomDto extends ChatRoomBaseDto {
  constructor(props: { id: ChatRoomId; createdAt: Date }) {
    super({ ...props, type: RoomType.PRIVATE });
  }

  public static fromDomain(chatRoom: ChatRoom): PrivateChatRoomDto {
    return new PrivateChatRoomDto({
      id: chatRoom.id,
      createdAt: chatRoom.createdAt,
    });
  }
}

// 그룹 채팅방 DTO (이름이 필수)
export class GroupChatRoomDto extends ChatRoomBaseDto {
  readonly name: string;

  constructor(props: { id: ChatRoomId; name: string; createdAt: Date }) {
    super({ ...props, type: RoomType.GROUP });
    this.name = props.name;
  }

  public static fromDomain(chatRoom: ChatRoom): GroupChatRoomDto {
    return new GroupChatRoomDto({
      id: chatRoom.id,
      name: chatRoom.name!,
      createdAt: chatRoom.createdAt,
    });
  }
}

export type ChatRoomDto = PrivateChatRoomDto | GroupChatRoomDto;

export class JoinRoomDto {
  @IsUUID("4")
  @IsNotEmpty()
  readonly roomId!: string;
}
