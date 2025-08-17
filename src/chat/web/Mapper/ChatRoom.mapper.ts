import { RoomType } from "@prisma/client";
import {
  ChatRoomDto,
  GroupChatRoomDto,
  PrivateChatRoomDto,
} from "../dto/ChatRoom.dto";
import { ChatRoom } from "@/chat/domain/ChatRoom";

//TODO: 추후 채팅방 타입이 다양해진다면, if-else 대신 전략 패턴, 맵 기반 팩토리로 개선
export function toChatRoomDto(chatRoom: ChatRoom): ChatRoomDto {
  if (chatRoom.type === RoomType.GROUP) {
    // DTO의 정적 메서드를 호출하여 생성
    return GroupChatRoomDto.fromDomain(chatRoom);
  } else {
    return PrivateChatRoomDto.fromDomain(chatRoom);
  }
}
