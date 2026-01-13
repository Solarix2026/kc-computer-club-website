/* eslint-disable prettier/prettier */
import { NextRequest, NextResponse } from 'next/server';
import { getStudentById, deleteStudent, updateStudent } from '@/services/student.service';

/**
 * GET /api/admin/students/[id]
 * 获取单个学生详细信息
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const student = await getStudentById(id);
    
    if (!student) {
      return NextResponse.json(
        { success: false, error: '学生不存在' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, student });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, error: err.message || '获取学生信息失败' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/students/[id]
 * 更新学生信息
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    await updateStudent(id, body);
    
    return NextResponse.json({ success: true, message: '学生信息已更新' });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, error: err.message || '更新失败' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/students/[id]
 * 删除单个学生
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteStudent(id);
    
    return NextResponse.json({ success: true, message: '学生已删除' });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, error: err.message || '删除失败' },
      { status: 500 }
    );
  }
}
