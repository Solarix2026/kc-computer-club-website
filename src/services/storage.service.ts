/* eslint-disable prettier/prettier */
import { Client, Storage, ID } from 'appwrite';

/**
 * Appwrite 存储服务
 * 用于上传和管理公告、活动、报名表单图片
 */

const APPWRITE_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '';
const APPWRITE_PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '';
const APPWRITE_STORAGE_BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID || '';

// 初始化客户端
const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID);

export const storage = new Storage(client);

/**
 * 上传图片
 * @param file 文件对象
 * @param bucket 桶 ID（默认使用环境变量中的 ID）
 * @returns 文件 ID
 */
export async function uploadImage(
  file: File,
  bucket: string = APPWRITE_STORAGE_BUCKET_ID
): Promise<string> {
  try {
    if (!bucket) {
      throw new Error('存储桶 ID 未配置');
    }

    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('仅支持 JPEG、PNG、WebP、GIF 格式的图片');
    }

    // 验证文件大小（最大 5MB）
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error('文件大小不能超过 5MB');
    }

    // 上传文件
    const response = await storage.createFile(
      bucket,
      ID.unique(),
      file
    );

    return response.$id;
  } catch (error: unknown) {
    const err = error as Error & { message?: string };
    throw new Error(err.message || '图片上传失败');
  }
}

/**
 * 获取图片预览 URL
 * @param fileId 文件 ID
 * @param bucket 桶 ID（默认使用环境变量中的 ID）
 * @returns 图片 URL
 */
export function getImageUrl(
  fileId: string,
  bucket: string = APPWRITE_STORAGE_BUCKET_ID
): string {
  if (!bucket) {
    throw new Error('存储桶 ID 未配置');
  }
  return `${APPWRITE_ENDPOINT}/storage/buckets/${bucket}/files/${fileId}/preview?project=${APPWRITE_PROJECT_ID}`;
}

/**
 * 删除图片
 * @param fileId 文件 ID
 * @param bucket 桶 ID（默认使用环境变量中的 ID）
 */
export async function deleteImage(
  fileId: string,
  bucket: string = APPWRITE_STORAGE_BUCKET_ID
): Promise<void> {
  try {
    if (!bucket) {
      throw new Error('存储桶 ID 未配置');
    }

    await storage.deleteFile(bucket, fileId);
  } catch (error: unknown) {
    const err = error as Error & { message?: string };
    throw new Error(err.message || '删除图片失败');
  }
}

/**
 * 获取文件信息
 * @param fileId 文件 ID
 * @param bucket 桶 ID（默认使用环境变量中的 ID）
 */
interface FileInfo {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  createdAt: string;
}

export async function getFileInfo(
  fileId: string,
  bucket: string = APPWRITE_STORAGE_BUCKET_ID
): Promise<FileInfo> {
  try {
    if (!bucket) {
      throw new Error('存储桶 ID 未配置');
    }

    const file = await storage.getFile(bucket, fileId);
    return {
      id: file.$id,
      name: file.name,
      size: file.sizeOriginal,
      mimeType: file.mimeType,
      createdAt: file.$createdAt,
    };
  } catch (error: unknown) {
    const err = error as Error & { message?: string };
    throw new Error(err.message || '获取文件信息失败');
  }
}

/**
 * 列出桶中的所有文件
 * @param bucket 桶 ID（默认使用环境变量中的 ID）
 */
export async function listFiles(
  bucket: string = APPWRITE_STORAGE_BUCKET_ID
): Promise<FileInfo[]> {
  try {
    if (!bucket) {
      throw new Error('存储桶 ID 未配置');
    }

    const response = await storage.listFiles(bucket);
    return response.files.map((file: Record<string, unknown>) => {
      const typedFile = file as Record<string, unknown>;
      return {
        id: String(typedFile.$id),
        name: String(typedFile.name),
        size: Number(typedFile.sizeOriginal),
        mimeType: String(typedFile.mimeType),
        createdAt: String(typedFile.$createdAt),
      };
    });
  } catch (error: unknown) {
    const err = error as Error & { message?: string };
    throw new Error(err.message || '获取文件列表失败');
  }
}
