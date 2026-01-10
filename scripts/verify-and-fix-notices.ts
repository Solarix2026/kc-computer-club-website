/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Client, Databases } from 'appwrite';
import * as path from 'path';
import * as dotenv from 'dotenv';

// 加载 .env.local
dotenv.config({ path: path.join(__dirname, '../.env.local') });

// 初始化 Appwrite 客户端
const client = new Client();

client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'http://localhost/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '');

// 需要使用 API Key 作为管理员权限
if (process.env.APPWRITE_API_KEY) {
  (client as any).setDevKey(process.env.APPWRITE_API_KEY);
}

const databases = new Databases(client);

async function verifyAndFixNotices() {
  try {
    console.log('🔍 检查和修复 notices collection...\n');

    const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'kccompt_db';
    const collectionId = 'notices';

    // 获取 collection 的属性
    await (databases as any).listDocuments(
      databaseId,
      collectionId,
      [],
      1  // 只查询1个文档来验证 collection 存在
    );
    
    console.log('✅ Collection 访问成功');
    console.log(`📌 notices collection 已存在，现在尝试添加缺失的属性...\n`);

    // 尝试添加 images 属性
    console.log('🔧 添加 images 属性...');
    try {
      await (databases as any).createStringAttribute(
        databaseId,
        collectionId,
        'images',
        4096,
        false
      );
      console.log('✅ images 属性添加成功！');
    } catch (err: any) {
      if (err.message && err.message.includes('already exists')) {
        console.log('⏭️ images 属性已存在');
      } else {
        console.error('⚠️ 添加 images 属性失败:', err.message);
      }
    }

    // 尝试添加 category 属性
    console.log('🔧 添加 category 属性...');
    try {
      await (databases as any).createStringAttribute(
        databaseId,
        collectionId,
        'category',
        256,
        false
      );
      console.log('✅ category 属性添加成功！');
    } catch (err: any) {
      if (err.message && err.message.includes('already exists')) {
        console.log('⏭️ category 属性已存在');
      } else {
        console.error('⚠️ 添加 category 属性失败:', err.message);
      }
    }

    console.log('\n✨ 数据库验证和修复完成！\n');
  } catch (error: any) {
    console.error('❌ 错误:', error.message);
    console.log('\n💡 解决方案：');
    console.log('   1. 确保 Appwrite 服务正在运行');
    console.log('   2. 确保 APPWRITE_API_KEY 正确配置');
    console.log('   3. 检查网络连接\n');
    process.exit(1);
  }
}

verifyAndFixNotices();
