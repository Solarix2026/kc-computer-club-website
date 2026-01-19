/* eslint-disable prettier/prettier */
import { NextRequest, NextResponse } from 'next/server';
import { serverDatabases, ID, Query } from '@/services/appwrite-server';

const APPWRITE_DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '';
const ATTENDANCE_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_ATTENDANCE_COLLECTION || 'attendance';
const USERS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION || 'users';

/**
 * POST /api/attendance/mark-absent
 * 自动标记未点名的学生为缺席（当点名时间结束后）
 * 
 * 触发条件：
 * 1. 第一时段 (15:20-15:25) 过了 → 标记所有未点名的学生为缺席（time > 15:25）
 * 2. 第二时段 (16:35-16:40) 过了 → 标记所有未点名的学生为缺席（time > 16:40）
 * 
 * Body: {
 *   sessionTime: '15:20' | '16:35',
 *   weekNumber: number,
 *   markAs?: 'late' | 'absent'  // 默认为 'absent'（缺席）
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionTime, weekNumber, markAs = 'absent' } = body;

    if (!sessionTime || !weekNumber) {
      return NextResponse.json(
        { error: '缺少必要参数：sessionTime, weekNumber' },
        { status: 400 }
      );
    }

    if (!['15:20', '16:35'].includes(sessionTime)) {
      return NextResponse.json(
        { error: 'sessionTime 必须是 15:20 或 16:35' },
        { status: 400 }
      );
    }

    const status = markAs === 'absent' ? 'absent' : 'late';
    const statusLabel = status === 'late' ? '迟到' : '缺席';

    // 获取所有学生
    const allUsers = await serverDatabases.listDocuments(
      APPWRITE_DATABASE_ID,
      USERS_COLLECTION_ID,
      [Query.equal('role', 'student'), Query.limit(500)]
    );

    const studentList = allUsers.documents.map((doc) => ({
      $id: doc.$id,
      studentId: doc.studentId || doc.$id,
      studentName: doc.chineseName || doc.name || doc.email,
      studentEmail: doc.email,
    }));

    console.log(`[MARK-LATE] 获取学生列表: ${studentList.length} 名学生`);

    // 获取本时段所有已有的点名记录（包括 present, late, absent）
    const existingRecords = await serverDatabases.listDocuments(
      APPWRITE_DATABASE_ID,
      ATTENDANCE_COLLECTION_ID,
      [
        Query.equal('sessionTime', sessionTime),
        Query.equal('weekNumber', weekNumber),
        Query.limit(500),
      ]
    );

    // 已有记录的学生ID集合（避免重复创建）
    const existingStudentIds = new Set(existingRecords.documents.map((doc) => doc.studentId));

    console.log(`[MARK-LATE] 周${weekNumber}时段${sessionTime}已有记录: ${existingStudentIds.size} 条`);

    // 找出没有任何点名记录的学生
    const missingStudents = studentList.filter((student) => !existingStudentIds.has(student.studentId));

    console.log(`[MARK-LATE] 未有记录的学生: ${missingStudents.length} 名`);

    // 为未点名的学生创建迟到记录
    const createdRecords = [];
    const now = new Date().toISOString();

    for (const student of missingStudents) {
      try {
        // 使用 ID.unique() 避免重复ID冲突
        const record = await serverDatabases.createDocument(
          APPWRITE_DATABASE_ID,
          ATTENDANCE_COLLECTION_ID,
          ID.unique(),
          {
            studentId: student.studentId,
            studentName: student.studentName,
            studentEmail: student.studentEmail,
            checkInTime: now,
            sessionTime,
            weekNumber,
            status: status, // 标记为迟到或缺席
            notes: `系统自动标记（超过规定时间未点名 - ${statusLabel}）`,
            createdAt: now,
          }
        );
        createdRecords.push(record);
      } catch (err) {
        const error = err as Error & { code?: number };
        // 如果是重复文档错误，跳过
        if (error.code === 409) {
          console.log(`[MARK-LATE] 学生 ${student.studentName} 已有记录，跳过`);
        } else {
          console.warn(`[MARK-LATE] 创建${statusLabel}记录失败 ${student.studentName}:`, err);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `自动标记完成：${createdRecords.length} 名学生被标记为${statusLabel}`,
      summary: {
        sessionTime,
        weekNumber,
        totalStudents: studentList.length,
        existingRecordsCount: existingStudentIds.size,
        missingCount: missingStudents.length,
        createdRecordsCount: createdRecords.length,
        markedAs: status,
      },
    });
  } catch (error: unknown) {
    const err = error as Error & { message?: string };
    console.error('[MARK-LATE] 错误:', err);
    return NextResponse.json(
      { error: err.message || '标记失败' },
      { status: 500 }
    );
  }
}
