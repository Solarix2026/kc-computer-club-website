/* eslint-disable prettier/prettier */
import { NextRequest, NextResponse } from 'next/server';
import { Databases, Client, Query, ID } from 'node-appwrite';

const APPWRITE_DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '';
const HOMEWORK_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_HOMEWORK_COLLECTION || 'homework';
const SUBMISSIONS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_HOMEWORK_SUBMISSIONS_COLLECTION || 'homework_submissions';

// 服务端 Appwrite 客户端
const client = new Client();
client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '')
  .setKey(process.env.APPWRITE_API_KEY || '');

const serverDatabases = new Databases(client);

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/homework/[id]
 * 获取单个功课详情
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const homework = await serverDatabases.getDocument(
      APPWRITE_DATABASE_ID,
      HOMEWORK_COLLECTION_ID,
      id
    );

    // 获取该功课的提交统计
    const submissions = await serverDatabases.listDocuments(
      APPWRITE_DATABASE_ID,
      SUBMISSIONS_COLLECTION_ID,
      [Query.equal('homeworkId', id)]
    );

    const stats = {
      total: submissions.total,
      submitted: submissions.documents.filter((s: Record<string, unknown>) => s.status === 'submitted').length,
      late: submissions.documents.filter((s: Record<string, unknown>) => s.status === 'late').length,
      graded: submissions.documents.filter((s: Record<string, unknown>) => s.status === 'graded').length,
    };

    return NextResponse.json({
      success: true,
      homework: parseHomework(homework),
      stats,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('获取功课详情失败:', err);
    return NextResponse.json(
      { success: false, error: err.message || '获取功课详情失败' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/homework/[id]
 * 更新功课
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, description, subject, dueDate, attachments, allowedFileTypes, maxFileSize, status } = body;

    const now = new Date().toISOString();
    const updateData: Record<string, unknown> = {
      updatedAt: now,
    };

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (subject !== undefined) updateData.subject = subject;
    if (dueDate !== undefined) updateData.dueDate = dueDate;
    if (attachments !== undefined) updateData.attachments = JSON.stringify(attachments);
    if (allowedFileTypes !== undefined) updateData.allowedFileTypes = JSON.stringify(allowedFileTypes);
    if (maxFileSize !== undefined) updateData.maxFileSize = maxFileSize;
    if (status !== undefined) updateData.status = status;

    const homework = await serverDatabases.updateDocument(
      APPWRITE_DATABASE_ID,
      HOMEWORK_COLLECTION_ID,
      id,
      updateData
    );

    return NextResponse.json({
      success: true,
      homework: parseHomework(homework),
      message: '功课更新成功',
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('更新功课失败:', err);
    return NextResponse.json(
      { success: false, error: err.message || '更新功课失败' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/homework/[id]
 * 删除功课
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    await serverDatabases.deleteDocument(
      APPWRITE_DATABASE_ID,
      HOMEWORK_COLLECTION_ID,
      id
    );

    return NextResponse.json({
      success: true,
      message: '功课删除成功',
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('删除功课失败:', err);
    return NextResponse.json(
      { success: false, error: err.message || '删除功课失败' },
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
