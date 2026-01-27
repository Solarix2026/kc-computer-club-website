/* eslint-disable prettier/prettier */
/**
 * POST /api/init/create-club-settings
 * 创建 clubSettings 集合
 * 仅在开发环境使用
 */

import { NextRequest, NextResponse } from 'next/server';
import { serverDatabases } from '@/services/appwrite-server';
import { Permission, Role } from 'node-appwrite';

const APPWRITE_DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '';
const COLLECTION_ID = 'clubSettings';

export async function POST(request: NextRequest) {
  try {
    // 检查授权
    const authHeader = request.headers.get('authorization');
    if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.INIT_SECRET}`) {
      return NextResponse.json(
        { error: '未授权' },
        { status: 401 }
      );
    }

    console.log('开始创建 clubSettings 集合...');

    // 先尝试删除现有集合
    try {
      await serverDatabases.deleteCollection(APPWRITE_DATABASE_ID, COLLECTION_ID);
      console.log('✓ 已删除现有集合');
    } catch {
      // 集合不存在，继续
    }

    // 创建集合
    await serverDatabases.createCollection(
      APPWRITE_DATABASE_ID,
      COLLECTION_ID,
      '社团设置',
      [
        Permission.read(Role.any()),
        Permission.update(Role.any()),
        Permission.create(Role.any()),
      ]
    );
    console.log('✓ 集合已创建');

    // 定义所有属性
    const stringAttrs = [
      { key: 'aboutTitle', size: 256 },
      { key: 'aboutDescription', size: 4096 },
      { key: 'aboutEmail', size: 256 },
      { key: 'aboutLocation', size: 512 },
      { key: 'aboutMeetingTime', size: 256 },
      { key: 'website', size: 512 },
      { key: 'logoUrl', size: 1024 },
      { key: 'heroImage', size: 1024 },
      { key: 'heroImageAlt', size: 256 },
      { key: 'githubUrl', size: 512 },
      { key: 'discordUrl', size: 512 },
      { key: 'instagramUrl', size: 512 },
      { key: 'youtubeUrl', size: 512 },
      { key: 'attendanceSession1Start', size: 256 },
      { key: 'attendanceSession2Start', size: 256 },
      { key: 'attendanceWeekStartDate', size: 256 },
      { key: 'attendanceCode', size: 10 }, // 点名验证码（4位数字）
      { key: 'attendanceCodeCreatedAt', size: 64 }, // 验证码创建时间（ISO 8601）
    ];

    const intAttrs = [
      'activeMembers',
      'yearlyActivities',
      'awardProjects',
      'partners',
      'attendanceDayOfWeek',
      'attendanceSession1Duration',
      'attendanceSession2Duration',
    ];

    console.log(`\n正在创建属性...`);

    // 创建字符串属性
    for (const attr of stringAttrs) {
      try {
        await serverDatabases.createStringAttribute(
          APPWRITE_DATABASE_ID,
          COLLECTION_ID,
          attr.key,
          attr.size,
          false
        );
        console.log(`  ✓ ${attr.key}`);
      } catch (error: unknown) {
        const err = error as { message?: string };
        if (err.message?.includes('already exist')) {
          console.log(`  ✓ ${attr.key} (已存在)`);
        } else {
          console.error(`  ✗ ${attr.key}:`, err.message);
        }
      }
    }

    // 创建整数属性
    for (const key of intAttrs) {
      try {
        await (serverDatabases as unknown as {
          createIntegerAttribute: (
            dbId: string,
            collId: string,
            key: string,
            required: boolean
          ) => Promise<unknown>;
        }).createIntegerAttribute(APPWRITE_DATABASE_ID, COLLECTION_ID, key, false);
        console.log(`  ✓ ${key}`);
      } catch (error: unknown) {
        const err = error as { message?: string };
        if (err.message?.includes('already exist')) {
          console.log(`  ✓ ${key} (已存在)`);
        } else {
          console.error(`  ✗ ${key}:`, err.message);
        }
      }
    }

    // 创建布尔属性
    const boolAttrs = ['attendanceDebugMode', 'attendanceCodeEnabled'];
    for (const key of boolAttrs) {
      try {
        await (serverDatabases as unknown as {
          createBooleanAttribute: (
            dbId: string,
            collId: string,
            key: string,
            required: boolean
          ) => Promise<unknown>;
        }).createBooleanAttribute(APPWRITE_DATABASE_ID, COLLECTION_ID, key, false);
        console.log(`  ✓ ${key}`);
      } catch (error: unknown) {
        const err = error as { message?: string };
        if (!err.message?.includes('already exist')) {
          console.error(`  ✗ ${key}:`, err.message);
        } else {
          console.log(`  ✓ ${key} (已存在)`);
        }
      }
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'clubSettings 集合创建成功' 
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const err = error as Error & { message?: string };
    console.error('✗ 创建集合失败:', err);
    return NextResponse.json(
      { error: err.message || '创建集合失败' },
      { status: 500 }
    );
  }
}
