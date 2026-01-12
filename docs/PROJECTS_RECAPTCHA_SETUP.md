# 项目功能更新总结

## 已完成的功能

### 1. ✅ Projects Collection 创建
- 运行 `npm run setup:projects` 脚本在 Appwrite 中创建了 `projects` Collection
- 已添加环境变量 `NEXT_PUBLIC_APPWRITE_PROJECTS_COLLECTION=projects` 到 `.env.local`
- **注意**：由于 Appwrite 免费版属性数量限制，`adminFeedback` 属性未能创建，代码已做兼容处理

### 2. ✅ Vercel Speed Insights
- 已安装 `@vercel/speed-insights` 包
- 已在 `src/app/layout.tsx` 中添加 `<SpeedInsights />` 组件
- 部署到 Vercel 后自动收集性能数据

### 3. ✅ Google reCAPTCHA v3
- 已安装 `react-google-recaptcha-v3` 包
- 已创建 `src/contexts/ReCaptchaContext.tsx` Provider 组件
- 已在 `src/app/layout.tsx` 中集成 `<ReCaptchaProvider>`
- 配置的密钥：
  - Site Key: `6LfpFUgsAAAAAFvoBnhXt65Cbanpj4JmXpquOivu`
  - Secret Key: `6LfpFUgsAAAAAASLawJTxEDgrbmUoslae2mtFBAA`
- 已添加到 `.env.local`

### 4. ✅ 组员验证功能
- 创建了 API 端点 `/api/users/validate` 用于验证用户是否已注册
- 更新了项目提交页面 `src/app/projects/submit/page.tsx`：
  - 添加组员时需要先输入邮箱并点击"验证邮箱"按钮
  - 系统会自动验证邮箱是否已在数据库中注册
  - 验证成功后自动填充用户姓名和 userId
  - 未验证的组员无法提交项目
  - 组长信息自动从登录用户获取，不可编辑

---

## 文件变更清单

### 新增文件
- `src/contexts/ReCaptchaContext.tsx` - reCAPTCHA Provider
- `src/app/api/users/validate/route.ts` - 用户验证 API
- `scripts/create-projects-collection.ts` - 创建 projects collection 脚本
- `scripts/add-admin-feedback.ts` - 添加 adminFeedback 属性脚本

### 修改文件
- `src/app/layout.tsx` - 添加 SpeedInsights 和 ReCaptchaProvider
- `src/app/projects/submit/page.tsx` - 添加组员邮箱验证功能
- `src/services/project.service.ts` - 处理 adminFeedback 属性缺失
- `package.json` - 添加 `setup:projects` 脚本
- `.env.example` - 添加新的环境变量
- `.env.local` - 添加 reCAPTCHA 和 projects 配置
- `config/collections.json` - 添加 projects collection 配置

---

## 使用说明

### 1. 运行项目
```bash
npm run dev
```

### 2. 测试组员验证
1. 访问 `/projects/submit`（需要先登录）
2. 填写项目信息
3. 点击"添加成员"
4. 输入组员邮箱
5. 点击"验证邮箱"按钮
6. 如果邮箱已注册，会显示绿色勾号并自动填充姓名
7. 如果邮箱未注册，会显示红色错误提示

### 3. reCAPTCHA 使用
在表单中使用 `useGoogleReCaptcha` Hook：
```tsx
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

function MyForm() {
  const { executeRecaptcha } = useGoogleReCaptcha();
  
  const handleSubmit = async () => {
    if (!executeRecaptcha) return;
    const token = await executeRecaptcha('submit');
    // 将 token 发送到后端验证
  };
}
```

### 4. 后端验证 reCAPTCHA
```ts
const verifyRecaptcha = async (token: string) => {
  const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`,
  });
  const data = await response.json();
  return data.success && data.score > 0.5;
};
```

---

## 已知限制

### Appwrite 免费版属性限制
- `adminFeedback` 属性因属性数量限制未能创建
- 代码已做兼容处理：读取时返回空字符串，更新时跳过该字段
- 如需使用 adminFeedback 功能，可以：
  1. 升级 Appwrite 到付费版
  2. 或在 Appwrite 控制台手动删除一个不常用的属性后添加 adminFeedback

---

## 环境变量清单

```env
# 新增的环境变量
NEXT_PUBLIC_APPWRITE_ATTENDANCE_COLLECTION=attendance
NEXT_PUBLIC_APPWRITE_PROJECTS_COLLECTION=projects
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_site_key
RECAPTCHA_SECRET_KEY=your_secret_key
```
