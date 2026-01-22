/* eslint-disable prettier/prettier */
'use client';

import { AdminLayout } from '@/components/layout/AdminLayout';
import Link from 'next/link';
import { useState, useEffect, useCallback, use } from 'react';

interface Homework {
  homeworkId: string;
  title: string;
  description: string;
  subject: string;
  dueDate: string;
  status: 'draft' | 'published' | 'closed';
  createdByName: string;
  createdAt: string;
}

interface Submission {
  submissionId: string;
  homeworkId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  content: string;
  attachments: string[];
  status: 'submitted' | 'late' | 'graded' | 'returned';
  grade?: string;
  feedback?: string;
  submittedAt: string;
  gradedAt?: string;
}

export default function AdminHomeworkDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  
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
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [gradeForm, setGradeForm] = useState({ grade: '', feedback: '' });
  const [isGrading, setIsGrading] = useState(false);
  const [isReturning, setIsReturning] = useState(false);
  const [returnReason, setReturnReason] = useState('');
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returningSubmission, setReturningSubmission] = useState<Submission | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'submitted' | 'late' | 'graded' | 'returned'>('all');

  const fetchData = useCallback(async () => {
    try {
      // 获取功课详情
      const hwResponse = await fetch(`/api/homework/${id}`);
      const hwData = await hwResponse.json();

      if (hwData.success) {
        setHomework(hwData.homework);
      }

      // 获取提交列表
      const subResponse = await fetch(`/api/homework/${id}/submissions`);
      const subData = await subResponse.json();

      if (subData.success) {
        setSubmissions(subData.submissions || []);
      }
    } catch (err) {
      console.error('加载数据失败:', err);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleGrade = async () => {
    if (!selectedSubmission || !gradeForm.grade) {
      showNotification('请填写评分', 'error');
      return;
    }

    setIsGrading(true);

    try {
      const response = await fetch(`/api/homework/submissions/${selectedSubmission.submissionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grade: gradeForm.grade,
          feedback: gradeForm.feedback,
          status: 'graded',
          gradedBy: 'admin',
        }),
      });

      const data = await response.json();

      if (data.success) {
        showNotification('评分成功', 'success');
        setSelectedSubmission(null);
        setGradeForm({ grade: '', feedback: '' });
        fetchData();
      } else {
        showNotification(data.error || '评分失败', 'error');
      }
    } catch (err) {
      console.error('评分失败:', err);
      showNotification('评分失败', 'error');
    } finally {
      setIsGrading(false);
    }
  };

  const handleReturn = async () => {
    if (!returningSubmission) return;

    setIsReturning(true);

    try {
      const response = await fetch(`/api/homework/submissions/${returningSubmission.submissionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'returned',
          returnReason: returnReason || '请修改后重新提交',
          feedback: returnReason || '请修改后重新提交',
        }),
      });

      const data = await response.json();

      if (data.success) {
        showNotification('已退回给学生', 'success');
        setShowReturnModal(false);
        setReturningSubmission(null);
        setReturnReason('');
        fetchData();
      } else {
        showNotification(data.error || '退回失败', 'error');
      }
    } catch (err) {
      console.error('退回失败:', err);
      showNotification('退回失败', 'error');
    } finally {
      setIsReturning(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted':
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-500/10 text-blue-400">已提交</span>;
      case 'late':
        return <span className="px-2 py-1 text-xs rounded-full bg-orange-500/10 text-orange-400">迟交</span>;
      case 'graded':
        return <span className="px-2 py-1 text-xs rounded-full bg-[#13ec80]/10 text-[#13ec80]">已评分</span>;
      case 'returned':
        return <span className="px-2 py-1 text-xs rounded-full bg-purple-500/10 text-purple-400">已退回</span>;
      default:
        return null;
    }
  };

  const filteredSubmissions = submissions.filter((sub) => {
    if (filterStatus === 'all') return true;
    return sub.status === filterStatus;
  });

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[#137fec] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">加载中...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!homework) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
            <span className="material-symbols-outlined text-4xl text-red-400 mb-3">error</span>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">功课不存在</h3>
            <Link href="/admin/homework" className="text-[#137fec] hover:underline">
              返回功课列表
            </Link>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        {/* 返回链接 */}
        <Link
          href="/admin/homework"
          className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          返回功课列表
        </Link>

        {/* 功课信息 */}
        <div className="bg-white dark:bg-[#1a2632] border border-gray-200 dark:border-[#283946] rounded-2xl p-6 mb-6 shadow-sm dark:shadow-none">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-2 py-1 text-xs rounded-full bg-[#137fec]/10 text-[#137fec]">
                  {homework.subject}
                </span>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  homework.status === 'published' ? 'bg-[#13ec80]/10 text-[#13ec80]' : 
                  homework.status === 'closed' ? 'bg-red-500/10 text-red-400' : 'bg-gray-500/10 text-gray-400'
                }`}>
                  {homework.status === 'published' ? '已发布' : homework.status === 'closed' ? '已关闭' : '草稿'}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{homework.title}</h1>
              <p className="text-gray-500 dark:text-gray-400">{homework.description}</p>
            </div>
            <div className="text-right text-sm text-gray-500 dark:text-gray-400">
              <div>截止: {formatDate(homework.dueDate)}</div>
              <div className="mt-1">发布者: {homework.createdByName}</div>
            </div>
          </div>
        </div>

        {/* 统计 */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-[#1a2632] border border-gray-200 dark:border-[#283946] rounded-xl p-4 text-center shadow-sm dark:shadow-none">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{submissions.length}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">总提交</div>
          </div>
          <div className="bg-white dark:bg-[#1a2632] border border-gray-200 dark:border-[#283946] rounded-xl p-4 text-center shadow-sm dark:shadow-none">
            <div className="text-2xl font-bold text-blue-400">
              {submissions.filter(s => s.status === 'submitted').length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">待批改</div>
          </div>
          <div className="bg-white dark:bg-[#1a2632] border border-gray-200 dark:border-[#283946] rounded-xl p-4 text-center shadow-sm dark:shadow-none">
            <div className="text-2xl font-bold text-orange-400">
              {submissions.filter(s => s.status === 'late').length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">迟交</div>
          </div>
          <div className="bg-white dark:bg-[#1a2632] border border-gray-200 dark:border-[#283946] rounded-xl p-4 text-center shadow-sm dark:shadow-none">
            <div className="text-2xl font-bold text-[#13ec80]">
              {submissions.filter(s => s.status === 'graded').length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">已评分</div>
          </div>
        </div>

        {/* 筛选器 */}
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            { key: 'all', label: '全部' },
            { key: 'submitted', label: '待批改' },
            { key: 'late', label: '迟交' },
            { key: 'graded', label: '已评分' },
            { key: 'returned', label: '已退回' },
          ].map((filter) => (
            <button
              key={filter.key}
              onClick={() => setFilterStatus(filter.key as typeof filterStatus)}
              className={`px-4 py-2 rounded-lg transition-all ${
                filterStatus === filter.key
                  ? 'bg-[#137fec] text-white'
                  : 'bg-gray-100 dark:bg-[#1a2632] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#243442]'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* 提交列表 */}
        {filteredSubmissions.length === 0 ? (
          <div className="bg-white dark:bg-[#1a2632] border border-gray-200 dark:border-[#283946] rounded-2xl p-12 text-center shadow-sm dark:shadow-none">
            <span className="material-symbols-outlined text-6xl text-gray-400 dark:text-gray-600 mb-4">inbox</span>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">暂无提交</h3>
            <p className="text-gray-500 dark:text-gray-400">目前没有符合条件的提交</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#1a2632] border border-gray-200 dark:border-[#283946] rounded-2xl overflow-hidden shadow-sm dark:shadow-none">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-[#0d1117]">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">学生</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">提交时间</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">状态</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">评分</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-500 dark:text-gray-400">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-[#283946]">
                {filteredSubmissions.map((sub) => (
                  <tr key={sub.submissionId} className="hover:bg-gray-50 dark:hover:bg-[#243442] transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-gray-900 dark:text-white font-medium">{sub.studentName}</div>
                        <div className="text-gray-500 text-sm">{sub.studentEmail}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-sm">
                      {formatDate(sub.submittedAt)}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(sub.status)}
                    </td>
                    <td className="px-6 py-4 text-gray-900 dark:text-white">
                      {sub.grade || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedSubmission(sub);
                            setGradeForm({ 
                              grade: sub.grade || '', 
                              feedback: sub.feedback || '' 
                            });
                          }}
                          className="flex items-center gap-1 px-3 py-1 bg-[#137fec] text-white text-sm rounded-lg hover:bg-[#0f5fcc] transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">
                            {sub.status === 'graded' ? 'edit' : 'grade'}
                          </span>
                          {sub.status === 'graded' ? '修改' : '评分'}
                        </button>
                        {sub.status !== 'returned' && sub.status !== 'graded' && (
                          <button
                            onClick={() => {
                              setReturningSubmission(sub);
                              setShowReturnModal(true);
                            }}
                            className="flex items-center gap-1 px-3 py-1 bg-purple-500 text-white text-sm rounded-lg hover:bg-purple-600 transition-colors"
                          >
                            <span className="material-symbols-outlined text-sm">undo</span>
                            退回
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 评分弹窗 */}
        {selectedSubmission && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-[#1a2632] border border-gray-200 dark:border-[#283946] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl dark:shadow-none">
              <div className="p-6 border-b border-gray-200 dark:border-[#283946] flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">评分 - {selectedSubmission.studentName}</h2>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#283946] rounded-lg transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* 学生提交内容 */}
                <div>
                  <label className="block text-gray-500 dark:text-gray-400 text-sm mb-2">学生提交内容</label>
                  <div className="bg-gray-50 dark:bg-[#0d1117] border border-gray-200 dark:border-[#283946] rounded-lg p-4 text-gray-900 dark:text-white whitespace-pre-wrap max-h-48 overflow-y-auto">
                    {selectedSubmission.content || '（无文字内容）'}
                  </div>
                </div>

                {/* 附件 */}
                {selectedSubmission.attachments && selectedSubmission.attachments.length > 0 && (
                  <div>
                    <label className="block text-gray-500 dark:text-gray-400 text-sm mb-2">附件</label>
                    <div className="flex flex-wrap gap-2">
                      {selectedSubmission.attachments.map((url, index) => (
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

                {/* 评分 */}
                <div>
                  <label className="block text-gray-500 dark:text-gray-400 text-sm mb-2">评分 *</label>
                  <input
                    type="text"
                    value={gradeForm.grade}
                    onChange={(e) => setGradeForm({ ...gradeForm, grade: e.target.value })}
                    placeholder="例如：A+, 90分, 优秀"
                    className="w-full bg-gray-50 dark:bg-[#0d1117] border border-gray-200 dark:border-[#283946] rounded-lg px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#137fec]"
                  />
                </div>

                {/* 反馈 */}
                <div>
                  <label className="block text-gray-500 dark:text-gray-400 text-sm mb-2">反馈（选填）</label>
                  <textarea
                    value={gradeForm.feedback}
                    onChange={(e) => setGradeForm({ ...gradeForm, feedback: e.target.value })}
                    placeholder="给学生的反馈意见..."
                    rows={4}
                    className="w-full bg-gray-50 dark:bg-[#0d1117] border border-gray-200 dark:border-[#283946] rounded-lg px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#137fec]"
                  />
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 dark:border-[#283946] flex justify-end gap-3">
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="px-6 py-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleGrade}
                  disabled={isGrading || !gradeForm.grade}
                  className="flex items-center gap-2 px-6 py-2 bg-[#13ec80] text-[#0d1117] rounded-lg hover:bg-[#0fd673] transition-colors disabled:opacity-50"
                >
                  {isGrading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-[#0d1117] border-t-transparent rounded-full animate-spin" />
                      提交中...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined">check</span>
                      提交评分
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 退回弹窗 */}
        {showReturnModal && returningSubmission && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-[#1a2632] border border-gray-200 dark:border-[#283946] rounded-2xl w-full max-w-lg shadow-xl dark:shadow-none">
              <div className="p-6 border-b border-gray-200 dark:border-[#283946] flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">退回功课 - {returningSubmission.studentName}</h2>
                <button
                  onClick={() => {
                    setShowReturnModal(false);
                    setReturningSubmission(null);
                    setReturnReason('');
                  }}
                  className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#283946] rounded-lg transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-lg p-4">
                  <p className="text-amber-700 dark:text-amber-400 text-sm">
                    退回后，学生可以修改并重新提交功课（即使已过截止日期）
                  </p>
                </div>

                <div>
                  <label className="block text-gray-500 dark:text-gray-400 text-sm mb-2">退回原因（选填）</label>
                  <textarea
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    placeholder="请说明需要修改的内容..."
                    rows={4}
                    className="w-full bg-gray-50 dark:bg-[#0d1117] border border-gray-200 dark:border-[#283946] rounded-lg px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 dark:border-[#283946] flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowReturnModal(false);
                    setReturningSubmission(null);
                    setReturnReason('');
                  }}
                  className="px-6 py-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleReturn}
                  disabled={isReturning}
                  className="flex items-center gap-2 px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50"
                >
                  {isReturning ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      处理中...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined">undo</span>
                      确认退回
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
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
    </AdminLayout>
  );
}
