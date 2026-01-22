/* eslint-disable prettier/prettier */
import { NextRequest, NextResponse } from 'next/server';
import { Databases, Client, Query } from 'node-appwrite';

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
  params: Promise<{ submissionId: string }>;
}

/**
 * GET /api/homework/submissions/[submissionId]
 * 获取单个提交详情
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { submissionId } = await params;

    const submission = await serverDatabases.getDocument(
      APPWRITE_DATABASE_ID,
      SUBMISSIONS_COLLECTION_ID,
      submissionId
    );

    return NextResponse.json({
      success: true,
      submission: parseSubmission(submission),
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('获取提交详情失败:', err);
    return NextResponse.json(
      { success: false, error: err.message || '获取提交详情失败' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/homework/submissions/[submissionId]
 * 更新提交 (学生更新内容 / 管理员评分)
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { submissionId } = await params;
    const body = await request.json();
    const { content, attachments, grade, feedback, status, gradedBy, returnReason } = body;

    // 获取当前提交记录
    const currentSubmission = await serverDatabases.getDocument(
      APPWRITE_DATABASE_ID,
      SUBMISSIONS_COLLECTION_ID,
      submissionId
    );

    const now = new Date();
    const updateData: Record<string, unknown> = {
      updatedAt: now.toISOString(),
    };

    // 学生更新内容时的检查
    if (content !== undefined && !grade && !status) {
      // 获取功课信息检查截止日期
      const homeworkList = await serverDatabases.listDocuments(
        APPWRITE_DATABASE_ID,
        HOMEWORK_COLLECTION_ID,
        [Query.equal('$id', currentSubmission.homeworkId as string), Query.limit(1)]
      );

      if (homeworkList.documents.length > 0) {
        const homework = homeworkList.documents[0];
        const dueDate = new Date(homework.dueDate as string);
        
        // 只有当功课已退回(returned)或未过期时才允许学生修改
        if (currentSubmission.status !== 'returned' && now > dueDate) {
          return NextResponse.json(
            { success: false, error: '功课已截止，无法修改' },
            { status: 400 }
          );
        }
      }

      // 如果是退回状态，更新后变回已提交
      if (currentSubmission.status === 'returned') {
        updateData.status = 'submitted';
      }
    }

    // 学生可更新的字段
    if (content !== undefined) updateData.content = content;
    if (attachments !== undefined) updateData.attachments = JSON.stringify(attachments);

    // 管理员可更新的字段
    if (grade !== undefined) {
      updateData.grade = grade;
      updateData.gradedAt = now.toISOString();
    }
    if (feedback !== undefined) updateData.feedback = feedback;
    if (status !== undefined) updateData.status = status;
    if (gradedBy !== undefined) updateData.gradedBy = gradedBy;
    if (returnReason !== undefined) updateData.returnReason = returnReason;

    const submission = await serverDatabases.updateDocument(
      APPWRITE_DATABASE_ID,
      SUBMISSIONS_COLLECTION_ID,
      submissionId,
      updateData
    );

    let message = '更新成功';
    if (grade) message = '评分成功';
    if (status === 'returned') message = '已退回给学生';

    return NextResponse.json({
      success: true,
      submission: parseSubmission(submission),
      message,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('更新提交失败:', err);
    return NextResponse.json(
      { success: false, error: err.message || '更新提交失败' },
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
