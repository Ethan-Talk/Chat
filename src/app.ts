import express from "express";
import { memberRouter } from '@/member/web/member.router';

// 1. Express 앱 생성
const app = express();
const port = 3000; // 서버를 실행할 포트

// 2. JSON 요청 본문을 자동으로 파싱해주는 미들웨어 등록
app.use(express.json());

// 3. 우리가 만든 라우터를 서버에 등록
app.use('/api/v1/members', memberRouter);

// 4. 서버 실행
app.listen(port, () => {
  console.log(`🚀 Server is running at http://localhost:${port}`);
});
