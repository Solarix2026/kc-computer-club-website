/* eslint-disable prettier/prettier */
import { NextRequest, NextResponse } from 'next/server';
import { serverDatabases, ID, Query } from '@/services/appwrite-server';
import bcrypt from 'bcryptjs';

/**
 * POST /api/admin/students/create
 * 管理员手动创建单个学生账户
 */

const APPWRITE_DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '';
const USERS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION || '';

const DEFAULT_STUDENT_PASSWORD = '11111111';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      studentId,
      chineseName,
      englishName,
      classNameCn,
      classNameEn,
      classCode,
      groupLevel,
      level,
      phone,
      instagram,
      group,
      position,
      notes,
      password,
    } = body;

    // 验证必填字段
    if (!studentId || studentId.trim().length < 3) {
      return NextResponse.json(
        { error: '学号必填且至少3位' },
        { status: 400 }
      );
    }

    if (!chineseName || chineseName.trim().length < 2) {
      return NextResponse.json(
        { error: '中文姓名至少需要2个字符' },
        { status: 400 }
      );
    }

    // 生成邮箱
    const email = `${studentId.trim()}@kuencheng.edu.my`.toLowerCase();

    // 检查邮箱是否已存在
    const existing = await serverDatabases.listDocuments(
      APPWRITE_DATABASE_ID,
      USERS_COLLECTION_ID,
      [Query.equal('email', email)]
    );

    if (existing.documents.length > 0) {
      return NextResponse.json(
        { error: '该学号已注册' },
        { status: 400 }
      );
    }

    // 创建用户记录
    const now = new Date().toISOString();
    const actualPassword = password || DEFAULT_STUDENT_PASSWORD;
    const passwordHash = await bcrypt.hash(actualPassword, 10);
    const requirePasswordChange = actualPassword === DEFAULT_STUDENT_PASSWORD;

    const newStudent = await serverDatabases.createDocument(
      APPWRITE_DATABASE_ID,
      USERS_COLLECTION_ID,
      ID.unique(),
      {
        email: email,
        name: chineseName.trim(),
        studentId: studentId.trim(),
        chineseName: chineseName.trim(),
        englishName: (englishName || '').trim(),
        classNameCn: (classNameCn || '').trim(),
        classNameEn: (classNameEn || '').trim(),
        classCode: (classCode || '').trim(),
        groupLevel: (groupLevel || '').trim(),
        level: (level || '').trim(),
        phone: (phone || '').trim(),
        instagram: (instagram || '').trim(),
        group: (group || '').trim(),
        position: (position || '').trim(),
        notes: (notes || '').trim(),
        role: 'student',
        passwordHash: passwordHash,
        requirePasswordChange: requirePasswordChange,
        emailVerified: true,
        createdAt: now,
        updatedAt: now,
      }
    );

    return NextResponse.json({
      success: true,
      message: '学生账户创建成功',
      student: {
        id: newStudent.$id,
        email: email,
        studentId: studentId.trim(),
        chineseName: chineseName.trim(),
        requirePasswordChange: requirePasswordChange,
      },
    });
  } catch (error) {
    console.error('创建学生失败:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '创建学生失败' },
      { status: 500 }
    );
  }
}
