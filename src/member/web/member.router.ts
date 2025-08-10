import { PrismaClient } from "@prisma/client";
import { PrismaMemberRepository } from "@/member/repository/PrismaMemberRepository";
import { MemberService } from "@/member/service/MemberService";
import { Router } from "express";


const prisma = new PrismaClient();
const memberRepository = new PrismaMemberRepository(prisma);
const memberService = new MemberService(memberRepository);

const memberRouter = Router();

memberRouter.post('/signup', async (req, res, next) => {
    try {
        const result = await memberService.signup(req.body);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
})

export { memberRouter };