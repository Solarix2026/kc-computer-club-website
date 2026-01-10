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
const COLLECTION_ID = 'activities';

// 添加 allowedGrades 属性
async function addAllowedGradesAttribute(): Promise<void> {
  try {
    console.log('🔧 添加 allowedGrades 属性到 activities 集合...\n');

    const attributeData = {
      key: 'allowedGrades',
      type: 'string',
      required: false,
      array: false,
      size: 1024,
    };

    await api.post(
      `/v1/databases/${DB_ID}/collections/${COLLECTION_ID}/attributes/string`,
      attributeData
    );
    console.log('✅ allowedGrades 属性添加成功！');
  } catch (error: any) {
    if (error.response?.status === 409) {
      console.log('⏭️ allowedGrades 属性已存在');
    } else {
      console.error(
        '❌ 添加属性失败:',
        error.response?.data?.message || error.message
      );
      throw error;
    }
  }
}

// 添加 coverImage 属性（如果还没有）
async function addCoverImageAttribute(): Promise<void> {
  try {
    console.log('🔧 添加 coverImage 属性到 activities 集合...\n');

    const attributeData = {
      key: 'coverImage',
      type: 'string',
      required: false,
      array: false,
      size: 2048,
    };

    await api.post(
      `/v1/databases/${DB_ID}/collections/${COLLECTION_ID}/attributes/string`,
      attributeData
    );
    console.log('✅ coverImage 属性添加成功！');
  } catch (error: any) {
    if (error.response?.status === 409) {
      console.log('⏭️ coverImage 属性已存在');
    } else {
      console.error(
        '❌ 添加属性失败:',
        error.response?.data?.message || error.message
      );
      throw error;
    }
  }
}

// 主函数
async function main() {
  try {
    // 验证环境变量
    if (!process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT) {
      throw new Error('NEXT_PUBLIC_APPWRITE_ENDPOINT 未配置');
    }

    if (!process.env.APPWRITE_API_KEY) {
      throw new Error('APPWRITE_API_KEY 未配置');
    }

    if (!process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID) {
      throw new Error('NEXT_PUBLIC_APPWRITE_PROJECT_ID 未配置');
    }

    console.log('✅ 环境变量验证通过\n');

    // 添加属性
    await addCoverImageAttribute();
    await new Promise((resolve) => setTimeout(resolve, 500));
    await addAllowedGradesAttribute();

    console.log('\n✨ 所有属性已添加！');
    console.log('现在可以保存带有 allowedGrades 的活动了。');
  } catch (error) {
    console.error('\n❌ 添加属性失败:', error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('未捕获的错误:', error);
  process.exit(1);
});
