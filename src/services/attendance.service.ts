/* eslint-disable prettier/prettier */
import { databases } from '@/services/appwrite';
import { ID, Query } from 'appwrite';

const APPWRITE_DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '';
const ATTENDANCE_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_ATTENDANCE_COLLECTION || 'attendance';

/**
 * 点名系统服务
 * 每周二 15:20-15:25 和 16:35-16:40 开放点名（5分钟）
 */

export interface AttendanceRecord {
  $id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  checkInTime: string | null; // ISO datetime, null for pending
  sessionTime: '15:20' | '16:35' | string; // 点名时段，支持自定义格式 HH:MM
  weekNumber: number; // 第几周
  status: 'present' | 'absent' | 'late' | 'pending'; // pending = 等待点名
  notes?: string;
}

export interface AttendanceSession {
  sessionTime: '15:20' | '16:35';
  sessionNumber: 1 | 2;  // 时段编号：1 或 2
  startTime: Date;
  endTime: Date;
  isActive: boolean;
  minutesRemaining: number;
}

// 点名配置（可从数据库或设置中读取）
export interface AttendanceConfig {
  dayOfWeek: number; // 0=Sunday, 1=Monday, 2=Tuesday, etc.
  session1Start: { hour: number; minute: number };
  session1Duration: number; // 分钟
  session2Start: { hour: number; minute: number };
  session2Duration: number; // 分钟
  weekStartDate: string; // ISO 日期字符串，第1周的开始日期，如 '2026-01-06'
}

// 默认配置：周二 15:20-15:25 和 16:35-16:40
let attendanceConfig: AttendanceConfig = {
  dayOfWeek: 2, // Tuesday
  session1Start: { hour: 15, minute: 20 },
  session1Duration: 5,
  session2Start: { hour: 16, minute: 35 },
  session2Duration: 5,
  weekStartDate: '2026-01-06', // 默认第1周从2026年1月6日开始
};

// 是否启用调试模式（允许任何时间点名）
let debugMode = false;

/**
 * 设置点名配置
 */
export function setAttendanceConfig(config: Partial<AttendanceConfig>): void {
  attendanceConfig = { ...attendanceConfig, ...config };
}

/**
 * 获取当前点名配置
 */
export function getAttendanceConfig(): AttendanceConfig {
  return { ...attendanceConfig };
}

/**
 * 切换调试模式
 */
export function setDebugMode(enabled: boolean): void {
  debugMode = enabled;
}

/**
 * 获取调试模式状态
 */
export function isDebugMode(): boolean {
  return debugMode;
}

/**
 * 获取当前点名时段（如果在开放时间内）
 * 每周二 15:20-15:25 和 16:35-16:40
 */
export function getCurrentAttendanceSession(): AttendanceSession | null {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sunday, 2=Tuesday
  const hours = now.getHours();
  const minutes = now.getMinutes();

  // 调试模式：始终返回第一个时段
  if (debugMode) {
    const startTime = new Date(now);
    startTime.setSeconds(0, 0);
    const endTime = new Date(now);
    endTime.setMinutes(endTime.getMinutes() + 5);
    
    return {
      sessionTime: '15:20',
      sessionNumber: 1,
      startTime,
      endTime,
      isActive: true,
      minutesRemaining: 5,
    };
  }

  // 不是配置的日期，返回 null
  if (dayOfWeek !== attendanceConfig.dayOfWeek) {
    return null;
  }

  const { session1Start, session1Duration, session2Start, session2Duration } = attendanceConfig;

  // 第一个时段: 15:20-15:25 (可配置)
  const session1EndMinute = session1Start.minute + session1Duration;
  if (hours === session1Start.hour && minutes >= session1Start.minute && minutes < session1EndMinute) {
    const startTime = new Date(now);
    startTime.setHours(session1Start.hour, session1Start.minute, 0, 0);
    const endTime = new Date(now);
    endTime.setHours(session1Start.hour, session1EndMinute, 0, 0);
    const minutesRemaining = session1EndMinute - minutes;

    return {
      sessionTime: '15:20',
      sessionNumber: 1,
      startTime,
      endTime,
      isActive: true,
      minutesRemaining,
    };
  }

  // 第二个时段: 16:35-16:40 (可配置)
  const session2EndMinute = session2Start.minute + session2Duration;
  if (hours === session2Start.hour && minutes >= session2Start.minute && minutes < session2EndMinute) {
    const startTime = new Date(now);
    startTime.setHours(session2Start.hour, session2Start.minute, 0, 0);
    const endTime = new Date(now);
    endTime.setHours(session2Start.hour, session2EndMinute, 0, 0);
    const minutesRemaining = session2EndMinute - minutes;

    return {
      sessionTime: '16:35',
      sessionNumber: 2,
      startTime,
      endTime,
      isActive: true,
      minutesRemaining,
    };
  }

  return null;
}

/**
 * 使用外部配置获取当前点名时段（用于 API 路由，配置从数据库加载）
 */
export function getCurrentAttendanceSessionWithConfig(config: AttendanceConfig, isDebug: boolean): AttendanceSession | null {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const hours = now.getHours();
  const minutes = now.getMinutes();

  // 调试模式：始终返回第一个时段
  if (isDebug) {
    const startTime = new Date(now);
    startTime.setSeconds(0, 0);
    const endTime = new Date(now);
    endTime.setMinutes(endTime.getMinutes() + 5);
    
    const sessionTimeStr = `${config.session1Start.hour}:${String(config.session1Start.minute).padStart(2, '0')}`;
    return {
      sessionTime: sessionTimeStr as '15:20' | '16:35',
      sessionNumber: 1,
      startTime,
      endTime,
      isActive: true,
      minutesRemaining: 5,
    };
  }

  // 不是配置的日期，返回 null
  if (dayOfWeek !== config.dayOfWeek) {
    return null;
  }

  const { session1Start, session1Duration, session2Start, session2Duration } = config;

  // 第一个时段
  const session1EndMinute = session1Start.minute + session1Duration;
  if (hours === session1Start.hour && minutes >= session1Start.minute && minutes < session1EndMinute) {
    const startTime = new Date(now);
    startTime.setHours(session1Start.hour, session1Start.minute, 0, 0);
    const endTime = new Date(now);
    endTime.setHours(session1Start.hour, session1EndMinute, 0, 0);
    const minutesRemaining = session1EndMinute - minutes;
    const sessionTimeStr = `${session1Start.hour}:${String(session1Start.minute).padStart(2, '0')}`;

    return {
      sessionTime: sessionTimeStr as '15:20' | '16:35',
      sessionNumber: 1,
      startTime,
      endTime,
      isActive: true,
      minutesRemaining,
    };
  }

  // 第二个时段
  const session2EndMinute = session2Start.minute + session2Duration;
  if (hours === session2Start.hour && minutes >= session2Start.minute && minutes < session2EndMinute) {
    const startTime = new Date(now);
    startTime.setHours(session2Start.hour, session2Start.minute, 0, 0);
    const endTime = new Date(now);
    endTime.setHours(session2Start.hour, session2EndMinute, 0, 0);
    const minutesRemaining = session2EndMinute - minutes;
    const sessionTimeStr = `${session2Start.hour}:${String(session2Start.minute).padStart(2, '0')}`;

    return {
      sessionTime: sessionTimeStr as '15:20' | '16:35',
      sessionNumber: 2,
      startTime,
      endTime,
      isActive: true,
      minutesRemaining,
    };
  }

  return null;
}

/**
 * 获取当前周数（从配置的起始日期开始计算）
 */
export function getCurrentWeekNumber(): number {
  const now = new Date();
  
  // 从配置中获取第1周的开始日期
  const weekStartDate = new Date(attendanceConfig.weekStartDate);
  
  // 如果当前日期早于起始日期，返回第1周
  if (now < weekStartDate) {
    return 1;
  }

  const timeDiff = now.getTime() - weekStartDate.getTime();
  const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const weekNumber = Math.floor(daysDiff / 7) + 1;

  return Math.max(1, weekNumber);
}

/**
 * 使用外部配置获取当前周数（用于 API 路由，配置从数据库加载）
 */
export function getCurrentWeekNumberWithConfig(config: AttendanceConfig): number {
  const now = new Date();
  
  // 从配置中获取第1周的开始日期
  const weekStartDate = new Date(config.weekStartDate);
  
  // 如果当前日期早于起始日期，返回第1周
  if (now < weekStartDate) {
    return 1;
  }

  const timeDiff = now.getTime() - weekStartDate.getTime();
  const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const weekNumber = Math.floor(daysDiff / 7) + 1;

  return Math.max(1, weekNumber);
}

/**
 * 学生点名
 */
export async function checkInAttendance(
  studentId: string,
  studentName: string,
  studentEmail: string
): Promise<AttendanceRecord> {
  try {
    const session = getCurrentAttendanceSession();
    if (!session) {
      throw new Error('当前不在点名时间内。点名时间为每周二 15:20-15:25 或 16:35-16:40');
    }

    // 检查今天同一时段是否已经点过名
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingRecords = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      ATTENDANCE_COLLECTION_ID,
      [
        Query.equal('studentId', studentId),
        Query.equal('sessionTime', session.sessionTime),
        Query.greaterThanEqual('checkInTime', today.toISOString()),
        Query.lessThan('checkInTime', tomorrow.toISOString()),
      ] as unknown as string[]
    );

    if (existingRecords.documents.length > 0) {
      throw new Error(`您已在 ${session.sessionTime} 完成点名`);
    }

    // 记录点名
    const weekNumber = getCurrentWeekNumber();
    const now = new Date().toISOString();

    const record = await databases.createDocument(
      APPWRITE_DATABASE_ID,
      ATTENDANCE_COLLECTION_ID,
      ID.unique(),
      {
        studentId,
        studentName,
        studentEmail,
        checkInTime: now,
        sessionTime: session.sessionTime,
        weekNumber,
        status: 'present',
        notes: debugMode ? '[DEBUG] 调试模式点名' : '',
      }
    );

    return record as unknown as AttendanceRecord;
  } catch (error: unknown) {
    const err = error as Error & { message?: string };
    throw new Error(err.message || '点名失败，请稍后重试');
  }
}

/**
 * 获取学生的点名记录（支持按周过滤）
 */
export async function getStudentAttendanceRecords(
  studentId: string,
  weekNumber?: number
): Promise<AttendanceRecord[]> {
  try {
    const queries: unknown[] = [Query.equal('studentId', studentId)];
    if (weekNumber !== undefined) {
      queries.push(Query.equal('weekNumber', weekNumber));
    }

    const response = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      ATTENDANCE_COLLECTION_ID,
      queries as unknown as string[]
    );

    return response.documents as unknown as AttendanceRecord[];
  } catch (error: unknown) {
    const err = error as Error & { message?: string };
    console.error('获取点名记录失败:', err);
    throw new Error(err.message || '获取点名记录失败');
  }
}

/**
 * 获取某个时段的所有点名记录（管理员）
 */
export async function getAttendanceRecordsBySession(
  sessionTime: '15:20' | '16:35',
  weekNumber?: number
): Promise<AttendanceRecord[]> {
  try {
    const queries: unknown[] = [Query.equal('sessionTime', sessionTime)];
    if (weekNumber !== undefined) {
      queries.push(Query.equal('weekNumber', weekNumber));
    }

    const response = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      ATTENDANCE_COLLECTION_ID,
      queries as unknown as string[]
    );

    // 按点名时间排序（最近的在前面，pending 记录排在最后）
    const records = response.documents as unknown as AttendanceRecord[];
    return records.sort((a, b) => {
      // 处理 null checkInTime（pending 记录）
      const timeA = a.checkInTime ? new Date(a.checkInTime).getTime() : 0;
      const timeB = b.checkInTime ? new Date(b.checkInTime).getTime() : 0;
      return timeB - timeA;
    });
  } catch (error: unknown) {
    const err = error as Error & { message?: string };
    console.error('获取点名记录失败:', err);
    throw new Error(err.message || '获取点名记录失败');
  }
}

/**
 * 获取某周的全部点名统计
 */
export async function getWeeklyAttendanceSummary(weekNumber: number): Promise<{
  weekNumber: number;
  session1: { total: number; students: AttendanceRecord[] };
  session2: { total: number; students: AttendanceRecord[] };
}> {
  try {
    const session1Records = await getAttendanceRecordsBySession('15:20', weekNumber);
    const session2Records = await getAttendanceRecordsBySession('16:35', weekNumber);

    return {
      weekNumber,
      session1: {
        total: session1Records.length,
        students: session1Records,
      },
      session2: {
        total: session2Records.length,
        students: session2Records,
      },
    };
  } catch (error: unknown) {
    const err = error as Error & { message?: string };
    throw new Error(err.message || '获取周统计失败');
  }
}

/**
 * 获取所有学生的点名统计（当周）
 */
export async function getAllStudentsAttendanceStatus(weekNumber: number): Promise<{
  weekNumber: number;
  presentCount: number;
  totalExpected: number;
  attendanceRecords: AttendanceRecord[];
}> {
  try {
    const response = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      ATTENDANCE_COLLECTION_ID,
      [Query.equal('weekNumber', weekNumber)]
    );

    const records = response.documents as unknown as AttendanceRecord[];

    return {
      weekNumber,
      presentCount: records.length,
      totalExpected: 0, // 需要从学生表计算
      attendanceRecords: records,
    };
  } catch (error: unknown) {
    const err = error as Error & { message?: string };
    throw new Error(err.message || '获取统计失败');
  }
}

/**
 * 检查是否应该自动标记缺席
 * 返回 { shouldMarkAbsent: boolean, sessionTime: string }
 */
export function checkIfShouldMarkAbsent(): { shouldMarkAbsent: boolean; sessionTime?: '15:20' | '16:35' } {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();

  // 第一时段结束时间：15:25
  if (hours === 15 && minutes >= 25 && minutes < 30) {
    return { shouldMarkAbsent: true, sessionTime: '15:20' };
  }

  // 第二时段结束时间：16:40
  if (hours === 16 && minutes >= 40 && minutes < 45) {
    return { shouldMarkAbsent: true, sessionTime: '16:35' };
  }

  return { shouldMarkAbsent: false };
}

/**
 * 检查是否应该自动标记缺席（使用配置）
 * 支持自定义时段的配置
 */
export function checkIfShouldMarkAbsentWithConfig(config: AttendanceConfig): { 
  shouldMarkAbsent: boolean; 
  sessionTime?: string;
  minutesSinceEnd?: number;
} {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const currentMinutes = hours * 60 + minutes;

  // 第一时段结束时间
  const session1EndMinutes = config.session1Start.hour * 60 + config.session1Start.minute + config.session1Duration;
  // 第二时段结束时间
  const session2EndMinutes = config.session2Start.hour * 60 + config.session2Start.minute + config.session2Duration;

  // 检查是否在第一时段结束后 5 分钟内（标记缺席窗口）
  if (currentMinutes >= session1EndMinutes && currentMinutes < session1EndMinutes + 5) {
    const sessionTime = `${String(config.session1Start.hour).padStart(2, '0')}:${String(config.session1Start.minute).padStart(2, '0')}`;
    return { 
      shouldMarkAbsent: true, 
      sessionTime,
      minutesSinceEnd: currentMinutes - session1EndMinutes,
    };
  }

  // 检查是否在第二时段结束后 5 分钟内（标记缺席窗口）
  if (currentMinutes >= session2EndMinutes && currentMinutes < session2EndMinutes + 5) {
    const sessionTime = `${String(config.session2Start.hour).padStart(2, '0')}:${String(config.session2Start.minute).padStart(2, '0')}`;
    return { 
      shouldMarkAbsent: true, 
      sessionTime,
      minutesSinceEnd: currentMinutes - session2EndMinutes,
    };
  }

  return { shouldMarkAbsent: false };
}

/**
 * 判断学生点名状态（是否迟到）
 * @param sessionConfig 时段配置 { hour, minute, duration }
 * @param checkInTime 点名时间
 * @param lateBufferMinutes 迟到缓冲时间（默认0分钟，即时段结束后立即为迟到）
 * @returns 'present' | 'late' | 'absent'
 */
export function determineCheckInStatus(
  sessionConfig: { hour: number; minute: number; duration: number },
  checkInTime: Date,
  lateBufferMinutes: number = 0
): 'present' | 'late' | 'absent' {
  const checkInHour = checkInTime.getHours();
  const checkInMinute = checkInTime.getMinutes();
  const checkInTotalMinutes = checkInHour * 60 + checkInMinute;

  const sessionStartMinutes = sessionConfig.hour * 60 + sessionConfig.minute;
  const sessionEndMinutes = sessionStartMinutes + sessionConfig.duration;
  const lateDeadlineMinutes = sessionEndMinutes + lateBufferMinutes;

  // 在正常点名时间内
  if (checkInTotalMinutes >= sessionStartMinutes && checkInTotalMinutes < sessionEndMinutes) {
    return 'present';
  }

  // 在迟到缓冲时间内
  if (checkInTotalMinutes >= sessionEndMinutes && checkInTotalMinutes < lateDeadlineMinutes + 5) {
    return 'late';
  }

  // 超过迟到窗口（通常不会到达这里，因为点名入口会关闭）
  return 'absent';
}

/**
 * 获取时段的剩余时间（考虑迟到缓冲）
 * @param sessionConfig 时段配置
 * @param lateBufferMinutes 迟到缓冲时间
 * @returns { isOpen, isLateWindow, minutesRemaining }
 */
export function getSessionTimeStatus(
  sessionConfig: { hour: number; minute: number; duration: number },
  lateBufferMinutes: number = 5
): { isOpen: boolean; isLateWindow: boolean; minutesRemaining: number } {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTotalMinutes = currentHour * 60 + currentMinute;

  const sessionStartMinutes = sessionConfig.hour * 60 + sessionConfig.minute;
  const sessionEndMinutes = sessionStartMinutes + sessionConfig.duration;
  const lateDeadlineMinutes = sessionEndMinutes + lateBufferMinutes;

  // 在正常点名时间内
  if (currentTotalMinutes >= sessionStartMinutes && currentTotalMinutes < sessionEndMinutes) {
    return {
      isOpen: true,
      isLateWindow: false,
      minutesRemaining: sessionEndMinutes - currentTotalMinutes,
    };
  }

  // 在迟到缓冲时间内
  if (currentTotalMinutes >= sessionEndMinutes && currentTotalMinutes < lateDeadlineMinutes) {
    return {
      isOpen: true,
      isLateWindow: true,
      minutesRemaining: lateDeadlineMinutes - currentTotalMinutes,
    };
  }

  // 不在点名时间
  return {
    isOpen: false,
    isLateWindow: false,
    minutesRemaining: 0,
  };
}

