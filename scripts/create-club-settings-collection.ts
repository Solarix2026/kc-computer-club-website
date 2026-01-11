/* eslint-disable prettier/prettier */
/**
 * 创建 clubSettings 集合
 * 运行命令: npx ts-node scripts/create-club-settings-collection.ts
 */

import { Client, Databases, Permission, Role } from 'node-appwrite';

const client = new Client();

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '';
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '';
const apiKey = process.env.APPWRITE_API_KEY || '';
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '';

if (!endpoint || !projectId || !apiKey || !databaseId) {
  console.error('缺少必需的环境变量');
  process.exit(1);
}

client.setEndpoint(endpoint).setProject(projectId).setKey(apiKey);

const databases = new Databases(client);

async function createClubSettingsCollection() {
  const collectionId = 'clubSettings';

  try {
    console.log('正在创建 clubSettings 集合...');

    // 先尝试删除现有集合（可选）
    try {
      await databases.deleteCollection(databaseId, collectionId);
      console.log('✓ 已删除现有集合');
    } catch {
      // 集合不存在，继续
    }

    // 创建集合
    await databases.createCollection(
      databaseId,
      collectionId,
      '社团设置',
      [
        Permission.read(Role.any()),
        Permission.update(Role.any()),
        Permission.create(Role.any()),
      ]
    );
    console.log('✓ 集合已创建');

    // 创建所有属性
    const attributes: Array<{
      key: string;
      type: 'string' | 'integer' | 'boolean';
      size?: number;
    }> = [
      // 关于信息
      { key: 'aboutTitle', type: 'string', size: 256 },
      { key: 'aboutDescription', type: 'string', size: 4096 },
      { key: 'aboutEmail', type: 'string', size: 256 },
      { key: 'aboutLocation', type: 'string', size: 512 },
      { key: 'aboutMeetingTime', type: 'string', size: 256 },

      // 统计数据
      { key: 'activeMembers', type: 'integer' },
      { key: 'yearlyActivities', type: 'integer' },
      { key: 'awardProjects', type: 'integer' },
      { key: 'partners', type: 'integer' },

      // 社交媒体链接
      { key: 'githubUrl', type: 'string', size: 512 },
      { key: 'discordUrl', type: 'string', size: 512 },
      { key: 'instagramUrl', type: 'string', size: 512 },
      { key: 'youtubeUrl', type: 'string', size: 512 },

      // 点名配置
      { key: 'attendanceDayOfWeek', type: 'integer' },
      { key: 'attendanceSession1Start', type: 'string', size: 256 },
      { key: 'attendanceSession1Duration', type: 'integer' },
      { key: 'attendanceSession2Start', type: 'string', size: 256 },
      { key: 'attendanceSession2Duration', type: 'integer' },
      { key: 'attendanceWeekStartDate', type: 'string', size: 256 },
      { key: 'attendanceDebugMode', type: 'boolean' },
    ];

    console.log(`\n正在创建 ${attributes.length} 个属性...`);

    for (const attr of attributes) {
      try {
        if (attr.type === 'string') {
          await databases.createStringAttribute(
            databaseId,
            collectionId,
            attr.key,
            attr.size || 255,
            false
          );
        } else if (attr.type === 'integer') {
          await (databases as unknown as {
            createIntegerAttribute: (
              dbId: string,
              collId: string,
              key: string,
              required: boolean
            ) => Promise<unknown>;
          }).createIntegerAttribute(databaseId, collectionId, attr.key, false);
        } else if (attr.type === 'boolean') {
          await (databases as unknown as {
            createBooleanAttribute: (
              dbId: string,
              collId: string,
              key: string,
              required: boolean
            ) => Promise<unknown>;
          }).createBooleanAttribute(databaseId, collectionId, attr.key, false);
        }
        console.log(`  ✓ ${attr.key}`);
      } catch (error: unknown) {
        const err = error as { code?: number; message?: string };
        if (err.code === 400 || err.message?.includes('already exist')) {
          console.log(`  ✓ ${attr.key} (已存在)`);
        } else {
          console.error(`  ✗ ${attr.key}:`, err.message);
        }
      }
    }

    console.log('\n✓ clubSettings 集合创建成功！');
  } catch (error) {
    console.error('✗ 创建集合失败:', error);
    process.exit(1);
  }
}

createClubSettingsCollection();
