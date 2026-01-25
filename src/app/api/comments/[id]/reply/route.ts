/* eslint-disable prettier/prettier */
import { NextRequest, NextResponse } from 'next/server';
import { commentService, ReplyCommentInput } from '@/services/comment.service';

/**
 * POST /api/comments/[id]/reply - 老师回复评论
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { reply, replyAuthor }: ReplyCommentInput = body;

    // 验证必填字段
    if (!reply || !replyAuthor) {
      return NextResponse.json(
        { error: '缺少必填字段: reply, replyAuthor' },
        { status: 400 }
      );
    }

    const input: ReplyCommentInput = {
      reply,
      replyAuthor,
    };

    const comment = await commentService.replyToComment(id, input);

    return NextResponse.json({
      success: true,
      message: '回复成功',
      comment,
    });
  } catch (error: unknown) {
    const err = error as Error & { message?: string };
    console.error('回复评论失败:', err);
    return NextResponse.json(
      { error: err.message || '回复评论失败' },
      { status: 500 }
    );
  }
}
