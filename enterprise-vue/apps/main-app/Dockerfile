# ==================== Stage 1: Build ====================
FROM node:20-alpine AS builder

# 安装 pnpm
RUN corepack enable && corepack prepare pnpm@9 --activate

WORKDIR /app

# 复制 workspace 配置
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json ./
COPY packages/ ./packages/
COPY apps/main-app/ ./apps/main-app/

# 安装依赖（仅生产所需）
RUN pnpm install --frozen-lockfile

# 构建
ENV NODE_ENV=production
RUN pnpm turbo run build --filter=@enterprise/main-app

# ==================== Stage 2: Serve ====================
FROM nginx:1.27-alpine AS production

# 复制 Nginx 配置
COPY apps/main-app/nginx.conf /etc/nginx/conf.d/default.conf

# 复制构建产物
COPY --from=builder /app/apps/main-app/dist /usr/share/nginx/html

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget -q --spider http://localhost/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
