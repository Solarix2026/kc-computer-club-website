# 学校电脑社官网 – 开发计划与检查清单（Plan & Checklist）

## 概览（Overview）

本计划将学校电脑社官网项目分为 **5 个主要阶段**，从项目初始化到上线部署。每个阶段都包含详细的任务检查清单。

---

## 第一阶段：项目初始化与基础配置（Phase 1: Setup & Configuration）

### 1.1 项目环境搭建

- [ ] 初始化 Next.js 项目 (`npx create-next-app@latest kccompt`)
- [ ] 配置 TypeScript（tsconfig.json）
- [ ] 安装核心依赖包：
  - [ ] `react`, `react-dom`
  - [ ] `next`
  - [ ] `appwrite`
  - [ ] `tailwindcss` 或其他 CSS 框架
  - [ ] `axios` 或 `fetch-api` 封装
  - [ ] `zustand` 或 `context-api`（状态管理）
  - [ ] `react-hook-form`（表单管理）
  - [ ] `zod` 或 `yup`（表单验证）
  - [ ] `date-fns`（日期处理）
  - [ ] `js-cookie`（Cookie 管理）
  - [ ] `next-auth` 或 Appwrite 认证
- [ ] 配置 ESLint 和 Prettier
- [ ] 配置 .env.local 和 .env.example
- [ ] 初始化 Git 仓库

### 1.2 Appwrite 环境配置

- [ ] 创建 Appwrite 项目
- [ ] 配置 Appwrite 项目 ID、API 端点、API 密钥
- [ ] 创建 8 个 Collections（见 context.md 数据库 Schema）：
  - [ ] `users`
  - [ ] `admins`
  - [ ] `notices`
  - [ ] `activities`
  - [ ] `signups`
  - [ ] `comments`
  - [ ] `ai_chats`
  - [ ] `club_info`
- [ ] 设置 Collection 权限（学生读权限、管理员写权限等）
- [ ] 初始化 club_info 记录（电脑社信息）
- [ ] 创建 Appwrite 文件存储桶（images）

### 1.3 项目结构搭建

- [ ] 创建完整的文件夹结构（见 context.md 第 7.1 节）
- [ ] 创建 TypeScript 类型定义文件（types/）
- [ ] 创建全局样式文件（styles/）
- [ ] 创建 utils 工具函数
- [ ] 创建 constants 常量文件
- [ ] 创建 Appwrite 客户端配置文件

---

## 第二阶段：前台网站 - 通用组件与布局（Phase 2: Public Website - Common Components）

### 2.1 通用组件开发

#### 导航和布局

- [ ] **Header 组件**
  - [ ] 响应式导航栏
  - [ ] Logo 和社团名称
  - [ ] 导航菜单（首页、介绍、公告、活动、管理后台）
  - [ ] 管理员登录按钮（右上角）

- [ ] **Footer 组件**
  - [ ] 社团信息（邮箱、电话）
  - [ ] 快速链接
  - [ ] 版权信息
  - [ ] 可选：社交媒体链接

- [ ] **通用按钮组件**（Button.tsx）
  - [ ] 不同样式（primary, secondary, danger）
  - [ ] 不同大小（sm, md, lg）
  - [ ] 加载状态
  - [ ] 禁用状态

- [ ] **通用输入框组件**（Input.tsx）
  - [ ] 文本输入
  - [ ] 邮箱输入
  - [ ] 电话输入
  - [ ] 错误提示

#### 卡片与展示组件

- [ ] **NoticeCard 组件**
  - [ ] 公告标题、摘要、封面
  - [ ] 发布时间、作者
  - [ ] 标签展示
  - [ ] 点击跳转详情页

- [ ] **ActivityCard 组件**
  - [ ] 活动标题、描述、封面
  - [ ] 时间、地点、报名状态
  - [ ] 参加人数显示
  - [ ] 点击跳转详情页

- [ ] **CommentCard 组件**
  - [ ] 评论者昵称
  - [ ] 评论内容
  - [ ] 发布时间
  - [ ] 管理员删除按钮（条件显示）

### 2.2 通用页面布局

- [ ] **RootLayout（全局布局）**
  - [ ] Header 组件集成
  - [ ] Footer 组件集成
  - [ ] 主体内容区域
  - [ ] 响应式布局

- [ ] **全局样式**
  - [ ] CSS 变量（主题颜色、字体、间距）
  - [ ] 响应式断点
  - [ ] 深色模式支持（可选）

### 2.3 通用模态框与提示

- [ ] **ConfirmModal 组件**
  - [ ] 确认对话框（用于删除操作）
  - [ ] 确定/取消按钮
  - [ ] 可自定义文本

- [ ] **SuccessModal 组件**
  - [ ] 成功提示
  - [ ] 自动关闭或手动关闭

- [ ] **ErrorModal 组件**
  - [ ] 错误提示与错误信息
  - [ ] 重试按钮（可选）

---

## 第三阶段：身份认证系统（Phase 3: Authentication System）

### 3.1 管理员认证

- [ ] **后端认证服务（auth.service.ts）**
  - [ ] 管理员注册接口（仅初始化）
  - [ ] 管理员登录接口
  - [ ] 密码哈希与验证（bcrypt）
  - [ ] Session / JWT Token 生成
  - [ ] Token 验证与刷新
  - [ ] 登出接口

- [ ] **登录表单（LoginForm.tsx）**
  - [ ] 用户名和密码输入
  - [ ] 表单验证
  - [ ] 错误提示
  - [ ] 提交按钮

- [ ] **登录页面（app/admin/page.tsx）**
  - [ ] 集成登录表单
  - [ ] 登录成功重定向到 Dashboard
  - [ ] 未登录时显示登录页

- [ ] **认证 Context（AuthContext.tsx）**
  - [ ] 当前登录用户信息
  - [ ] 登出方法
  - [ ] 权限检查方法

- [ ] **受保护路由（Protected Routes）**
  - [ ] 创建中间件检查管理员认证
  - [ ] 未认证用户重定向到登录页
  - [ ] 路由权限管理

### 3.2 Student 匿名评论与报名

- [ ] 学生无需登录即可留言和报名
- [ ] 报名时使用邮箱和昵称识别
- [ ] 评论使用昵称识别

---

## 第四阶段：前台网站 - 核心功能（Phase 4: Public Website - Core Features）

### 4.1 首页（Home Page）

- [ ] **HeroSection 组件**
  - [ ] 社团简介
  - [ ] 背景图或视频
  - [ ] 行动号召按钮（CTA）

- [ ] **LatestNotices 组件**
  - [ ] 从 `notices` Collection 获取最新公告
  - [ ] 显示前 3-5 条最新公告
  - [ ] "查看更多" 链接

- [ ] **UpcomingActivities 组件**
  - [ ] 从 `activities` Collection 获取即将开始的活动
  - [ ] 按开始时间排序
  - [ ] 显示前 3-5 条活动
  - [ ] "查看更多" 链接

- [ ] **AboutClub 组件**
  - [ ] 社团宗旨和愿景
  - [ ] 活动分类展示
  - [ ] 从 `club_info` Collection 获取

### 4.2 关于页面（About Page）

- [ ] **AboutClub 详情页**
  - [ ] 社团详细介绍
  - [ ] 活动类型列表
  - [ ] 历届活动展示（可选）
  - [ ] 联系信息

### 4.3 公告功能（Notices）

- [ ] **公告列表页（notices/page.tsx）**
  - [ ] 从 `notices` Collection 获取所有已发布公告
  - [ ] 按时间排序（最新在前）
  - [ ] 分页显示
  - [ ] 标签筛选（可选）
  - [ ] 搜索功能（可选）

- [ ] **公告详情页（notices/[id]/page.tsx）**
  - [ ] 展示公告标题、内容、作者、发布时间
  - [ ] 支持 Markdown 渲染
  - [ ] 展示评论列表
  - [ ] 评论表单
  - [ ] 管理员删除评论按钮（条件显示）

- [ ] **useNotices Hook**
  - [ ] 获取所有公告
  - [ ] 按 ID 获取单个公告
  - [ ] 搜索、筛选、分页逻辑

### 4.4 活动功能（Activities）

- [ ] **活动列表页（activities/page.tsx）**
  - [ ] 从 `activities` Collection 获取所有已发布活动
  - [ ] 按时间排序
  - [ ] 按分类筛选（编程、AI、网页、比赛等）
  - [ ] 分页显示
  - [ ] 显示报名状态（已截止 / 报名中）

- [ ] **活动详情页（activities/[id]/page.tsx）**
  - [ ] 活动标题、描述、封面、地点、时间
  - [ ] 报名截止时间倒计时（可选）
  - [ ] 参加人数显示
  - [ ] 报名按钮（未截止时可用）
  - [ ] 评论列表与评论表单

- [ ] **活动报名页（activities/[id]/signup/page.tsx）**
  - [ ] 动态加载报名表单字段
  - [ ] 表单验证
  - [ ] 提交报名数据到 `signups` Collection
  - [ ] 成功提示与邮箱确认（可选）

- [ ] **useActivities Hook**
  - [ ] 获取所有活动
  - [ ] 按 ID 获取单个活动
  - [ ] 按分类筛选
  - [ ] 分页逻辑

### 4.5 评论功能（Comments）

- [ ] **CommentForm 组件**
  - [ ] 昵称输入
  - [ ] 评论内容输入
  - [ ] 邮箱输入（可选，用于通知）
  - [ ] 提交按钮
  - [ ] 表单验证

- [ ] **评论提交与展示**
  - [ ] 创建评论记录到 `comments` Collection
  - [ ] 实时或刷新后显示评论
  - [ ] 评论按时间排序
  - [ ] 管理员删除评论功能

- [ ] **useComments Hook**
  - [ ] 获取特定公告/活动的评论
  - [ ] 提交评论
  - [ ] 删除评论（需管理员权限）

---

## 第五阶段：后台管理系统（Phase 5: Admin Dashboard）

### 5.1 管理员布局与导航

- [ ] **AdminLayout 组件**
  - [ ] 侧边栏导航
  - [ ] 顶部栏（用户信息、登出按钮）
  - [ ] 响应式设计

- [ ] **Sidebar 组件**
  - [ ] 导航菜单项：
    - [ ] Dashboard
    - [ ] 公告管理
    - [ ] 活动管理
    - [ ] 报名管理
    - [ ] 评论管理
    - [ ] 设置

### 5.2 Dashboard 总览（Dashboard）

- [ ] **DashboardStats 组件**
  - [ ] 公告总数
  - [ ] 活动总数
  - [ ] 报名总人数
  - [ ] 今日新报名数
  - [ ] 最近发布内容列表

- [ ] **Dashboard 页面（admin/dashboard/page.tsx）**
  - [ ] 集成 DashboardStats 组件
  - [ ] 数据从各 Collection 实时获取

### 5.3 公告管理（Notice Management）

- [ ] **公告管理列表页（admin/dashboard/notices/page.tsx）**
  - [ ] 表格显示所有公告（包括草稿）
  - [ ] 列：标题、作者、状态、发布时间、操作
  - [ ] 发布/草稿切换
  - [ ] 编辑和删除按钮
  - [ ] 创建新公告按钮

- [ ] **公告创建页（admin/dashboard/notices/create/page.tsx）**
  - [ ] NoticeForm 组件
  - [ ] 标题、内容（Markdown 编辑器）、标签输入
  - [ ] 封面图片上传
  - [ ] 保存为草稿或发布
  - [ ] 验证与错误提示

- [ ] **公告编辑页（admin/dashboard/notices/[id]/edit/page.tsx）**
  - [ ] 编辑现有公告
  - [ ] 修改发布状态
  - [ ] 删除公告确认

- [ ] **notice.service.ts**
  - [ ] 创建公告
  - [ ] 更新公告
  - [ ] 删除公告
  - [ ] 获取公告列表（含草稿）

### 5.4 活动管理（Activity Management）

- [ ] **活动管理列表页（admin/dashboard/activities/page.tsx）**
  - [ ] 表格显示所有活动
  - [ ] 列：标题、分类、开始时间、报名人数、状态、操作
  - [ ] 状态过滤（草稿、已发布、进行中、已完成）
  - [ ] 编辑和删除按钮
  - [ ] 创建新活动按钮

- [ ] **活动创建页（admin/dashboard/activities/create/page.tsx）**
  - [ ] ActivityForm 组件
  - [ ] 标题、描述、分类、时间、地点、报名截止
  - [ ] 最大参加人数设置
  - [ ] 动态报名表单字段配置
  - [ ] 封面图片上传
  - [ ] 保存为草稿或发布

- [ ] **活动编辑页（admin/dashboard/activities/[id]/edit/page.tsx）**
  - [ ] 编辑现有活动
  - [ ] 修改报名表单字段
  - [ ] 删除活动确认

- [ ] **报名列表查看（admin/dashboard/activities/[id]/signups/page.tsx）**
  - [ ] 表格显示报名人员
  - [ ] 列：报名者、邮箱、报名时间、状态、操作
  - [ ] 导出为 CSV 按钮
  - [ ] 删除报名记录按钮
  - [ ] 确认报名状态（pending → confirmed）

- [ ] **DynamicFormBuilder 组件**
  - [ ] 拖拽或表单化添加/删除字段
  - [ ] 字段类型：文本、邮箱、下拉框、日期等
  - [ ] 字段验证规则设置
  - [ ] 字段排序

- [ ] **activity.service.ts**
  - [ ] 创建活动
  - [ ] 更新活动
  - [ ] 删除活动
  - [ ] 获取活动列表

- [ ] **signup.service.ts**
  - [ ] 提交报名
  - [ ] 获取报名列表
  - [ ] 更新报名状态
  - [ ] 删除报名记录
  - [ ] 导出报名数据为 CSV

### 5.5 评论管理（Comment Moderation）

- [ ] **评论管理页（admin/dashboard/comments/page.tsx）**
  - [ ] 表格显示所有评论
  - [ ] 列：评论者、内容、关联内容、发布时间、操作
  - [ ] 搜索功能
  - [ ] 删除评论按钮（带确认）
  - [ ] 批量删除（可选）

- [ ] **comment.service.ts**
  - [ ] 获取所有评论
  - [ ] 删除评论
  - [ ] 审核状态更新（可选）

### 5.6 设置页面（Settings）

- [ ] **管理员设置页（admin/dashboard/settings/page.tsx）**
  - [ ] 修改电脑社信息（名称、介绍、联系方式）
  - [ ] 上传 LOGO 和 Banner 图片
  - [ ] 管理员账户管理（可选）

- [ ] **club_info 更新**
  - [ ] 从 club_info Collection 获取并显示
  - [ ] 更新信息到数据库

---

## 第六阶段：AI 聊天机器人（Phase 6: AI Chatbot）

### 6.1 前端聊天 UI

- [ ] **ChatWidget 组件**
  - [ ] 右下角悬浮小球
  - [ ] 点击展开聊天窗口
  - [ ] 响应式设计

- [ ] **ChatMessage 组件**
  - [ ] 用户消息气泡
  - [ ] AI 回应气泡
  - [ ] 不同样式区分

- [ ] **ChatInput 组件**
  - [ ] 文本输入框
  - [ ] 发送按钮
  - [ ] 加载动画

- [ ] **ChatContext（状态管理）**
  - [ ] 聊天消息列表
  - [ ] 添加消息方法
  - [ ] 清空对话方法
  - [ ] 会话 ID 管理

### 6.2 后端聊天服务

- [ ] **chat.service.ts**
  - [ ] 调用 AI API（OpenAI、Claude 等）
  - [ ] 注入 RAG 上下文（公告、活动、FAQ）
  - [ ] 过滤草稿内容（学生端只看已发布）
  - [ ] 过滤安全内容（不回应不相关问题）

- [ ] **AI Prompt Engineering**
  - [ ] 设计系统提示词
  - [ ] 上下文注入策略
  - [ ] 回应质量与安全控制

- [ ] **ai_chats 记录**
  - [ ] 保存聊天记录到 ai_chats Collection
  - [ ] 记录使用的上下文源
  - [ ] 用户类型区分（student/admin）

### 6.3 FAQ 数据管理

- [ ] **FAQ 数据文件（data/faq.data.ts）**
  - [ ] 常见问题与回答
  - [ ] 包括：社团是什么、如何加入、最近活动、报名流程等

---

## 第七阶段：测试与优化（Phase 7: Testing & Optimization）

### 7.1 单元测试

- [ ] 服务层测试
  - [ ] auth.service.ts 测试
  - [ ] notice.service.ts 测试
  - [ ] activity.service.ts 测试
  - [ ] comment.service.ts 测试

- [ ] Utility 函数测试
  - [ ] format.ts 测试
  - [ ] validate.ts 测试

### 7.2 集成测试

- [ ] 认证流程测试
- [ ] 公告创建与发布流程测试
- [ ] 活动创建与报名流程测试
- [ ] 评论提交与删除测试
- [ ] 权限验证测试

### 7.3 E2E 测试

- [ ] 使用 Playwright 或 Cypress
- [ ] 学生流程：浏览公告 → 查看活动 → 报名 → 留言
- [ ] 管理员流程：登录 → 创建公告 → 发布活动 → 查看报名
- [ ] 聊天机器人交互测试

### 7.4 性能优化

- [ ] 图片优化与懒加载
- [ ] 代码分割与按需加载
- [ ] 缓存策略（Next.js ISR 或 SWR）
- [ ] 数据库查询优化（索引）
- [ ] 资源压缩与 minify
- [ ] Web Vitals 监控

### 7.5 安全审计

- [ ] XSS 防护检查
- [ ] CSRF 令牌验证
- [ ] SQL 注入防护（Appwrite 自动处理）
- [ ] 敏感数据加密（密码、tokens）
- [ ] 环境变量管理
- [ ] HTTPS 配置

### 7.6 可访问性（Accessibility）

- [ ] WCAG 2.1 AA 标准检查
- [ ] 屏幕阅读器兼容性
- [ ] 键盘导航支持
- [ ] 颜色对比度检查

---

## 第八阶段：部署与上线（Phase 8: Deployment）

### 8.1 前端部署

- [ ] 构建优化（`npm run build`）
- [ ] 部署到 Vercel / Netlify / Render
- [ ] 配置 CI/CD（GitHub Actions）
- [ ] 环境变量配置
- [ ] 域名配置与 SSL

### 8.2 后端配置

- [ ] Appwrite 生产环境配置
- [ ] Database 备份策略
- [ ] API 速率限制
- [ ] 日志与监控

### 8.3 上线检查

- [ ] 功能全量测试
- [ ] 跨浏览器测试（Chrome, Firefox, Safari, Edge）
- [ ] 移动设备测试（虽然以桌面为主）
- [ ] 性能基准测试
- [ ] 安全审计

### 8.4 上线后运维

- [ ] 监控错误日志
- [ ] 用户反馈收集
- [ ] 定期备份
- [ ] 依赖更新维护
- [ ] 内容更新管理

---

## 第九阶段：后续扩展（Phase 9: Future Enhancements，可选）

- [ ] 学生账号系统与实名认证
- [ ] 点赞 / 回复评论功能
- [ ] 活动签到系统（QR Code）
- [ ] 消息通知系统（邮件、推送）
- [ ] 多语言支持（中文 / English）
- [ ] 移动端原生应用（React Native）
- [ ] 活动相册与成果展示
- [ ] 数据分析与报表系统
- [ ] 发票与报销管理
- [ ] 社团成员管理系统

---

## 开发检查清单（Development Checklist）

### 每次提交前检查（Before Each Commit）

- [ ] 代码格式化（`npm run format`）
- [ ] ESLint 检查通过（`npm run lint`）
- [ ] TypeScript 编译无错误（`npm run type-check`）
- [ ] 相关测试通过（`npm test`）
- [ ] 本地构建成功（`npm run build`）
- [ ] 功能测试验证
- [ ] Git commit 消息清晰

### Pull Request 审查（PR Review Questions）

- [ ] 代码是否遵循项目架构和命名规范？
- [ ] 是否添加了必要的错误处理和类型定义？
- [ ] 是否有重复代码可以复用或提取？
- [ ] 性能或安全问题是否已解决？
- [ ] 是否需要更新文档或注释？

### 功能完成标准（Definition of Done）

- [ ] 功能代码完成并通过本地测试
- [ ] 单元测试覆盖核心逻辑
- [ ] 集成测试验证与其他模块的交互
- [ ] 代码审查通过
- [ ] 文档已更新
- [ ] 性能和安全审计通过
- [ ] 部署到测试环境验证

---

## 开发进度跟踪（Progress Tracking）

| 阶段 | 任务名称 | 状态 | 负责人 | 开始日期 | 完成日期 | 备注 |
|------|--------|------|--------|---------|---------|------|
| Phase 1 | 项目初始化与基础配置 | ⬜ | - | - | - | - |
| Phase 2 | 前台网站 - 通用组件 | ⬜ | - | - | - | - |
| Phase 3 | 身份认证系统 | ⬜ | - | - | - | - |
| Phase 4 | 前台网站 - 核心功能 | ⬜ | - | - | - | - |
| Phase 5 | 后台管理系统 | ⬜ | - | - | - | - |
| Phase 6 | AI 聊天机器人 | ⬜ | - | - | - | - |
| Phase 7 | 测试与优化 | ⬜ | - | - | - | - |
| Phase 8 | 部署与上线 | ⬜ | - | - | - | - |

---

## 状态说明

- ⬜ 未开始（Not Started）
- 🟨 进行中（In Progress）
- ✅ 已完成（Completed）
- ⚠️ 有阻碍（Blocked）
- 📋 已规划（Planned）

---

## 快速参考（Quick Reference）

### 常用命令

```bash
# 开发服务器
npm run dev

# 代码检查与格式化
npm run lint
npm run format
npm run type-check

# 构建
npm run build

# 测试
npm test
npm run test:integration
npm run test:e2e

# 部署
npm run deploy
```

### 重要文件位置

| 文件/文件夹 | 用途 |
|-----------|------|
| `src/app/` | Next.js 页面与路由 |
| `src/components/` | React 组件 |
| `src/services/` | 业务逻辑与 API 服务 |
| `src/types/` | TypeScript 类型定义 |
| `src/utils/` | 工具函数 |
| `src/config/` | 配置文件 |
| `docs/` | 项目文档 |

---

## 参考资源

- [Next.js 官方文档](https://nextjs.org/docs)
- [Appwrite 文档](https://appwrite.io/docs)
- [React 官方文档](https://react.dev)
- [TypeScript 官方文档](https://www.typescriptlang.org/docs/)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)（如果使用）
