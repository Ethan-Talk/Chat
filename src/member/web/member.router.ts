import { PrismaClient } from "@prisma/client";
import { PrismaMemberRepository } from "@/member/repository/PrismaMemberRepository";
import { MemberService } from "@/member/service/MemberService";
import { Router } from "express";
import { plainToInstance } from "class-transformer";
import { MemberSignUpDto } from "./dto";
import { validate } from "class-validator";

const prisma = new PrismaClient();
const memberRepository = new PrismaMemberRepository(prisma);
const memberService = new MemberService(memberRepository);

const memberRouter = Router();

/**
 * @swagger
 * /api/v1/members/signup:
 * post:
 * summary: "회원가입"
 * description: "새로운 회원을 생성합니다."
 * tags: [Members]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * loginId:
 * type: string
 * nickname:
 * type: string
 * password:
 * type: string
 * responses:
 * "201":
 * description: "회원가입 성공"
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/MemberDto'
 */
memberRouter.post("/signup", async (req, res, next) => {
  try {
    const memberSignUpDto = plainToInstance(MemberSignUpDto, req.body);

    const errors = await validate(memberSignUpDto);

    if (errors.length > 0) {
      // 400 Bad Request 상태 코드와 에러 내용을 응답
      return res.status(400).json({ message: "Validation failed", errors });
    }

    const result = await memberService.signup(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

export { memberRouter };
