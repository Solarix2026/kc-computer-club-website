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
async function getAttendanceConfigFromDB(): Promise<{ config: AttendanceConfig; debugMode: boolean; attendanceCode: string | null; codeEnabled: boolean }> {
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
      attendanceCode: doc.attendanceCode ?? null,
      codeEnabled: doc.attendanceCodeEnabled ?? false,
    };
  } catch (error: unknown) {
    const err = error as { code?: number };
    if (err.code === 404) {
      console.log('[AttendanceAPI] 配置文档不存在，使用默认配置');
    } else {
      console.error('[AttendanceAPI] 获取配置失败:', error);
    }
    return { config: DEFAULT_CONFIG, debugMode: false, attendanceCode: null, codeEnabled: false };
  }
}

/**
 * 保存点名配置到数据库（包括验证码）
 */
async function saveAttendanceConfigToDB(
  config: Partial<AttendanceConfig>, 
  debugMode?: boolean,
  attendanceCode?: string | null,
  codeEnabled?: boolean
): Promise<void> {
  const updateData: Record<string, unknown> = {};
  
  if (config.dayOfWeek !== undefined) {
    updateData.attendanceDayOfWeek = config.dayOfWeek;
  }
  if (config.session1Start !== undefined) {
    updateData.attendanceSession1Start = JSON.stringify(config.session1Start);
  }
  if (config.session1Duration !== undefined) {
    updateData.attendanceSession1Duration = config.session1Duration;
  }
  if (config.session2Start !== undefined) {
    updateData.attendanceSession2Start = JSON.stringify(config.session2Start);
  }
  if (config.session2Duration !== undefined) {
    updateData.attendanceSession2Duration = config.session2Duration;
  }
  if (config.weekStartDate !== undefined) {
    updateData.attendanceWeekStartDate = config.weekStartDate;
  }
  if (debugMode !== undefined) {
    updateData.attendanceDebugMode = debugMode;
  }
  if (attendanceCode !== undefined) {
    updateData.attendanceCode = attendanceCode;
  }
  if (codeEnabled !== undefined) {
    updateData.attendanceCodeEnabled = codeEnabled;
  }

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
    const { config, debugMode, attendanceCode, codeEnabled } = await getAttendanceConfigFromDB();

    // 获取调试模式状态
    if (action === 'debug-status') {
      return NextResponse.json({
        debugMode,
        config,
        attendanceCode,
        codeEnabled,
      });
    }

    const session = getCurrentAttendanceSessionWithConfig(config, debugMode);
    const weekNumber = getCurrentWeekNumberWithConfig(config);
    const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

    if (!session) {
      return NextResponse.json({
        isAttendanceOpen: false,
        session: null,
        message: `当前不在点名时间。点名时间为每${dayNames[config.dayOfWeek]} ${config.session1Start.hour}:${String(config.session1Start.minute).padStart(2, '0')}-${config.session1Start.hour}:${String(config.session1Start.minute + config.session1Duration).padStart(2, '0')} 或 ${config.session2Start.hour}:${String(config.session2Start.minute).padStart(2, '0')}-${config.session2Start.hour}:${String(config.session2Start.minute + config.session2Duration).padStart(2, '0')}`,
        weekNumber,
        debugMode,
        config,
        codeEnabled,
        hasCode: !!attendanceCode,
      });
    }

    return NextResponse.json({
      isAttendanceOpen: true,
      session: {
        sessionTime: session.sessionTime,
        minutesRemaining: session.minutesRemaining,
      },
      weekNumber,
      debugMode,
      config,
      codeEnabled,
      hasCode: !!attendanceCode,
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
    const { config: currentConfig, debugMode: currentDebugMode, attendanceCode: currentCode, codeEnabled: currentCodeEnabled } = await getAttendanceConfigFromDB();

    // 切换调试模式
    if (body.action === 'toggle-debug') {
      await saveAttendanceConfigToDB({}, body.enabled, undefined, undefined);
      return NextResponse.json({
        success: true,
        debugMode: body.enabled,
        message: body.enabled ? '调试模式已开启' : '调试模式已关闭',
      });
    }

    // 更新点名配置
    if (body.action === 'update-config') {
      await saveAttendanceConfigToDB(body.config, undefined, undefined, undefined);
      const { config: updatedConfig } = await getAttendanceConfigFromDB();
      return NextResponse.json({
        success: true,
        config: updatedConfig,
        message: '点名配置已更新',
      });
    }

    // 生成新验证码
    if (body.action === 'generate-code') {
      const newCode = generateAttendanceCode();
      await saveAttendanceConfigToDB({}, undefined, newCode, true);
      return NextResponse.json({
        success: true,
        attendanceCode: newCode,
        codeEnabled: true,
        message: `验证码已生成: ${newCode}`,
      });
    }

    // 切换验证码开关
    if (body.action === 'toggle-code') {
      await saveAttendanceConfigToDB({}, undefined, body.enabled ? currentCode : null, body.enabled);
      return NextResponse.json({
        success: true,
        codeEnabled: body.enabled,
        attendanceCode: body.enabled ? currentCode : null,
        message: body.enabled ? '验证码功能已开启' : '验证码功能已关闭',
      });
    }

    // 清除验证码
    if (body.action === 'clear-code') {
      await saveAttendanceConfigToDB({}, undefined, null, false);
      return NextResponse.json({
        success: true,
        codeEnabled: false,
        attendanceCode: null,
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

    // 验证码检查
    if (currentCodeEnabled && currentCode) {
      if (!verificationCode) {
        return NextResponse.json(
          { error: '请输入点名验证码', requireCode: true },
          { status: 400 }
        );
      }
      if (verificationCode !== currentCode) {
        return NextResponse.json(
          { error: '验证码错误，请检查后重试', requireCode: true },
          { status: 400 }
        );
      }
    }

    // 检查点名时间
    const session = getCurrentAttendanceSessionWithConfig(currentConfig, currentDebugMode);
    
    if (!session && !currentDebugMode) {
      const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
      return NextResponse.json(
        { error: `当前不在点名时间。点名时间为每${dayNames[currentConfig.dayOfWeek]} ${currentConfig.session1Start.hour}:${String(currentConfig.session1Start.minute).padStart(2, '0')}-${currentConfig.session1Start.hour}:${String(currentConfig.session1Start.minute + currentConfig.session1Duration).padStart(2, '0')} 或 ${currentConfig.session2Start.hour}:${String(currentConfig.session2Start.minute).padStart(2, '0')}-${currentConfig.session2Start.hour}:${String(currentConfig.session2Start.minute + currentConfig.session2Duration).padStart(2, '0')}` },
        { status: 400 }
      );
    }

    // 确定当前时段
    const sessionTime = session ? session.sessionTime : (currentDebugMode ? `${currentConfig.session1Start.hour}:${String(currentConfig.session1Start.minute).padStart(2, '0')}` : '15:20');

    // 检查今天同一时段是否已经点过名（使用服务器端 SDK）
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    try {
      const existingRecords = await serverDatabases.listDocuments(
        APPWRITE_DATABASE_ID,
        ATTENDANCE_COLLECTION_ID,
        [
          Query.equal('studentId', studentId),
          Query.equal('sessionTime', sessionTime),
          Query.greaterThanEqual('checkInTime', today.toISOString()),
          Query.lessThan('checkInTime', tomorrow.toISOString()),
        ]
      );

      if (existingRecords.documents.length > 0) {
        return NextResponse.json(
          { error: `您已在 ${sessionTime} 完成点名` },
          { status: 400 }
        );
      }
    } catch (queryError) {
      console.error('检查重复点名失败:', queryError);
      // 如果查询失败，继续执行（不阻止点名）
    }

    // 使用服务器端 SDK 创建点名记录
    const weekNumber = getCurrentWeekNumberWithConfig(currentConfig);
    const now = new Date().toISOString();

    console.log('[DEBUG POST] 保存点名记录:', {
      studentId,
      studentName,
      sessionTime,
      weekNumber,
      checkInTime: now,
    });

    const record = await serverDatabases.createDocument(
      APPWRITE_DATABASE_ID,
      ATTENDANCE_COLLECTION_ID,
      ID.unique(),
      {
        studentId,
        studentName,
        studentEmail,
        checkInTime: now,
        sessionTime: sessionTime,
        weekNumber,
        status: 'present',
        notes: currentDebugMode ? '[DEBUG] 调试模式点名' : '',
        createdAt: now,
      }
    );

    console.log('[DEBUG POST] 记录保存成功:', {
      id: record.$id,
      weekNumber: record.weekNumber,
    });

    return NextResponse.json({
      success: true,
      message: '点名成功！',
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
