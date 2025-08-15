# =================================================================
# 1. 빌드(Build) 스테이지: TypeScript를 JavaScript로 컴파일
# =================================================================
FROM node:18-alpine AS builder

# 작업 디렉토리 설정
WORKDIR /app

# 의존성 파일 먼저 복사 (캐싱 최적화)
COPY package*.json ./

# 프로덕션 의존성 설치
RUN npm ci

# 소스 코드 전체 복사
COPY . .

# Prisma Client 생성
RUN npx prisma generate

# TypeScript 코드 컴파일 => dist 폴더에 결과물 생김
RUN npm run build

# =================================================================
# 2. 프로덕션(Production) 스테이지: 실제 실행될 최종 이미지
# =================================================================
FROM node:18-alpine

WORKDIR /app

# 프로덕션용 의존성만 설치, dev 제외
COPY package*.json ./
RUN npm ci --omit=dev


# 빌드 스테이지에서 컴파일된 파일만 복사
COPY --from=builder /app/dist ./dist

# Prisma 스키마 파일 복사 (런타임에 필요)
COPY --from=builder /app/prisma ./prisma


RUN npx prisma generate

COPY --from=builder /app/tsconfig.json ./

ENV TS_NODE_BASEURL=./dist

# 백엔드 서버가 사용할 포트 명시 (8080번)
EXPOSE 8080

# 컨테이너 시작 시 실행될 명령어
CMD ["node", "-r", "tsconfig-paths/register", "dist/app.js"]