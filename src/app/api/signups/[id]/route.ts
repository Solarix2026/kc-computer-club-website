/* eslint-disable prettier/prettier */
import { NextRequest, NextResponse } from 'next/server';
import { signupService } from '@/services/signup.service';

/**
 * GET /api/signups/[id] - 获取单个报名
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const signup = await signupService.getSignupById(id);

    return NextResponse.json({
      success: true,
      signup,
    });
  } catch (error: unknown) {
    const err = error as Error & { message?: string };
    console.error('获取报名失败:', err);
    return NextResponse.json(
      { error: err.message || '获取报名失败' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/signups/[id] - 更新报名
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const signup = await signupService.updateSignup(id, body);

    return NextResponse.json({
      success: true,
      message: '报名更新成功',
      signup,
    });
  } catch (error: unknown) {
    const err = error as Error & { message?: string };
    console.error('更新报名失败:', err);
    return NextResponse.json(
      { error: err.message || '更新报名失败' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/signups/[id] - 删除报名
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await signupService.deleteSignup(id);

    return NextResponse.json({
      success: true,
      message: '报名删除成功',
    });
  } catch (error: unknown) {
    const err = error as Error & { message?: string };
    console.error('删除报名失败:', err);
    return NextResponse.json(
      { error: err.message || '删除报名失败' },
      { status: 500 }
    );
  }
}
