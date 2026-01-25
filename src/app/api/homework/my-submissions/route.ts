/* eslint-disable prettier/prettier */
import { NextRequest, NextResponse } from 'next/server';
import { Databases, Client, Query } from 'node-appwrite';

const APPWRITE_DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '';
const SUBMISSIONS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_HOMEWORK_SUBMISSIONS_COLLECTION || 'homework_submissions';

// 服务端 Appwrite 客户端
const client = new Client();
client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '')
  .setKey(process.env.APPWRITE_API_KEY || '');

const serverDatabases = new Databases(client);

/**
 * GET /api/homework/my-submissions
 * 获取当前学生的所有提交记录
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    if (!studentId) {
      return NextResponse.json(
        { success: false, error: '请提供学生ID' },
        { status: 400 }
      );
    }

    const response = await serverDatabases.listDocuments(
      APPWRITE_DATABASE_ID,
      SUBMISSIONS_COLLECTION_ID,
      [
        Query.equal('studentId', studentId),
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
    console.error('获取提交记录失败:', err);
    return NextResponse.json(
      { success: false, error: err.message || '获取提交记录失败' },
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
