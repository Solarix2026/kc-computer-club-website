/* eslint-disable prettier/prettier */
'use client';

import { AdminLayout } from '@/components/layout/AdminLayout';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';

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

export default function AdminHomeworkPage() {
  const [homework, setHomework] = useState<Homework[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const showNotification = (message: string, type: 'success' | 'error') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft' | 'closed'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 创建表单
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '编程',
    dueDate: '',
    status: 'published',
  });

  const fetchHomework = useCallback(async () => {
    try {
      const url = filterStatus === 'all' ? '/api/homework' : `/api/homework?status=${filterStatus}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setHomework(data.homework || []);
      }
    } catch (err) {
      console.error('加载功课失败:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    fetchHomework();
  }, [fetchHomework]);

  const handleCreate = async () => {
    if (!formData.title || !formData.description || !formData.dueDate) {
      showNotification('请填写所有必填字段', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/homework', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          createdBy: 'admin',
          createdByName: '管理员',
        }),
      });

      const data = await response.json();

      if (data.success) {
        showNotification('功课发布成功', 'success');
        setShowCreateModal(false);
        setFormData({
          title: '',
          description: '',
          subject: '编程',
          dueDate: '',
          status: 'published',
        });
        fetchHomework();
      } else {
        showNotification(data.error || '发布失败', 'error');
      }
    } catch (err) {
      console.error('发布失败:', err);
      showNotification('发布失败', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除此功课吗？')) return;

    try {
      const response = await fetch(`/api/homework/${id}`, { method: 'DELETE' });
      const data = await response.json();

      if (data.success) {
        showNotification('删除成功', 'success');
        fetchHomework();
      } else {
        showNotification(data.error || '删除失败', 'error');
      }
    } catch (err) {
      console.error('删除失败:', err);
      showNotification('删除失败', 'error');
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/homework/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (data.success) {
        showNotification('状态更新成功', 'success');
        fetchHomework();
      } else {
        showNotification(data.error || '更新失败', 'error');
      }
    } catch (err) {
      console.error('更新失败:', err);
      showNotification('更新失败', 'error');
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
      case 'published':
        return <span className="px-2 py-1 text-xs rounded-full bg-[#13ec80]/10 text-[#13ec80]">已发布</span>;
      case 'draft':
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-500/10 text-gray-400">草稿</span>;
      case 'closed':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-500/10 text-red-400">已关闭</span>;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[#137fec] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">加载中...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <span className="material-symbols-outlined text-[#137fec] text-3xl">assignment</span>
              功课管理
            </h1>
            <p className="text-gray-400 mt-1">发布和管理功课</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#137fec] text-white rounded-lg hover:bg-[#0f5fcc] transition-colors"
          >
            <span className="material-symbols-outlined">add</span>
            发布功课
          </button>
        </div>

        {/* 筛选器 */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { key: 'all', label: '全部' },
            { key: 'published', label: '已发布' },
            { key: 'draft', label: '草稿' },
            { key: 'closed', label: '已关闭' },
          ].map((filter) => (
            <button
              key={filter.key}
              onClick={() => setFilterStatus(filter.key as typeof filterStatus)}
              className={`px-4 py-2 rounded-lg transition-all ${
                filterStatus === filter.key
                  ? 'bg-[#137fec] text-white'
                  : 'bg-[#1a2632] text-gray-300 hover:bg-[#243442]'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* 功课列表 */}
        {homework.length === 0 ? (
          <div className="bg-[#1a2632] border border-[#283946] rounded-2xl p-12 text-center">
            <span className="material-symbols-outlined text-6xl text-gray-600 mb-4">inbox</span>
            <h3 className="text-xl font-semibold text-white mb-2">暂无功课</h3>
            <p className="text-gray-400">点击上方按钮发布第一个功课</p>
          </div>
        ) : (
          <div className="bg-[#1a2632] border border-[#283946] rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-[#0d1117]">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">功课标题</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">科目</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">截止日期</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">状态</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-400">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#283946]">
                {homework.map((hw) => (
                  <tr key={hw.homeworkId} className="hover:bg-[#243442] transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-white font-medium">{hw.title}</div>
                        <div className="text-gray-500 text-sm truncate max-w-xs">{hw.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs rounded-full bg-[#137fec]/10 text-[#137fec]">
                        {hw.subject}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm">
                      {formatDate(hw.dueDate)}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(hw.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/homework/${hw.homeworkId}`}
                          className="p-2 text-gray-400 hover:text-white hover:bg-[#283946] rounded-lg transition-colors"
                          title="查看提交"
                        >
                          <span className="material-symbols-outlined">visibility</span>
                        </Link>
                        {hw.status === 'published' && (
                          <button
                            onClick={() => handleStatusChange(hw.homeworkId, 'closed')}
                            className="p-2 text-gray-400 hover:text-orange-400 hover:bg-[#283946] rounded-lg transition-colors"
                            title="关闭"
                          >
                            <span className="material-symbols-outlined">lock</span>
                          </button>
                        )}
                        {hw.status === 'closed' && (
                          <button
                            onClick={() => handleStatusChange(hw.homeworkId, 'published')}
                            className="p-2 text-gray-400 hover:text-green-400 hover:bg-[#283946] rounded-lg transition-colors"
                            title="重新开放"
                          >
                            <span className="material-symbols-outlined">lock_open</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(hw.homeworkId)}
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-[#283946] rounded-lg transition-colors"
                          title="删除"
                        >
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 创建功课弹窗 */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1a2632] border border-[#283946] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-[#283946] flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">发布功课</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-[#283946] rounded-lg transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* 标题 */}
                <div>
                  <label className="block text-gray-400 text-sm mb-2">功课标题 *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="例如：第一周编程作业"
                    className="w-full bg-[#0d1117] border border-[#283946] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#137fec]"
                  />
                </div>

                {/* 科目 */}
                <div>
                  <label className="block text-gray-400 text-sm mb-2">科目 *</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full bg-[#0d1117] border border-[#283946] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#137fec]"
                  >
                    <option value="编程">编程</option>
                    <option value="AI">AI</option>
                    <option value="网页">网页开发</option>
                    <option value="算法">算法</option>
                    <option value="其他">其他</option>
                  </select>
                </div>

                {/* 截止日期 */}
                <div>
                  <label className="block text-gray-400 text-sm mb-2">截止日期 *</label>
                  <input
                    type="datetime-local"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full bg-[#0d1117] border border-[#283946] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#137fec]"
                  />
                </div>

                {/* 描述 */}
                <div>
                  <label className="block text-gray-400 text-sm mb-2">功课要求 *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="详细描述功课要求..."
                    rows={6}
                    className="w-full bg-[#0d1117] border border-[#283946] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#137fec]"
                  />
                </div>

                {/* 状态 */}
                <div>
                  <label className="block text-gray-400 text-sm mb-2">发布状态</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        value="published"
                        checked={formData.status === 'published'}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-4 h-4 text-[#137fec]"
                      />
                      <span className="text-white">立即发布</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        value="draft"
                        checked={formData.status === 'draft'}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-4 h-4 text-[#137fec]"
                      />
                      <span className="text-white">保存草稿</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-[#283946] flex justify-end gap-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleCreate}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-2 bg-[#137fec] text-white rounded-lg hover:bg-[#0f5fcc] transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      发布中...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined">publish</span>
                      发布功课
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
    </AdminLayout>
  );
}
