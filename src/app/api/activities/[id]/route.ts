/* eslint-disable prettier/prettier */
import { NextRequest, NextResponse } from 'next/server';
import { activityService } from '@/services/activity.service';

/**
 * GET /api/activities/[id] - 获取单个活动
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const activity = await activityService.getActivityById(id);

    return NextResponse.json({
      success: true,
      activity,
    });
  } catch (error: unknown) {
    const err = error as Error & { message?: string };
    console.error('获取活动失败:', err);
    return NextResponse.json(
      { error: err.message || '获取活动失败' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/activities/[id] - 更新活动
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const activity = await activityService.updateActivity(id, body);

    return NextResponse.json({
      success: true,
      message: '活动更新成功',
      activity,
    });
  } catch (error: unknown) {
    const err = error as Error & { message?: string };
    console.error('更新活动失败:', err);
    return NextResponse.json(
      { error: err.message || '更新活动失败' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/activities/[id] - 删除活动
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await activityService.deleteActivity(id);

    return NextResponse.json({
      success: true,
      message: '活动删除成功',
    });
  } catch (error: unknown) {
    const err = error as Error & { message?: string };
    console.error('删除活动失败:', err);
    return NextResponse.json(
      { error: err.message || '删除活动失败' },
      { status: 500 }
    );
  }
}
