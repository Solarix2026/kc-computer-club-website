/* eslint-disable prettier/prettier */
'use client';

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';

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
  status: 'pending' | 'approved' | 'rejected' | 'revision';
  adminFeedback?: string;
  createdAt: string;
  updatedAt: string;
}

interface ProjectStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export default function AdminProjectsPage() {
  const [stats, setStats] = useState<ProjectStats>({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'revision'>('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // 加载项目数据
  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/projects?stats=true');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '获取项目列表失败');
      }

      setProjects(data.projects || []);
      if (data.stats) {
        setStats(data.stats);
      }
    } catch (err) {
      const error = err as Error;
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const getCategoryLabel = (category: string): string => {
    const labels: Record<string, string> = {
      'web': '网页应用开发',
      'mobile': '移动应用开发',
      'ai': '人工智能/机器学习',
      'game': '游戏开发',
      'iot': '物联网',
      'security': '网络安全',
      'data': '数据分析',
      'other': '其他',
    };
    return labels[category] || category;
  };

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('zh-CN');
  };

  const filteredProjects = projects.filter((project) => {
    const matchesFilter = filter === 'all' || project.status === filter;
    const matchesSearch = searchQuery === '' || 
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.teamName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const statusLabels: Record<string, string> = {
    pending: '待审核',
    approved: '已批准',
    rejected: '已拒绝',
    revision: '需修改',
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    revision: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  };

  const roleLabels: Record<string, string> = {
    leader: '组长',
    member: '成员',
    tech_lead: '技术负责',
    design_lead: '设计负责',
  };

  const handleApprove = async (projectId: string) => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '操作失败');
      }

      await fetchProjects();
      setShowModal(false);
      setSelectedProject(null);
    } catch (err) {
      const error = err as Error;
      alert(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (projectId: string) => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'reject',
          feedback: feedbackText || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '操作失败');
      }

      await fetchProjects();
      setShowModal(false);
      setSelectedProject(null);
      setFeedbackText('');
    } catch (err) {
      const error = err as Error;
      alert(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestRevision = async (projectId: string) => {
    if (!feedbackText.trim()) {
      alert('请填写修改意见');
      return;
    }
    setActionLoading(true);
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'revision',
          feedback: feedbackText,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '操作失败');
      }

      await fetchProjects();
      setShowModal(false);
      setSelectedProject(null);
      setFeedbackText('');
    } catch (err) {
      const error = err as Error;
      alert(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  // 加载中状态
  if (isLoading) {
    return (
      <AdminLayout>
        <div className="p-6 lg:p-8 flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <span className="material-symbols-outlined text-4xl text-[#13ec80] animate-spin">hourglass_empty</span>
            <p className="text-[#8ba396]">加载中...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // 错误状态
  if (error) {
    return (
      <AdminLayout>
        <div className="p-6 lg:p-8 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <span className="material-symbols-outlined text-5xl text-red-400 mb-4">error</span>
            <h2 className="text-xl font-bold text-white mb-2">加载失败</h2>
            <p className="text-[#8ba396] mb-4">{error}</p>
            <button
              onClick={fetchProjects}
              className="h-10 px-4 bg-[#13ec80] hover:bg-[#0fd673] text-[#102219] font-medium rounded-lg transition-colors"
            >
              重试
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8">
        {/* 页面标题 */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">项目计划审核</h1>
            <p className="text-[#8ba396] mt-1">审核学生提交的项目计划提案</p>
          </div>
        </div>

        {/* 统计卡片 - 蓝色主题 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#1a2632] rounded-xl p-6 border border-[#2a3c4a]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#137fec]/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl text-[#137fec]">folder</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
                <p className="text-sm text-[#8ba3a6]">总提案数</p>
              </div>
            </div>
          </div>

          <div className="bg-[#1a2632] rounded-xl p-6 border border-[#2a3c4a]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl text-amber-400">pending</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.pending}</p>
                <p className="text-sm text-[#8ba3a6]">待审核</p>
              </div>
            </div>
          </div>

          <div className="bg-[#1a2632] rounded-xl p-6 border border-[#2a3c4a]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl text-green-400">check_circle</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.approved}</p>
                <p className="text-sm text-[#8ba3a6]">已批准</p>
              </div>
            </div>
          </div>

          <div className="bg-[#1a2632] rounded-xl p-6 border border-[#2a3c4a]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl text-red-400">cancel</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.rejected}</p>
                <p className="text-sm text-[#8ba3a6]">已拒绝</p>
              </div>
            </div>
          </div>
        </div>

        {/* 筛选和搜索 - 蓝色主题 */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex items-center gap-2 p-1 bg-[#1a2632] rounded-xl border border-[#2a3c4a]">
            {(['all', 'pending', 'approved', 'rejected', 'revision'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === status
                    ? 'bg-[#137fec] text-white'
                    : 'text-[#8ba3a6] hover:text-white'
                }`}
              >
                {status === 'all' ? '全部' : statusLabels[status]}
              </button>
            ))}
          </div>

          <div className="flex-1 min-w-50 max-w-md">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#6189a5]">search</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索项目或团队名称..."
                className="w-full h-10 pl-10 pr-4 rounded-xl bg-[#1a2632] border border-[#2a3c4a] text-sm text-white placeholder:text-[#6189a5] focus:outline-none focus:ring-2 focus:ring-[#137fec]"
              />
            </div>
          </div>
        </div>

        {/* 项目列表 - 蓝色主题 */}
        <div className="grid gap-4">
          {filteredProjects.map((project) => (
            <div
              key={project.projectId}
              className="bg-[#1a2632] rounded-xl border border-[#2a3c4a] p-6 hover:border-[#137fec]/50 transition-colors"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-white">{project.title}</h3>
                    <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${statusColors[project.status]}`}>
                      {statusLabels[project.status]}
                    </span>
                  </div>
                  <p className="text-sm text-[#8ba396] mb-4 line-clamp-2">{project.description}</p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-[#618975]">
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-lg">groups</span>
                      <span>{project.teamName}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-lg">category</span>
                      <span>{getCategoryLabel(project.category)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-lg">person</span>
                      <span>{project.members.find(m => m.role === 'leader')?.name || '未知'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-lg">group</span>
                      <span>{project.members.length} 人</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-lg">schedule</span>
                      <span>{formatDate(project.createdAt)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedProject(project);
                      setFeedbackText(project.adminFeedback || '');
                      setShowModal(true);
                    }}
                    className="flex items-center gap-2 h-10 px-4 bg-[#101922] hover:bg-[#137fec]/10 text-white rounded-lg transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">visibility</span>
                    查看详情
                  </button>
                  {project.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(project.projectId)}
                        disabled={actionLoading}
                        className="flex items-center gap-2 h-10 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                      >
                        <span className="material-symbols-outlined text-lg">check</span>
                        批准
                      </button>
                      <button
                        onClick={() => handleReject(project.projectId)}
                        disabled={actionLoading}
                        className="flex items-center gap-2 h-10 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
                      >
                        <span className="material-symbols-outlined text-lg">close</span>
                        拒绝
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}

          {filteredProjects.length === 0 && (
            <div className="bg-[#1a2632] rounded-xl border border-[#2a3c4a] p-12 text-center">
              <span className="material-symbols-outlined text-5xl text-[#2a3c4a] mb-4">folder_off</span>
              <p className="text-[#8ba3a6]">暂无项目提案</p>
            </div>
          )}
        </div>

        {/* 项目详情弹窗 - 蓝色主题 */}
        {showModal && selectedProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-[#1a2632] rounded-2xl border border-[#2a3c4a] w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-[#2a3c4a]">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white">{selectedProject.title}</h2>
                    <p className="text-sm text-[#8ba396] mt-1">团队：{selectedProject.teamName}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setSelectedProject(null);
                      setFeedbackText('');
                    }}
                    className="p-2 hover:bg-[#102219] rounded-lg transition-colors"
                  >
                    <span className="material-symbols-outlined text-[#8ba396]">close</span>
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-[#8ba396] mb-2">项目类别</h4>
                    <p className="text-white">{getCategoryLabel(selectedProject.category)}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-[#8ba396] mb-2">当前状态</h4>
                    <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${statusColors[selectedProject.status]}`}>
                      {statusLabels[selectedProject.status]}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-[#8ba396] mb-2">项目描述</h4>
                  <p className="text-white whitespace-pre-wrap">{selectedProject.description}</p>
                </div>

                {selectedProject.objectives && (
                  <div>
                    <h4 className="text-sm font-medium text-[#8ba396] mb-2">项目目标</h4>
                    <p className="text-white whitespace-pre-wrap">{selectedProject.objectives}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {selectedProject.timeline && (
                    <div>
                      <h4 className="text-sm font-medium text-[#8ba396] mb-2">预计时间线</h4>
                      <p className="text-white">{selectedProject.timeline}</p>
                    </div>
                  )}
                  {selectedProject.resources && (
                    <div>
                      <h4 className="text-sm font-medium text-[#8ba396] mb-2">所需资源</h4>
                      <p className="text-white">{selectedProject.resources}</p>
                    </div>
                  )}
                </div>

                {selectedProject.projectLink && (
                  <div>
                    <h4 className="text-sm font-medium text-[#8ba396] mb-2">项目链接</h4>
                    <a 
                      href={selectedProject.projectLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#137fec] hover:underline inline-flex items-center gap-1"
                    >
                      {selectedProject.projectLink}
                      <span className="material-symbols-outlined text-sm">open_in_new</span>
                    </a>
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-medium text-[#8ba3a6] mb-3">团队成员（{selectedProject.members.length} 人）</h4>
                  <div className="grid gap-2">
                    {selectedProject.members.map((member, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-[#101922] rounded-lg">
                        <div className="w-10 h-10 rounded-full bg-[#137fec]/20 flex items-center justify-center text-[#137fec] font-bold">
                          {member.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">{member.name}</p>
                          <p className="text-xs text-[#6189a5]">{member.email}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          member.role === 'leader' 
                            ? 'bg-[#137fec]/20 text-[#137fec]' 
                            : 'bg-[#283039] text-[#8ba3a6]'
                        }`}>
                          {roleLabels[member.role]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-[#8ba396] mb-2">提交时间</h4>
                    <p className="text-white">{formatDate(selectedProject.createdAt)}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-[#8ba396] mb-2">最后更新</h4>
                    <p className="text-white">{formatDate(selectedProject.updatedAt)}</p>
                  </div>
                </div>

                {/* 反馈输入框 - 蓝色主题 */}
                {(selectedProject.status === 'pending' || selectedProject.adminFeedback) && (
                  <div>
                    <h4 className="text-sm font-medium text-[#8ba3a6] mb-2">管理员反馈</h4>
                    {selectedProject.status === 'pending' ? (
                      <textarea
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        placeholder="输入反馈意见（要求修改时必填）..."
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl bg-[#101922] border border-[#2a3c4a] text-white placeholder:text-[#6189a5] focus:outline-none focus:ring-2 focus:ring-[#137fec] resize-none"
                      />
                    ) : selectedProject.adminFeedback ? (
                      <p className="text-white bg-[#101922] p-4 rounded-xl">{selectedProject.adminFeedback}</p>
                    ) : null}
                  </div>
                )}
              </div>
              <div className="p-6 border-t border-[#2a3c4a] flex flex-wrap justify-end gap-3">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedProject(null);
                    setFeedbackText('');
                  }}
                  className="h-10 px-4 bg-[#101922] hover:bg-[#283039] text-white rounded-lg transition-colors"
                >
                  关闭
                </button>
                {selectedProject.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleRequestRevision(selectedProject.projectId)}
                      disabled={actionLoading}
                      className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                      {actionLoading ? '处理中...' : '要求修改'}
                    </button>
                    <button
                      onClick={() => handleReject(selectedProject.projectId)}
                      disabled={actionLoading}
                      className="h-10 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                      {actionLoading ? '处理中...' : '拒绝'}
                    </button>
                    <button
                      onClick={() => handleApprove(selectedProject.projectId)}
                      disabled={actionLoading}
                      className="h-10 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                      {actionLoading ? '处理中...' : '批准'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
