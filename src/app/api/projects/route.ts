/* eslint-disable prettier/prettier */
import { NextRequest, NextResponse } from 'next/server';
import {
  getAllProjects,
  createProject,
  getUserProject,
  getProjectStats,
} from '@/services/project.service';
import { CreateProjectInput } from '@/types';

/**
 * GET /api/projects - 获取所有项目或检查用户项目状态
 * 查询参数: 
 *   - status: 过滤项目状态
 *   - checkUser: 用户邮箱（检查用户是否已在某个项目中）
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const checkUser = searchParams.get('checkUser');
    const getStats = searchParams.get('stats');

    // 如果请求统计数据，同时返回项目列表
    if (getStats === 'true') {
      const projects = await getAllProjects();
      const stats = await getProjectStats();
      return NextResponse.json({ 
        success: true, 
        projects,
        stats,
      });
    }

    // 如果是检查用户是否已在项目中
    if (checkUser) {
      const userProject = await getUserProject(checkUser);
      if (userProject) {
        return NextResponse.json({
          success: true,
          hasProject: true,
          project: userProject,
          isLeader: userProject.leaderEmail === checkUser,
        });
      }
      return NextResponse.json({
        success: true,
        hasProject: false,
        project: null,
        isLeader: false,
      });
    }

    // 获取项目列表
    const projects = await getAllProjects(status || undefined);

    return NextResponse.json({
      success: true,
      total: projects.length,
      projects,
    });
  } catch (error: unknown) {
    const err = error as Error & { message?: string };
    console.error('获取项目失败:', err);
    return NextResponse.json(
      { error: err.message || '获取项目失败' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/projects - 创建新项目
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      teamName,
      title,
      description,
      category,
      objectives,
      timeline,
      resources,
      projectLink,
      members,
      leaderId,
      leaderEmail,
    } = body;

    // 验证必填字段
    if (!teamName || !title || !description || !category || !leaderId || !leaderEmail) {
      return NextResponse.json(
        { error: '缺少必填字段：teamName, title, description, category, leaderId, leaderEmail' },
        { status: 400 }
      );
    }

    // 验证组员数据
    if (!members || !Array.isArray(members) || members.length === 0) {
      return NextResponse.json(
        { error: '至少需要一名组员（组长）' },
        { status: 400 }
      );
    }

    // 检查组长是否已在其他项目中
    const existingProject = await getUserProject(leaderEmail);
    if (existingProject) {
      return NextResponse.json(
        { 
          error: '您已经是其他项目的成员，不能创建新项目',
          existingProject: {
            id: existingProject.projectId,
            title: existingProject.title,
            teamName: existingProject.teamName,
          }
        },
        { status: 400 }
      );
    }

    // 检查所有组员是否已在其他项目中
    for (const member of members) {
      if (member.email !== leaderEmail) {
        const memberProject = await getUserProject(member.email);
        if (memberProject) {
          return NextResponse.json(
            { 
              error: `组员 ${member.name} (${member.email}) 已经是其他项目的成员`,
              memberEmail: member.email,
            },
            { status: 400 }
          );
        }
      }
    }

    const input: CreateProjectInput = {
      teamName,
      title,
      description,
      category,
      objectives: objectives || '',
      timeline: timeline || '',
      resources: resources || '',
      projectLink: projectLink || '',
      members,
      leaderId,
      leaderEmail,
    };

    const project = await createProject(input);

    return NextResponse.json({
      success: true,
      message: '项目创建成功',
      project,
    });
  } catch (error: unknown) {
    const err = error as Error & { message?: string };
    console.error('创建项目失败:', err);
    return NextResponse.json(
      { error: err.message || '创建项目失败' },
      { status: 500 }
    );
  }
}
