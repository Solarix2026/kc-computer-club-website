/* eslint-disable prettier/prettier */
import { NextRequest, NextResponse } from 'next/server';
import { commentService, CreateCommentInput } from '@/services/comment.service';

/**
 * GET /api/comments - 获取所有评论
 * 查询参数: 
 * - onlyApproved=true (仅获取已审批)
 * - targetType=notice&targetId=xxx (按目标过滤)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const onlyApproved = searchParams.get('onlyApproved') === 'true';
    const targetType = searchParams.get('targetType') as 'notice' | 'activity' | null;
    const targetId = searchParams.get('targetId');

    let comments;
    if (targetType && targetId) {
      comments = await commentService.getCommentsByTarget(targetType, targetId, onlyApproved);
    } else {
      comments = await commentService.getAllComments(onlyApproved);
    }

    return NextResponse.json({
      success: true,
      total: comments.length,
      comments,
    });
  } catch (error: unknown) {
    const err = error as Error & { message?: string };
    console.error('获取评论列表失败:', err);
    return NextResponse.json(
      { error: err.message || '获取评论列表失败' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/comments - 创建新评论
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { targetType, targetId, targetTitle, authorName, authorEmail, content } = body;

    // 验证必填字段
    if (!targetType || !targetId || !authorName || !content) {
      return NextResponse.json(
        { error: '缺少必填字段: targetType, targetId, authorName, content' },
        { status: 400 }
      );
    }

    const input: CreateCommentInput = {
      targetType,
      targetId,
      targetTitle,
      authorName,
      authorEmail,
      content,
      status: 'pending', // 新评论默认待审批
    };

    const comment = await commentService.createComment(input);

    return NextResponse.json({
      success: true,
      message: '评论发布成功，等待管理员审批',
      comment,
    });
  } catch (error: unknown) {
    const err = error as Error & { message?: string };
    console.error('创建评论失败:', err);
    return NextResponse.json(
      { error: err.message || '创建评论失败' },
      { status: 500 }
    );
  }
}
