/* eslint-disable prettier/prettier */
import { NextRequest, NextResponse } from 'next/server';
import { activityService, CreateActivityInput } from '@/services/activity.service';
import { Client, Databases, Query } from 'appwrite';

/**
 * GET /api/activities - 获取所有活动
 * 查询参数: 
 *   - onlyPublished=true (仅获取已发布)
 *   - visibility=public|all (可见范围，默认all)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const onlyPublished = searchParams.get('onlyPublished') === 'true';
    const visibility = (searchParams.get('visibility') as 'public' | 'all') || 'all';

    const activities = await activityService.getAllActivities(onlyPublished, visibility);

    // 实时统计每个活动的报名数
    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);
    const databases = new Databases(client);

    const activitiesWithCount = await Promise.all(
      activities.map(async (activity) => {
        try {
          const signupsResponse = await databases.listDocuments(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
            'signups',
            [
              Query.equal('activityId', activity.$id),
              Query.notEqual('status', 'cancelled'),
            ]
          );
          const actualCount = signupsResponse.total || 0;
          return {
            ...activity,
            currentParticipants: actualCount,
          };
        } catch (err) {
          console.warn(`Failed to count signups for activity ${activity.$id}:`, err);
          // 如果查询失败，返回数据库中存储的计数
          return activity;
        }
      })
    );

    return NextResponse.json({
      success: true,
      total: activitiesWithCount.length,
      activities: activitiesWithCount,
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
      visibility,
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
      visibility: visibility || 'public',
    };

    const activity = await activityService.createActivity(input);

    // 如果活动发布（status='published'），向所有用户发送通知
    if (status === 'published') {
      try {
        // 获取所有用户列表（这里需要实现）
        // 为了演示，我们先向一个默认用户列表发送通知
        const userIds = ['user1', 'user2', 'user3']; // 应该从数据库获取所有用户
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        for (const userId of userIds) {
          await fetch(`${appUrl}/api/notifications`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId,
              title: `新活动：${title}`,
              message: `${date} 在 ${location} 举行的 "${description.substring(0, 50)}..." 活动`,
              type: 'activity',
              relatedId: activity.$id,
            }),
          }).catch((err) => console.error('发送通知失败:', err));
        }
      } catch (err) {
        console.error('发送通知时出错:', err);
        // 不要因为通知失败而阻止活动创建
      }
    }

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
