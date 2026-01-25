/* eslint-disable prettier/prettier */
import { uploadImage } from '@/services/storage.service';
import { NextRequest, NextResponse } from 'next/server';

/**
 * 上传文件 API
 * POST /api/upload
 * 
 * Body: FormData with 'file' field
 * 
 * Response:
 * {
 *   success: true,
 *   fileId: string,
 *   fileName: string,
 *   fileSize: number,
 *   mimeType: string,
 *   url: string
 * }
 */

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: '文件未提供' },
        { status: 400 }
      );
    }

    // 上传文件
    const fileId = await uploadImage(file);

    // 构建预览 URL
    const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '';
    const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '';
    const bucketId = process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID || '';
    const url = `${endpoint}/storage/buckets/${bucketId}/files/${fileId}/preview?project=${projectId}&width=1200&height=800&gravity=center`;

    return NextResponse.json({
      success: true,
      fileId,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      url,
    });
  } catch (error: unknown) {
    const err = error as Error & { message?: string };
    console.error('Upload error:', err);
    return NextResponse.json(
      { error: err.message || '文件上传失败' },
      { status: 500 }
    );
  }
}
