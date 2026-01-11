/* eslint-disable prettier/prettier */
import { NextRequest, NextResponse } from 'next/server';
import { serverDatabases, ID, Query } from '@/services/appwrite-server';

const APPWRITE_DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '';
const SETTINGS_COLLECTION_ID = 'clubSettings';
const ATTENDANCE_CONFIG_DOC_ID = 'attendance_config'; // 固定文档 ID

/**
 * 点名配置接口
 */
export interface AttendanceConfig {
  dayOfWeek: number; // 0 = 周日, 1 = 周一, ..., 6 = 周六
  session1Start: { hour: number; minute: number };
  session1Duration: number; // 分钟
  session2Start: { hour: number; minute: number };
  session2Duration: number; // 分钟
  weekStartDate: string; // 第1周的开始日期 (YYYY-MM-DD)
  debugMode?: boolean; // 调试模式
}

/**
 * 默认配置
 */
const DEFAULT_CONFIG: AttendanceConfig = {
  dayOfWeek: 2, // 周二
  session1Start: { hour: 15, minute: 20 },
  session1Duration: 5,
  session2Start: { hour: 16, minute: 35 },
  session2Duration: 5,
  weekStartDate: '2026-01-06',
  debugMode: false,
};

/**
 * GET /api/attendance/config
 * 获取点名配置
 */
export async function GET() {
  try {
    // 尝试从数据库获取配置
    const doc = await serverDatabases.getDocument(
      APPWRITE_DATABASE_ID,
      SETTINGS_COLLECTION_ID,
      ATTENDANCE_CONFIG_DOC_ID
    );

    // 解析存储的 JSON 配置
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
      debugMode: doc.attendanceDebugMode ?? false,
    };

    return NextResponse.json({
      success: true,
      config,
      source: 'database',
    });
  } catch (error: unknown) {
    const err = error as { code?: number; message?: string };
    
    // 如果文档不存在，返回默认配置
    if (err.code === 404) {
      console.log('[AttendanceConfig] 配置文档不存在，使用默认配置');
      return NextResponse.json({
        success: true,
        config: DEFAULT_CONFIG,
        source: 'default',
      });
    }

    console.error('[AttendanceConfig] 获取配置失败:', err.message);
    return NextResponse.json(
      { 
        error: '获取点名配置失败', 
        message: err.message,
        config: DEFAULT_CONFIG, // 返回默认配置作为降级
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/attendance/config
 * 保存点名配置到数据库
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const config: Partial<AttendanceConfig> = body.config || body;

    // 构建要存储的数据
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
    if (config.debugMode !== undefined) {
      updateData.attendanceDebugMode = config.debugMode;
    }

    let result;

    try {
      // 尝试更新现有文档
      result = await serverDatabases.updateDocument(
        APPWRITE_DATABASE_ID,
        SETTINGS_COLLECTION_ID,
        ATTENDANCE_CONFIG_DOC_ID,
        updateData
      );
      console.log('[AttendanceConfig] 配置更新成功');
    } catch (updateError: unknown) {
      const updateErr = updateError as { code?: number };
      
      // 如果文档不存在，创建新文档
      if (updateErr.code === 404) {
        console.log('[AttendanceConfig] 配置文档不存在，创建新文档');
        
        // 合并默认配置和新配置
        const fullConfig = { ...DEFAULT_CONFIG, ...config };
        const createData = {
          attendanceDayOfWeek: fullConfig.dayOfWeek,
          attendanceSession1Start: JSON.stringify(fullConfig.session1Start),
          attendanceSession1Duration: fullConfig.session1Duration,
          attendanceSession2Start: JSON.stringify(fullConfig.session2Start),
          attendanceSession2Duration: fullConfig.session2Duration,
          attendanceWeekStartDate: fullConfig.weekStartDate,
          attendanceDebugMode: fullConfig.debugMode ?? false,
        };

        result = await serverDatabases.createDocument(
          APPWRITE_DATABASE_ID,
          SETTINGS_COLLECTION_ID,
          ATTENDANCE_CONFIG_DOC_ID,
          createData
        );
        console.log('[AttendanceConfig] 配置文档创建成功');
      } else {
        throw updateError;
      }
    }

    // 返回更新后的配置
    const savedConfig: AttendanceConfig = {
      dayOfWeek: result.attendanceDayOfWeek ?? DEFAULT_CONFIG.dayOfWeek,
      session1Start: result.attendanceSession1Start 
        ? JSON.parse(result.attendanceSession1Start) 
        : DEFAULT_CONFIG.session1Start,
      session1Duration: result.attendanceSession1Duration ?? DEFAULT_CONFIG.session1Duration,
      session2Start: result.attendanceSession2Start 
        ? JSON.parse(result.attendanceSession2Start) 
        : DEFAULT_CONFIG.session2Start,
      session2Duration: result.attendanceSession2Duration ?? DEFAULT_CONFIG.session2Duration,
      weekStartDate: result.attendanceWeekStartDate ?? DEFAULT_CONFIG.weekStartDate,
      debugMode: result.attendanceDebugMode ?? false,
    };

    return NextResponse.json({
      success: true,
      config: savedConfig,
      message: '点名配置已保存',
    });
  } catch (error: unknown) {
    const err = error as { code?: number; message?: string };
    console.error('[AttendanceConfig] 保存配置失败:', err.message);
    
    return NextResponse.json(
      { error: '保存点名配置失败', message: err.message },
      { status: 500 }
    );
  }
}
