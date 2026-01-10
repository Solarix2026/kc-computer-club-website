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

async function addImagesAttribute() {
  try {
    console.log('🔄 开始添加 images 属性到 notices collection...\n');

    const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'kccompt_db';
    const collectionId = 'notices';

    // 创建 images 属性
    await (databases as any).createStringAttribute(
      databaseId,
      collectionId,
      'images',
      4096,
      false
    );

    console.log('✅ images 属性添加成功！');
    console.log('   您现在可以使用多张图片功能了。\n');
  } catch (error: any) {
    if (error.message && (error.message.includes('already exists') || error.message.includes('Attribute'))) {
      console.log('⏭️ images 属性已存在或出现错误。');
      console.log('💡 如果您需要重新初始化数据库，请运行: npm run setup:appwrite\n');
      process.exit(0);
    } else {
      console.error('❌ 添加属性失败:', error.message);
      console.log('\n💡 解决方案：');
      console.log('   1. 确保 APPWRITE_API_KEY 在 .env.local 中正确设置');
      console.log('   2. 确保 Appwrite 服务正在运行');
      console.log('   3. 或者运行 npm run setup:appwrite 重新初始化整个数据库\n');
      process.exit(1);
    }
  }
}

addImagesAttribute();
