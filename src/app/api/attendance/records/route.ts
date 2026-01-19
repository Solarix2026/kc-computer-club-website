/* eslint-disable prettier/prettier */
import { NextRequest, NextResponse } from 'next/server';
import { Client, Databases, Query } from 'node-appwrite';

/**
 * GET /api/attendance/records
 * 获取点名记录（支持按时段和周过滤）
 * 现在会返回所有学生，包括未点名的学生（标记为 pending）
 * 
 * Query params:
 *   - sessionTime: '15:20' | '16:35' (可选)
 *   - weekNumber: number (可选，默认当前周)
 *   - includeAll: 'true' (可选，是否包含所有学生，默认 true)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sessionTime = searchParams.get('sessionTime') as '15:20' | '16:35' | null;
    const weekNumber = searchParams.get('weekNumber')
      ? parseInt(searchParams.get('weekNumber') as string)
      : getCurrentWeekNumber();
    const includeAll = searchParams.get('includeAll') !== 'false'; // 默认包含所有学生

    if (sessionTime && sessionTime !== '15:20' && sessionTime !== '16:35') {
      return NextResponse.json(
        { error: '时段参数必须为 "15:20" 或 "16:35"' },
        { status: 400 }
      );
    }

    // 使用服务器端 Appwrite 客户端（带 API 密钥）
    const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
    const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
    const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
    const apiKey = process.env.APPWRITE_API_KEY;
    const usersCollectionId = process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION || 'users';

    if (!endpoint || !projectId || !databaseId || !apiKey) {
      return NextResponse.json(
        { error: '服务器配置不完整' },
        { status: 500 }
      );
    }

    const client = new Client()
      .setEndpoint(endpoint)
      .setProject(projectId)
      .setKey(apiKey);

    const databases = new Databases(client);
    const ATTENDANCE_COLLECTION_ID = 'attendance';

    // 获取所有学生列表（用于显示未点名的学生）
    let allStudents: Array<{ $id: string; studentId: string; studentName: string; studentEmail: string }> = [];
    if (includeAll) {
      try {
        const usersResponse = await databases.listDocuments(
          databaseId,
          usersCollectionId,
          [Query.equal('role', 'student'), Query.limit(500)]
        );
        allStudents = usersResponse.documents.map((doc: Record<string, unknown>) => ({
          $id: String(doc.$id),
          studentId: String(doc.studentId || doc.$id),
          studentName: String(doc.chineseName || doc.name || doc.email),
          studentEmail: String(doc.email),
        }));
      } catch (err) {
        console.warn('获取学生列表失败:', err);
      }
    }

    if (sessionTime) {
      // 获取特定时段的记录
      const queries = [Query.equal('sessionTime', sessionTime)];
      if (weekNumber !== undefined) {
        queries.push(Query.equal('weekNumber', weekNumber));
      }

      const response = await databases.listDocuments(
        databaseId,
        ATTENDANCE_COLLECTION_ID,
        queries as unknown as string[]
      );

      const records = response.documents.sort(
        (a: Record<string, unknown>, b: Record<string, unknown>) => 
          new Date(String(b.checkInTime)).getTime() - new Date(String(a.checkInTime)).getTime()
      );

      // 如果需要包含所有学生，添加未点名的学生
      let allRecords: Record<string, unknown>[] = [...records];
      if (includeAll && allStudents.length > 0) {
        const recordedStudentIds = new Set(records.map((r: Record<string, unknown>) => String(r.studentId)));
        
        // 添加未点名的学生（状态为 pending）
        for (const student of allStudents) {
          if (!recordedStudentIds.has(student.studentId)) {
            allRecords.push({
              $id: `pending_${student.studentId}_${sessionTime}_week${weekNumber}`,
              studentId: student.studentId,
              studentName: student.studentName,
              studentEmail: student.studentEmail,
              checkInTime: null,
              sessionTime: sessionTime,
              weekNumber: weekNumber,
              status: 'pending', // 未点名
              notes: '',
              isPending: true,
            });
          }
        }
      }

      // 按状态排序：present -> late -> pending -> absent
      const statusOrder = { present: 0, late: 1, pending: 2, absent: 3 };
      allRecords.sort((a: Record<string, unknown>, b: Record<string, unknown>) => {
        const statusA = statusOrder[String(a.status) as keyof typeof statusOrder] ?? 4;
        const statusB = statusOrder[String(b.status) as keyof typeof statusOrder] ?? 4;
        return statusA - statusB;
      });

      return NextResponse.json({
        success: true,
        weekNumber,
        sessionTime,
        totalRecords: allRecords.length,
        presentCount: records.filter((r: Record<string, unknown>) => r.status === 'present').length,
        lateCount: records.filter((r: Record<string, unknown>) => r.status === 'late').length,
        absentCount: records.filter((r: Record<string, unknown>) => r.status === 'absent').length,
        pendingCount: allRecords.filter((r: Record<string, unknown>) => r.status === 'pending').length,
        totalStudents: allStudents.length,
        records: allRecords,
      });
    } else {
      // 获取整周统计
      const queries = [Query.equal('weekNumber', weekNumber)];
      const response = await databases.listDocuments(
        databaseId,
        ATTENDANCE_COLLECTION_ID,
        queries as unknown as string[]
      );

      const records = response.documents;
      
      // 分组统计（使用实际的 sessionTime 格式：'15:20' 和 '16:35'）
      const session1 = records.filter((r: Record<string, unknown>) => r.sessionTime === '15:20');
      const session2 = records.filter((r: Record<string, unknown>) => r.sessionTime === '16:35');

      // 计算各状态数量
      const getStatusCounts = (sessionRecords: Record<string, unknown>[]) => ({
        present: sessionRecords.filter(r => r.status === 'present').length,
        late: sessionRecords.filter(r => r.status === 'late').length,
        absent: sessionRecords.filter(r => r.status === 'absent').length,
      });

      const summary = {
        weekNumber,
        totalStudents: allStudents.length,
        session1: {
          total: session1.length,
          ...getStatusCounts(session1),
          students: session1.sort(
            (a: Record<string, unknown>, b: Record<string, unknown>) => 
              new Date(String(b.checkInTime)).getTime() - new Date(String(a.checkInTime)).getTime()
          ),
        },
        session2: {
          total: session2.length,
          ...getStatusCounts(session2),
          students: session2.sort(
            (a: Record<string, unknown>, b: Record<string, unknown>) => 
              new Date(String(b.checkInTime)).getTime() - new Date(String(a.checkInTime)).getTime()
          ),
        },
      };

      return NextResponse.json({
        success: true,
        summary,
      });
    }
  } catch (error: unknown) {
    const err = error as Error & { message?: string; code?: number };
    console.error('获取点名记录错误:', err);
    return NextResponse.json(
      { error: err.message || '获取点名记录失败', code: err.code || 500 },
      { status: 500 }
    );
  }
}

/**
 * 获取当前周数（学年内第几周）
 * 假设学年从9月1日开始
 */
function getCurrentWeekNumber(): number {
  const now = new Date();
  const year = now.getFullYear();
  
  let schoolYearStart: Date;
  if (now.getMonth() >= 8) {
    schoolYearStart = new Date(year, 8, 1);
  } else {
    schoolYearStart = new Date(year - 1, 8, 1);
  }

  const timeDiff = now.getTime() - schoolYearStart.getTime();
  const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  return Math.floor(daysDiff / 7) + 1;
}
