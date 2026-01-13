/* eslint-disable prettier/prettier */
import { NextRequest, NextResponse } from 'next/server';
import {
  getAllStudents,
  bulkImportStudents,
  deleteAllStudents,
  ImportStudentData,
} from '@/services/student.service';

/**
 * GET /api/admin/students
 * 获取所有学生列表（含活动、出勤、项目信息）
 */
export async function GET() {
  try {
    const students = await getAllStudents();
    return NextResponse.json({ success: true, students });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, error: err.message || '获取学生列表失败' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/students
 * 批量导入学生
 * Body: { students: ImportStudentData[], defaultPassword?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { students, defaultPassword } = body as {
      students: ImportStudentData[];
      defaultPassword?: string;
    };
    
    if (!students || !Array.isArray(students) || students.length === 0) {
      return NextResponse.json(
        { success: false, error: '请提供学生数据' },
        { status: 400 }
      );
    }
    
    const result = await bulkImportStudents(students, defaultPassword);
    
    return NextResponse.json({
      message: `成功导入 ${result.success} 名学生，失败 ${result.failed} 名`,
      success: result.success,
      failed: result.failed,
      errors: result.errors,
    });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, error: err.message || '批量导入失败' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/students
 * 删除所有学生用户
 */
export async function DELETE() {
  try {
    const result = await deleteAllStudents();
    
    return NextResponse.json({
      success: true,
      message: `已删除 ${result.deleted} 名学生，失败 ${result.failed} 名`,
      deleted: result.deleted,
      failed: result.failed,
    });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, error: err.message || '删除失败' },
      { status: 500 }
    );
  }
}
