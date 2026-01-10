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
    const { 
      title, 
      description, 
      category, 
      date, // 格式: YYYY-MM-DD
      startTime, // 格式: HH:mm
      endDate, // 格式: YYYY-MM-DD
      endTime, // 格式: HH:mm
      location, 
      maxAttendees,
      registrationDeadline, // 格式: YYYY-MM-DD
      registrationDeadlineTime, // 格式: HH:mm
      organizer, 
      organizerId, 
      status,
      coverImage,
      allowedGrades,
    } = body;

    // 验证必填字段
    if (!title || !description || !date || !startTime || !endDate || !endTime || !location || !organizer || !organizerId) {
      return NextResponse.json(
        { error: '缺少必填字段' },
        { status: 400 }
      );
    }

    // 将日期和时间组合成 ISO datetime 格式
    // startTime: "2024-01-15" + "14:30" => "2024-01-15T14:30:00Z"
    const startDateTime = `${date}T${startTime}:00Z`;
    const endDateTime = `${endDate}T${endTime}:00Z`;
    const signupDeadlineDateTime = `${registrationDeadline}T${registrationDeadlineTime || '23:59'}:00Z`;

    const input: CreateActivityInput = {
      title,
      description,
      category: category || '其他',
      startTime: startDateTime,
      endTime: endDateTime,
      location,
      maxParticipants: maxAttendees || 0,
      currentParticipants: 0,
      signupDeadline: signupDeadlineDateTime,
      signupFormFields: JSON.stringify([]),
      organizer,
      organizerId,
      status: status || 'draft',
      coverImage: coverImage || undefined,
      allowedGrades: allowedGrades && allowedGrades.length > 0 ? JSON.stringify(allowedGrades) : undefined,
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
