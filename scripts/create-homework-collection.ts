/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Client, Databases, Permission, Role, IndexType } from 'node-appwrite';
import * as path from 'path';
import * as dotenv from 'dotenv';

// 加载 .env.local
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const APPWRITE_DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '';
const HOMEWORK_COLLECTION_ID = 'homework';
const SUBMISSIONS_COLLECTION_ID = 'homework_submissions';

// 初始化 Appwrite 客户端
const client = new Client();

client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'http://localhost/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '')
  .setKey(process.env.APPWRITE_API_KEY || '');

const databases = new Databases(client);

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function createHomeworkCollection(): Promise<void> {
  console.log('🚀 开始创建 homework Collection...\n');

  try {
    // 1. 创建功课 Collection
    console.log('📁 创建 homework Collection...');
    await databases.createCollection(
      APPWRITE_DATABASE_ID,
      HOMEWORK_COLLECTION_ID,
      '功课表',
      [
        Permission.read(Role.any()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users()),
      ]
    );
    console.log('✅ homework Collection 创建成功\n');

    await sleep(1000);

    // 2. 创建功课属性
    console.log('📝 创建功课属性...');
    
    const homeworkAttributes = [
      { key: 'title', type: 'string', size: 256, required: true },
      { key: 'description', type: 'string', size: 8192, required: true },
      { key: 'subject', type: 'string', size: 128, required: true },
      { key: 'dueDate', type: 'string', size: 64, required: true },
      { key: 'attachments', type: 'string', size: 4096, required: false },
      { key: 'allowedFileTypes', type: 'string', size: 512, required: false },
      { key: 'maxFileSize', type: 'integer', required: false },
      { key: 'status', type: 'string', size: 32, required: true },
      { key: 'createdBy', type: 'string', size: 256, required: true },
      { key: 'createdByName', type: 'string', size: 128, required: true },
      { key: 'createdAt', type: 'string', size: 64, required: true },
      { key: 'updatedAt', type: 'string', size: 64, required: true },
    ];

    for (const attr of homeworkAttributes) {
      try {
        if (attr.type === 'integer') {
          await (databases as any).createIntegerAttribute(
            APPWRITE_DATABASE_ID,
            HOMEWORK_COLLECTION_ID,
            attr.key,
            attr.required
          );
        } else {
          await (databases as any).createStringAttribute(
            APPWRITE_DATABASE_ID,
            HOMEWORK_COLLECTION_ID,
            attr.key,
            attr.size,
            attr.required
          );
        }
        console.log(`  ✅ ${attr.key}`);
        await sleep(500);
      } catch (err: any) {
        if (err.message?.includes('already exists')) {
          console.log(`  ⏭️ ${attr.key} (已存在)`);
        } else {
          console.error(`  ❌ ${attr.key}: ${err.message}`);
        }
      }
    }

    console.log('\n✅ homework Collection 创建完成！\n');

  } catch (err: any) {
    if (err.message?.includes('already exists')) {
      console.log('⏭️ homework Collection 已存在，跳过创建\n');
    } else {
      console.error('❌ 创建失败:', err.message);
      throw err;
    }
  }
}

async function createSubmissionsCollection(): Promise<void> {
  console.log('🚀 开始创建 homework_submissions Collection...\n');

  try {
    // 1. 创建提交 Collection
    console.log('📁 创建 homework_submissions Collection...');
    await databases.createCollection(
      APPWRITE_DATABASE_ID,
      SUBMISSIONS_COLLECTION_ID,
      '功课提交表',
      [
        Permission.read(Role.any()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users()),
      ]
    );
    console.log('✅ homework_submissions Collection 创建成功\n');

    await sleep(1000);

    // 2. 创建提交属性
    console.log('📝 创建提交属性...');
    
    const submissionAttributes = [
      { key: 'homeworkId', type: 'string', size: 256, required: true },
      { key: 'studentId', type: 'string', size: 256, required: true },
      { key: 'studentName', type: 'string', size: 128, required: true },
      { key: 'studentEmail', type: 'string', size: 256, required: true },
      { key: 'content', type: 'string', size: 8192, required: false },
      { key: 'attachments', type: 'string', size: 4096, required: false },
      { key: 'status', type: 'string', size: 32, required: true },
      { key: 'grade', type: 'string', size: 32, required: false },
      { key: 'feedback', type: 'string', size: 2048, required: false },
      { key: 'submittedAt', type: 'string', size: 64, required: true },
      { key: 'gradedAt', type: 'string', size: 64, required: false },
      { key: 'gradedBy', type: 'string', size: 256, required: false },
      { key: 'updatedAt', type: 'string', size: 64, required: true },
    ];

    for (const attr of submissionAttributes) {
      try {
        await (databases as any).createStringAttribute(
          APPWRITE_DATABASE_ID,
          SUBMISSIONS_COLLECTION_ID,
          attr.key,
          attr.size,
          attr.required
        );
        console.log(`  ✅ ${attr.key}`);
        await sleep(500);
      } catch (err: any) {
        if (err.message?.includes('already exists')) {
          console.log(`  ⏭️ ${attr.key} (已存在)`);
        } else {
          console.error(`  ❌ ${attr.key}: ${err.message}`);
        }
      }
    }

    // 3. 创建索引
    console.log('\n📇 创建索引...');
    
    await sleep(3000); // 等待属性创建完成

    try {
      await databases.createIndex(
        APPWRITE_DATABASE_ID,
        SUBMISSIONS_COLLECTION_ID,
        'homeworkId_idx',
        IndexType.Key,
        ['homeworkId']
      );
      console.log('  ✅ homeworkId_idx');
    } catch (err: any) {
      console.log(`  ⏭️ homeworkId_idx: ${err.message}`);
    }

    try {
      await databases.createIndex(
        APPWRITE_DATABASE_ID,
        SUBMISSIONS_COLLECTION_ID,
        'studentId_idx',
        IndexType.Key,
        ['studentId']
      );
      console.log('  ✅ studentId_idx');
    } catch (err: any) {
      console.log(`  ⏭️ studentId_idx: ${err.message}`);
    }

    console.log('\n✅ homework_submissions Collection 创建完成！');

  } catch (err: any) {
    if (err.message?.includes('already exists')) {
      console.log('⏭️ homework_submissions Collection 已存在，跳过创建');
    } else {
      console.error('❌ 创建失败:', err.message);
      throw err;
    }
  }
}

async function main() {
  console.log('========================================');
  console.log('   功课系统 Collection 创建脚本');
  console.log('========================================\n');

  await createHomeworkCollection();
  await createSubmissionsCollection();

  console.log('\n📌 请在 .env.local 中添加:');
  console.log('   NEXT_PUBLIC_APPWRITE_HOMEWORK_COLLECTION=homework');
  console.log('   NEXT_PUBLIC_APPWRITE_HOMEWORK_SUBMISSIONS_COLLECTION=homework_submissions');
}

main()
  .then(() => {
    console.log('\n🎉 脚本执行完成');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n💥 脚本执行失败:', err);
    process.exit(1);
  });
