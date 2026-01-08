# 学校电脑社官网 – 产品上下文（Context）

## 一、产品背景（Background）

随着学校科技活动与编程教育的普及，电脑社（Computer Club）需要一个**统一、正式、易维护**的网站，用于：

* 对外介绍电脑社
* 向学生发布最新通知与活动
* 让学生在线报名活动
* 由管理员集中管理内容

该网站以 **桌面端（Desktop-first）** 为主要使用场景，兼顾清晰信息结构与高效管理。

---

## 二、产品目标（Objectives）

1. 打造一个**官方电脑社展示平台**
2. 提供**公告 / 活动发布系统**
3. 提供**活动报名表单系统**
4. 提供**仅管理员可用的后台管理 Dashboard**
5. 在公告详情页支持**评论互动（Comment Component）**

---

## 三、目标用户（Target Users）

### 1. 普通学生（Student）

* 浏览电脑社介绍
* 查看最新通知与活动
* 报名活动
* 在公告下方留言 / 评论

### 2. 管理员（Admin / Teacher / Club Committee）

* 登录后台管理系统
* 发布 / 编辑 / 删除通知
* 创建活动与报名表单
* 查看与管理报名数据
* 管理评论内容（删除不当评论）

---

## 四、核心功能模块（Core Features）

### 1. 前台网站（Public Website）

#### 1.1 首页（Home）

* 电脑社简介（使命 / 愿景 / 活动方向）
* 最新公告（Latest Notices）
* 即将开始的活动（Upcoming Activities）

#### 1.2 电脑社介绍（About Computer Club）

* 社团宗旨
* 活动类型（编程 / AI / 网页 / 比赛 / 工作坊）
* 历届活动展示（可选）

#### 1.3 公告 / 活动列表（Notices & Activities）

* 列表展示所有公告与活动
* 按时间排序（最新在前）
* 标签区分：公告 / 活动 / 比赛 / 讲座

#### 1.4 公告 / 活动详情页（Notice Detail Page）

* 标题
* 发布时间
* 发布者
* 正文内容（支持图文）
* 报名按钮（若为活动）

##### 评论组件（Comment Component）

* 学生可填写昵称 + 评论内容
* 按时间排序显示评论
* 支持管理员删除评论

#### 1.5 活动报名表单（Signup Form）

* 姓名
* 班级
* 学号 / Email
* 联系方式
* 备注（可选）
* 提交成功提示

---

### 2. 后台管理系统（Admin Dashboard）

> **仅管理员可访问（Admin-only Access）**

#### 2.1 管理员登录（Admin Auth）

* 账号 + 密码登录
* 未登录不可访问后台页面

#### 2.2 Dashboard 总览

* 公告数量
* 活动数量
* 报名人数统计
* 最近发布内容

#### 2.3 公告管理（Notice Management）

* 创建公告
* 编辑公告
* 删除公告
* 设置是否公开发布（Publish / Draft）

#### 2.4 活动与报名管理（Activity & Signup）

* 创建活动
* 自定义报名表单字段
* 设置报名截止时间
* 查看报名名单
* 导出报名数据（CSV / Excel）

#### 2.5 评论管理（Comment Moderation）

* 查看所有评论
* 删除不当评论

---

## 五、权限设计（Permission Rules）

| 功能   | 学生 | 管理员 |
| ---- | -- | --- |
| 浏览内容 | ✅  | ✅   |
| 评论   | ✅  | ✅   |
| 报名活动 | ✅  | ❌   |
| 发布公告 | ❌  | ✅   |
| 创建活动 | ❌  | ✅   |
| 管理评论 | ❌  | ✅   |

---

## 六、UI / UX 设计原则（Desktop-focused）

* 桌面端宽屏布局（1200px+）
* 左右留白，信息层级清晰
* 公告 / 活动使用卡片式设计
* 后台 Dashboard 使用侧边栏布局
* 操作按钮明确（Publish / Edit / Delete）

---

## 七、技术实现方向（Tech Direction，可选）

* Frontend：React / Next.js
* Backend：Supabase / Appwrite / Firebase
* Database：PostgreSQL
* Auth：Role-based Admin Auth
* Form：动态表单系统

---

## 七.一、项目文件夹结构（Folder Structure）

```
kccompt/
├── public/                          # 静态资源
│   ├── images/                      # 图片（社团LOGO、宣传图等）
│   ├── favicon.ico
│   └── robots.txt
│
├── src/
│   ├── app/                         # Next.js App Router（如果使用Next.js 13+）
│   │   ├── page.tsx                 # 首页
│   │   ├── about/
│   │   │   └── page.tsx             # 电脑社介绍页
│   │   ├── notices/
│   │   │   ├── page.tsx             # 公告列表页
│   │   │   └── [id]/
│   │   │       └── page.tsx         # 公告详情页
│   │   ├── activities/
│   │   │   ├── page.tsx             # 活动列表页
│   │   │   └── [id]/
│   │   │       ├── page.tsx         # 活动详情页
│   │   │       └── signup/
│   │   │           └── page.tsx     # 活动报名页
│   │   ├── admin/
│   │   │   ├── page.tsx             # 管理员登录页
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx         # Dashboard 总览
│   │   │   │   ├── notices/
│   │   │   │   │   ├── page.tsx     # 公告管理列表
│   │   │   │   │   ├── create/
│   │   │   │   │   │   └── page.tsx # 创建公告
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── edit/
│   │   │   │   │           └── page.tsx
│   │   │   │   ├── activities/
│   │   │   │   │   ├── page.tsx     # 活动管理列表
│   │   │   │   │   ├── create/
│   │   │   │   │   │   └── page.tsx # 创建活动
│   │   │   │   │   └── [id]/
│   │   │   │   │       ├── edit/
│   │   │   │   │       │   └── page.tsx
│   │   │   │   │       └── signups/
│   │   │   │   │           └── page.tsx  # 查看报名列表
│   │   │   │   ├── comments/
│   │   │   │   │   └── page.tsx     # 评论管理
│   │   │   │   └── settings/
│   │   │   │       └── page.tsx     # 管理员设置
│   │   │   └── layout.tsx           # 管理员布局（侧边栏）
│   │   ├── layout.tsx               # 全局布局
│   │   └── error.tsx                # 错误页面
│   │
│   ├── components/                  # React 组件（可复用）
│   │   ├── common/
│   │   │   ├── Header.tsx           # 导航栏
│   │   │   ├── Footer.tsx           # 页脚
│   │   │   ├── Sidebar.tsx          # 侧边栏（管理后台）
│   │   │   └── Button.tsx           # 通用按钮
│   │   │
│   │   ├── cards/
│   │   │   ├── NoticeCard.tsx       # 公告卡片
│   │   │   ├── ActivityCard.tsx     # 活动卡片
│   │   │   └── CommentCard.tsx      # 评论卡片
│   │   │
│   │   ├── forms/
│   │   │   ├── LoginForm.tsx        # 管理员登录表单
│   │   │   ├── NoticeForm.tsx       # 公告编辑表单
│   │   │   ├── ActivityForm.tsx     # 活动编辑表单
│   │   │   ├── SignupForm.tsx       # 活动报名表单
│   │   │   ├── CommentForm.tsx      # 评论表单
│   │   │   └── DynamicFormBuilder.tsx  # 动态表单生成器
│   │   │
│   │   ├── sections/
│   │   │   ├── HeroSection.tsx      # 首页 Hero 区块
│   │   │   ├── LatestNotices.tsx    # 最新公告区块
│   │   │   ├── UpcomingActivities.tsx # 即将开始活动区块
│   │   │   └── AboutClub.tsx        # 社团介绍区块
│   │   │
│   │   ├── admin/
│   │   │   ├── DashboardStats.tsx   # Dashboard 数据统计
│   │   │   ├── NoticeList.tsx       # 公告列表（管理员）
│   │   │   ├── ActivityList.tsx     # 活动列表（管理员）
│   │   │   ├── CommentList.tsx      # 评论列表（管理员）
│   │   │   └── ExportButton.tsx     # 导出按钮（CSV/Excel）
│   │   │
│   │   ├── chat/
│   │   │   ├── ChatWidget.tsx       # 悬浮聊天窗口
│   │   │   ├── ChatMessage.tsx      # 聊天消息气泡
│   │   │   ├── ChatInput.tsx        # 聊天输入框
│   │   │   └── ChatContext.tsx      # 聊天状态管理
│   │   │
│   │   └── modal/
│   │       ├── ConfirmModal.tsx     # 确认对话框
│   │       ├── SuccessModal.tsx     # 成功提示
│   │       └── ErrorModal.tsx       # 错误提示
│   │
│   ├── services/                    # API 服务与业务逻辑
│   │   ├── appwrite.ts              # Appwrite 客户端配置
│   │   ├── auth.service.ts          # 认证服务
│   │   ├── notice.service.ts        # 公告服务
│   │   ├── activity.service.ts      # 活动服务
│   │   ├── signup.service.ts        # 报名服务
│   │   ├── comment.service.ts       # 评论服务
│   │   ├── admin.service.ts         # 管理员服务
│   │   ├── chat.service.ts          # AI 聊天服务
│   │   ├── export.service.ts        # 数据导出服务
│   │   └── upload.service.ts        # 文件上传服务
│   │
│   ├── hooks/                       # 自定义 Hooks
│   │   ├── useAuth.ts               # 认证 hook
│   │   ├── useNotices.ts            # 公告数据 hook
│   │   ├── useActivities.ts         # 活动数据 hook
│   │   ├── useComments.ts           # 评论数据 hook
│   │   ├── useSignup.ts             # 报名表单 hook
│   │   ├── useForm.ts               # 通用表单 hook
│   │   └── useQuery.ts              # 查询参数 hook
│   │
│   ├── types/                       # TypeScript 类型定义
│   │   ├── index.ts                 # 统一导出
│   │   ├── user.types.ts            # 用户相关类型
│   │   ├── notice.types.ts          # 公告相关类型
│   │   ├── activity.types.ts        # 活动相关类型
│   │   ├── signup.types.ts          # 报名相关类型
│   │   ├── comment.types.ts         # 评论相关类型
│   │   ├── api.types.ts             # API 响应类型
│   │   └── form.types.ts            # 表单相关类型
│   │
│   ├── utils/                       # 工具函数
│   │   ├── format.ts                # 格式化函数（日期、时间等）
│   │   ├── validate.ts              # 验证函数（邮箱、电话等）
│   │   ├── storage.ts               # 本地存储工具
│   │   ├── api.ts                   # API 请求工具（封装 fetch）
│   │   ├── auth.ts                  # 认证工具函数
│   │   ├── file.ts                  # 文件操作工具
│   │   ├── error.ts                 # 错误处理工具
│   │   └── constants.ts             # 常量定义
│   │
│   ├── styles/                      # 样式文件
│   │   ├── globals.css              # 全局样式
│   │   ├── variables.css            # CSS 变量（主题颜色、间距等）
│   │   ├── components.css           # 组件样式
│   │   ├── admin.css                # 管理后台样式
│   │   └── responsive.css           # 响应式设计
│   │
│   ├── config/                      # 配置文件
│   │   ├── appwrite.config.ts       # Appwrite 配置
│   │   ├── constants.config.ts      # 应用常量
│   │   ├── ai-config.ts             # AI 聊天配置
│   │   └── theme.config.ts          # 主题配置
│   │
│   ├── data/                        # 静态数据、模拟数据
│   │   ├── faq.data.ts              # FAQ 数据
│   │   ├── club-info.data.ts        # 电脑社信息
│   │   ├── sample-notices.ts        # 示例公告
│   │   └── sample-activities.ts     # 示例活动
│   │
│   ├── context/                     # React Context（状态管理）
│   │   ├── AuthContext.tsx          # 认证上下文
│   │   ├── NoticeContext.tsx        # 公告上下文
│   │   ├── ActivityContext.tsx      # 活动上下文
│   │   └── ChatContext.tsx          # 聊天上下文
│   │
│   ├── middleware/                  # 中间件
│   │   ├── auth.middleware.ts       # 认证中间件
│   │   ├── admin.middleware.ts      # 管理员权限检查
│   │   └── error.middleware.ts      # 错误处理中间件
│   │
│   └── lib/                         # 第三方库集成
│       ├── markdown.ts              # Markdown 渲染
│       └── analytics.ts             # 分析集成
│
├── docs/                            # 文档
│   ├── context.md                   # 产品上下文（本文件）
│   ├── architecture.md              # 系统架构设计
│   ├── api-spec.md                  # API 规范
│   ├── database-schema.md           # 数据库设计
│   └── deployment.md                # 部署指南
│
├── tests/                           # 测试文件
│   ├── unit/                        # 单元测试
│   │   ├── services/
│   │   └── utils/
│   ├── integration/                 # 集成测试
│   └── e2e/                         # 端到端测试
│
├── .env.example                     # 环境变量示例
├── .env.local                       # 本地环境变量（不提交）
├── package.json                     # 项目依赖
├── tsconfig.json                    # TypeScript 配置
├── next.config.js                   # Next.js 配置
├── tailwind.config.js               # Tailwind CSS 配置（如果使用）
├── README.md                        # 项目说明
└── .gitignore                       # Git 忽略文件
```

---

## 七.二、数据库 Schema（Database Schema）

> **基于 Appwrite Database Collections**

### Collection 1: `users` - 用户信息表

```json
{
  "name": "users",
  "attributes": [
    {
      "key": "userId",
      "type": "string",
      "required": true,
      "description": "用户唯一标识（主键）"
    },
    {
      "key": "email",
      "type": "email",
      "required": true,
      "unique": true,
      "description": "邮箱"
    },
    {
      "key": "name",
      "type": "string",
      "required": true,
      "description": "用户名称"
    },
    {
      "key": "role",
      "type": "string",
      "required": true,
      "enum": ["student", "admin"],
      "description": "用户角色"
    },
    {
      "key": "avatar",
      "type": "string",
      "required": false,
      "description": "头像 URL"
    },
    {
      "key": "createdAt",
      "type": "datetime",
      "required": true,
      "description": "创建时间"
    },
    {
      "key": "updatedAt",
      "type": "datetime",
      "required": true,
      "description": "更新时间"
    }
  ],
  "indexes": [
    {
      "key": "email",
      "type": "unique"
    },
    {
      "key": "role",
      "type": "key"
    }
  ]
}
```

### Collection 2: `admins` - 管理员账户表

```json
{
  "name": "admins",
  "attributes": [
    {
      "key": "adminId",
      "type": "string",
      "required": true,
      "description": "管理员唯一标识（主键）"
    },
    {
      "key": "userId",
      "type": "string",
      "required": true,
      "description": "关联用户 ID（外键）"
    },
    {
      "key": "username",
      "type": "string",
      "required": true,
      "unique": true,
      "description": "管理员账号"
    },
    {
      "key": "passwordHash",
      "type": "string",
      "required": true,
      "description": "密码哈希值"
    },
    {
      "key": "permissions",
      "type": "string",
      "required": false,
      "description": "权限列表（JSON）：manage_notices, manage_activities, manage_comments, view_analytics"
    },
    {
      "key": "lastLogin",
      "type": "datetime",
      "required": false,
      "description": "最后登录时间"
    },
    {
      "key": "isActive",
      "type": "boolean",
      "required": true,
      "default": true,
      "description": "是否激活"
    },
    {
      "key": "createdAt",
      "type": "datetime",
      "required": true,
      "description": "创建时间"
    }
  ],
  "indexes": [
    {
      "key": "username",
      "type": "unique"
    },
    {
      "key": "userId",
      "type": "key"
    }
  ]
}
```

### Collection 3: `notices` - 公告表

```json
{
  "name": "notices",
  "attributes": [
    {
      "key": "noticeId",
      "type": "string",
      "required": true,
      "description": "公告唯一标识（主键）"
    },
    {
      "key": "title",
      "type": "string",
      "required": true,
      "description": "公告标题"
    },
    {
      "key": "content",
      "type": "string",
      "required": true,
      "description": "公告内容（支持 Markdown）"
    },
    {
      "key": "author",
      "type": "string",
      "required": true,
      "description": "发布者名称"
    },
    {
      "key": "authorId",
      "type": "string",
      "required": true,
      "description": "发布者 ID（管理员 ID）"
    },
    {
      "key": "status",
      "type": "string",
      "required": true,
      "enum": ["draft", "published"],
      "default": "draft",
      "description": "发布状态"
    },
    {
      "key": "coverImage",
      "type": "string",
      "required": false,
      "description": "封面图片 URL"
    },
    {
      "key": "tags",
      "type": "string",
      "required": false,
      "description": "标签（JSON 数组）"
    },
    {
      "key": "publishedAt",
      "type": "datetime",
      "required": false,
      "description": "发布时间"
    },
    {
      "key": "createdAt",
      "type": "datetime",
      "required": true,
      "description": "创建时间"
    },
    {
      "key": "updatedAt",
      "type": "datetime",
      "required": true,
      "description": "更新时间"
    }
  ],
  "indexes": [
    {
      "key": "status",
      "type": "key"
    },
    {
      "key": "authorId",
      "type": "key"
    },
    {
      "key": "createdAt",
      "type": "key"
    }
  ]
}
```

### Collection 4: `activities` - 活动表

```json
{
  "name": "activities",
  "attributes": [
    {
      "key": "activityId",
      "type": "string",
      "required": true,
      "description": "活动唯一标识（主键）"
    },
    {
      "key": "title",
      "type": "string",
      "required": true,
      "description": "活动标题"
    },
    {
      "key": "description",
      "type": "string",
      "required": true,
      "description": "活动描述（支持 Markdown）"
    },
    {
      "key": "category",
      "type": "string",
      "required": true,
      "enum": ["编程", "AI", "网页", "比赛", "工作坊", "讲座", "其他"],
      "description": "活动分类"
    },
    {
      "key": "organizer",
      "type": "string",
      "required": true,
      "description": "组织者名称"
    },
    {
      "key": "organizerId",
      "type": "string",
      "required": true,
      "description": "组织者 ID（管理员 ID）"
    },
    {
      "key": "location",
      "type": "string",
      "required": true,
      "description": "活动地点"
    },
    {
      "key": "startTime",
      "type": "datetime",
      "required": true,
      "description": "开始时间"
    },
    {
      "key": "endTime",
      "type": "datetime",
      "required": true,
      "description": "结束时间"
    },
    {
      "key": "signupDeadline",
      "type": "datetime",
      "required": true,
      "description": "报名截止时间"
    },
    {
      "key": "maxParticipants",
      "type": "integer",
      "required": false,
      "description": "最大参加人数（null 表示无限制）"
    },
    {
      "key": "currentParticipants",
      "type": "integer",
      "required": true,
      "default": 0,
      "description": "当前报名人数"
    },
    {
      "key": "signupFormFields",
      "type": "string",
      "required": true,
      "description": "报名表单字段配置（JSON）"
    },
    {
      "key": "status",
      "type": "string",
      "required": true,
      "enum": ["draft", "published", "ongoing", "completed", "cancelled"],
      "default": "draft",
      "description": "活动状态"
    },
    {
      "key": "coverImage",
      "type": "string",
      "required": false,
      "description": "封面图片 URL"
    },
    {
      "key": "publishedAt",
      "type": "datetime",
      "required": false,
      "description": "发布时间"
    },
    {
      "key": "createdAt",
      "type": "datetime",
      "required": true,
      "description": "创建时间"
    },
    {
      "key": "updatedAt",
      "type": "datetime",
      "required": true,
      "description": "更新时间"
    }
  ],
  "indexes": [
    {
      "key": "status",
      "type": "key"
    },
    {
      "key": "category",
      "type": "key"
    },
    {
      "key": "organizerId",
      "type": "key"
    },
    {
      "key": "startTime",
      "type": "key"
    },
    {
      "key": "signupDeadline",
      "type": "key"
    }
  ]
}
```

### Collection 5: `signups` - 活动报名表

```json
{
  "name": "signups",
  "attributes": [
    {
      "key": "signupId",
      "type": "string",
      "required": true,
      "description": "报名记录唯一标识（主键）"
    },
    {
      "key": "activityId",
      "type": "string",
      "required": true,
      "description": "活动 ID（外键）"
    },
    {
      "key": "formData",
      "type": "string",
      "required": true,
      "description": "报名表单数据（JSON）：包括姓名、班级、学号/Email、联系方式等"
    },
    {
      "key": "email",
      "type": "email",
      "required": true,
      "description": "报名者邮箱"
    },
    {
      "key": "phone",
      "type": "string",
      "required": false,
      "description": "报名者电话"
    },
    {
      "key": "status",
      "type": "string",
      "required": true,
      "enum": ["pending", "confirmed", "cancelled", "attended"],
      "default": "pending",
      "description": "报名状态"
    },
    {
      "key": "notes",
      "type": "string",
      "required": false,
      "description": "备注"
    },
    {
      "key": "createdAt",
      "type": "datetime",
      "required": true,
      "description": "报名时间"
    },
    {
      "key": "updatedAt",
      "type": "datetime",
      "required": true,
      "description": "更新时间"
    }
  ],
  "indexes": [
    {
      "key": "activityId",
      "type": "key"
    },
    {
      "key": "email",
      "type": "key"
    },
    {
      "key": "status",
      "type": "key"
    },
    {
      "key": "createdAt",
      "type": "key"
    }
  ]
}
```

### Collection 6: `comments` - 评论表

```json
{
  "name": "comments",
  "attributes": [
    {
      "key": "commentId",
      "type": "string",
      "required": true,
      "description": "评论唯一标识（主键）"
    },
    {
      "key": "contentType",
      "type": "string",
      "required": true,
      "enum": ["notice", "activity"],
      "description": "评论内容类型"
    },
    {
      "key": "contentId",
      "type": "string",
      "required": true,
      "description": "关联的公告或活动 ID（外键）"
    },
    {
      "key": "nickname",
      "type": "string",
      "required": true,
      "description": "评论者昵称"
    },
    {
      "key": "email",
      "type": "email",
      "required": false,
      "description": "评论者邮箱"
    },
    {
      "key": "content",
      "type": "string",
      "required": true,
      "description": "评论内容"
    },
    {
      "key": "status",
      "type": "string",
      "required": true,
      "enum": ["pending", "approved", "rejected"],
      "default": "pending",
      "description": "审核状态（可选实现）"
    },
    {
      "key": "isDeleted",
      "type": "boolean",
      "required": true,
      "default": false,
      "description": "是否已删除（软删除）"
    },
    {
      "key": "createdAt",
      "type": "datetime",
      "required": true,
      "description": "评论时间"
    },
    {
      "key": "updatedAt",
      "type": "datetime",
      "required": true,
      "description": "更新时间"
    }
  ],
  "indexes": [
    {
      "key": "contentType",
      "type": "key"
    },
    {
      "key": "contentId",
      "type": "key"
    },
    {
      "key": "status",
      "type": "key"
    },
    {
      "key": "isDeleted",
      "type": "key"
    },
    {
      "key": "createdAt",
      "type": "key"
    }
  ]
}
```

### Collection 7: `ai_chats` - AI 聊天记录表

```json
{
  "name": "ai_chats",
  "attributes": [
    {
      "key": "chatId",
      "type": "string",
      "required": true,
      "description": "聊天唯一标识（主键）"
    },
    {
      "key": "sessionId",
      "type": "string",
      "required": true,
      "description": "会话 ID（浏览器 sessionStorage）"
    },
    {
      "key": "userMessage",
      "type": "string",
      "required": true,
      "description": "用户消息"
    },
    {
      "key": "aiResponse",
      "type": "string",
      "required": true,
      "description": "AI 回应"
    },
    {
      "key": "contextUsed",
      "type": "string",
      "required": false,
      "description": "AI 使用的数据源（JSON）：notices, activities, faq"
    },
    {
      "key": "userType",
      "type": "string",
      "required": true,
      "enum": ["student", "admin"],
      "description": "用户类型"
    },
    {
      "key": "createdAt",
      "type": "datetime",
      "required": true,
      "description": "消息时间"
    }
  ],
  "indexes": [
    {
      "key": "sessionId",
      "type": "key"
    },
    {
      "key": "userType",
      "type": "key"
    },
    {
      "key": "createdAt",
      "type": "key"
    }
  ]
}
```

### Collection 8: `club_info` - 电脑社信息表

```json
{
  "name": "club_info",
  "attributes": [
    {
      "key": "infoId",
      "type": "string",
      "required": true,
      "description": "信息唯一标识（主键）"
    },
    {
      "key": "clubName",
      "type": "string",
      "required": true,
      "description": "社团名称"
    },
    {
      "key": "mission",
      "type": "string",
      "required": true,
      "description": "社团宗旨 / 使命"
    },
    {
      "key": "vision",
      "type": "string",
      "required": true,
      "description": "社团愿景"
    },
    {
      "key": "description",
      "type": "string",
      "required": true,
      "description": "社团详细介绍"
    },
    {
      "key": "categories",
      "type": "string",
      "required": true,
      "description": "活动类型（JSON 数组）：编程、AI、网页、比赛、工作坊"
    },
    {
      "key": "contactEmail",
      "type": "email",
      "required": true,
      "description": "联系邮箱"
    },
    {
      "key": "contactPhone",
      "type": "string",
      "required": false,
      "description": "联系电话"
    },
    {
      "key": "logo",
      "type": "string",
      "required": false,
      "description": "社团 LOGO URL"
    },
    {
      "key": "bannerImage",
      "type": "string",
      "required": false,
      "description": "首页 Banner 图片 URL"
    },
    {
      "key": "updatedAt",
      "type": "datetime",
      "required": true,
      "description": "更新时间"
    }
  ]
}
```

### 数据库关系图（ER Diagram）

```
┌─────────────┐
│   admins    │
├─────────────┤
│ adminId (PK)│
│ userId (FK) │
│ username    │
│ passwordHash│
│ permissions │
│ isActive    │
│ lastLogin   │
└─────────────┘
      │
      ├─────────────────┐
      │                 │
┌─────▼──────┐  ┌──────▼─────┐
│   notices  │  │ activities │
├────────────┤  ├────────────┤
│ noticeId   │  │ activityId │
│ title      │  │ title      │
│ content    │  │ description│
│ authorId(FK)   │ organizerId(FK)
│ status     │  │ status     │
│ tags       │  │ category   │
│ createdAt  │  │ startTime  │
└────────────┘  │ signupDeadline
      │         └────────────┘
      │               │
      │        ┌──────▼──────┐
      │        │   signups   │
      │        ├─────────────┤
      │        │ signupId(PK)│
      │        │ activityId(FK)
      │        │ formData    │
      │        │ status      │
      │        │ createdAt   │
      │        └─────────────┘
      │
      ├──────────────────────┐
      │                      │
┌─────▼──────┐      ┌───────▼────┐
│  comments  │      │  club_info │
├────────────┤      ├────────────┤
│ commentId  │      │ infoId     │
│ contentType│      │ clubName   │
│ contentId  │      │ mission    │
│ nickname   │      │ vision     │
│ content    │      │ categories │
│ status     │      │ logo       │
│ createdAt  │      │ updatedAt  │
└────────────┘      └────────────┘

┌─────────────┐
│  ai_chats   │
├─────────────┤
│ chatId (PK) │
│ sessionId   │
│ userMessage │
│ aiResponse  │
│ userType    │
│ createdAt   │
└─────────────┘
```

---

## 八、AI 聊天机器人（AI Chatbot 模块）

### 8.1 功能定位（Role of AI Chatbot）

AI Chatbot 作为电脑社官网的**智能助手**，用于降低学生获取信息的成本，减少管理员重复解答问题的负担。

主要目标：

* 自动回答常见问题
* 引导学生了解活动与报名
* 提升网站现代化与科技感

---

### 8.2 学生端功能（Public AI Assistant）

#### 常见问答（FAQ AI）

* 电脑社是做什么的？
* 如何加入电脑社？
* 最近有什么活动？
* 活动报名什么时候截止？

#### 活动引导

* 根据当前公告与活动内容回答问题
* 引导学生点击对应活动详情页

#### 报名辅助

* 解释报名流程
* 提醒必填字段
* 提示报名截止时间

#### 使用形式

* 右下角悬浮 Chat Widget（Desktop）
* 点击后展开聊天窗口
* 文本输入为主（无需登录）

---

### 8.3 管理员端功能（Admin AI Assistant）

#### 后台辅助功能

* 帮助管理员快速生成公告草稿
* 根据活动信息生成报名表单字段建议
* 总结学生评论与常见问题

---

### 8.4 AI 数据来源（AI Context Source）

AI Chatbot 仅基于以下数据进行回答：

* 已发布公告
* 已发布活动内容
* 固定 FAQ 文档

> 不访问未发布（Draft）内容

---

### 8.5 权限与安全（AI Safety & Scope）

* 学生 AI：只读公开内容
* 管理员 AI：仅在后台使用
* AI 不可执行任何发布 / 删除操作
* 所有管理操作需人工确认

---

### 8.6 技术实现方向（AI Tech Direction，可选）

* AI 模型：

  * Open-source LLM（本地或 API）
  * 或第三方 AI API
* 数据注入方式：

  * RAG（基于公告与活动内容）
* 前端：Chat UI Component
* 后端：AI Gateway + 内容过滤

---

## 九、未来可扩展方向（Future Expansion）

* 学生账号系统
* 点赞 / 回复评论
* 活动签到系统（QR Code）
* 多语言（中文 / English）
* 移动端适配
