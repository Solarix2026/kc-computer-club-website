/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as dotenv from 'dotenv';
import * as path from 'path';
import axios from 'axios';

// 加载 .env.local
dotenv.config({ path: path.join(__dirname, '../.env.local') });

// 创建 Appwrite API 客户端
const api = axios.create({
  baseURL: (process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '').replace('/v1', ''),
  headers: {
    'X-Appwrite-Project': process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
    'X-Appwrite-Key': process.env.APPWRITE_API_KEY,
    'Content-Type': 'application/json',
  },
});

const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'kccomputer';

// 添加 visibility 属性到指定集合
async function addVisibilityAttribute(collectionId: string, collectionName: string): Promise<void> {
  try {
    console.log(`🔧 添加 visibility 属性到 ${collectionName} 集合...\n`);

    const attributeData = {
      key: 'visibility',
      elements: ['public', 'internal'],
      required: false,
      default: 'public',
    };

    await api.post(
      `/v1/databases/${DB_ID}/collections/${collectionId}/attributes/enum`,
      attributeData
    );
    console.log(`✅ ${collectionName} visibility 属性添加成功！`);
  } catch (error: any) {
    if (error.response?.status === 409) {
      console.log(`⏭️ ${collectionName} visibility 属性已存在`);
    } else {
      console.error(
        `❌ 添加 ${collectionName} 属性失败:`,
        error.response?.data?.message || error.message
      );
      throw error;
    }
  }
}

async function main() {
  console.log('========================================');
  console.log('  添加 visibility 属性（公开/内部）');
  console.log('========================================\n');

  const noticesCollectionId = process.env.NEXT_PUBLIC_APPWRITE_NOTICES_COLLECTION || 'notices';
  const activitiesCollectionId = 'activities';

  // 添加到 notices 集合
  await addVisibilityAttribute(noticesCollectionId, 'notices');
  
  // 等待一秒再添加下一个
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 添加到 activities 集合
  await addVisibilityAttribute(activitiesCollectionId, 'activities');

  console.log('\n========================================');
  console.log('  ✅ 所有属性添加完成！');
  console.log('========================================\n');
  console.log('visibility 字段说明:');
  console.log('  - public: 公开（所有人可见）');
  console.log('  - internal: 内部（仅学生可见）');
}

main().catch(console.error);
