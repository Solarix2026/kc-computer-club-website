/* eslint-disable prettier/prettier */
/**
 * 添加 uniqueKey 属性到 attendance 集合
 * 格式: studentId_sessionTime_weekNumber
 * 用于唯一标识每个学生每周每时段的点名记录
 * 
 * 运行: npx ts-node --project tsconfig.scripts.json scripts/add-unique-key-attribute.ts
 */

import { Client, Databases, IndexType } from 'node-appwrite';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const apiKey = process.env.APPWRITE_API_KEY;

if (!endpoint || !projectId || !databaseId || !apiKey) {
  console.error('❌ 缺少必要的环境变量');
  process.exit(1);
}

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId)
  .setKey(apiKey);

const databases = new Databases(client);
const ATTENDANCE_COLLECTION_ID = 'attendance';
const DB_ID = databaseId as string;

async function addUniqueKeyAttribute() {
  console.log('🔧 正在添加 uniqueKey 属性到 attendance 集合...\n');

  try {
    // 添加 uniqueKey 属性
    await databases.createStringAttribute(
      DB_ID,
      ATTENDANCE_COLLECTION_ID,
      'uniqueKey',
      256,          // size
      false,        // required (false for existing records)
      undefined,    // default
      false         // array
    );
    console.log('✅ uniqueKey 属性已添加');

    // 等待属性创建完成
    console.log('⏳ 等待属性创建完成...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 添加索引以加速查询
    try {
      await databases.createIndex(
        DB_ID,
        ATTENDANCE_COLLECTION_ID,
        'uniqueKey_idx',
        IndexType.Unique,     // 唯一索引
        ['uniqueKey']
      );
      console.log('✅ uniqueKey 唯一索引已添加');
    } catch (indexError: unknown) {
      const err = indexError as { message?: string };
      if (err.message?.includes('already exists')) {
        console.log('ℹ️ uniqueKey 索引已存在');
      } else {
        console.warn('⚠️ 无法添加唯一索引:', err.message);
      }
    }

    console.log('\n✅ 完成！现在可以使用 uniqueKey 字段了');
    console.log('格式: studentId_sessionTime_weekNumber');
    console.log('例如: 12345_15:20_3 (学号12345, 时段15:20, 第3周)');

  } catch (error: unknown) {
    const err = error as { message?: string; code?: number };
    if (err.message?.includes('already exists') || err.code === 409) {
      console.log('ℹ️ uniqueKey 属性已存在');
    } else {
      console.error('❌ 添加属性失败:', err.message);
      process.exit(1);
    }
  }
}

addUniqueKeyAttribute();
