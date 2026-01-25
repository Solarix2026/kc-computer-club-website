/* eslint-disable prettier/prettier */
import { databases } from '@/services/appwrite';
import { ID, Query } from 'appwrite';
import { Project, CreateProjectInput, UpdateProjectInput, ProjectMember } from '@/types';

const APPWRITE_DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '';
const PROJECTS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECTS_COLLECTION || 'projects';

/**
 * 项目服务
 * 管理所有项目的数据库操作
 */

/**
 * 获取所有项目
 */
export async function getAllProjects(status?: string): Promise<Project[]> {
  try {
    const queries = status ? [Query.equal('status', status)] : [];
    const response = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      PROJECTS_COLLECTION_ID,
      queries
    );
    return response.documents.map(parseProject) as Project[];
  } catch (error: unknown) {
    const err = error as Error & { message?: string };
    console.error('获取项目列表失败:', err);
    throw new Error(err.message || '获取项目列表失败');
  }
}

/**
 * 按 ID 获取单个项目
 */
export async function getProjectById(id: string): Promise<Project> {
  try {
    const project = await databases.getDocument(
      APPWRITE_DATABASE_ID,
      PROJECTS_COLLECTION_ID,
      id
    );
    return parseProject(project) as Project;
  } catch (error: unknown) {
    const err = error as Error & { message?: string };
    console.error('获取项目失败:', err);
    throw new Error(err.message || '获取项目失败');
  }
}

/**
 * 检查用户是否已在某个项目中（作为组员）
 * @returns 返回用户所在的项目，如果没有则返回 null
 */
export async function getUserProject(userEmail: string): Promise<Project | null> {
  try {
    // 搜索所有项目，检查用户是否是组长或组员
    const response = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      PROJECTS_COLLECTION_ID,
      []
    );

    for (const doc of response.documents) {
      const project = parseProject(doc);
      
      // 检查是否是组长
      if (project.leaderEmail === userEmail) {
        return project as Project;
      }
      
      // 检查是否是组员
      if (project.members && project.members.some(m => m.email === userEmail)) {
        return project as Project;
      }
    }

    return null;
  } catch (error: unknown) {
    const err = error as Error & { message?: string };
    console.error('检查用户项目失败:', err);
    return null;
  }
}

/**
 * 检查用户是否是组长
 */
export async function isUserProjectLeader(userEmail: string): Promise<boolean> {
  try {
    const project = await getUserProject(userEmail);
    if (!project) return false;
    return project.leaderEmail === userEmail;
  } catch {
    return false;
  }
}

/**
 * 创建新项目
 */
export async function createProject(input: CreateProjectInput): Promise<Project> {
  try {
    const now = new Date().toISOString();
    
    // 将 members 数组转换为 JSON 字符串存储，并添加 joinedAt
    const membersWithTimestamp: ProjectMember[] = input.members.map(m => ({
      ...m,
      joinedAt: now,
    }));

    const projectData = {
      teamName: input.teamName,
      title: input.title,
      description: input.description,
      category: input.category,
      objectives: input.objectives || '',
      timeline: input.timeline || '',
      resources: input.resources || '',
      projectLink: input.projectLink || '',
      members: JSON.stringify(membersWithTimestamp),
      leaderId: input.leaderId,
      leaderEmail: input.leaderEmail,
      status: 'pending',
      // adminFeedback 属性因 Appwrite 免费版限制可能不存在，不在创建时设置
      createdAt: now,
      updatedAt: now,
    };

    const project = await databases.createDocument(
      APPWRITE_DATABASE_ID,
      PROJECTS_COLLECTION_ID,
      ID.unique(),
      projectData
    );

    return parseProject(project) as Project;
  } catch (error: unknown) {
    const err = error as Error & { message?: string };
    console.error('创建项目失败:', err);
    throw new Error(err.message || '创建项目失败');
  }
}

/**
 * 更新项目
 */
export async function updateProject(id: string, input: UpdateProjectInput): Promise<Project> {
  try {
    const now = new Date().toISOString();
    const updateData: Record<string, unknown> = {
      updatedAt: now,
    };

    if (input.teamName !== undefined) updateData.teamName = input.teamName;
    if (input.title !== undefined) updateData.title = input.title;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.category !== undefined) updateData.category = input.category;
    if (input.objectives !== undefined) updateData.objectives = input.objectives;
    if (input.timeline !== undefined) updateData.timeline = input.timeline;
    if (input.resources !== undefined) updateData.resources = input.resources;
    if (input.projectLink !== undefined) updateData.projectLink = input.projectLink;
    if (input.status !== undefined) updateData.status = input.status;
    
    // adminFeedback 存储在 timeline 字段中，使用 FEEDBACK:: 前缀
    // 因为 Appwrite 免费版属性数量限制
    if (input.adminFeedback !== undefined) {
      // 首先获取当前项目的 timeline 值
      const currentProject = await databases.getDocument(
        APPWRITE_DATABASE_ID,
        PROJECTS_COLLECTION_ID,
        id
      );
      let currentTimeline = (currentProject.timeline as string) || '';
      // 移除旧的 FEEDBACK:: 内容
      if (currentTimeline.includes('FEEDBACK::')) {
        currentTimeline = currentTimeline.substring(0, currentTimeline.indexOf('FEEDBACK::')).trim();
      }
      // 添加新的反馈（如果有的话）
      if (input.adminFeedback) {
        updateData.timeline = currentTimeline + (currentTimeline ? '\n' : '') + 'FEEDBACK::' + input.adminFeedback;
      } else {
        updateData.timeline = currentTimeline;
      }
    }
    
    // 处理 members 更新
    if (input.members !== undefined) {
      const now = new Date().toISOString();
      const membersWithTimestamp: ProjectMember[] = input.members.map(m => ({
        ...m,
        joinedAt: now,
      }));
      updateData.members = JSON.stringify(membersWithTimestamp);
    }

    const project = await databases.updateDocument(
      APPWRITE_DATABASE_ID,
      PROJECTS_COLLECTION_ID,
      id,
      updateData
    );

    return parseProject(project) as Project;
  } catch (error: unknown) {
    const err = error as Error & { message?: string };
    console.error('更新项目失败:', err);
    throw new Error(err.message || '更新项目失败');
  }
}

/**
 * 删除项目
 */
export async function deleteProject(id: string): Promise<void> {
  try {
    await databases.deleteDocument(
      APPWRITE_DATABASE_ID,
      PROJECTS_COLLECTION_ID,
      id
    );
  } catch (error: unknown) {
    const err = error as Error & { message?: string };
    console.error('删除项目失败:', err);
    throw new Error(err.message || '删除项目失败');
  }
}

/**
 * 审批项目
 */
export async function approveProject(id: string, feedback?: string): Promise<Project> {
  return updateProject(id, {
    status: 'approved',
    adminFeedback: feedback || '项目已批准',
  });
}

/**
 * 拒绝项目
 */
export async function rejectProject(id: string, feedback: string): Promise<Project> {
  return updateProject(id, {
    status: 'rejected',
    adminFeedback: feedback,
  });
}

/**
 * 要求修改项目
 */
export async function requestRevision(id: string, feedback: string): Promise<Project> {
  return updateProject(id, {
    status: 'revision',
    adminFeedback: feedback,
  });
}

/**
 * 恢复项目为待审核状态
 */
export async function revertProjectToPending(id: string): Promise<Project> {
  return updateProject(id, {
    status: 'pending',
    adminFeedback: '',
  });
}

/**
 * 解析项目数据
 */
function parseProject(doc: Record<string, unknown>): Partial<Project> {
  // 解析 members 字段
  let members: ProjectMember[] = [];
  if (doc.members) {
    try {
      if (typeof doc.members === 'string') {
        members = JSON.parse(doc.members as string);
      } else if (Array.isArray(doc.members)) {
        members = doc.members as ProjectMember[];
      }
    } catch {
      members = [];
    }
  }

  // 解析 checklist 字段（从 resources 字段中提取）
  let checklist: any = undefined;
  if (doc.resources && typeof doc.resources === 'string' && (doc.resources as string).startsWith('CHECKLIST::')) {
    try {
      const checklistJson = (doc.resources as string).substring('CHECKLIST::'.length);
      checklist = JSON.parse(checklistJson);
    } catch {
      checklist = undefined;
    }
  }

  // 解析 adminFeedback 字段（从 timeline 字段中提取 FEEDBACK:: 前缀的内容）
  // 因为 Appwrite 免费版属性数量限制，我们复用 timeline 字段存储反馈
  let adminFeedback = '';
  let actualTimeline = doc.timeline as string || '';
  if (actualTimeline.includes('FEEDBACK::')) {
    const feedbackIndex = actualTimeline.indexOf('FEEDBACK::');
    adminFeedback = actualTimeline.substring(feedbackIndex + 'FEEDBACK::'.length);
    actualTimeline = actualTimeline.substring(0, feedbackIndex).trim();
  }
  // 也检查原始 adminFeedback 字段（如果存在）
  if (!adminFeedback && doc.adminFeedback) {
    adminFeedback = doc.adminFeedback as string;
  }

  return {
    projectId: doc.$id as string,
    teamName: doc.teamName as string,
    title: doc.title as string,
    description: doc.description as string,
    category: doc.category as Project['category'],
    objectives: doc.objectives as string,
    timeline: actualTimeline,
    resources: doc.resources as string,
    projectLink: doc.projectLink as string,
    members,
    checklist,
    leaderId: doc.leaderId as string,
    leaderEmail: doc.leaderEmail as string,
    status: doc.status as Project['status'],
    adminFeedback: adminFeedback,
    createdAt: doc.createdAt as string,
    updatedAt: doc.updatedAt as string,
  };
}

/**
 * 获取项目统计
 */
export async function getProjectStats(): Promise<{
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  revision: number;
}> {
  try {
    const projects = await getAllProjects();
    return {
      total: projects.length,
      pending: projects.filter(p => p.status === 'pending').length,
      approved: projects.filter(p => p.status === 'approved').length,
      rejected: projects.filter(p => p.status === 'rejected').length,
      revision: projects.filter(p => p.status === 'revision').length,
    };
  } catch {
    return { total: 0, pending: 0, approved: 0, rejected: 0, revision: 0 };
  }
}
