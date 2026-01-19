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
 * 新版本功能说明：
 * 1. 将所有 "pending" 状态的记录更新为 "absent"
 * 2. 为没有任何记录的学生创建 "absent" 记录
 * 
 * 触发条件：
 * 1. 第一时段 (15:20-15:25) 过了 → 标记所有未点名的学生为缺席（time > 15:25）
 * 2. 第二时段 (16:35-16:40) 过了 → 标记所有未点名的学生为缺席（time > 16:40）
 * 
 * Body: {
 *   sessionTime: '15:20' | '16:35' | string (HH:MM格式),
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

    // 验证 sessionTime 格式 (HH:MM)
    if (!/^\d{2}:\d{2}$/.test(sessionTime)) {
      return NextResponse.json(
        { error: 'sessionTime 格式必须是 HH:MM（如 15:20 或 21:00）' },
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

    console.log(`[MARK-ABSENT] 获取学生列表: ${studentList.length} 名学生`);

    // 获取本时段所有已有的点名记录
    const existingRecords = await serverDatabases.listDocuments(
      APPWRITE_DATABASE_ID,
      ATTENDANCE_COLLECTION_ID,
      [
        Query.equal('sessionTime', sessionTime),
        Query.equal('weekNumber', weekNumber),
        Query.limit(500),
      ]
    );

    console.log(`[MARK-ABSENT] 周${weekNumber}时段${sessionTime}已有记录: ${existingRecords.documents.length} 条`);

    // 处理 pending 状态的记录 - 将其更新为 absent
    const pendingRecords = existingRecords.documents.filter((doc) => doc.status === 'pending');
    const updatedRecords = [];
    const now = new Date().toISOString();

    console.log(`[MARK-ABSENT] 待处理的 pending 记录: ${pendingRecords.length} 条`);

    for (const record of pendingRecords) {
      try {
        await serverDatabases.updateDocument(
          APPWRITE_DATABASE_ID,
          ATTENDANCE_COLLECTION_ID,
          record.$id,
          {
            status: status,
            checkInTime: now, // 标记时间
            notes: `系统自动标记（点名时间结束 - ${statusLabel}）`,
          }
        );
        updatedRecords.push(record);
      } catch (err) {
        console.warn(`[MARK-ABSENT] 更新记录失败 ${record.$id}:`, err);
      }
    }

    console.log(`[MARK-ABSENT] 已更新 ${updatedRecords.length} 条 pending 记录为 ${status}`);

    // 已有记录的学生ID集合（包括 present, late, absent, pending）
    const existingStudentIds = new Set(existingRecords.documents.map((doc) => doc.studentId));

    // 找出没有任何点名记录的学生（如果时段未初始化，可能有这种情况）
    const missingStudents = studentList.filter((student) => !existingStudentIds.has(student.studentId));

    console.log(`[MARK-ABSENT] 无任何记录的学生: ${missingStudents.length} 名`);

    // 为未点名的学生创建缺席记录
    const createdRecords = [];

    for (const student of missingStudents) {
      try {
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
            status: status,
            notes: `系统自动标记（未初始化时段，超时未点名 - ${statusLabel}）`,
            createdAt: now,
          }
        );
        createdRecords.push(record);
      } catch (err) {
        const error = err as Error & { code?: number };
        if (error.code === 409) {
          console.log(`[MARK-ABSENT] 学生 ${student.studentName} 已有记录，跳过`);
        } else {
          console.warn(`[MARK-ABSENT] 创建${statusLabel}记录失败 ${student.studentName}:`, err);
        }
      }
    }

    console.log(`[MARK-ABSENT] 创建 ${createdRecords.length} 条新的缺席记录`);

    return NextResponse.json({
      success: true,
      message: `自动标记完成：${updatedRecords.length} 名学生从待点名更新为${statusLabel}，${createdRecords.length} 名学生新创建${statusLabel}记录`,
      summary: {
        sessionTime,
        weekNumber,
        totalStudents: studentList.length,
        existingRecordsCount: existingRecords.documents.length,
        pendingUpdatedCount: updatedRecords.length,
        missingCreatedCount: createdRecords.length,
        markedAs: status,
      },
    });
  } catch (error: unknown) {
    const err = error as Error & { message?: string };
    console.error('[MARK-ABSENT] 错误:', err);
    return NextResponse.json(
      { error: err.message || '标记失败' },
      { status: 500 }
    );
  }
}
