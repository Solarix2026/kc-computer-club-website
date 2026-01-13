/* eslint-disable prettier/prettier */
'use client';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { ProjectChecklistComponent } from '@/components/projects/ProjectChecklist';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

interface TeamMember {
  userId: string;
  name: string;
  email: string;
  role: 'leader' | 'member' | 'tech_lead' | 'design_lead';
}

interface Project {
  projectId: string;
  teamName: string;
  title: string;
  description: string;
  category: string;
  objectives?: string;
  timeline?: string;
  resources?: string;
  projectLink?: string;
  members: TeamMember[];
  leaderId: string;
  leaderEmail: string;
  checklist?: {
    checklistId: string;
    projectId: string;
    title: string;
    items: Array<{
      id: string;
      title: string;
      description?: string;
      completed: boolean;
      completedAt?: string;
      assignee?: string;
    }>;
    createdAt: string;
    updatedAt: string;
  };
  status: 'pending' | 'approved' | 'rejected' | 'revision';
  adminFeedback?: string;
  createdAt: string;
  updatedAt: string;
}

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showShareMenu, setShowShareMenu] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/projects/${projectId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || '获取项目失败');
        }

        setProject(data.project);
      } catch (err) {
        const error = err as Error;
        setError(error.message);
        console.error('加载项目失败:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'code':
        return '👨‍💻';
      case 'design':
        return '🎨';
      case 'document':
        return '📄';
      case 'link':
        return '🔗';
      default:
        return '📎';
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'pending':
        return 'bg-amber-500/10 text-amber-400';
      case 'approved':
        return 'bg-[#13ec80]/10 text-[#13ec80]';
      case 'rejected':
        return 'bg-red-500/10 text-red-400';
      case 'revision':
        return 'bg-blue-500/10 text-blue-400';
      default:
        return 'bg-gray-500/10 text-gray-400';
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'pending':
        return '待审核';
      case 'approved':
        return '已批准';
      case 'rejected':
        return '已拒绝';
      case 'revision':
        return '需修改';
      default:
        return status;
    }
  };

  const getCategoryLabel = (category: string): string => {
    const categoryMap: Record<string, string> = {
      'web': '网页应用',
      'mobile': '移动应用',
      'ai': 'AI/ML',
      'game': '游戏开发',
      'iot': '物联网',
      'security': '网络安全',
      'data': '数据分析',
      'other': '其他',
    };
    return categoryMap[category] || category;
  };

  const getRoleLabel = (role: string): string => {
    const roleMap: Record<string, string> = {
      'leader': '组长',
      'member': '成员',
      'tech_lead': '技术负责',
      'design_lead': '设计负责',
    };
    return roleMap[role] || role;
  };

  // 加载中状态
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#102219] text-white">
        <Header />
        <main className="grow py-8 px-4 md:px-10 lg:px-20">
          <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[50vh]">
            <div className="flex flex-col items-center gap-4">
              <span className="material-symbols-outlined text-4xl text-[#13ec80] animate-spin">hourglass_empty</span>
              <p className="text-gray-400">加载中...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // 错误状态
  if (error || !project) {
    return (
      <div className="min-h-screen bg-[#102219] text-white">
        <Header />
        <main className="grow py-8 px-4 md:px-10 lg:px-20">
          <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[50vh]">
            <div className="text-center">
              <span className="material-symbols-outlined text-5xl text-red-400 mb-4 block">error</span>
              <h2 className="text-xl font-bold mb-2">加载失败</h2>
              <p className="text-gray-400 mb-4">{error || '项目不存在'}</p>
              <Link href="/projects">
                <button className="px-4 py-2 bg-[#13ec80] hover:bg-[#0fd673] text-[#102219] font-bold rounded-lg">
                  返回项目列表
                </button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#102219] text-white">
      <Header />

      <main className="grow py-8 px-4 md:px-10 lg:px-20">
        <div className="max-w-7xl mx-auto">
          {/* 页面头部 */}
          <div className="mb-8">
            <div className="text-sm text-gray-400 mb-4 flex items-center gap-2">
              <Link href="/projects" className="hover:text-white">项目</Link>
              <span className="material-symbols-outlined">chevron_right</span>
              <span>{project.title}</span>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-black mb-2">{project.title}</h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-4">
                  <p>修改于 {formatDate(project.updatedAt)}</p>
                  <span className="size-1 bg-gray-600 rounded-full"></span>
                  <p>创建于 {formatDate(project.createdAt)}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium ${getStatusColor(project.status)}`}>
                    {getStatusLabel(project.status)}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-lg bg-white/10 text-sm font-medium">
                    {getCategoryLabel(project.category)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="relative">
                  <Button
                    variant="secondary"
                    size="md"
                    rightIcon="share"
                    onClick={() => setShowShareMenu(!showShareMenu)}
                  >
                    分享
                  </Button>
                </div>
                {project.leaderEmail && (
                  <Link href={`/projects/${project.projectId}/edit`}>
                    <Button variant="primary" size="md" rightIcon="edit">
                      编辑项目
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* 主网格布局 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* 左列 - 内容 */}
            <div className="lg:col-span-2 space-y-8">
              {/* 概览卡片 */}
              <div className="bg-[#1a2c24] rounded-2xl p-6 lg:p-8 border border-white/10">
                <h3 className="text-lg font-bold mb-3">项目描述</h3>
                <p className="text-gray-400 leading-relaxed mb-6">{project.description}</p>

                {project.objectives && (
                  <>
                    <h3 className="text-lg font-bold mb-3 mt-6">项目目标</h3>
                    <p className="text-gray-400 leading-relaxed mb-6 whitespace-pre-wrap">{project.objectives}</p>
                  </>
                )}

                {project.timeline && (
                  <>
                    <h3 className="text-xs font-bold uppercase tracking-wider mb-3 mt-6">时间线</h3>
                    <p className="text-gray-400">{project.timeline}</p>
                  </>
                )}

                {project.resources && (
                  <>
                    <h3 className="text-xs font-bold uppercase tracking-wider mb-3 mt-6">所需资源</h3>
                    <p className="text-gray-400 whitespace-pre-wrap">{project.resources}</p>
                  </>
                )}
              </div>

              {/* 项目链接 */}
              {project.projectLink && (
                <div className="bg-[#1a2c24] rounded-2xl p-6 lg:p-8 border border-white/10">
                  <h3 className="text-lg font-bold mb-4">项目链接</h3>
                  <a
                    href={project.projectLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
                  >
                    <span className="material-symbols-outlined">open_in_new</span>
                    查看项目
                  </a>
                </div>
              )}

              {/* 管理员反馈 - 需修改时特别高亮显示 */}
              {project.adminFeedback && (
                <div className={`rounded-2xl p-6 lg:p-8 border ${
                  project.status === 'revision' 
                    ? 'bg-amber-900/20 border-amber-500/30' 
                    : project.status === 'rejected'
                    ? 'bg-red-900/20 border-red-500/30'
                    : 'bg-[#1a2c24] border-white/10'
                }`}>
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`material-symbols-outlined ${
                      project.status === 'revision' 
                        ? 'text-amber-400' 
                        : project.status === 'rejected'
                        ? 'text-red-400'
                        : 'text-[#13ec80]'
                    }`}>
                      {project.status === 'revision' ? 'edit_note' : project.status === 'rejected' ? 'cancel' : 'feedback'}
                    </span>
                    <h3 className={`text-lg font-bold ${
                      project.status === 'revision' 
                        ? 'text-amber-400' 
                        : project.status === 'rejected'
                        ? 'text-red-400'
                        : 'text-white'
                    }`}>
                      {project.status === 'revision' 
                        ? '需要修改 - 管理员反馈' 
                        : project.status === 'rejected'
                        ? '已拒绝 - 管理员反馈'
                        : '管理员反馈'}
                    </h3>
                  </div>
                  <div className={`rounded-lg p-4 whitespace-pre-wrap ${
                    project.status === 'revision' 
                      ? 'bg-amber-950/50 text-amber-100 border border-amber-500/20' 
                      : project.status === 'rejected'
                      ? 'bg-red-950/50 text-red-100 border border-red-500/20'
                      : 'bg-[#101922] text-gray-300'
                  }`}>
                    {project.adminFeedback}
                  </div>
                  {project.status === 'revision' && (
                    <div className="mt-4 flex items-center gap-2 text-amber-400 text-sm">
                      <span className="material-symbols-outlined text-lg">info</span>
                      <span>请根据反馈修改项目后重新提交</span>
                    </div>
                  )}
                </div>
              )}

              {/* 项目检查清单 */}
              {project.status === 'approved' && (
                <ProjectChecklistComponent
                  projectId={project.projectId}
                  checklist={project.checklist}
                  isReadOnly={false}
                  projectMembers={project.members}
                  leaderEmail={project.leaderEmail}
                />
              )}
            </div>

            {/* 右列 - 侧边栏 */}
            <div className="space-y-6">
              {/* 团队信息 */}
              <div className="bg-[#1a2c24] rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-bold mb-4">团队信息</h3>
                <div className="space-y-3 mb-4">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">团队名称</p>
                    <p className="font-bold">{project.teamName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">成员数</p>
                    <p className="font-bold">{project.members.length} 人</p>
                  </div>
                </div>
              </div>

              {/* 团队成员 */}
              <div className="bg-[#1a2c24] rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-bold mb-4">团队成员（{project.members.length} 人）</h3>
                <div className="space-y-3">
                  {project.members.map((member, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-[#101922] rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-[#13ec80]/20 flex items-center justify-center text-[#13ec80] font-bold text-sm">
                        {member.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{member.name}</p>
                        <p className="text-xs text-gray-400 truncate">{member.email}</p>
                      </div>
                      <span className={`flex-shrink-0 px-2 py-1 text-xs rounded-full whitespace-nowrap ${
                        member.role === 'leader' 
                          ? 'bg-[#13ec80]/20 text-[#13ec80]' 
                          : 'bg-white/10 text-gray-300'
                      }`}>
                        {getRoleLabel(member.role)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 项目状态 */}
              <div className="bg-[#1a2c24] rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-bold mb-4">状态</h3>
                <div className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-bold ${getStatusColor(project.status)}`}>
                  {getStatusLabel(project.status)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
