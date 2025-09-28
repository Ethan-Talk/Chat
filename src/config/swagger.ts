import swaggerJsdoc from "swagger-jsdoc";
import path from "path";

const options: swaggerJsdoc.Options = {
  // 1. Swagger 명세서의 기본 정보
  definition: {
    openapi: "3.0.0",
    info: {
      title: "채팅 서비스 API 명세서",
      version: "1.0.0",
      description:
        "Node.js, Express, Socket.IO로 만드는 포트폴리오용 채팅 서비스 API입니다.",
    },
    // 2. API 서버의 기본 URL
    servers: [
      {
        url: "http://localhost:8000", // 우리 로컬 서버 주소
      },
    ],
    components: {
      schemas: {
        MemberDto: {
          type: "object",
          properties: {
            id: { type: "string", description: "회원의 고유 UUID" },
            loginId: { type: "string" },
            nickname: { type: "string" },
          },
        },
      },
    },
  },
  // 3. API 정보가 담긴 파일 경로 (우리가 만든 라우터 파일)
  apis: [
    path.join(__dirname, "../member/web/*.router.ts"),
    path.join(__dirname, "../chat/web/controller/*.router.ts"),
    path.join(__dirname, "../health/*.router.ts"),
  ],
};

// 설정 객체를 바탕으로 Swagger 명세서를 생성합니다.
const specs = swaggerJsdoc(options);

export { specs };
