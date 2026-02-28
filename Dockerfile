# 构建
FROM node:20-slim AS build
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# 新增内存限制
ENV NODE_OPTIONS="--max-old-space-size=1024"

COPY . /app
WORKDIR /app

# 依赖
RUN pnpm install
RUN pnpm run build

# 运行
FROM nginx:stable-alpine

# 后端地址默认值（可在容器运行时覆盖）
ENV BACKEND_ORIGIN=http://backendsrv:8800

# 使用 Nginx 模板，在容器启动时根据环境变量渲染配置
COPY default.conf /etc/nginx/templates/default.conf.template

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
