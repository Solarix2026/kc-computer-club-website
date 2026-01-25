/* eslint-disable prettier/prettier */
import { databases } from '@/services/appwrite';
import { ID, Query } from 'appwrite';
import { Homework, HomeworkSubmission, CreateHomeworkInput, CreateSubmissionInput } from '@/types';

const APPWRITE_DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '';
const HOMEWORK_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_HOMEWORK_COLLECTION || 'homework';
const SUBMISSIONS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_HOMEWORK_SUBMISSIONS_COLLECTION || 'homework_submissions';

/**
 * 功课服务
 * 管理功课发布和提交的数据库操作
 */

// ==================== 功课管理 ====================

/**
 * 获取所有功课
 */
export async function getAllHomework(status?: string): Promise<Homework[]> {
  try {
    const queries = status ? [Query.equal('status', status)] : [];
    queries.push(Query.orderDesc('createdAt'));
    
    const response = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      HOMEWORK_COLLECTION_ID,
      queries
    );
    return response.documents.map(parseHomework) as Homework[];
  } catch (error: unknown) {
    const err = error as Error & { message?: string };
    console.error('获取功课列表失败:', err);
    throw new Error(err.message || '获取功课列表失败');
  }
}

/**
 * 获取已发布的功课 (学生用)
 */
export async function getPublishedHomework(): Promise<Homework[]> {
  return getAllHomework('published');
}

/**
 * 按 ID 获取单个功课
 */
export async function getHomeworkById(id: string): Promise<Homework> {
  try {
    const homework = await databases.getDocument(
      APPWRITE_DATABASE_ID,
      HOMEWORK_COLLECTION_ID,
      id
    );
    return parseHomework(homework) as Homework;
  } catch (error: unknown) {
    const err = error as Error & { message?: string };
    console.error('获取功课失败:', err);
    throw new Error(err.message || '获取功课失败');
  }
}

/**
 * 创建新功课 (管理员)
 */
export async function createHomework(input: CreateHomeworkInput): Promise<Homework> {
  try {
    const now = new Date().toISOString();
    
    const homeworkData = {
      title: input.title,
      description: input.description,
      subject: input.subject,
      dueDate: input.dueDate,
      attachments: JSON.stringify(input.attachments || []),
      allowedFileTypes: JSON.stringify(input.allowedFileTypes || ['pdf', 'doc', 'docx', 'jpg', 'png']),
      maxFileSize: input.maxFileSize || 10, // 默认10MB
      status: input.status || 'published',
      createdBy: input.createdBy,
      createdByName: input.createdByName,
      createdAt: now,
      updatedAt: now,
    };

    const homework = await databases.createDocument(
      APPWRITE_DATABASE_ID,
      HOMEWORK_COLLECTION_ID,
      ID.unique(),
      homeworkData
    );

    return parseHomework(homework) as Homework;
  } catch (error: unknown) {
    const err = error as Error & { message?: string };
    console.error('创建功课失败:', err);
    throw new Error(err.message || '创建功课失败');
  }
}

/**
 * 更新功课
 */
export async function updateHomework(id: string, input: Partial<CreateHomeworkInput> & { status?: string }): Promise<Homework> {
  try {
    const now = new Date().toISOString();
    const updateData: Record<string, unknown> = {
      updatedAt: now,
    };

    if (input.title !== undefined) updateData.title = input.title;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.subject !== undefined) updateData.subject = input.subject;
    if (input.dueDate !== undefined) updateData.dueDate = input.dueDate;
    if (input.attachments !== undefined) updateData.attachments = JSON.stringify(input.attachments);
    if (input.allowedFileTypes !== undefined) updateData.allowedFileTypes = JSON.stringify(input.allowedFileTypes);
    if (input.maxFileSize !== undefined) updateData.maxFileSize = input.maxFileSize;
    if (input.status !== undefined) updateData.status = input.status;

    const homework = await databases.updateDocument(
      APPWRITE_DATABASE_ID,
      HOMEWORK_COLLECTION_ID,
      id,
      updateData
    );

    return parseHomework(homework) as Homework;
  } catch (error: unknown) {
    const err = error as Error & { message?: string };
    console.error('更新功课失败:', err);
    throw new Error(err.message || '更新功课失败');
  }
}

/**
 * 删除功课
 */
export async function deleteHomework(id: string): Promise<void> {
  try {
    await databases.deleteDocument(
      APPWRITE_DATABASE_ID,
      HOMEWORK_COLLECTION_ID,
      id
    );
  } catch (error: unknown) {
    const err = error as Error & { message?: string };
    console.error('删除功课失败:', err);
    throw new Error(err.message || '删除功课失败');
  }
}

// ==================== 提交管理 ====================

/**
 * 获取功课的所有提交
 */
export async function getSubmissionsByHomework(homeworkId: string): Promise<HomeworkSubmission[]> {
  try {
    const response = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      SUBMISSIONS_COLLECTION_ID,
      [
        Query.equal('homeworkId', homeworkId),
        Query.orderDesc('submittedAt')
      ]
    );
    return response.documents.map(parseSubmission) as HomeworkSubmission[];
  } catch (error: unknown) {
    const err = error as Error & { message?: string };
    console.error('获取提交列表失败:', err);
    throw new Error(err.message || '获取提交列表失败');
  }
}

/**
 * 获取学生的所有提交
 */
export async function getSubmissionsByStudent(studentId: string): Promise<HomeworkSubmission[]> {
  try {
    const response = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      SUBMISSIONS_COLLECTION_ID,
      [
        Query.equal('studentId', studentId),
        Query.orderDesc('submittedAt')
      ]
    );
    return response.documents.map(parseSubmission) as HomeworkSubmission[];
  } catch (error: unknown) {
    const err = error as Error & { message?: string };
    console.error('获取提交列表失败:', err);
    throw new Error(err.message || '获取提交列表失败');
  }
}

/**
 * 获取学生对特定功课的提交
 */
export async function getStudentSubmission(homeworkId: string, studentId: string): Promise<HomeworkSubmission | null> {
  try {
    const response = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      SUBMISSIONS_COLLECTION_ID,
      [
        Query.equal('homeworkId', homeworkId),
        Query.equal('studentId', studentId),
        Query.limit(1)
      ]
    );
    if (response.documents.length === 0) return null;
    return parseSubmission(response.documents[0]) as HomeworkSubmission;
  } catch (error: unknown) {
    const err = error as Error & { message?: string };
    console.error('获取提交失败:', err);
    return null;
  }
}

/**
 * 提交功课 (学生)
 */
export async function submitHomework(input: CreateSubmissionInput): Promise<HomeworkSubmission> {
  try {
    const now = new Date().toISOString();
    
    // 检查是否已经提交过
    const existing = await getStudentSubmission(input.homeworkId, input.studentId);
    if (existing) {
      throw new Error('您已经提交过此功课，请使用更新功能');
    }

    // 检查是否过期
    const homework = await getHomeworkById(input.homeworkId);
    const isLate = new Date() > new Date(homework.dueDate);

    const submissionData = {
      homeworkId: input.homeworkId,
      studentId: input.studentId,
      studentName: input.studentName,
      studentEmail: input.studentEmail,
      content: input.content || '',
      attachments: JSON.stringify(input.attachments || []),
      status: isLate ? 'late' : 'submitted',
      submittedAt: now,
      updatedAt: now,
    };

    const submission = await databases.createDocument(
      APPWRITE_DATABASE_ID,
      SUBMISSIONS_COLLECTION_ID,
      ID.unique(),
      submissionData
    );

    return parseSubmission(submission) as HomeworkSubmission;
  } catch (error: unknown) {
    const err = error as Error & { message?: string };
    console.error('提交功课失败:', err);
    throw new Error(err.message || '提交功课失败');
  }
}

/**
 * 更新提交 (学生可更新内容, 管理员可评分)
 */
export async function updateSubmission(
  id: string,
  input: {
    content?: string;
    attachments?: string[];
    grade?: string;
    feedback?: string;
    status?: HomeworkSubmission['status'];
    gradedBy?: string;
  }
): Promise<HomeworkSubmission> {
  try {
    const now = new Date().toISOString();
    const updateData: Record<string, unknown> = {
      updatedAt: now,
    };

    if (input.content !== undefined) updateData.content = input.content;
    if (input.attachments !== undefined) updateData.attachments = JSON.stringify(input.attachments);
    if (input.grade !== undefined) {
      updateData.grade = input.grade;
      updateData.gradedAt = now;
    }
    if (input.feedback !== undefined) updateData.feedback = input.feedback;
    if (input.status !== undefined) updateData.status = input.status;
    if (input.gradedBy !== undefined) updateData.gradedBy = input.gradedBy;

    const submission = await databases.updateDocument(
      APPWRITE_DATABASE_ID,
      SUBMISSIONS_COLLECTION_ID,
      id,
      updateData
    );

    return parseSubmission(submission) as HomeworkSubmission;
  } catch (error: unknown) {
    const err = error as Error & { message?: string };
    console.error('更新提交失败:', err);
    throw new Error(err.message || '更新提交失败');
  }
}

/**
 * 评分功课 (管理员)
 */
export async function gradeSubmission(
  id: string,
  grade: string,
  feedback: string,
  gradedBy: string
): Promise<HomeworkSubmission> {
  return updateSubmission(id, {
    grade,
    feedback,
    status: 'graded',
    gradedBy,
  });
}

// ==================== 统计 ====================

/**
 * 获取功课统计
 */
export async function getHomeworkStats(): Promise<{
  total: number;
  published: number;
  draft: number;
  closed: number;
}> {
  try {
    const homework = await getAllHomework();
    return {
      total: homework.length,
      published: homework.filter(h => h.status === 'published').length,
      draft: homework.filter(h => h.status === 'draft').length,
      closed: homework.filter(h => h.status === 'closed').length,
    };
  } catch {
    return { total: 0, published: 0, draft: 0, closed: 0 };
  }
}

/**
 * 获取特定功课的提交统计
 */
export async function getSubmissionStats(homeworkId: string): Promise<{
  total: number;
  submitted: number;
  late: number;
  graded: number;
  returned: number;
}> {
  try {
    const submissions = await getSubmissionsByHomework(homeworkId);
    return {
      total: submissions.length,
      submitted: submissions.filter(s => s.status === 'submitted').length,
      late: submissions.filter(s => s.status === 'late').length,
      graded: submissions.filter(s => s.status === 'graded').length,
      returned: submissions.filter(s => s.status === 'returned').length,
    };
  } catch {
    return { total: 0, submitted: 0, late: 0, graded: 0, returned: 0 };
  }
}

// ==================== 解析函数 ====================

function parseHomework(doc: Record<string, unknown>): Partial<Homework> {
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
    status: doc.status as Homework['status'],
    createdBy: doc.createdBy as string,
    createdByName: doc.createdByName as string,
    createdAt: doc.createdAt as string,
    updatedAt: doc.updatedAt as string,
  };
}

function parseSubmission(doc: Record<string, unknown>): Partial<HomeworkSubmission> {
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
    status: doc.status as HomeworkSubmission['status'],
    grade: doc.grade as string,
    feedback: doc.feedback as string,
    submittedAt: doc.submittedAt as string,
    gradedAt: doc.gradedAt as string,
    gradedBy: doc.gradedBy as string,
    updatedAt: doc.updatedAt as string,
  };
}
