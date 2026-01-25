/* eslint-disable prettier/prettier */
import { NextRequest, NextResponse } from 'next/server';
import { uploadImage, deleteImage, getImageUrl } from '@/services/storage.service';

/**
 * 上传图片 API
 * POST /api/upload/image
 * 
 * 请求: multipart/form-data
 * 字段: file (File)
 * 
 * 响应:
 * {
 *   "fileId": "xxx",
 *   "url": "https://..."
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: '未提供文件' },
        { status: 400 }
      );
    }

    // 上传文件
    const fileId = await uploadImage(file);

    // 生成预览 URL
    const url = getImageUrl(fileId);

    return NextResponse.json({
      success: true,
      fileId,
      url,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
    });
  } catch (error: unknown) {
    const err = error as Error & { message?: string };
    console.error('上传错误:', err);
    return NextResponse.json(
      { error: err.message || '上传失败' },
      { status: 500 }
    );
  }
}

/**
 * 删除图片 API
 * DELETE /api/upload/image
 * 
 * 请求 Body:
 * {
 *   "fileId": "xxx"
 * }
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { fileId } = body;

    if (!fileId) {
      return NextResponse.json(
        { error: '未提供文件 ID' },
        { status: 400 }
      );
    }

    await deleteImage(fileId);

    return NextResponse.json({
      success: true,
      message: '文件删除成功',
    });
  } catch (error: unknown) {
    const err = error as Error & { message?: string };
    console.error('删除错误:', err);
    return NextResponse.json(
      { error: err.message || '删除失败' },
      { status: 500 }
    );
  }
}
