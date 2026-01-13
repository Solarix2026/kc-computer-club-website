/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * 添加学生管理所需的 users collection 属性
 * - studentId: 学号
 * - className: 班级
 * - passwordHash: 密码哈希（用于批量导入的学生）
 * - emailVerified: 邮箱是否已验证
 * 
 * 运行方式:
 * npx ts-node --project tsconfig.scripts.json scripts/add-student-attrs.ts
 */

const { Client, Databases } = require('node-appwrite');
require('dotenv').config({ path: '.env.local' });

const APPWRITE_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '';
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY || '';
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'kccompt_db';
const USERS_COLLECTION_ID = 'users';

async function addStudentAttributes() {
  console.log('🔧 添加学生管理所需的属性到 users collection...\n');
  console.log('Endpoint:', APPWRITE_ENDPOINT);
  console.log('Project:', APPWRITE_PROJECT_ID);
  console.log('Database:', DATABASE_ID);
  console.log('API Key:', APPWRITE_API_KEY ? '已设置' : '未设置');
  console.log('');

  const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID)
    .setKey(APPWRITE_API_KEY);

  const databases = new Databases(client);

  const attributesToAdd = [
    {
      key: 'studentId',
      type: 'string',
      size: 50,
      required: false,
      description: '学号',
    },
    {
      key: 'className',
      type: 'string',
      size: 100,
      required: false,
      description: '班级',
    },
    {
      key: 'passwordHash',
      type: 'string',
      size: 512,
      required: false,
      description: '密码哈希（批量导入学生用）',
    },
    {
      key: 'emailVerified',
      type: 'boolean',
      required: false,
      default: false,
      description: '邮箱是否已验证',
    },
  ];

  for (const attr of attributesToAdd) {
    try {
      if (attr.type === 'string') {
        await databases.createStringAttribute(
          DATABASE_ID,
          USERS_COLLECTION_ID,
          attr.key,
          attr.size!,
          attr.required || false,
          undefined, // default
          false // array
        );
        console.log(`✅ 已添加属性: ${attr.key} (${attr.description})`);
      } else if (attr.type === 'boolean') {
        await databases.createBooleanAttribute(
          DATABASE_ID,
          USERS_COLLECTION_ID,
          attr.key,
          attr.required || false,
          attr.default as boolean
        );
        console.log(`✅ 已添加属性: ${attr.key} (${attr.description})`);
      }
    } catch (error: unknown) {
      const err = error as Error & { code?: number; message?: string };
      if (err.code === 409 || err.message?.includes('already exists')) {
        console.log(`⏭️  属性已存在: ${attr.key}`);
      } else {
        console.error(`❌ 添加属性失败: ${attr.key}`, err.message);
      }
    }
  }

  console.log('\n✨ 完成！');
  console.log('注意：新属性可能需要几秒钟才能在 Appwrite 中生效。');
}

addStudentAttributes().catch(console.error);
