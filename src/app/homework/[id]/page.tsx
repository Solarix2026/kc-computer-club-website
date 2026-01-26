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
  const [attachments, setAttachments] = useState<string[]>([]);
  const [newAttachment, setNewAttachment] = useState('');
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper function to ensure URL has proper protocol
  const ensureHttpProtocol = (url: string): string => {
    const trimmed = url.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }
    return `https://${trimmed}`;
  };

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      showNotification('文件大小不能超过 10MB', 'error');
      return;
    }

    setIsUploadingFile(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success && data.url) {
        setAttachments([...attachments, data.url]);
        showNotification('文件上传成功', 'success');
        // Reset file input
        e.target.value = '';
      } else {
        showNotification(data.error || '文件上传失败', 'error');
      }
    } catch (err) {
      console.error('文件上传失败:', err);
      showNotification('文件上传失败，请稍后重试', 'error');
    } finally {
      setIsUploadingFile(false);
    }
  };

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
          setAttachments(submission.attachments || []);
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
          attachments,
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
          attachments,
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
            <p className="text-gray-500 dark:text-gray-400">加载中...</p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  if (error || !homework) {
    return (
      <StudentLayout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl p-6 text-center">
            <span className="material-symbols-outlined text-4xl text-red-500 dark:text-red-400 mb-3">error</span>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">加载失败</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">{error || '功课不存在'}</p>
            <Link href="/homework" className="text-[#13ec80] hover:underline">
              返回功课列表
            </Link>
          </div>
        </div>
      </StudentLayout>
    );
  }

  const isOverdue = new Date() > new Date(homework.dueDate);
  const canSubmit = !mySubmission && !isOverdue && user && homework.status === 'published';
  // 允许更新：未评分 且 (未过期 或 被退回) 且 功课未关闭
  const canUpdate = mySubmission && mySubmission.status !== 'graded' && user && homework.status !== 'closed' &&
    (!isOverdue || mySubmission.status === 'returned');

  return (
    <StudentLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 返回链接 */}
        <Link
          href="/homework"
          className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          返回功课列表
        </Link>

        {/* 功课详情 */}
        <div className="bg-white dark:bg-[#1a2632] border border-gray-200 dark:border-[#283946] rounded-2xl overflow-hidden shadow-sm dark:shadow-none">
          {/* 头部 */}
          <div className="p-6 border-b border-gray-200 dark:border-[#283946]">
            <div className="flex items-center gap-3 mb-3">
              <span className="px-3 py-1 rounded-full bg-[#137fec]/10 text-[#137fec]">
                {homework.subject}
              </span>
              {getStatusBadge()}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{homework.title}</h1>
            <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
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
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">功课要求</h2>
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{homework.description}</p>
            </div>

            {/* 附件 */}
            {homework.attachments && homework.attachments.length > 0 && (
              <div className="mt-6">
                <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-2">附件</h3>
                <div className="flex flex-wrap gap-2">
                  {homework.attachments.map((url, index) => (
                    <a
                      key={index}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-[#243442] rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#2d4050] transition-colors"
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
            <div className="bg-white dark:bg-[#1a2632] border border-gray-200 dark:border-[#283946] rounded-xl p-4 text-center shadow-sm dark:shadow-none">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">总提交</div>
            </div>
            <div className="bg-white dark:bg-[#1a2632] border border-gray-200 dark:border-[#283946] rounded-xl p-4 text-center shadow-sm dark:shadow-none">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.submitted}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">已提交</div>
            </div>
            <div className="bg-white dark:bg-[#1a2632] border border-gray-200 dark:border-[#283946] rounded-xl p-4 text-center shadow-sm dark:shadow-none">
              <div className="text-2xl font-bold text-orange-500 dark:text-orange-400">{stats.late}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">迟交</div>
            </div>
            <div className="bg-white dark:bg-[#1a2632] border border-gray-200 dark:border-[#283946] rounded-xl p-4 text-center shadow-sm dark:shadow-none">
              <div className="text-2xl font-bold text-[#13ec80]">{stats.graded}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">已评分</div>
            </div>
          </div>
        )}

        {/* 我的提交 / 提交表单 */}
        <div className="mt-6 bg-white dark:bg-[#1a2632] border border-gray-200 dark:border-[#283946] rounded-2xl p-6 shadow-sm dark:shadow-none">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#13ec80]">edit_document</span>
            {mySubmission ? '我的提交' : '提交功课'}
          </h2>

          {/* 评分和反馈 */}
          {mySubmission && mySubmission.status === 'graded' && (
            <div className="mb-6 p-4 bg-[#13ec80]/5 border border-[#13ec80]/20 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-500 dark:text-gray-400">评分</span>
                <span className="text-2xl font-bold text-[#13ec80]">{mySubmission.grade}</span>
              </div>
              {mySubmission.feedback && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400 text-sm">老师反馈</span>
                  <p className="text-gray-900 dark:text-white mt-1">{mySubmission.feedback}</p>
                </div>
              )}
              {mySubmission.gradedAt && (
                <div className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                  评分时间: {formatDate(mySubmission.gradedAt)}
                </div>
              )}
            </div>
          )}

          {/* 退回提示 */}
          {mySubmission && mySubmission.status === 'returned' && (
            <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/30 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-purple-500">undo</span>
                <span className="font-medium text-purple-700 dark:text-purple-400">功课已退回</span>
              </div>
              {mySubmission.feedback && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400 text-sm">老师留言</span>
                  <p className="text-gray-900 dark:text-white mt-1">{mySubmission.feedback}</p>
                </div>
              )}
              <p className="text-purple-600 dark:text-purple-300 text-sm mt-2">
                请根据老师的反馈修改后重新提交
              </p>
            </div>
          )}

          {/* 提交时间 */}
          {mySubmission && (
            <div className="mb-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                提交时间: {formatDate(mySubmission.submittedAt)}
              </div>
              {mySubmission.attachments && mySubmission.attachments.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">提交的附件:</p>
                  <div className="flex flex-wrap gap-2">
                    {mySubmission.attachments.map((url, index) => (
                      <a
                        key={index}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-3 py-1 bg-blue-50 dark:bg-blue-500/10 rounded-lg text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">link</span>
                        附件 {index + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 内容输入 */}
          {user ? (
            <>
              {/* 附件/链接上传 */}
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                  附件链接 <span className="text-gray-500">(可选)</span>
                </label>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={newAttachment}
                      onChange={(e) => setNewAttachment(e.target.value)}
                      placeholder="粘贴文件链接 (Google Drive, GitHub, 等)..."
                      disabled={mySubmission?.status === 'graded' || homework.status === 'closed'}
                      className="flex-1 bg-gray-50 dark:bg-[#0d1117] border border-gray-200 dark:border-[#283946] rounded-lg px-4 py-2 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#13ec80] disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newAttachment.trim()) {
                          const validUrl = ensureHttpProtocol(newAttachment);
                          setAttachments([...attachments, validUrl]);
                          setNewAttachment('');
                        }
                      }}
                      disabled={!newAttachment.trim() || mySubmission?.status === 'graded' || homework.status === 'closed'}
                      className="px-4 py-2 bg-[#13ec80] text-[#0d1117] rounded-lg hover:bg-[#0fd673] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      添加
                    </button>
                  </div>

                  {/* 文件上传按钮 */}
                  <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-[#0d1117] border border-gray-200 dark:border-[#283946] rounded-lg">
                    <span className="material-symbols-outlined text-gray-500">upload_file</span>
                    <label className="flex-1 cursor-pointer">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {isUploadingFile ? '上传中...' : '或点击上传文件 (最大 10MB)'}
                      </span>
                      <input
                        type="file"
                        onChange={handleFileUpload}
                        disabled={mySubmission?.status === 'graded' || homework.status === 'closed' || isUploadingFile}
                        className="hidden"
                        accept="*/*"
                      />
                    </label>
                    {isUploadingFile && (
                      <div className="w-5 h-5 border-2 border-[#13ec80] border-t-transparent rounded-full animate-spin" />
                    )}
                  </div>
                  
                  {/* 已添加的附件列表 */}
                  {attachments.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs text-gray-500">已添加 {attachments.length} 个链接：</p>
                      {attachments.map((attachment, index) => {
                        const isUploadedFile = attachment.includes('/api/upload/');
                        const fileName = isUploadedFile ? decodeURIComponent(attachment.split('/').pop() || 'file') : attachment;
                        return (
                          <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-[#0d1117] rounded-lg border border-gray-200 dark:border-[#283946]">
                            <span className="material-symbols-outlined text-sm text-[#13ec80]">
                              {isUploadedFile ? 'description' : 'link'}
                            </span>
                            <a 
                              href={attachment} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex-1 text-sm text-[#137fec] hover:underline truncate"
                              title={attachment}
                            >
                              {isUploadedFile ? fileName : attachment}
                            </a>
                            <button
                              type="button"
                              onClick={() => {
                                setAttachments(attachments.filter((_, i) => i !== index));
                              }}
                              disabled={mySubmission?.status === 'graded' || homework.status === 'closed'}
                              className="p-1 text-gray-400 hover:text-red-400 hover:bg-gray-100 dark:hover:bg-[#283946] rounded transition-colors disabled:opacity-50"
                            >
                              <span className="material-symbols-outlined text-sm">close</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="在此输入功课内容..."
                disabled={mySubmission?.status === 'graded' || homework.status === 'closed'}
                className="w-full h-48 bg-gray-50 dark:bg-[#0d1117] border border-gray-200 dark:border-[#283946] rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#13ec80] disabled:opacity-50 disabled:cursor-not-allowed"
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

                {!canSubmit && !canUpdate && mySubmission?.status !== 'graded' && (homework.status === 'closed' || isOverdue) && (
                  <p className="text-gray-400">功课已截止，无法提交</p>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <span className="material-symbols-outlined text-4xl text-gray-400 dark:text-gray-600 mb-3">login</span>
              <p className="text-gray-500 dark:text-gray-400 mb-4">请登录后提交功课</p>
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
            <p className="text-sm text-gray-900 dark:text-white">{toastMessage}</p>
            <button
              onClick={() => setShowToast(false)}
              className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>
        </div>
      )}
    </StudentLayout>
  );
}
