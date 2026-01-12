/* eslint-disable prettier/prettier */
import { NextRequest, NextResponse } from 'next/server';
import { databases } from '@/services/appwrite';
import { ChecklistItem } from '@/types';

const APPWRITE_DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '';
const PROJECTS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECTS_COLLECTION || 'projects';

/**
 * GET /api/projects/[id]/checklist - 获取项目检查清单
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const project = await databases.getDocument(
      APPWRITE_DATABASE_ID,
      PROJECTS_COLLECTION_ID,
      id
    );

    // 解析 checklist 字段
    let checklist = null;
    if (project.checklist) {
      try {
        if (typeof project.checklist === 'string') {
          checklist = JSON.parse(project.checklist);
        } else {
          checklist = project.checklist;
        }
      } catch {
        checklist = null;
      }
    }

    return NextResponse.json({
      success: true,
      checklist: checklist || {
        checklistId: `${id}-checklist`,
        projectId: id,
        title: '项目检查清单',
        items: [],
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      },
    });
  } catch (error: unknown) {
    const err = error as Error & { message?: string };
    console.error('获取检查清单失败:', err);
    return NextResponse.json(
      { error: err.message || '获取检查清单失败' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/projects/[id]/checklist - 更新项目检查清单
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { items } = body;

    if (!Array.isArray(items)) {
      return NextResponse.json(
        { error: '项目列表格式错误' },
        { status: 400 }
      );
    }

    // 获取现有项目
    const project = await databases.getDocument(
      APPWRITE_DATABASE_ID,
      PROJECTS_COLLECTION_ID,
      id
    );

    // 构建新的检查清单
    const checklist = {
      checklistId: `${id}-checklist`,
      projectId: id,
      title: '项目检查清单',
      items: items.map((item: ChecklistItem) => ({
        id: item.id,
        title: item.title,
        description: item.description || null,
        completed: item.completed,
        completedAt: item.completedAt || null,
        assignee: item.assignee || null,
      })),
      createdAt: project.createdAt,
      updatedAt: new Date().toISOString(),
    };

    // 更新项目文档
    await databases.updateDocument(
      APPWRITE_DATABASE_ID,
      PROJECTS_COLLECTION_ID,
      id,
      {
        checklist: JSON.stringify(checklist),
        updatedAt: new Date().toISOString(),
      }
    );

    return NextResponse.json({
      success: true,
      message: '检查清单更新成功',
      checklist,
    });
  } catch (error: unknown) {
    const err = error as Error & { message?: string };
    console.error('更新检查清单失败:', err);
    return NextResponse.json(
      { error: err.message || '更新检查清单失败' },
      { status: 500 }
    );
  }
}
