# 1. Base image
FROM node:20-alpine AS base

# 2. 安裝套件
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# 3. 編譯 Next.js (Build)
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# 提示：請確保 next.config.js 有設定 output: 'standalone'
RUN npm run build

# 4. 生產環境執行 (Runner)
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080
ENV HOSTNAME="0.0.0.0"

# 複製打包好的 standalone 內容
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 8080

# 正確指向 server.js
CMD ["node", "server.js"]
