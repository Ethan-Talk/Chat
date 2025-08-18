import { PrismaClient } from "@prisma/client";
import { PrismaMemberRepository } from "@/member/repository/PrismaMemberRepository";
import { MemberService } from "@/member/service/MemberService";
import { Router } from "express";
import { plainToInstance } from "class-transformer";
import { MemberSignInDTO, MemberSignUpDto } from "./dto";
import { validate } from "class-validator";
import { generateAccessToken } from "@/auth/auth.utils";
import { authMiddleware, AuthRequest } from "@/auth/auth.middleware";
import { MemberId } from "../domain/MemberId";
import { prisma } from "@/lib/prisma";

const memberRepository = new PrismaMemberRepository(prisma);
const memberService = new MemberService(memberRepository);

const memberRouter = Router();

memberRouter.post("/signup", async (req, res, next) => {
  try {
    const memberSignUpDto = plainToInstance(MemberSignUpDto, req.body);

    const errors = await validate(memberSignUpDto);

    if (errors.length > 0) {
      // 400 Bad Request 상태 코드와 에러 내용을 응답
      return res.status(400).json({ message: "Validation failed", errors });
    }

    const result = await memberService.signup(memberSignUpDto);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

memberRouter.post("/signin", async (req, res, next) => {
  try {
    const memberSignInDTO = plainToInstance(MemberSignInDTO, req.body);
    const errors = await validate(memberSignInDTO);
    if (errors.length > 0) {
      return res.status(400).json({ message: "Validation failed", errors });
    }

    const memberDto = await memberService.signin(memberSignInDTO);

    // TODO : 토큰은 책임 분리 측면에서 여기에 맞지 않음. 따로 빼야겠음
    const accessToken = generateAccessToken(memberDto.id);

    // 4. 응답 헤더에 토큰 추가
    res.setHeader("Authorization", `Bearer ${accessToken}`);

    // 5. 200 OK 응답
    return res.status(200).json(memberDto);
  } catch (error) {
    return res.status(401).json({ message: "Invalid credentials" }); //TODO 에러메시지 처리
  }
});

memberRouter.get("/me", authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      // 미들웨어는 통과했지만, 이 경로는 인증이 필수이므로 401 에러를 응답합니다.
      //TODO: 미들웨어 통과하면 인증은 된거니 403아닌가? 확인 해야함.
      return res.status(401).json({ message: "Authentication required" });
    }

    const memberIdString = req.user.memberId;

    const memberId = MemberId(memberIdString);

    const memberProfile = await memberService.getMemberProfile(memberId);

    res.status(200).json(memberProfile);
  } catch (error) {
    next(error);
  }
});

export { memberRouter };
