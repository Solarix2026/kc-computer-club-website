/* eslint-disable prettier/prettier */
import { NextRequest, NextResponse } from 'next/server';
import {
  getAllNotices,
  createNotice,
  CreateNoticeInput,
} from '@/services/notice.service';

/**
 * GET /api/notices - 获取所有公告
 * 查询参数: 
 *   - onlyPublished=true (仅获取已发布)
 *   - visibility=public|all (可见范围，默认all)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const onlyPublished = searchParams.get('onlyPublished') === 'true';
    const visibility = (searchParams.get('visibility') as 'public' | 'all') || 'all';

    const notices = await getAllNotices(onlyPublished, visibility);

    return NextResponse.json({
      success: true,
      total: notices.length,
      notices,
    });
  } catch (error: unknown) {
    const err = error as Error & { message?: string };
    console.error('获取公告列表失败:', err);
    return NextResponse.json(
      { error: err.message || '获取公告列表失败' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/notices - 创建新公告
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, category, authorId, author, status, images, tags, visibility } = body;

    // 验证必填字段
    if (!title || !content || !category || !authorId || !author) {
      return NextResponse.json(
        { error: '缺少必填字段：title, content, category, authorId, author' },
        { status: 400 }
      );
    }

    const input: CreateNoticeInput = {
      title,
      content,
      category,
      authorId,
      author,
      status: status || 'draft',
      images,
      tags,
      visibility: visibility || 'public',
    };

    const notice = await createNotice(input);

    // 如果公告发布（status='published'），向所有用户发送通知
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
              title: `新公告：${title}`,
              message: content.substring(0, 100) + '...',
              type: 'notice',
              relatedId: notice.$id,
            }),
          }).catch((err) => console.error('发送通知失败:', err));
        }
      } catch (err) {
        console.error('发送通知时出错:', err);
        // 不要因为通知失败而阻止公告创建
      }
    }

    return NextResponse.json({
      success: true,
      message: '公告创建成功',
      notice,
    });
  } catch (error: unknown) {
    const err = error as Error & { message?: string };
    console.error('创建公告失败:', err);
    return NextResponse.json(
      { error: err.message || '创建公告失败' },
      { status: 500 }
    );
  }
}
