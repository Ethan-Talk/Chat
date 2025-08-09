import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });

io.on("connection", (socket) => {
  console.log("connected:", socket.id);
  socket.emit("welcome", { msg: "hello" });
});

const PORT = 3000;
httpServer.listen(PORT, () => {
  console.log(`listening on http://localhost:${PORT}`);
});
