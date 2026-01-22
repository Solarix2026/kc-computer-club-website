/* eslint-disable prettier/prettier */
'use client';

import { StudentLayout } from '@/components/layout/StudentLayout';
import Link from 'next/link';
import { useState, useEffect, useCallback, use } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface Homework {
  homeworkId: string;
  title: string;
  description: string;
  subject: string;
  dueDate: string;
  attachments: string[];
  allowedFileTypes: string[];
  maxFileSize: number;
  status: 'draft' | 'published' | 'closed';
  createdByName: string;
  createdAt: string;
}

interface Submission {
  submissionId: string;
  homeworkId: string;
  studentId: string;
  studentName: string;
  content: string;
  attachments: string[];
  status: 'submitted' | 'late' | 'graded' | 'returned';
  grade?: string;
  feedback?: string;
  submittedAt: string;
  gradedAt?: string;
}

interface Stats {
  total: number;
  submitted: number;
  late: number;
  graded: number;
}

export default function HomeworkDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  
  const [homework, setHomework] = useState<Homework | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const showNotification = (message: string, type: 'success' | 'error') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };
  const [stats, setStats] = useState<Stats | null>(null);
  const [mySubmission, setMySubmission] = useState<Submission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchHomework = useCallback(async () => {
    try {
      const response = await fetch(`/api/homework/${id}`);
      const data = await response.json();

      if (data.success) {
        setHomework(data.homework);
        setStats(data.stats);
      } else {
        setError(data.error || '加载功课失败');
      }
    } catch (err) {
      console.error('加载功课失败:', err);
      setError('加载功课失败');
    }
  }, [id]);

  const fetchMySubmission = useCallback(async () => {
    if (!user || !('studentId' in user) || !user.studentId) return;

    try {
      const response = await fetch(`/api/homework/my-submissions?studentId=${user.studentId}`);
      const data = await response.json();

      if (data.success) {
        const submission = data.submissions.find((s: Submission) => s.homeworkId === id);
        if (submission) {
          setMySubmission(submission);
          setContent(submission.content || '');
        }
      }
    } catch (err) {
      console.error('加载提交记录失败:', err);
    }
  }, [id, user]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await fetchHomework();
      await fetchMySubmission();
      setIsLoading(false);
    };
    loadData();
  }, [fetchHomework, fetchMySubmission]);

  const handleSubmit = async () => {
    if (!user || !('studentId' in user)) {
      showNotification('请先登录学生账号', 'error');
      return;
    }

    if (!content.trim()) {
      showNotification('请填写功课内容', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/homework/${id}/submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: user.studentId,
          studentName: user.name || ('chineseName' in user ? user.chineseName : ''),
          studentEmail: user.email,
          content,
          attachments: [],
        }),
      });

      const data = await response.json();

      if (data.success) {
        showNotification(data.message || '提交成功', 'success');
        setMySubmission(data.submission);
      } else {
        showNotification(data.error || '提交失败', 'error');
      }
    } catch (err) {
      console.error('提交失败:', err);
      showNotification('提交失败，请稍后重试', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!mySubmission) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/homework/submissions/${mySubmission.submissionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
        }),
      });

      const data = await response.json();

      if (data.success) {
        showNotification('更新成功', 'success');
        setMySubmission(data.submission);
      } else {
        showNotification(data.error || '更新失败', 'error');
      }
    } catch (err) {
      console.error('更新失败:', err);
      showNotification('更新失败，请稍后重试', 'error');
    } finally {
      setIsSubmitting(false);
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

  const getStatusBadge = () => {
    if (!mySubmission) {
      const isOverdue = homework && new Date() > new Date(homework.dueDate);
      if (isOverdue) {
        return <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-400">已过期</span>;
      }
      return <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400">待提交</span>;
    }

    switch (mySubmission.status) {
      case 'submitted':
        return <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400">已提交</span>;
      case 'late':
        return <span className="px-3 py-1 rounded-full bg-orange-500/10 text-orange-400">迟交</span>;
      case 'graded':
        return <span className="px-3 py-1 rounded-full bg-[#13ec80]/10 text-[#13ec80]">已评分</span>;
      case 'returned':
        return <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-400">已退回</span>;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[#13ec80] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">加载中...</p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  if (error || !homework) {
    return (
      <StudentLayout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
            <span className="material-symbols-outlined text-4xl text-red-400 mb-3">error</span>
            <h3 className="text-xl font-semibold text-white mb-2">加载失败</h3>
            <p className="text-gray-400 mb-4">{error || '功课不存在'}</p>
            <Link href="/homework" className="text-[#13ec80] hover:underline">
              返回功课列表
            </Link>
          </div>
        </div>
      </StudentLayout>
    );
  }

  const isOverdue = new Date() > new Date(homework.dueDate);
  const canSubmit = !mySubmission && !isOverdue && user;
  const canUpdate = mySubmission && mySubmission.status !== 'graded' && user;

  return (
    <StudentLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 返回链接 */}
        <Link
          href="/homework"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          返回功课列表
        </Link>

        {/* 功课详情 */}
        <div className="bg-[#1a2632] border border-[#283946] rounded-2xl overflow-hidden">
          {/* 头部 */}
          <div className="p-6 border-b border-[#283946]">
            <div className="flex items-center gap-3 mb-3">
              <span className="px-3 py-1 rounded-full bg-[#137fec]/10 text-[#137fec]">
                {homework.subject}
              </span>
              {getStatusBadge()}
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">{homework.title}</h1>
            <div className="flex flex-wrap gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">person</span>
                {homework.createdByName}
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">schedule</span>
                发布: {formatDate(homework.createdAt)}
              </span>
              <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-400' : ''}`}>
                <span className="material-symbols-outlined text-sm">event</span>
                截止: {formatDate(homework.dueDate)}
              </span>
            </div>
          </div>

          {/* 内容 */}
          <div className="p-6">
            <h2 className="text-lg font-semibold text-white mb-3">功课要求</h2>
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-300 whitespace-pre-wrap">{homework.description}</p>
            </div>

            {/* 附件 */}
            {homework.attachments && homework.attachments.length > 0 && (
              <div className="mt-6">
                <h3 className="text-md font-semibold text-white mb-2">附件</h3>
                <div className="flex flex-wrap gap-2">
                  {homework.attachments.map((url, index) => (
                    <a
                      key={index}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 bg-[#243442] rounded-lg text-gray-300 hover:bg-[#2d4050] transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">attach_file</span>
                      附件 {index + 1}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 提交统计 */}
        {stats && (
          <div className="mt-6 grid grid-cols-4 gap-4">
            <div className="bg-[#1a2632] border border-[#283946] rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-white">{stats.total}</div>
              <div className="text-sm text-gray-400">总提交</div>
            </div>
            <div className="bg-[#1a2632] border border-[#283946] rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">{stats.submitted}</div>
              <div className="text-sm text-gray-400">已提交</div>
            </div>
            <div className="bg-[#1a2632] border border-[#283946] rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-orange-400">{stats.late}</div>
              <div className="text-sm text-gray-400">迟交</div>
            </div>
            <div className="bg-[#1a2632] border border-[#283946] rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-[#13ec80]">{stats.graded}</div>
              <div className="text-sm text-gray-400">已评分</div>
            </div>
          </div>
        )}

        {/* 我的提交 / 提交表单 */}
        <div className="mt-6 bg-[#1a2632] border border-[#283946] rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#13ec80]">edit_document</span>
            {mySubmission ? '我的提交' : '提交功课'}
          </h2>

          {/* 评分和反馈 */}
          {mySubmission && mySubmission.status === 'graded' && (
            <div className="mb-6 p-4 bg-[#13ec80]/5 border border-[#13ec80]/20 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-400">评分</span>
                <span className="text-2xl font-bold text-[#13ec80]">{mySubmission.grade}</span>
              </div>
              {mySubmission.feedback && (
                <div>
                  <span className="text-gray-400 text-sm">老师反馈</span>
                  <p className="text-white mt-1">{mySubmission.feedback}</p>
                </div>
              )}
              {mySubmission.gradedAt && (
                <div className="text-xs text-gray-500 mt-2">
                  评分时间: {formatDate(mySubmission.gradedAt)}
                </div>
              )}
            </div>
          )}

          {/* 提交时间 */}
          {mySubmission && (
            <div className="mb-4 text-sm text-gray-400">
              提交时间: {formatDate(mySubmission.submittedAt)}
            </div>
          )}

          {/* 内容输入 */}
          {user ? (
            <>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="在此输入功课内容..."
                disabled={mySubmission?.status === 'graded'}
                className="w-full h-48 bg-[#0d1117] border border-[#283946] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#13ec80] disabled:opacity-50 disabled:cursor-not-allowed"
              />

              {/* 提交按钮 */}
              <div className="mt-4 flex gap-3">
                {canSubmit && (
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !content.trim()}
                    className="flex items-center gap-2 px-6 py-3 bg-[#13ec80] text-[#0d1117] rounded-lg font-medium hover:bg-[#0fd673] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-[#0d1117] border-t-transparent rounded-full animate-spin" />
                        提交中...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined">send</span>
                        提交功课
                      </>
                    )}
                  </button>
                )}

                {canUpdate && (
                  <button
                    onClick={handleUpdate}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-6 py-3 bg-[#137fec] text-white rounded-lg font-medium hover:bg-[#0f5fcc] transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        更新中...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined">update</span>
                        更新提交
                      </>
                    )}
                  </button>
                )}

                {!canSubmit && !canUpdate && mySubmission?.status !== 'graded' && isOverdue && (
                  <p className="text-red-400">功课已过期，无法提交</p>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <span className="material-symbols-outlined text-4xl text-gray-600 mb-3">login</span>
              <p className="text-gray-400 mb-4">请登录后提交功课</p>
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
      </div>

      {/* Toast 通知 */}
      {showToast && (
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-right-full duration-300">
          <div className={`flex items-center gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-xl ${
            toastType === 'success' 
              ? 'bg-green-500/20 border-green-500/30' 
              : 'bg-red-500/20 border-red-500/30'
          }`}>
            <span className={`material-symbols-outlined ${
              toastType === 'success' ? 'text-green-500' : 'text-red-500'
            }`}>
              {toastType === 'success' ? 'check_circle' : 'error'}
            </span>
            <p className="text-sm text-white">{toastMessage}</p>
            <button
              onClick={() => setShowToast(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>
        </div>
      )}
    </StudentLayout>
  );
}
