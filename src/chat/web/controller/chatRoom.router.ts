import { authMiddleware, AuthRequest } from "@/auth/auth.middleware";
import { PrismaChatRoomRepository } from "@/chat/repository/PrismaChatRoomRepository";
import { ChatRoomService } from "@/chat/service/ChatRoomService";
import { MemberId } from "@/member/domain/MemberId";
import { PrismaMemberRepository } from "@/member/repository/PrismaMemberRepository";
import { PrismaClient } from "@prisma/client";
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
