import { MessageType } from "@prisma/client";
import { ChatRoomId } from "./ChatRoom";
import { ChatMessage } from "./ChatMessage";
import { MemberId } from "@/member/domain/MemberId";

export interface IChatMessageRepository {
  create(message: ChatMessage): Promise<ChatMessage>;
}
