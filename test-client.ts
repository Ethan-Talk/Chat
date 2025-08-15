import { io } from "socket.io-client";

// 1. 여기에 발급받은 토큰을 붙여넣으세요. (Bearer 제외)

const JWT_TOKEN_HOON = "skk";

const JWT_TOKEN_HARRY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJtZW1iZXJJZCI6ImFkZTQwNTY1LWVjMzMtNDI0Ny1hNDUyLTRkNjU5YzkyZDkyZCIsImlhdCI6MTc1NTI0MTI1MCwiZXhwIjoxNzU1MjQ0ODUwfQ.cDG-a4181lunjInA-5bNpdfiSd4LfiLbQbPl09yI5UY";

//서버에 연결 시도
const socketHoon = io("http://localhost:8080", {
  // 2. auth 객체에 토큰을 담아 보냅니다.
  auth: {
    token: JWT_TOKEN_HOON,
  },
});

//connect 이벤트가 발생했을 때
socketHoon.on("connect", () => {
  console.log(`✅ 서버 연결 성공: ${socketHoon.id}`);

  // 3. 'sendMessage' 이벤트로 메시지를 보냅니다.
  const message = "Node.js 클라이언트에서 보낸 전체 메시지";
  console.log(`-> 메시지 전송: ${message}`);
  socketHoon.emit("public", message); //sendMessage라는 이벤트를 발생.

  const privateMessage = "해리야 밥먹자";
  socketHoon.emit("private");
});

// 4. 서버로부터 오는 'newMessage' 이벤트를 받습니다.
socketHoon.on("public", (data) => {
  console.log("석훈 전체 메시지 수신:", data);
});

// 연결 에러 처리
socketHoon.on("connect_error", (err) => {
  console.error(`❌ 연결 에러: ${err.message}`);
});

// 연결 끊김 처리
socketHoon.on("disconnect", () => {
  console.log("🔌 서버와 연결이 끊겼습니다.");
});
