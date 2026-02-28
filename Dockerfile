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

# 新增Nginx反向代理配置
COPY default.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
