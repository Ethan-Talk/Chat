import { Request, Response, NextFunction } from "express";
import { validateAccessToken } from "./auth.utils"; // 이전에 만든 유틸리티 함수 재사용

// Express의 Request 타입에 user 속성을 추가하기 위한 트릭
// 이렇게 하면 req.user 에 타입 에러 없이 접근할 수 있어요.
export interface AuthRequest extends Request {
  user?: { memberId: string };
}

export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  // 1. 요청 헤더에서 토큰 추출
  const authHeader = req.headers["authorization"];
  const accessToken = authHeader && authHeader.split(" ")[1]; // "Bearer TOKEN" 형식

  // 2. 토큰 존재 여부 확인
  if (!accessToken) {
    return next();
  }

  try {
    // 3. 토큰 검증
    const decoded = validateAccessToken(accessToken);

    // 4. req 객체에 사용자 정보 추가(인증 객체 같은거네)
    req.user = { memberId: decoded.memberId };

    // 5. 다음 미들웨어 또는 라우터 핸들러로 제어권 넘기기
    next();
  } catch (error) {
    // 토큰이 유효하지 않은 경우 (만료, 위조 등)
    return res.status(401).json({ message: "Invalid accessToken" });
  }
}
