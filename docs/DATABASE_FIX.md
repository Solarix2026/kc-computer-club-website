# 手动添加缺失的数据库属性（Manual Database Fix）

您的 Appwrite Cloud 数据库缺少 `images` 和 `category` 属性。有以下两种方案解决：

## 方案 1：使用 Appwrite 控制台（推荐）

1. 登录 [Appwrite Cloud](https://cloud.appwrite.io)
2. 进入您的项目：`695f6fae002f3e3e529b3`
3. 进入数据库：`kccomputer`
4. 选择 Collection：`notices`
5. 点击 "Create Attribute" 或 "+" 按钮
6. 创建以下两个属性：

### 属性 1: images
```
Key: images
Type: String
Size: 4096
Required: No
Default: (leave empty)
```

### 属性 2: category
```
Key: category
Type: String
Size: 256
Required: No
Default: (leave empty)
```

## 方案 2：使用命令行重新初始化（会清空所有数据）

```bash
npm run setup:appwrite
```

## 为什么需要这些属性？

- **images**: 存储公告的多个图片 URL 列表（JSON 格式）
- **category**: 存储公告的分类（活动通知、课程公告等）

## 修复后

完成属性添加后，您可以正常使用图片上传功能：

```bash
npm run build  # 重新构建项目
npm run dev     # 启动开发服务器
```

## 需要帮助？

如果在 Appwrite 控制台找不到选项，请检查：
1. 确保您已登录 Appwrite Cloud
2. 确保您在正确的项目和数据库中
3. 确保您有足够的权限（通常是项目所有者）
