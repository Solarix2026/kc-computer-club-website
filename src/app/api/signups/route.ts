/* eslint-disable prettier/prettier */
import { NextRequest, NextResponse } from 'next/server';
import { signupService, CreateSignupInput } from '@/services/signup.service';

/**
 * GET /api/signups - 获取所有报名
 * 查询参数: activityId=xxx (按活动ID过滤)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const activityId = searchParams.get('activityId');

    const signups = await signupService.getAllSignups(activityId || undefined);

    return NextResponse.json({
      success: true,
      total: signups.length,
      signups,
    });
  } catch (error: unknown) {
    const err = error as Error & { message?: string };
    console.error('获取报名列表失败:', err);
    return NextResponse.json(
      { error: err.message || '获取报名列表失败' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/signups - 创建新报名
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { activityId, activityTitle, studentName, studentEmail, studentId, major, year, formData } = body;

    // 验证必填字段
    if (!activityId || !studentName || !studentEmail) {
      return NextResponse.json(
        { error: '缺少必填字段: activityId, studentName, studentEmail' },
        { status: 400 }
      );
    }

    const input: CreateSignupInput = {
      activityId,
      activityTitle,
      studentName,
      studentEmail,
      studentId,
      major,
      year,
      formData,
    };

    const signup = await signupService.createSignup(input);

    return NextResponse.json({
      success: true,
      message: '报名成功',
      signup,
    });
  } catch (error: unknown) {
    const err = error as Error & { message?: string };
    console.error('创建报名失败:', err);
    return NextResponse.json(
      { error: err.message || '创建报名失败' },
      { status: 500 }
    );
  }
}
