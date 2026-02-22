/* eslint-disable prettier/prettier */
import { NextRequest, NextResponse } from 'next/server';
import { serverDatabases, ID, Query } from '@/services/appwrite-server';
import {
  getCurrentAttendanceSessionWithConfig,
  getCurrentWeekNumberWithConfig,
  AttendanceConfig,
} from '@/services/attendance.service';

const APPWRITE_DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '';
const ATTENDANCE_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_ATTENDANCE_COLLECTION || 'attendance';
const SETTINGS_COLLECTION_ID = 'clubSettings';
const ATTENDANCE_CONFIG_DOC_ID = 'attendance_config';

/**
 * 默认配置
 */
const DEFAULT_CONFIG: AttendanceConfig = {
  dayOfWeek: 2,
  session1Start: { hour: 15, minute: 20 },
  session1Duration: 5,
  session2Start: { hour: 16, minute: 35 },
  session2Duration: 5,
  weekStartDate: '2026-01-06',
};

/**
 * 生成随机点名验证码（4位数字）
 */
function generateAttendanceCode(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

/**
 * 从数据库获取点名配置（包括验证码）
 */
async function getAttendanceConfigFromDB(): Promise<{ config: AttendanceConfig; debugMode: boolean; attendanceCode1: string | null; attendanceCode2: string | null; attendanceCodesWeek: number | null; codeEnabled: boolean }> {
  try {
    const doc = await serverDatabases.getDocument(
      APPWRITE_DATABASE_ID,
      SETTINGS_COLLECTION_ID,
      ATTENDANCE_CONFIG_DOC_ID
    );

    const config: AttendanceConfig = {
      dayOfWeek: doc.attendanceDayOfWeek ?? DEFAULT_CONFIG.dayOfWeek,
      session1Start: doc.attendanceSession1Start 
        ? JSON.parse(doc.attendanceSession1Start) 
        : DEFAULT_CONFIG.session1Start,
      session1Duration: doc.attendanceSession1Duration ?? DEFAULT_CONFIG.session1Duration,
      session2Start: doc.attendanceSession2Start 
        ? JSON.parse(doc.attendanceSession2Start) 
        : DEFAULT_CONFIG.session2Start,
      session2Duration: doc.attendanceSession2Duration ?? DEFAULT_CONFIG.session2Duration,
      weekStartDate: doc.attendanceWeekStartDate ?? DEFAULT_CONFIG.weekStartDate,
    };

    return {
      config,
      debugMode: doc.attendanceDebugMode ?? false,
      attendanceCode1: doc.attendanceCode1 ?? null,
      attendanceCode2: doc.attendanceCode2 ?? null,
      attendanceCodesWeek: typeof doc.attendanceCodesWeek === 'number' ? doc.attendanceCodesWeek : null,
      codeEnabled: doc.attendanceCodeEnabled ?? false,
    };
  } catch (error: unknown) {
    const err = error as { code?: number };
    if (err.code === 404) {
      console.log('[AttendanceAPI] 配置文档不存在，使用默认配置');
    } else {
      console.error('[AttendanceAPI] 获取配置失败:', error);
    }
    return { config: DEFAULT_CONFIG, debugMode: false, attendanceCode1: null, attendanceCode2: null, attendanceCodesWeek: null, codeEnabled: false };
  }
}

/**
 * 保存点名配置到数据库（包括验证码）
 */
async function saveAttendanceConfigToDB(
  config: Partial<AttendanceConfig>, 
  debugMode?: boolean,
  attendanceCode1?: string | null,
  attendanceCode2?: string | null,
  attendanceCodesWeek?: number | null,
  codeEnabled?: boolean,
): Promise<void> {
  const updateData: Record<string, unknown> = {};
  
  if (config.dayOfWeek !== undefined) updateData.attendanceDayOfWeek = config.dayOfWeek;
  if (config.session1Start !== undefined) updateData.attendanceSession1Start = JSON.stringify(config.session1Start);
  if (config.session1Duration !== undefined) updateData.attendanceSession1Duration = config.session1Duration;
  if (config.session2Start !== undefined) updateData.attendanceSession2Start = JSON.stringify(config.session2Start);
  if (config.session2Duration !== undefined) updateData.attendanceSession2Duration = config.session2Duration;
  if (config.weekStartDate !== undefined) updateData.attendanceWeekStartDate = config.weekStartDate;
  if (debugMode !== undefined) updateData.attendanceDebugMode = debugMode;
  if (attendanceCode1 !== undefined) updateData.attendanceCode1 = attendanceCode1;
  if (attendanceCode2 !== undefined) updateData.attendanceCode2 = attendanceCode2;
  if (attendanceCodesWeek !== undefined) updateData.attendanceCodesWeek = attendanceCodesWeek;
  if (codeEnabled !== undefined) updateData.attendanceCodeEnabled = codeEnabled;

  try {
    await serverDatabases.updateDocument(
      APPWRITE_DATABASE_ID,
      SETTINGS_COLLECTION_ID,
      ATTENDANCE_CONFIG_DOC_ID,
      updateData
    );
  } catch (error: unknown) {
    const err = error as { code?: number };
    if (err.code === 404) {
      // 创建新文档
      const fullConfig = { ...DEFAULT_CONFIG, ...config };
      await serverDatabases.createDocument(
        APPWRITE_DATABASE_ID,
        SETTINGS_COLLECTION_ID,
        ATTENDANCE_CONFIG_DOC_ID,
        {
          attendanceDayOfWeek: fullConfig.dayOfWeek,
          attendanceSession1Start: JSON.stringify(fullConfig.session1Start),
          attendanceSession1Duration: fullConfig.session1Duration,
          attendanceSession2Start: JSON.stringify(fullConfig.session2Start),
          attendanceSession2Duration: fullConfig.session2Duration,
          attendanceWeekStartDate: fullConfig.weekStartDate,
          attendanceDebugMode: debugMode ?? false,
        }
      );
    } else {
      throw error;
    }
  }
}

/**
 * GET /api/attendance/status
 * 获取当前点名状态（是否在点名时间，还剩多少时间）
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    // 从数据库获取配置
    const { config, debugMode, attendanceCode1, attendanceCode2, attendanceCodesWeek, codeEnabled } = await getAttendanceConfigFromDB();

    const now = new Date();
    const dayOfWeek = now.getDay();
    const currentHour = now.getHours();
    const weekNumber = getCurrentWeekNumberWithConfig(config);

    let code1 = attendanceCode1;
    let code2 = attendanceCode2;

    // 每周配置日到达时段1开始时间，自动生成两个新验证码（每周只生成一次）
    if ((debugMode || dayOfWeek === config.dayOfWeek) && currentHour >= config.session1Start.hour && attendanceCodesWeek !== weekNumber) {
      code1 = generateAttendanceCode();
      code2 = generateAttendanceCode();
      await saveAttendanceConfigToDB({}, undefined, code1, code2, weekNumber, true);
    }

    // 获取调试/管理状态
    if (action === 'debug-status') {
      return NextResponse.json({
        debugMode,
        config,
        attendanceCode1: code1,
        attendanceCode2: code2,
        attendanceCodesWeek: weekNumber,
        codeEnabled,
      });
    }

    // 只要是配置的星期，全天开放点名（移除时间窗口限制）
    const isAttendanceOpen = debugMode || dayOfWeek === config.dayOfWeek;
    const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

    return NextResponse.json({
      isAttendanceOpen,
      session: null,
      message: isAttendanceOpen
        ? `今天是点名日（每${dayNames[config.dayOfWeek]}），请输入对应时段的验证码进行签到`
        : `今天不是点名日。点名日为每${dayNames[config.dayOfWeek]}`,
      weekNumber,
      debugMode,
      config,
      codeEnabled,
      hasCode: !!(code1 || code2),
    });
  } catch (error: unknown) {
    const err = error as Error & { message?: string };
    return NextResponse.json(
      { error: err.message || '获取点名状态失败' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/attendance/check-in
 * 学生点名
 * 
 * Body: {
 *   studentId: string,
 *   studentName: string,
 *   studentEmail: string,
 *   verificationCode?: string  // 验证码（如果开启）
 * }
 * 
 * 或者设置调试模式:
 * Body: {
 *   action: 'toggle-debug',
 *   enabled: boolean
 * }
 * 
 * 或者更新配置:
 * Body: {
 *   action: 'update-config',
 *   config: AttendanceConfig
 * }
 * 
 * 或者生成/切换验证码:
 * Body: {
 *   action: 'generate-code'  // 生成新验证码
 * }
 * Body: {
 *   action: 'toggle-code',
 *   enabled: boolean  // 开启/关闭验证码
 * }
 * Body: {
 *   action: 'clear-code'  // 清除验证码
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 从数据库获取当前配置
    const { config: currentConfig, debugMode: currentDebugMode, attendanceCode1: currentCode1, attendanceCode2: currentCode2, codeEnabled: currentCodeEnabled } = await getAttendanceConfigFromDB();

    // 切换调试模式
    if (body.action === 'toggle-debug') {
      await saveAttendanceConfigToDB({}, body.enabled, undefined, undefined, undefined, undefined);
      return NextResponse.json({
        success: true,
        debugMode: body.enabled,
        message: body.enabled ? '调试模式已开启' : '调试模式已关闭',
      });
    }

    // 更新点名配置
    if (body.action === 'update-config') {
      await saveAttendanceConfigToDB(body.config, undefined, undefined, undefined, undefined, undefined);
      const { config: updatedConfig } = await getAttendanceConfigFromDB();
      return NextResponse.json({
        success: true,
        config: updatedConfig,
        message: '点名配置已更新',
      });
    }

    // 手动生成两个新验证码
    if (body.action === 'generate-code') {
      const newCode1 = generateAttendanceCode();
      const newCode2 = generateAttendanceCode();
      const weekNum = getCurrentWeekNumberWithConfig(currentConfig);
      await saveAttendanceConfigToDB({}, undefined, newCode1, newCode2, weekNum, true);
      return NextResponse.json({
        success: true,
        attendanceCode1: newCode1,
        attendanceCode2: newCode2,
        codeEnabled: true,
        message: `验证码已生成 — 时段1: ${newCode1}，时段2: ${newCode2}`,
      });
    }

    // 清除验证码
    if (body.action === 'clear-code') {
      await saveAttendanceConfigToDB({}, undefined, null, null, null, false);
      return NextResponse.json({
        success: true,
        codeEnabled: false,
        attendanceCode1: null,
        attendanceCode2: null,
        message: '验证码已清除',
      });
    }

    // 正常点名流程
    const { studentId, studentName, studentEmail, verificationCode } = body;

    if (!studentId || !studentName || !studentEmail) {
      return NextResponse.json(
        { error: '学生ID、姓名和邮箱必填' },
        { status: 400 }
      );
    }

    // 星期检查（移除时间窗口限制，全天开放点名）
    const nowDate = new Date();
    const nowDay = nowDate.getDay();
    if (!currentDebugMode && nowDay !== currentConfig.dayOfWeek) {
      const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
      return NextResponse.json(
        { error: `今天不是点名日。点名日为每${dayNames[currentConfig.dayOfWeek]}` },
        { status: 400 }
      );
    }

    // 根据验证码判断是哪个时段
    let sessionTime: string;
    let sessionNumber: 1 | 2;

    if (currentCodeEnabled && (currentCode1 || currentCode2)) {
      if (!verificationCode) {
        return NextResponse.json(
          { error: '请输入点名验证码', requireCode: true },
          { status: 400 }
        );
      }
      if (verificationCode === currentCode1) {
        sessionTime = `${currentConfig.session1Start.hour}:${String(currentConfig.session1Start.minute).padStart(2, '0')}`;
        sessionNumber = 1;
      } else if (verificationCode === currentCode2) {
        sessionTime = `${currentConfig.session2Start.hour}:${String(currentConfig.session2Start.minute).padStart(2, '0')}`;
        sessionNumber = 2;
      } else {
        return NextResponse.json(
          { error: '验证码错误，请检查后重试', requireCode: true },
          { status: 400 }
        );
      }
    } else {
      // 无验证码时，按当前时间判断时段
      const currentMinutes = nowDate.getHours() * 60 + nowDate.getMinutes();
      const session2StartMinutes = currentConfig.session2Start.hour * 60 + currentConfig.session2Start.minute;
      if (currentMinutes < session2StartMinutes) {
        sessionTime = `${currentConfig.session1Start.hour}:${String(currentConfig.session1Start.minute).padStart(2, '0')}`;
        sessionNumber = 1;
      } else {
        sessionTime = `${currentConfig.session2Start.hour}:${String(currentConfig.session2Start.minute).padStart(2, '0')}`;
        sessionNumber = 2;
      }
    }

    // 检查是否已有点名记录（包括 pending 状态）
    const weekNumber = getCurrentWeekNumberWithConfig(currentConfig);
    const nowIso = nowDate.toISOString();

    // 查找当前时段本周的记录（不限日期，因为使用 weekNumber）
    let existingRecord = null;
    try {
      const existingRecords = await serverDatabases.listDocuments(
        APPWRITE_DATABASE_ID,
        ATTENDANCE_COLLECTION_ID,
        [
          Query.equal('studentId', studentId),
          Query.equal('sessionTime', sessionTime),
          Query.equal('weekNumber', weekNumber),
          Query.limit(1),
        ]
      );

      if (existingRecords.documents.length > 0) {
        existingRecord = existingRecords.documents[0];
      }
    } catch (queryError) {
      console.error('检查现有记录失败:', queryError);
      // 如果查询失败，继续执行
    }

    // 如果已有非 pending 状态的记录，说明已点过名
    if (existingRecord && existingRecord.status !== 'pending') {
      return NextResponse.json(
        { error: `您已在 ${sessionTime} 完成点名（状态：${existingRecord.status === 'present' ? '出席' : existingRecord.status === 'late' ? '迟到' : '缺席'}）` },
        { status: 400 }
      );
    }

    // 所有在点名日的签到均视为出席（不再按时间窗口区分迟到）
    const checkInStatus: 'present' = 'present';
    const lateNote = '';

    console.log('[DEBUG POST] 点名处理:', {
      studentId,
      studentName,
      sessionTime,
      weekNumber,
      checkInTime: nowIso,
      existingRecordId: existingRecord?.$id || null,
      status: checkInStatus,
    });

    let record;
    
    if (existingRecord) {
      // 更新现有的 pending 记录为 present/late
      record = await serverDatabases.updateDocument(
        APPWRITE_DATABASE_ID,
        ATTENDANCE_COLLECTION_ID,
        existingRecord.$id,
        {
          checkInTime: nowIso,
          status: checkInStatus,
          notes: lateNote || (currentDebugMode ? '[DEBUG] 调试模式点名' : ''),
        }
      );
      console.log('[DEBUG POST] 更新 pending 记录为:', checkInStatus);
    } else {
      // 创建新记录（未初始化时段的情况）
      // 使用 uniqueKey 作为文档ID：studentId_sessionNumber_weekNumber
      const uniqueKey = `${studentId}_${sessionNumber}_${weekNumber}`;
      
      try {
        record = await serverDatabases.createDocument(
          APPWRITE_DATABASE_ID,
          ATTENDANCE_COLLECTION_ID,
          uniqueKey,  // 使用 uniqueKey 作为文档ID
          {
            studentId,
            studentName,
            studentEmail,
            checkInTime: nowIso,
            sessionTime: sessionTime,
            weekNumber,
            status: checkInStatus,
            notes: lateNote || (currentDebugMode ? '[DEBUG] 调试模式点名' : ''),
            createdAt: nowIso,
            uniqueKey,  // 保存 uniqueKey 字段以便查询
          }
        );
        console.log('[DEBUG POST] 创建新记录:', record.$id);
      } catch (createError: unknown) {
        const err = createError as Error & { message?: string };
        // 如果是"已存在"错误，说明已经点过名
        if (err.message && err.message.includes('already exists')) {
          return NextResponse.json(
            { error: '您已完成点名，请勿重复提交' },
            { status: 400 }
          );
        }
        // 其他错误继续抛出
        throw createError;
      }
    }

    console.log('[DEBUG POST] 记录处理成功:', {
      id: record.$id,
      weekNumber: record.weekNumber,
      status: record.status,
    });

    const statusMessage = checkInStatus === 'late' ? '点名成功（迟到）！' : '点名成功！';

    return NextResponse.json({
      success: true,
      message: statusMessage,
      record: {
        id: record.$id,
        studentName: record.studentName,
        sessionTime: record.sessionTime,
        checkInTime: record.checkInTime,
        status: record.status,
        weekNumber: record.weekNumber,
      },
    });
  } catch (error: unknown) {
    const err = error as Error & { message?: string };
    return NextResponse.json(
      { error: err.message || '点名失败，请稍后重试' },
      { status: 400 }
    );
  }
}
