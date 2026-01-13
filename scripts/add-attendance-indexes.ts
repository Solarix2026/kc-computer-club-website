/* eslint-disable prettier/prettier */
/**
 * 为 attendance collection 添加缺失的索引
 * 修复 studentEmail 查询失败的问题
 */

import axios from 'axios';

const APPWRITE_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '';
const APPWRITE_PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '';
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY || '';
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '';
const ATTENDANCE_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_ATTENDANCE_COLLECTION || 'attendance';

async function addAttendanceIndexes() {
  console.log('📊 为 attendance collection 添加缺失的索引...\n');

  if (!APPWRITE_API_KEY) {
    console.error('❌ 缺少 APPWRITE_API_KEY 环境变量');
    console.log('请在 .env.local 中设置 APPWRITE_API_KEY');
    process.exit(1);
  }

  const api = axios.create({
    baseURL: APPWRITE_ENDPOINT,
    headers: {
      'Content-Type': 'application/json',
      'X-Appwrite-Response-Format': '1.0.0',
      'X-Appwrite-Project': APPWRITE_PROJECT_ID,
      'X-Appwrite-Key': APPWRITE_API_KEY,
    },
  });

  // 需要添加的索引
  const indexes = [
    { key: 'studentEmail', attributes: ['studentEmail'], type: 'key' },
  ];

  for (const index of indexes) {
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));

      await api.post(
        `/databases/${DATABASE_ID}/collections/${ATTENDANCE_COLLECTION_ID}/indexes`,
        {
          key: index.key,
          type: index.type,
          attributes: index.attributes,
        }
      );
      console.log(`✓ 已添加索引: ${index.key}`);
    } catch (error: unknown) {
      const err = error as Error & { response?: { data?: { message?: string } } };
      if (err.response?.data?.message?.includes('already exists')) {
        console.log(`ℹ 索引已存在: ${index.key}`);
      } else {
        console.warn(`⚠ 添加索引失败: ${index.key}`, err.response?.data || err.message);
      }
    }
  }

  console.log('\n✅ 索引添加完成！');
  console.log('\n💡 索引创建可能需要几秒钟，请稍等后再测试。');
}

addAttendanceIndexes().catch((error) => {
  console.error('脚本执行失败:', error);
  process.exit(1);
});
