import * as jwt from "jsonwebtoken";
import { MemberId } from "@/member/domain/MemberId";

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }
  return secret;
}

export function generateAccessToken(memberId: MemberId): string {
  const accessToken = jwt.sign({ memberId }, getJwtSecret(), {
    expiresIn: "100h",
  });
  return accessToken;
}

export function validateAccessToken(accessToken: string): { memberId: string } {
  return jwt.verify(accessToken, getJwtSecret()) as { memberId: string };
}
