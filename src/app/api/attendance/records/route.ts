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

    // sessionTime 验证将在获取配置后进行
    const requestedSessionTime = sessionTime;

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
    const CLUB_SETTINGS_COLLECTION_ID = 'clubSettings';

    // 默认时段配置
    let session1Time = '15:20';
    let session2Time = '16:35';

    // 从数据库获取实际时段配置
    try {
      const settingsResponse = await databases.listDocuments(
        databaseId,
        CLUB_SETTINGS_COLLECTION_ID,
        [Query.limit(1)]
      );
      if (settingsResponse.documents.length > 0) {
        const settings = settingsResponse.documents[0];
        if (settings.attendanceSession1Start) {
          const s1 = JSON.parse(String(settings.attendanceSession1Start));
          session1Time = `${s1.hour}:${String(s1.minute).padStart(2, '0')}`;
        }
        if (settings.attendanceSession2Start) {
          const s2 = JSON.parse(String(settings.attendanceSession2Start));
          session2Time = `${s2.hour}:${String(s2.minute).padStart(2, '0')}`;
        }
      }
    } catch (err) {
      console.warn('获取时段配置失败，使用默认值:', err);
    }

    // 从邮箱提取学号（与学生端保持一致）
    const extractStudentIdFromEmail = (email: string): string => {
      const match = email?.match(/^(\d+)@/);
      return match ? match[1] : email?.split('@')[0] || '';
    };

    // 获取所有学生列表（用于显示未点名的学生）
    let allStudents: Array<{ $id: string; studentId: string; studentName: string; studentEmail: string }> = [];
    if (includeAll) {
      try {
        const usersResponse = await databases.listDocuments(
          databaseId,
          usersCollectionId,
          [Query.equal('role', 'student'), Query.limit(500)]
        );
        allStudents = usersResponse.documents.map((doc: Record<string, unknown>) => {
          const email = String(doc.email || '');
          // 优先使用 doc.studentId，如果没有则从邮箱提取
          const studentId = doc.studentId 
            ? String(doc.studentId)
            : extractStudentIdFromEmail(email);
          return {
            $id: String(doc.$id),
            studentId,
            studentName: String(doc.chineseName || doc.name || email),
            studentEmail: email,
          };
        });
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
        // 使用 uniqueKey 进行匹配（格式: studentId_sessionTime_weekNumber）
        const recordedUniqueKeys = new Set(
          records.map((r: Record<string, unknown>) => {
            // 如果有 uniqueKey 字段则使用，否则构建一个
            if (r.uniqueKey) return String(r.uniqueKey);
            return `${String(r.studentId)}_${sessionTime}_${weekNumber}`;
          })
        );
        
        // 添加未点名的学生（状态为 pending）
        for (const student of allStudents) {
          const expectedUniqueKey = `${student.studentId}_${sessionTime}_${weekNumber}`;
          if (!recordedUniqueKeys.has(expectedUniqueKey)) {
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
              uniqueKey: expectedUniqueKey,
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
      
      console.log('[RECORDS] 获取到记录数:', records.length);
      console.log('[RECORDS] session1Time:', session1Time, 'session2Time:', session2Time);
      if (records.length > 0) {
        console.log('[RECORDS] 示例记录:', {
          $id: records[0].$id,
          sessionTime: records[0].sessionTime,
          status: records[0].status,
        });
      }
      
      // 分组统计（使用从配置获取的 sessionTime，支持多种格式）
      // 也支持 uniqueKey 中的 sessionNumber 格式
      const isSession1 = (r: Record<string, unknown>): boolean => {
        const st = String(r.sessionTime || '');
        const uk = String(r.uniqueKey || r.$id || '');
        // 检查 sessionTime 是否匹配 session1Time，或 uniqueKey 包含 _1_
        return st === session1Time || st.replace(/-/g, ':') === session1Time || 
               uk.includes('_1_') || st === 'session1';
      };
      
      const isSession2 = (r: Record<string, unknown>): boolean => {
        const st = String(r.sessionTime || '');
        const uk = String(r.uniqueKey || r.$id || '');
        return st === session2Time || st.replace(/-/g, ':') === session2Time || 
               uk.includes('_2_') || st === 'session2';
      };
      
      const session1Records = records.filter((r: Record<string, unknown>) => isSession1(r));
      const session2Records = records.filter((r: Record<string, unknown>) => isSession2(r));

      // 添加未点名的学生到每个时段（仅返回，不写入数据库）
      // 注意：不自动创建记录，避免刷新时重复创建
      const addPendingStudents = (sessionRecords: Record<string, unknown>[], sessionNumber: 1 | 2, sessionTimeValue: string): Record<string, unknown>[] => {
        if (!includeAll || allStudents.length === 0) {
          return sessionRecords;
        }
        
        // 使用 studentId 进行匹配（避免因 $id 格式不同导致重复）
        const recordedStudentIds = new Set(
          sessionRecords.map((r) => String(r.studentId))
        );
        const allRecordsWithPending = [...sessionRecords];
        
        // 添加未点名的学生（状态为 pending，仅在响应中显示，不写入数据库）
        for (const student of allStudents) {
          if (!recordedStudentIds.has(student.studentId)) {
            const expectedId = `${student.studentId}_${sessionNumber}_${weekNumber}`;
            allRecordsWithPending.push({
              $id: expectedId,
              studentId: student.studentId,
              studentName: student.studentName,
              studentEmail: student.studentEmail,
              checkInTime: null,
              sessionTime: sessionTimeValue,
              weekNumber: weekNumber,
              status: 'pending',
              notes: '',
              uniqueKey: expectedId,
              isPending: true,  // 标记为虚拟记录，不在数据库中
            });
          }
        }
        
        return allRecordsWithPending;
      };

      const session1 = addPendingStudents(session1Records, 1, session1Time);
      const session2 = addPendingStudents(session2Records, 2, session2Time);

      // 计算各状态数量
      const getStatusCounts = (sessionRecords: Record<string, unknown>[]) => ({
        present: sessionRecords.filter(r => r.status === 'present').length,
        late: sessionRecords.filter(r => r.status === 'late').length,
        absent: sessionRecords.filter(r => r.status === 'absent').length,
        pending: sessionRecords.filter(r => r.status === 'pending').length,
      });

      // 按状态排序：present -> late -> pending -> absent
      const sortByStatus = (records: Record<string, unknown>[]): Record<string, unknown>[] => {
        const statusOrder = { present: 0, late: 1, pending: 2, absent: 3 };
        return [...records].sort((a, b) => {
          const statusA = statusOrder[String(a.status) as keyof typeof statusOrder] ?? 4;
          const statusB = statusOrder[String(b.status) as keyof typeof statusOrder] ?? 4;
          return statusA - statusB;
        });
      };

      const summary = {
        weekNumber,
        totalStudents: allStudents.length,
        session1: {
          total: session1.length,
          ...getStatusCounts(session1),
          students: sortByStatus(session1),
        },
        session2: {
          total: session2.length,
          ...getStatusCounts(session2),
          students: sortByStatus(session2),
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
