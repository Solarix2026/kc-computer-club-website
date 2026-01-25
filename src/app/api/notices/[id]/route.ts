/* eslint-disable prettier/prettier */
import { NextRequest, NextResponse } from 'next/server';
import {
  getNoticeById,
  updateNotice,
  deleteNotice,
  UpdateNoticeInput,
} from '@/services/notice.service';

/**
 * GET /api/notices/[id] - 获取单个公告
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const notice = await getNoticeById(id);

    return NextResponse.json({
      success: true,
      notice,
    });
  } catch (error: unknown) {
    const err = error as Error & { message?: string };
    console.error('获取公告失败:', err);
    return NextResponse.json(
      { error: err.message || '获取公告失败' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/notices/[id] - 更新公告
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const input: UpdateNoticeInput = {
      title: body.title,
      content: body.content,
      category: body.category,
      status: body.status,
      images: body.images,
      tags: body.tags,
    };

    const notice = await updateNotice(id, input);

    return NextResponse.json({
      success: true,
      message: '公告更新成功',
      notice,
    });
  } catch (error: unknown) {
    const err = error as Error & { message?: string };
    console.error('更新公告失败:', err);
    return NextResponse.json(
      { error: err.message || '更新公告失败' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/notices/[id] - 删除公告
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteNotice(id);

    return NextResponse.json({
      success: true,
      message: '公告删除成功',
    });
  } catch (error: unknown) {
    const err = error as Error & { message?: string };
    console.error('删除公告失败:', err);
    return NextResponse.json(
      { error: err.message || '删除公告失败' },
      { status: 500 }
    );
  }
}
