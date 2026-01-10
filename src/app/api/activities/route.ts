/* eslint-disable prettier/prettier */
import { NextRequest, NextResponse } from 'next/server';
import { activityService, CreateActivityInput } from '@/services/activity.service';

/**
 * GET /api/activities - 获取所有活动
 * 查询参数: onlyPublished=true (仅获取已发布)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const onlyPublished = searchParams.get('onlyPublished') === 'true';

    const activities = await activityService.getAllActivities(onlyPublished);

    return NextResponse.json({
      success: true,
      total: activities.length,
      activities,
    });
  } catch (error: unknown) {
    const err = error as Error & { message?: string };
    console.error('获取活动列表失败:', err);
    return NextResponse.json(
      { error: err.message || '获取活动列表失败' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/activities - 创建新活动
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, category, date, startTime, endTime, location, capacity, status, instructor, imageUrl } = body;

    // 验证必填字段
    if (!title || !description || !category || !date || !startTime || !endTime || !location || !capacity) {
      return NextResponse.json(
        { error: '缺少必填字段' },
        { status: 400 }
      );
    }

    const input: CreateActivityInput = {
      title,
      description,
      category,
      date,
      startTime,
      endTime,
      location,
      capacity,
      status: status || 'draft',
      instructor,
      imageUrl,
    };

    const activity = await activityService.createActivity(input);

    return NextResponse.json({
      success: true,
      message: '活动创建成功',
      activity,
    });
  } catch (error: unknown) {
    const err = error as Error & { message?: string };
    console.error('创建活动失败:', err);
    return NextResponse.json(
      { error: err.message || '创建活动失败' },
      { status: 500 }
    );
  }
}
