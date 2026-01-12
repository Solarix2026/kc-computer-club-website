/* eslint-disable prettier/prettier */
import { Client, Databases, Permission, Role } from 'node-appwrite';
import * as path from 'path';
import * as dotenv from 'dotenv';

// 加载 .env.local
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const APPWRITE_DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '';
const PROJECTS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECTS_COLLECTION || 'projects';

// 初始化 Appwrite 客户端
const client = new Client();

client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'http://localhost/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '')
  .setKey(process.env.APPWRITE_API_KEY || '');

const databases = new Databases(client);

async function fixProjectsPermissions(): Promise<void> {
  console.log('🔧 修复 projects Collection 权限...\n');

  try {
    // 更新 Collection 权限 - 允许任何人创建、读取、更新
    await databases.updateCollection(
      APPWRITE_DATABASE_ID,
      PROJECTS_COLLECTION_ID,
      '项目表',
      [
        Permission.read(Role.any()),    // 任何人可读
        Permission.create(Role.any()),  // 任何人可创建
        Permission.update(Role.any()),  // 任何人可更新
        Permission.delete(Role.users()), // 只有登录用户可删除
      ]
    );

    console.log('✅ 权限更新成功！');
    console.log('\n新权限:');
    console.log('  - 读取: 所有人');
    console.log('  - 创建: 所有人');
    console.log('  - 更新: 所有人');
    console.log('  - 删除: 已登录用户');

  } catch (err: unknown) {
    const error = err as Error & { message?: string };
    console.error('❌ 更新失败:', error.message);
    throw err;
  }
}

fixProjectsPermissions()
  .then(() => {
    console.log('\n🎉 权限修复完成');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n💥 脚本执行失败:', err);
    process.exit(1);
  });
