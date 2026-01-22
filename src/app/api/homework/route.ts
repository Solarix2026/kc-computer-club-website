/* eslint-disable prettier/prettier */
import { NextRequest, NextResponse } from 'next/server';
import { Databases, Client, Query, ID } from 'node-appwrite';

const APPWRITE_DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '';
const HOMEWORK_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_HOMEWORK_COLLECTION || 'homework';

// 服务端 Appwrite 客户端
const client = new Client();
client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '')
  .setKey(process.env.APPWRITE_API_KEY || '');

const serverDatabases = new Databases(client);

/**
 * GET /api/homework
 * 获取功课列表
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const queries: any[] = [];
    
    // 处理多个状态 (用逗号分隔)
    if (status) {
      const statuses = status.split(',').map(s => s.trim());
      if (statuses.length === 1) {
        queries.push(Query.equal('status', statuses[0]));
      } else {
        // 使用 OR 查询多个状态
        queries.push(Query.or(statuses.map(s => Query.equal('status', s))));
      }
    }
    
    queries.push(Query.orderDesc('createdAt'));

    const response = await serverDatabases.listDocuments(
      APPWRITE_DATABASE_ID,
      HOMEWORK_COLLECTION_ID,
      queries
    );

    // 自动关闭已过期的功课
    const now = new Date();
    const homework = await Promise.all(
      response.documents.map(async (doc) => {
        const parsed = parseHomework(doc);
        
        // 如果功课已发布且已过期，自动设为已截止
        if (parsed.status === 'published' && new Date(parsed.dueDate) < now) {
          try {
            await serverDatabases.updateDocument(
              APPWRITE_DATABASE_ID,
              HOMEWORK_COLLECTION_ID,
              parsed.homeworkId,
              { status: 'closed', updatedAt: now.toISOString() }
            );
            parsed.status = 'closed';
          } catch (updateErr) {
            console.error('自动关闭功课失败:', updateErr);
          }
        }
        
        return parsed;
      })
    );

    return NextResponse.json({
      success: true,
      homework,
      total: response.total,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('获取功课列表失败:', err);
    return NextResponse.json(
      { success: false, error: err.message || '获取功课列表失败' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/homework
 * 创建新功课 (管理员)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, subject, dueDate, attachments, allowedFileTypes, maxFileSize, status, createdBy, createdByName } = body;

    if (!title || !description || !subject || !dueDate || !createdBy) {
      return NextResponse.json(
        { success: false, error: '请填写所有必填字段' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    const homeworkData = {
      title,
      description,
      subject,
      dueDate,
      attachments: JSON.stringify(attachments || []),
      allowedFileTypes: JSON.stringify(allowedFileTypes || ['pdf', 'doc', 'docx', 'jpg', 'png']),
      maxFileSize: maxFileSize || 10,
      status: status || 'published',
      createdBy,
      createdByName: createdByName || '管理员',
      createdAt: now,
      updatedAt: now,
    };

    const homework = await serverDatabases.createDocument(
      APPWRITE_DATABASE_ID,
      HOMEWORK_COLLECTION_ID,
      ID.unique(),
      homeworkData
    );

    return NextResponse.json({
      success: true,
      homework: parseHomework(homework),
      message: '功课发布成功',
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('创建功课失败:', err);
    return NextResponse.json(
      { success: false, error: err.message || '创建功课失败' },
      { status: 500 }
    );
  }
}

function parseHomework(doc: Record<string, unknown>) {
  let attachments: string[] = [];
  let allowedFileTypes: string[] = [];

  if (doc.attachments) {
    try {
      attachments = typeof doc.attachments === 'string'
        ? JSON.parse(doc.attachments as string)
        : (doc.attachments as string[]);
    } catch {
      attachments = [];
    }
  }

  if (doc.allowedFileTypes) {
    try {
      allowedFileTypes = typeof doc.allowedFileTypes === 'string'
        ? JSON.parse(doc.allowedFileTypes as string)
        : (doc.allowedFileTypes as string[]);
    } catch {
      allowedFileTypes = ['pdf', 'doc', 'docx', 'jpg', 'png'];
    }
  }

  return {
    homeworkId: doc.$id as string,
    title: doc.title as string,
    description: doc.description as string,
    subject: doc.subject as string,
    dueDate: doc.dueDate as string,
    attachments,
    allowedFileTypes,
    maxFileSize: (doc.maxFileSize as number) || 10,
    status: doc.status as string,
    createdBy: doc.createdBy as string,
    createdByName: doc.createdByName as string,
    createdAt: doc.createdAt as string,
    updatedAt: doc.updatedAt as string,
  };
}
