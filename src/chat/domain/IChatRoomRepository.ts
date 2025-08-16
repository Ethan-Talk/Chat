import { ChatRoom, ChatRoomId } from "./ChatRoom";
import { Member } from "@/member/domain/Member";

export interface IChatRoomRepository {
  create(room: ChatRoom, initialMembers: Member[]): Promise<ChatRoom>;
  findById(id: ChatRoomId): Promise<ChatRoom | null>;

  // TODO: addMember, removeMember, deleteChatRoom
}
