/* eslint-disable prettier/prettier */
'use client';

import { StudentLayout } from '@/components/layout/StudentLayout';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface Homework {
  homeworkId: string;
  title: string;
  description: string;
  subject: string;
  dueDate: string;
  attachments: string[];
  status: 'draft' | 'published' | 'closed';
  createdByName: string;
  createdAt: string;
}

interface Submission {
  submissionId: string;
  homeworkId: string;
  status: 'submitted' | 'late' | 'graded' | 'returned';
  grade?: string;
  feedback?: string;
  submittedAt: string;
}

export default function HomeworkPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [homework, setHomework] = useState<Homework[]>([]);
  const [submissions, setSubmissions] = useState<Record<string, Submission>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'submitted' | 'graded'>('all');

  const fetchHomework = useCallback(async () => {
    try {
      const response = await fetch('/api/homework?status=published,closed');
      const data = await response.json();

      if (data.success) {
        setHomework(data.homework || []);
      } else {
        setError(data.error || '加载功课失败');
      }
    } catch (err) {
      console.error('加载功课失败:', err);
      setError('加载功课失败，请稍后重试');
    }
  }, []);

  const fetchMySubmissions = useCallback(async () => {
    if (!user || !('studentId' in user) || !user.studentId) return;

    try {
      const response = await fetch(`/api/homework/my-submissions?studentId=${user.studentId}`);
      const data = await response.json();

      if (data.success) {
        // 转换为 homeworkId -> submission 的映射
        const submissionMap: Record<string, Submission> = {};
        for (const sub of data.submissions) {
          submissionMap[sub.homeworkId] = sub;
        }
        setSubmissions(submissionMap);
      }
    } catch (err) {
      console.error('加载提交记录失败:', err);
    }
  }, [user]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await fetchHomework();
      await fetchMySubmissions();
      setIsLoading(false);
    };
    loadData();
  }, [fetchHomework, fetchMySubmissions]);

  const filteredHomework = homework.filter((hw) => {
    const submission = submissions[hw.homeworkId];
    
    if (filterStatus === 'pending') {
      return !submission;
    }
    if (filterStatus === 'submitted') {
      return submission && (submission.status === 'submitted' || submission.status === 'late');
    }
    if (filterStatus === 'graded') {
      return submission && submission.status === 'graded';
    }
    return true;
  });

  const getStatusBadge = (hw: Homework) => {
    const submission = submissions[hw.homeworkId];
    const isOverdue = new Date() > new Date(hw.dueDate);

    // 如果功课已截止，显示截止状态
    if (hw.status === 'closed') {
      return <span className="px-2 py-1 text-xs rounded-full bg-gray-500/10 text-gray-500">已截止</span>;
    }

    if (!submission) {
      if (isOverdue) {
        return <span className="px-2 py-1 text-xs rounded-full bg-red-500/10 text-red-400">已过期</span>;
      }
      return <span className="px-2 py-1 text-xs rounded-full bg-amber-500/10 text-amber-400">待提交</span>;
    }

    switch (submission.status) {
      case 'submitted':
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-500/10 text-blue-400">已提交</span>;
      case 'late':
        return <span className="px-2 py-1 text-xs rounded-full bg-orange-500/10 text-orange-400">迟交</span>;
      case 'graded':
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-[#13ec80]/10 text-[#13ec80]">
            已评分: {submission.grade}
          </span>
        );
      case 'returned':
        return <span className="px-2 py-1 text-xs rounded-full bg-purple-500/10 text-purple-400">已退回</span>;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDaysRemaining = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diff = due.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (days < 0) return `已过期 ${Math.abs(days)} 天`;
    if (days === 0) return '今天截止';
    if (days === 1) return '明天截止';
    return `剩余 ${days} 天`;
  };

  if (authLoading || isLoading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[#13ec80] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">加载中...</p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <span className="material-symbols-outlined text-[#13ec80] text-4xl">assignment</span>
            功课栏
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">查看和提交功课</p>
        </div>

        {/* 筛选器 */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { key: 'all', label: '全部' },
            { key: 'pending', label: '待提交' },
            { key: 'submitted', label: '已提交' },
            { key: 'graded', label: '已评分' },
          ].map((filter) => (
            <button
              key={filter.key}
              onClick={() => setFilterStatus(filter.key as typeof filterStatus)}
              className={`px-4 py-2 rounded-lg transition-all ${
                filterStatus === filter.key
                  ? 'bg-[#13ec80] text-[#0d1117]'
                  : 'bg-gray-100 dark:bg-[#1a2632] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#243442]'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl p-4 mb-6">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* 功课列表 */}
        {filteredHomework.length === 0 ? (
          <div className="bg-white dark:bg-[#1a2632] border border-gray-200 dark:border-[#283946] rounded-2xl p-12 text-center shadow-sm dark:shadow-none">
            <span className="material-symbols-outlined text-6xl text-gray-400 dark:text-gray-600 mb-4">inbox</span>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">暂无功课</h3>
            <p className="text-gray-500 dark:text-gray-400">目前没有{filterStatus !== 'all' ? '符合条件的' : ''}功课</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredHomework.map((hw) => {
              const submission = submissions[hw.homeworkId];
              const isOverdue = new Date() > new Date(hw.dueDate);
              const isClosed = hw.status === 'closed';

              return (
                <Link
                  key={hw.homeworkId}
                  href={`/homework/${hw.homeworkId}`}
                  className={`bg-white dark:bg-[#1a2632] border border-gray-200 dark:border-[#283946] rounded-xl p-6 transition-all group shadow-sm dark:shadow-none ${
                    isClosed
                      ? 'opacity-75 hover:border-gray-300 dark:hover:border-[#3a4a56]'
                      : 'hover:border-[#13ec80]/50 dark:hover:border-[#13ec80]/30 hover:shadow-md'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-2 py-1 text-xs rounded-full bg-[#137fec]/10 text-[#137fec]">
                          {hw.subject}
                        </span>
                        {getStatusBadge(hw)}
                      </div>
                      <h3 className={`text-xl font-semibold group-hover:text-[#13ec80] transition-colors ${
                        isClosed ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-white'
                      }`}>
                        {hw.title}
                      </h3>
                      <p className={`mt-1 line-clamp-2 ${
                        isClosed ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {hw.description}
                      </p>
                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-400 dark:text-gray-500">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">person</span>
                          {hw.createdByName}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">calendar_today</span>
                          截止: {formatDate(hw.dueDate)}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={`text-sm font-medium ${
                          isClosed
                            ? 'text-gray-400 dark:text-gray-500'
                            : isOverdue && !submission
                            ? 'text-red-500 dark:text-red-400'
                            : 'text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        {isClosed ? '已截止' : getDaysRemaining(hw.dueDate)}
                      </span>
                      {!submission && !isOverdue && !isClosed && (
                        <span className="flex items-center gap-1 text-[#13ec80] text-sm">
                          点击提交
                          <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </span>
                      )}
                      {submission && submission.status === 'graded' && submission.feedback && (
                        <span className="text-xs text-gray-400 dark:text-gray-500">有老师反馈</span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* 登录提示 */}
        {!user && (
          <div className="mt-8 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-xl p-6 text-center">
            <span className="material-symbols-outlined text-4xl text-amber-500 dark:text-amber-400 mb-3">login</span>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">请先登录</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">登录后可以查看和提交功课</p>
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#13ec80] text-[#0d1117] rounded-lg font-medium hover:bg-[#0fd673] transition-colors"
            >
              <span className="material-symbols-outlined">login</span>
              前往登录
            </Link>
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
