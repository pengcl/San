# 多阶段构建的生产环境Dockerfile
# 第一阶段：构建环境
FROM node:18-alpine AS builder

# 设置工作目录
WORKDIR /app

# 安装系统依赖
RUN apk add --no-cache git

# 复制package文件
COPY package*.json ./

# 安装依赖（使用npm ci以获得更快更可靠的构建）
RUN npm ci --only=production --silent

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 第二阶段：运行环境
FROM nginx:alpine AS production

# 安装必要的工具
RUN apk add --no-cache curl

# 复制自定义nginx配置
COPY nginx.conf /etc/nginx/nginx.conf
COPY nginx.default.conf /etc/nginx/conf.d/default.conf

# 从构建阶段复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制启动脚本
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# 创建非root用户
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

# 设置正确的权限
RUN chown -R appuser:appgroup /usr/share/nginx/html && \
    chown -R appuser:appgroup /var/cache/nginx && \
    chown -R appuser:appgroup /var/log/nginx && \
    chown -R appuser:appgroup /etc/nginx/conf.d

# 创建nginx运行所需的目录
RUN touch /var/run/nginx.pid && \
    chown appuser:appgroup /var/run/nginx.pid

# 暴露端口
EXPOSE 8080

# 切换到非root用户
USER appuser

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# 启动命令
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]

# 元数据标签
LABEL maintainer="三国游戏开发团队" \
      version="1.0.0" \
      description="三国策略游戏Web客户端" \
      org.opencontainers.image.title="Three Kingdoms Game Web Client" \
      org.opencontainers.image.description="一个基于React的三国策略游戏Web客户端" \
      org.opencontainers.image.version="1.0.0" \
      org.opencontainers.image.source="https://github.com/your-org/three-kingdoms-web-client"