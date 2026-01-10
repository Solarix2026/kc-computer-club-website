/* eslint-disable prettier/prettier */
import { databases } from '@/services/appwrite';
import { ID, Query } from 'appwrite';

const APPWRITE_DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '';
const NOTICES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_NOTICES_COLLECTION || '';

/**
 * 公告服务
 * 管理所有公告的数据库操作
 */

export interface Notice {
  $id: string;
  title: string;
  content: string;
  author: string;
  authorId: string;
  lastEditorId?: string;
  lastEditorName?: string;
  category: string;
  status: 'draft' | 'published';
  images?: string[];
  tags?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoticeInput {
  title: string;
  content: string;
  category: string;
  authorId: string;
  author: string;
  status?: 'draft' | 'published';
  images?: string[];
  tags?: string[];
}

export interface UpdateNoticeInput {
  title?: string;
  content?: string;
  category?: string;
  status?: 'draft' | 'published';
  images?: string[];
  tags?: string[];
  publishedAt?: string;
  lastEditorId?: string;
  lastEditorName?: string;
}

/**
 * 获取所有公告（可选过滤已发布）
 */
export async function getAllNotices(onlyPublished = false): Promise<Notice[]> {
  try {
    const queries = onlyPublished ? [Query.equal('status', 'published')] : [];
    const response = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      NOTICES_COLLECTION_ID,
      queries
    );
    const notices = response.documents.map(parseNotice) as unknown as Notice[];
    // 按createdAt降序排列，最新的在最前面
    return notices.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error: unknown) {
    const err = error as Error & { message?: string };
    console.error('获取公告列表失败:', err);
    throw new Error(err.message || '获取公告列表失败');
  }
}

/**
 * 按 ID 获取单个公告
 */
export async function getNoticeById(id: string): Promise<Notice> {
  try {
    const notice = await databases.getDocument(
      APPWRITE_DATABASE_ID,
      NOTICES_COLLECTION_ID,
      id
    );
    return parseNotice(notice) as unknown as Notice;
  } catch (error: unknown) {
    const err = error as Error & { message?: string };
    console.error('获取公告失败:', err);
    throw new Error(err.message || '获取公告失败');
  }
}

/**
 * 解析公告数据，将 JSON 字符串转换为数组
 */
function parseNotice(doc: Record<string, unknown>): Notice {
  // 解析 coverImage 字段中的图片数组
  let images: string[] = [];
  if (doc.coverImage) {
    const coverImageStr = (doc.coverImage as string).trim();
    if (coverImageStr && coverImageStr !== '[]') {
      try {
        const parsed = JSON.parse(coverImageStr);
        if (Array.isArray(parsed)) {
          // 过滤掉空字符串和无效 URL
          images = parsed.filter((img: unknown) => {
            return typeof img === 'string' && img.trim().length > 0;
          });
        } else if (typeof parsed === 'string' && parsed.trim().length > 0) {
          images = [parsed.trim()];
        }
      } catch {
        // 如果不是 JSON 数组，当作单个图片 URL
        if (typeof doc.coverImage === 'string' && coverImageStr.length > 0) {
          images = [coverImageStr];
        }
      }
    }
  }

  // 解析 tags 字段
  let tags: string[] = [];
  if (doc.tags) {
    const tagsStr = (doc.tags as string).trim();
    if (tagsStr && tagsStr !== '[]') {
      try {
        const parsed = JSON.parse(tagsStr);
        if (Array.isArray(parsed)) {
          tags = parsed.filter((tag: unknown) => typeof tag === 'string' && tag.trim().length > 0);
        }
      } catch {
        tags = [];
      }
    }
  }

  return {
    ...doc,
    images,
    tags,
  } as unknown as Notice;
}

/**
 * 创建新公告
 */
export async function createNotice(input: CreateNoticeInput): Promise<Notice> {
  try {
    const now = new Date().toISOString();
    const noticeData: Record<string, unknown> = {
      title: input.title,
      content: input.content,
      category: input.category || '其他',
      author: input.author,
      authorId: input.authorId,
      status: input.status || 'draft',
      tags: input.tags ? JSON.stringify(input.tags) : '[]',
      publishedAt: input.status === 'published' ? now : null,
      createdAt: now,
      updatedAt: now,
    };

    // 使用 coverImage 字段存储所有图片的 JSON 数组
    if (input.images && input.images.length > 0) {
      noticeData.coverImage = JSON.stringify(input.images);
    } else {
      noticeData.coverImage = '[]';
    }

    const notice = await databases.createDocument(
      APPWRITE_DATABASE_ID,
      NOTICES_COLLECTION_ID,
      ID.unique(),
      noticeData
    );
    return parseNotice(notice) as unknown as Notice;
  } catch (error: unknown) {
    const err = error as Error & { message?: string };
    console.error('创建公告失败:', err);
    throw new Error(err.message || '创建公告失败');
  }
}

/**
 * 更新公告
 */
export async function updateNotice(
  id: string,
  input: UpdateNoticeInput
): Promise<Notice> {
  try {
    const now = new Date().toISOString();
    const updateData: Record<string, unknown> = {
      updatedAt: now,
    };

    if (input.title) updateData.title = input.title;
    if (input.content) updateData.content = input.content;
    if (input.category) updateData.category = input.category;
    if (input.status) {
      updateData.status = input.status;
      if (input.status === 'published') {
        updateData.publishedAt = now;
      }
    }

    // 记录最后编辑者信息
    if (input.lastEditorId) updateData.lastEditorId = input.lastEditorId;
    if (input.lastEditorName) updateData.lastEditorName = input.lastEditorName;
    
    // 处理图片：使用 coverImage 字段存储所有图片的 JSON 数组
    if (input.images !== undefined) {
      if (input.images && input.images.length > 0) {
        updateData.coverImage = JSON.stringify(input.images);
      } else {
        updateData.coverImage = '[]';
      }
    }
    
    if (input.tags) updateData.tags = JSON.stringify(input.tags);

    const notice = await databases.updateDocument(
      APPWRITE_DATABASE_ID,
      NOTICES_COLLECTION_ID,
      id,
      updateData
    );
    return parseNotice(notice) as unknown as Notice;
  } catch (error: unknown) {
    const err = error as Error & { message?: string };
    console.error('更新公告失败:', err);
    throw new Error(err.message || '更新公告失败');
  }
}

/**
 * 删除公告
 */
export async function deleteNotice(id: string): Promise<void> {
  try {
    await databases.deleteDocument(
      APPWRITE_DATABASE_ID,
      NOTICES_COLLECTION_ID,
      id
    );
  } catch (error: unknown) {
    const err = error as Error & { message?: string };
    console.error('删除公告失败:', err);
    throw new Error(err.message || '删除公告失败');
  }
}

/**
 * 按分类获取公告
 */
export async function getNoticesByCategory(category: string): Promise<Notice[]> {
  try {
    const response = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      NOTICES_COLLECTION_ID,
      [Query.equal('category', category)]
    );
    const notices = response.documents.map(parseNotice) as unknown as Notice[];
    // 按createdAt降序排列，最新的在最前面
    return notices.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error: unknown) {
    const err = error as Error & { message?: string };
    console.error('按分类获取公告失败:', err);
    throw new Error(err.message || '获取公告失败');
  }
}

/**
 * 搜索公告（按标题和内容）
 */
export async function searchNotices(query: string): Promise<Notice[]> {
  try {
    const response = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      NOTICES_COLLECTION_ID,
      [Query.search('title', query)]
    );
    const notices = response.documents.map(parseNotice) as unknown as Notice[];
    // 按createdAt降序排列，最新的在最前面
    return notices.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error: unknown) {
    const err = error as Error & { message?: string };
    console.error('搜索公告失败:', err);
    throw new Error(err.message || '搜索公告失败');
  }
}
