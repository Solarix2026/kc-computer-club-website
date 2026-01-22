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
 * GET /api/homework/[id]/submissions
 * 获取功课的所有提交 (管理员)
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const response = await serverDatabases.listDocuments(
      APPWRITE_DATABASE_ID,
      SUBMISSIONS_COLLECTION_ID,
      [
        Query.equal('homeworkId', id),
        Query.orderDesc('submittedAt')
      ]
    );

    const submissions = response.documents.map(parseSubmission);

    return NextResponse.json({
      success: true,
      submissions,
      total: response.total,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('获取提交列表失败:', err);
    return NextResponse.json(
      { success: false, error: err.message || '获取提交列表失败' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/homework/[id]/submissions
 * 提交功课 (学生)
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: homeworkId } = await params;
    const body = await request.json();
    const { studentId, studentName, studentEmail, content, attachments } = body;

    if (!studentId || !studentName || !studentEmail) {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 400 }
      );
    }

    // 检查功课是否存在
    let homework;
    try {
      homework = await serverDatabases.getDocument(
        APPWRITE_DATABASE_ID,
        HOMEWORK_COLLECTION_ID,
        homeworkId
      );
    } catch {
      return NextResponse.json(
        { success: false, error: '功课不存在' },
        { status: 404 }
      );
    }

    if (homework.status !== 'published') {
      return NextResponse.json(
        { success: false, error: '此功课已截止，无法提交' },
        { status: 400 }
      );
    }

    // 检查是否已过期
    const now = new Date();
    const dueDate = new Date(homework.dueDate);
    const isLate = now > dueDate;

    // 已过期且功课状态为 closed，不允许提交
    if (isLate && homework.status === 'closed') {
      return NextResponse.json(
        { success: false, error: '此功课已截止，无法提交' },
        { status: 400 }
      );
    }
    const existingSubmissions = await serverDatabases.listDocuments(
      APPWRITE_DATABASE_ID,
      SUBMISSIONS_COLLECTION_ID,
      [
        Query.equal('homeworkId', homeworkId),
        Query.equal('studentId', studentId),
        Query.limit(1)
      ]
    );

    if (existingSubmissions.documents.length > 0) {
      return NextResponse.json(
        { success: false, error: '您已经提交过此功课' },
        { status: 400 }
      );
    }

    const submissionData = {
      homeworkId,
      studentId,
      studentName,
      studentEmail,
      content: content || '',
      attachments: JSON.stringify(attachments || []),
      status: isLate ? 'late' : 'submitted',
      submittedAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    const submission = await serverDatabases.createDocument(
      APPWRITE_DATABASE_ID,
      SUBMISSIONS_COLLECTION_ID,
      ID.unique(),
      submissionData
    );

    return NextResponse.json({
      success: true,
      submission: parseSubmission(submission),
      message: isLate ? '功课已提交（迟交）' : '功课提交成功',
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('提交功课失败:', err);
    return NextResponse.json(
      { success: false, error: err.message || '提交功课失败' },
      { status: 500 }
    );
  }
}

function parseSubmission(doc: Record<string, unknown>) {
  let attachments: string[] = [];

  if (doc.attachments) {
    try {
      attachments = typeof doc.attachments === 'string'
        ? JSON.parse(doc.attachments as string)
        : (doc.attachments as string[]);
    } catch {
      attachments = [];
    }
  }

  return {
    submissionId: doc.$id as string,
    homeworkId: doc.homeworkId as string,
    studentId: doc.studentId as string,
    studentName: doc.studentName as string,
    studentEmail: doc.studentEmail as string,
    content: doc.content as string,
    attachments,
    status: doc.status as string,
    grade: doc.grade as string,
    feedback: doc.feedback as string,
    submittedAt: doc.submittedAt as string,
    gradedAt: doc.gradedAt as string,
    gradedBy: doc.gradedBy as string,
    updatedAt: doc.updatedAt as string,
  };
}
