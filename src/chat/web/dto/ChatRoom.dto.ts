import { ChatRoom, ChatRoomId } from "@/chat/domain/ChatRoom";
import { RoomType } from "@prisma/client";
import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
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

export class ChatRoomDTO {
  id: ChatRoomId;
  name?: string;
  type: RoomType;
  createdAt: Date;

  private constructor(props: {
    id: ChatRoomId;
    name?: string;
    type: RoomType;
    createdAt: Date;
  }) {
    this.id = props.id;
    this.name = props.name;
    this.type = props.type;
    this.createdAt = props.createdAt;
  }

  //TODO: name 여부에 따라 분리를 해야겠네....
  public static fromDomain(chatRoom: ChatRoom): ChatRoomDTO {
    return new ChatRoomDTO({
      id: chatRoom.id,
      name: chatRoom.name,
      type: chatRoom.type,
      createdAt: chatRoom.createdAt,
    });
  }
}
