import { authMiddleware, AuthRequest } from "@/auth/auth.middleware";
import { PrismaChatRoomRepository } from "@/chat/repository/PrismaChatRoomRepository";
import { ChatRoomService } from "@/chat/service/ChatRoomService";
import { MemberId } from "@/member/domain/MemberId";
import { PrismaMemberRepository } from "@/member/repository/PrismaMemberRepository";
import { plainToInstance } from "class-transformer";
import { Router } from "express";
import { ChatRoomCreateRequestDTO } from "../dto/ChatRoom.dto";
import { validate } from "class-validator";
import { prisma } from "@/lib/prisma";

const memberRepository = new PrismaMemberRepository(prisma);
const chatRoomRepository = new PrismaChatRoomRepository(prisma);

const chatRoomService = new ChatRoomService(
  chatRoomRepository,
  memberRepository
);

const chatRoomRouter = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     ChatRoomCreateRequestDTO:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           nullable: true
 *         type:
 *           type: string
 *           enum: [PRIVATE, GROUP] # RoomType enum 값
 *         memberIds:
 *           type: array
 *           items:
 *             type: string
 *             format: uuid
 *       required:
 *         - type
 *         - memberIds
 *
 *     ChatRoomBaseDto:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         type:
 *           type: string
 *           enum: [PRIVATE, GROUP]
 *         createdAt:
 *           type: string
 *           format: date-time
 *       required:
 *         - id
 *         - type
 *         - createdAt
 *
 *     PrivateChatRoomDto:
 *       allOf:
 *         - $ref: '#/components/schemas/ChatRoomBaseDto'
 *
 *     GroupChatRoomDto:
 *       allOf:
 *         - $ref: '#/components/schemas/ChatRoomBaseDto'
 *         - type: object
 *           properties:
 *             name:
 *               type: string
 *           required:
 *             - name
 *
 *     ChatRoomDto:
 *       oneOf:
 *         - $ref: '#/components/schemas/PrivateChatRoomDto'
 *         - $ref: '#/components/schemas/GroupChatRoomDto'
 */

/**
 * @swagger
 * /api/v1/chat/rooms:
 *   post:
 *     summary: "채팅방 생성"
 *     tags: [ChatRooms]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChatRoomCreateRequestDTO'
 *     responses:
 *       "201":
 *         description: "채팅방 생성 성공"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChatRoomDto'
 *       "400":
 *         description: "유효성 검사 실패"
 *       "401":
 *         description: "인증 실패"
 */
chatRoomRouter.post("", authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const dto = plainToInstance(ChatRoomCreateRequestDTO, req.body);
    const errors = await validate(dto);
    if (errors.length > 0) {
      return res.status(400).json({ message: "Validation failed", errors });
    }

    const creatorId = MemberId(req.user.memberId);

    const response = await chatRoomService.createChatRoom(creatorId, dto);
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/chat/rooms:
 *   get:
 *     summary: "멤버가 속한 채팅방 목록 조회"
 *     tags: [ChatRooms]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: "조회 성공"
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ChatRoomDto'
 *       "401":
 *         description: "인증 실패"
 */
chatRoomRouter.get("", authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const memberId = MemberId(req.user.memberId);

    const response = await chatRoomService.findChatRoomsByMemberId(memberId);
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

export { chatRoomRouter };
