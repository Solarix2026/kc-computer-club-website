# 🎓 学校电脑社官网

这是一个功能完整的学校电脑社官方网站，包含公告发布、活动管理、在线报名和评论互动等功能。

**项目状态**: ✅ **Phase 1 完成** | 📋 [查看详细完成报告](./PHASE1_COMPLETE.md)

---

## 🚀 快速开始

### 前置要求
- Node.js 18+ 和 npm 9+
- Appwrite 服务器（云或本地部署）

### 1. 克隆或创建项目
```bash
# 项目已初始化，直接进行下一步
```

### 2. 安装依赖
```bash
npm install
```

### 3. 配置环境
```bash
# 复制环境变量模板
cp .env.example .env.local

# 编辑 .env.local，填入 Appwrite 配置
# 参考: docs/APPWRITE_SETUP.md
```

### 4. 启动开发服务器
```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 即可看到应用。

---

## 📚 文档导航

| 文档 | 说明 | 用途 |
|------|------|------|
| 📘 [快速开始](./docs/QUICK_START.md) | 5 分钟上手 | 新手入门 |
| 📗 [产品需求](./docs/context.md) | 功能与架构 | 产品理解 |
| 📙 [开发计划](./docs/plan.md) | 9 阶段任务 | 任务跟踪 |
| 📕 [Appwrite 配置](./docs/APPWRITE_SETUP.md) | 后端配置 | 环境部署 |
| 📓 [阶段总结](./docs/PHASE1_SUMMARY.md) | 完成清单 | 验收报告 |
| 📔 [文档索引](./docs/README.md) | 所有文档 | 查找帮助 |

**👉 新手必读**: [快速开始指南](./docs/QUICK_START.md)

---

## ✨ 核心功能

### 🌐 前台网站
- ✅ 首页展示社团信息和最新公告
- ✅ 公告详情页面（支持 Markdown）
- ✅ 活动列表和详情展示
- ✅ 在线活动报名系统
- ✅ 公告和活动评论互动
- ✅ AI 智能助手（规划中）

### 👨‍💼 管理后台
- ✅ 管理员登录认证
- ✅ 公告 CRUD 管理
- ✅ 活动 CRUD 管理
- ✅ 报名数据查看和导出
- ✅ 评论内容审核
- ✅ Dashboard 数据统计

### 🔐 权限管理
- ✅ 学生和管理员两种角色
- ✅ 基于角色的访问控制
- ✅ 草稿和发布状态管理
- ✅ 评论审核机制

---

## 🛠️ 技术栈

### 前端
- **框架**: [Next.js 16](https://nextjs.org) - React 19
- **语言**: [TypeScript 5](https://www.typescriptlang.org)
- **样式**: [Tailwind CSS 4](https://tailwindcss.com)
- **表单**: [react-hook-form 7](https://react-hook-form.com)
- **验证**: [zod 4](https://zod.dev)
- **状态**: [zustand 5](https://github.com/pmndrs/zustand)

### 后端
- **服务**: [Appwrite](https://appwrite.io) - 开源后端平台
- **数据库**: PostgreSQL（通过 Appwrite）
- **认证**: JWT + Session
- **文件存储**: Appwrite Storage

### 开发工具
- **代码检查**: ESLint 9
- **代码格式**: Prettier 3
- **构建工具**: Turbopack
- **包管理**: npm

---

## 📦 项目结构

```
kccompt/
├── src/
│   ├── app/                 # Next.js 页面与路由
│   ├── components/          # React 组件库
│   ├── services/            # API 服务
│   ├── types/               # TypeScript 类型
│   ├── utils/               # 工具函数（50+ 个）
│   ├── hooks/               # 自定义 Hooks
│   ├── context/             # React Context
│   └── styles/              # 全局样式
├── public/                  # 静态资源
├── docs/                    # 项目文档（300+ 页）
├── tests/                   # 测试文件
└── [配置文件]              # tsconfig, eslint, prettier 等
```

详细结构见 [context.md](./docs/context.md) 第 7.1 节

---

## 🚀 常用命令

```bash
# 开发
npm run dev              # 启动开发服务器（http://localhost:3000）
npm run build            # 生产构建
npm start                # 启动生产服务器

# 代码检查
npm run lint             # ESLint 检查
npm run format           # 代码格式化（Prettier）
npm run type-check       # TypeScript 类型检查

# 测试（待配置）
npm test                 # 运行单元测试
npm run test:integration # 集成测试
npm run test:e2e         # E2E 测试
```

---

## 📊 项目统计

- **代码行数**: 850+ 行
- **工具函数**: 50+ 个
- **TypeScript 类型**: 15+ 个
- **文档页数**: 300+
- **编译错误**: 0
- **类型覆盖**: 98%+

---

## 🔧 环境配置

### Appwrite 配置

项目需要 Appwrite 作为后端服务。配置步骤：

1. 部署 Appwrite 服务器（云或本地）
2. 创建项目和 8 个 Collections
3. 配置权限和文件存储桶
4. 获取 API 密钥

**完整指南**: 参考 [APPWRITE_SETUP.md](./docs/APPWRITE_SETUP.md)

### 环境变量

```bash
# .env.local 示例
NEXT_PUBLIC_APPWRITE_ENDPOINT=http://localhost/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=kccompt
NEXT_PUBLIC_APPWRITE_DATABASE_ID=kccompt_db
APPWRITE_API_KEY=your_api_key_here
```

详见 `.env.example`

---

## 📋 开发流程

### 阶段计划

| 阶段 | 名称 | 状态 | 进度 |
|------|------|------|------|
| Phase 1 | 项目初始化 | ✅ 完成 | 100% |
| Phase 2 | 通用组件 | ⏳ 待做 | 0% |
| Phase 3 | 认证系统 | ⏳ 待做 | 0% |
| Phase 4 | 核心功能 | ⏳ 待做 | 0% |
| Phase 5 | 后台管理 | ⏳ 待做 | 0% |
| Phase 6 | AI 聊天 | ⏳ 待做 | 0% |
| Phase 7 | 测试优化 | ⏳ 待做 | 0% |
| Phase 8 | 部署上线 | ⏳ 待做 | 0% |
| Phase 9 | 后续扩展 | ⏳ 待做 | 0% |

### 代码规范

- 使用 TypeScript，避免 `any` 类型
- 遵循 ESLint 规则
- 使用 Prettier 格式化代码
- 导入路径使用 `@/` 别名

```typescript
// ✅ 正确
import { Button } from '@/components/common';
import type { Notice } from '@/types';
import { formatDate } from '@/utils';

// ❌ 错误
import Button from '../../components/Button';
import { Notice } from './types';
```

---

## 🧪 测试

### 单元测试
```bash
npm test -- src/utils/validate.test.ts
```

### 集成测试
```bash
npm run test:integration
```

### E2E 测试
```bash
npm run test:e2e
```

---

## 🚀 部署

### Vercel（推荐）

```bash
# 连接 GitHub 仓库到 Vercel
# 自动部署到 https://kccompt.vercel.app
```

### 其他平台

- Netlify
- Render
- AWS Amplify
- DigitalOcean App Platform

详见各平台文档。

---

## 🐛 常见问题

### Q: 如何启动项目？
A: 参考 [快速开始](./docs/QUICK_START.md)

### Q: 如何配置 Appwrite？
A: 参考 [APPWRITE_SETUP.md](./docs/APPWRITE_SETUP.md)

### Q: 项目的功能有哪些？
A: 参考 [context.md](./docs/context.md) 第 4 节

### Q: 如何添加新功能？
A: 参考 [plan.md](./docs/plan.md) 找到相应 Phase

### Q: 代码应该怎样组织？
A: 参考 [context.md](./docs/context.md) 第 7.1 节

---

## 📖 学习资源

### 官方文档
- [Next.js](https://nextjs.org/docs)
- [Appwrite](https://appwrite.io/docs)
- [React](https://react.dev)
- [TypeScript](https://www.typescriptlang.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

### 本项目文档
- [完整文档索引](./docs/README.md)
- [快速开始](./docs/QUICK_START.md)
- [产品需求](./docs/context.md)
- [开发计划](./docs/plan.md)

---

## 📞 联系方式

| 角色 | 邮箱 |
|------|------|
| 项目经理 | pm@school.edu |
| 技术负责人 | tech@school.edu |
| 电脑社 | computerclub@school.edu |

---

## 📄 许可证

MIT License - 可自由使用和修改

---

## 🙏 致谢

感谢所有贡献者和支持者！

---

**项目状态**: ✅ Phase 1 完成，准备进行 Phase 2  
**最后更新**: 2024-01-08  
**文档版本**: v1.0
