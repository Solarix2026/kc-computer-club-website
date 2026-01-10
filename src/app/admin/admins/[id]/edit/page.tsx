/* eslint-disable prettier/prettier */
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { AdminLayout } from '@/components/layout/AdminLayout';

interface AdminData {
  $id: string;
  username: string;
  isActive: boolean;
  createdAt: string;
}

export default function EditAdminPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const adminId = params.id as string;

  const [admin, setAdmin] = useState<AdminData | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [loadingAdmin, setLoadingAdmin] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check authentication
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/admin/login');
    }
  }, [user, isLoading, router]);

  // Load admin data
  const loadAdminData = useCallback(async () => {
    try {
      setLoadingAdmin(true);
      // 从 API 获取管理员信息
      const response = await fetch('/api/admin/seed');
      const data = await response.json();

      if (data.admins) {
        const foundAdmin = data.admins.find((a: AdminData) => a.$id === adminId);
        if (foundAdmin) {
          setAdmin(foundAdmin);
          setIsActive(foundAdmin.isActive);
        } else {
          setError('管理员不存在');
        }
      }
    } catch (err) {
      setError('加载管理员信息失败');
      console.error(err);
    } finally {
      setLoadingAdmin(false);
    }
  }, [adminId]);

  useEffect(() => {
    if (user && adminId) {
      loadAdminData();
    }
  }, [user, adminId, loadAdminData]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!admin) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/admin/${adminId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '更新失败');
      }

      setSuccess('管理员信息更新成功！');
      setTimeout(() => {
        router.push('/admin/admins');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || loadingAdmin) {
    return (
      <AdminLayout adminName={user?.name || '管理员'}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <span className="inline-block animate-spin">
              <span className="material-symbols-outlined text-[#137fec] text-5xl">
                hourglass_bottom
              </span>
            </span>
            <p className="text-white mt-4">加载中...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!user || !admin) {
    return null;
  }

  return (
    <AdminLayout adminName={user.name || '管理员'}>
      <div className="max-w-2xl">
        <div className="mb-8">
          <Link
            href="/admin/admins"
            className="inline-flex items-center gap-2 text-[#7a8fa5] hover:text-white transition-colors mb-6"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            返回管理员列表
          </Link>

          <h1 className="text-3xl font-bold text-white">编辑管理员</h1>
          <p className="text-[#7a8fa5] mt-2">修改管理员账户信息</p>
        </div>

        {/* 表单卡片 */}
        <div className="bg-[#1a2838] rounded-2xl border border-[#283a4f] p-8">
          {/* 错误提示 */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
              {error}
            </div>
          )}

          {/* 成功提示 */}
          {success && (
            <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400">
              ✓ {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 用户名（只读） */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                管理员用户名
              </label>
              <input
                type="text"
                value={admin.username}
                disabled
                className="w-full px-4 py-3 bg-[#141f2e] border border-[#283a4f] rounded-lg text-white placeholder-[#5a6b7f] cursor-not-allowed opacity-60"
              />
              <p className="text-xs text-[#7a8fa5] mt-1">
                用户名无法修改
              </p>
            </div>

            {/* 注册时间（只读） */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                注册时间
              </label>
              <input
                type="text"
                value={new Date(admin.createdAt).toLocaleString('zh-CN')}
                disabled
                className="w-full px-4 py-3 bg-[#141f2e] border border-[#283a4f] rounded-lg text-white placeholder-[#5a6b7f] cursor-not-allowed opacity-60"
              />
            </div>

            {/* 账户状态 */}
            <div>
              <label className="block text-sm font-medium text-white mb-4">
                账户状态
              </label>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setIsActive(true)}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                    isActive
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-[#141f2e] text-[#7a8fa5] border border-[#283a4f] hover:border-[#137fec]'
                  }`}
                >
                  <span className="material-symbols-outlined">check_circle</span>
                  激活
                </button>
                <button
                  type="button"
                  onClick={() => setIsActive(false)}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                    !isActive
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : 'bg-[#141f2e] text-[#7a8fa5] border border-[#283a4f] hover:border-[#137fec]'
                  }`}
                >
                  <span className="material-symbols-outlined">block</span>
                  禁用
                </button>
              </div>
              <p className="text-xs text-[#7a8fa5] mt-2">
                禁用的管理员将无法登录管理后台
              </p>
            </div>

            {/* 提交按钮 */}
            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3 bg-[#137fec] text-white font-bold rounded-lg hover:bg-[#0f6ecf] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin material-symbols-outlined">
                      hourglass_bottom
                    </span>
                    保存中...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">save</span>
                    保存变更
                  </>
                )}
              </button>

              <Link href="/admin/admins" className="flex-1">
                <button
                  type="button"
                  className="w-full py-3 bg-[#283a4f] text-white font-bold rounded-lg hover:bg-[#354860] transition-colors"
                >
                  取消
                </button>
              </Link>
            </div>
          </form>

          {/* 说明 */}
          <div className="mt-8 pt-6 border-t border-[#283a4f]">
            <p className="text-[#7a8fa5] text-sm">
              💡 <strong>提示：</strong> 您可以激活或禁用管理员账户。禁用的管理员将无法登录管理后台，但账户数据会被保留。
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
