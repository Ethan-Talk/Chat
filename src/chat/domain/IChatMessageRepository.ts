import { ChatRoomId } from "./ChatRoom";
import { ChatMessage } from "./ChatMessage";

export interface IChatMessageRepository {
  create(message: ChatMessage): Promise<ChatMessage>;
  getAllMessageByChatRoomId(chatRoomId: ChatRoomId): Promise<ChatMessage[]>;
}
