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

/**
 * @swagger
 * components:
 *   schemas:
 *     ChatMessageDto:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         messageType:
 *           type: string
 *           enum: [TEXT, IMAGE, FILE]  # MessageType enum 값에 맞춰서
 *         content:
 *           type: string
 *         senderId:
 *           type: string
 *         chatRoomId:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *       required:
 *         - id
 *         - messageType
 *         - content
 *         - senderId
 *         - chatRoomId
 *         - createdAt
 *
 *     SendMessageDto:
 *       type: object
 *       properties:
 *         chatRoomId:
 *           type: string
 *           format: uuid
 *         messageType:
 *           type: string
 *           enum: [TEXT, IMAGE, FILE]
 *         content:
 *           type: string
 *       required:
 *         - chatRoomId
 *         - messageType
 *         - content
 *
 *     SendPublicMessageDto:
 *       type: object
 *       properties:
 *         messageType:
 *           type: string
 *           enum: [TEXT, IMAGE, FILE]
 *         content:
 *           type: string
 *       required:
 *         - messageType
 *         - content
 */

/**
 * @swagger
 * /api/v1/chatMessages/{roomId}:
 *   get:
 *     summary: "채팅방 메시지 조회"
 *     tags: [ChatMessages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: roomId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: "조회할 채팅방 ID"
 *     responses:
 *       "200":
 *         description: "메시지 조회 성공"
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ChatMessageDto'
 *       "401":
 *         description: "인증 실패"
 */
chatMessageRouter.get(
  "/:roomId",
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
