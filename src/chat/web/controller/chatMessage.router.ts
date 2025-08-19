import { authMiddleware, AuthRequest } from "@/auth/auth.middleware";
import { ChatRoomId } from "@/chat/domain/ChatRoom";
import { PrismaChatMessageRepository } from "@/chat/repository/PrismaChatMessageRepository";
import { PrismaChatRoomRepository } from "@/chat/repository/PrismaChatRoomRepository";
import { ChatMessageService } from "@/chat/service/ChatMessageService";
import { prisma } from "@/lib/prisma";
import { MemberId } from "@/member/domain/MemberId";
import { Router } from "express";

const chatMessageRepository = new PrismaChatMessageRepository(prisma);
const chatRoomRepository = new PrismaChatRoomRepository(prisma);

const chatMessageService = new ChatMessageService(
  chatMessageRepository,
  chatRoomRepository
);

const chatMessageRouter = Router();

chatMessageRouter.get(
  "/:roomid",
  authMiddleware,
  async (req: AuthRequest, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const memberId = MemberId(req.user.memberId);
      const chatRoomId = ChatRoomId(req.params.roomId);

      const messages = await chatMessageService.getAllMessagesByChatRoomId(
        memberId,
        chatRoomId
      );

      res.status(200).json(messages);
    } catch (error) {
      next(error);
    }
  }
);

export { chatMessageRouter };
