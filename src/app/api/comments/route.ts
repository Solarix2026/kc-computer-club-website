/* eslint-disable prettier/prettier */
import { NextRequest, NextResponse } from 'next/server';
import { commentService, CreateCommentInput } from '@/services/comment.service';

/**
 * GET /api/comments - 获取所有评论
 * 查询参数: 
 * - onlyApproved=true (仅获取已审批)
 * - contentType=notice&contentId=xxx (按目标过滤)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const onlyApproved = searchParams.get('onlyApproved') === 'true';
    const contentType = searchParams.get('contentType') as 'notice' | 'activity' | null;
    const contentId = searchParams.get('contentId');

    let comments;
    if (contentType && contentId) {
      comments = await commentService.getCommentsByTarget(contentType, contentId, onlyApproved);
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
    const { contentType, contentId, nickname, email, content } = body;

    // 验证必填字段
    if (!contentType || !contentId || !nickname || !content) {
      return NextResponse.json(
        { error: '缺少必填字段: contentType, contentId, nickname, content' },
        { status: 400 }
      );
    }

    const input: CreateCommentInput = {
      contentType,
      contentId,
      nickname,
      email,
      content,
      status: 'approved', // 直接批准
    };

    const comment = await commentService.createComment(input);

    return NextResponse.json({
      success: true,
      message: '评论发布成功',
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
