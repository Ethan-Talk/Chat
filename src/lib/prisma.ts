import { PrismaClient } from "@prisma/client";

// 앱 전체에서 공유할 단일 PrismaClient 인스턴스(싱글턴 패턴)
export const prisma = new PrismaClient();
