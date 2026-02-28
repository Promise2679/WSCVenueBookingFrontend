# WSCVenueBookingFrontend
WSC 场馆预约系统前端项目 / WSC Venue Booking System Frontend Project.
后端仓库：https://github.com/MucheXD/WSCVenueBookingBackend

# 目录结构 / Project Structure

```
.
├── .github/                # GitHub 配置 / GitHub configurations
│   └── workflows/          # 自动化部署流水线 / CI/CD Workflows (Actions)
│
├── public/                 # 静态资源 / Static assets
│
├── src/                    # 源代码目录 / Source code
│   ├── api/                # 接口层 / API Layer
│   │   ├── client/         # 客户端核心配置 / Core client configuration
│   │   ├── core/           # 内部转换与工具 / Internal serializers and utilities
│   │   ├── sdk.gen.ts      # 自动生成的服务函数 / Auto-generated service functions
│   │   └── types.gen.ts    # 自动生成的类型定义 / Auto-generated type definitions
│   │
│   ├── components/         # 可复用组件 / Reusable UI components
│   │   ├── home/           # 首页模块组件 / Home module components
│   │   └── ...             # 功能性组件 / Functional components (Reservation, etc.)
│   │
│   ├── constants/          # 静态常量与设置 / Static constants and settings
│   ├── pages/              # 页面级组件 / Page-level components
│   ├── router/             # 路由配置 / Vue Router configuration
│   ├── stores/             # 状态管理 / State management (Pinia)
│   ├── utils/              # 工具函数 / Utility functions
│   ├── App.vue             # 根组件 / Root component
│   └── main.ts             # 入口文件 / Project entry point
│
├── openapi-ts.config.ts    # 接口生成配置 / OpenAPI code generation configuration
├── vite.config.ts          # Vite 配置文件 / Vite configuration (with Proxy)
├── package.json            # 项目依赖与脚本 / Project dependencies and scripts
├── Dockerfile              # 容器化构建配置 / Docker deployment configuration
├── tsconfig.json           # TypeScript 配置 / TypeScript configuration
└── README.md               # 项目说明文档 / Project documentation
```

## 技术栈 / Tech Stack

- **项目框架:** Vue 3 (Composition API)
- **构建工具:** Vite
- **UI库:** Vuetify 3
- **状态管理:** Pinia / Pinia Colada
- **API Client:** @hey-api/openapi-ts (Fetch-based)
- **语言:** TypeScript

## 开发指南 / Development Guide

1. 环境准备 / Prerequisites

- Node.js: ^20.19.0 || >=22.12.0

- Package Manager: pnpm

2. 快速开始 / Quick Start

- 安装依赖
- - pnpm install
- 启动开发服务器
- - pnpm dev
- 构建生产版本
- - pnpm build


3. 接口同步 / API Synchronization

本项目采用契约驱动开发（Contract-First），通过后端提供的 openapi.yaml 自动生成前端 SDK。
The project uses Contract-First development, generating the frontend SDK from openapi.yaml.

### 协作规范 / Collaboration
提交代码前请确保 lint 检查通过。


