/* eslint-disable prettier/prettier */
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { changePassword } from '@/services/auth.service';

export default function ProfilePage() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'info' | 'password'>('info');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a1220] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mb-4">
            <span className="material-symbols-outlined text-[#137fec] text-5xl">
              hourglass_bottom
            </span>
          </div>
          <p className="text-white">加载中...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!oldPassword || !newPassword || !confirmPassword) {
      setError('请填写所有字段');
      return;
    }

    if (newPassword.length < 8) {
      setError('新密码至少需要 8 个字符');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('新密码和确认密码不匹配');
      return;
    }

    if (oldPassword === newPassword) {
      setError('新密码不能与旧密码相同');
      return;
    }

    setIsSubmitting(true);

    try {
      await changePassword(oldPassword, newPassword);
      setSuccess('密码修改成功！');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : '密码修改失败，请稍后重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (err) {
      console.error('登出失败:', err);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#111814] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* 头部 */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors mb-6"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            返回首页
          </Link>
          
          <div className="bg-white dark:bg-[#1a2220] rounded-2xl border border-gray-200 dark:border-[#283930] p-8 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-3xl">
                  person
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{user.name}</h1>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{user.email}</p>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200 dark:border-[#283930] flex gap-4">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined">logout</span>
                登出
              </button>
            </div>
          </div>
        </div>

        {/* 标签页 */}
        <div className="bg-white dark:bg-[#1a2220] rounded-2xl border border-gray-200 dark:border-[#283930] overflow-hidden shadow-sm">
          {/* 标签页导航 */}
          <div className="flex border-b border-gray-200 dark:border-[#283930]">
            <button
              onClick={() => setActiveTab('info')}
              className={`flex-1 py-4 px-6 font-medium transition-colors ${
                activeTab === 'info'
                  ? 'text-primary border-b-2 border-primary -mb-0.5'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <span className="material-symbols-outlined">info</span>
                基本信息
              </span>
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`flex-1 py-4 px-6 font-medium transition-colors ${
                activeTab === 'password'
                  ? 'text-primary border-b-2 border-primary -mb-0.5'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <span className="material-symbols-outlined">lock</span>
                修改密码
              </span>
            </button>
          </div>

          {/* 标签页内容 */}
          <div className="p-8">
            {/* 基本信息标签页 */}
            {activeTab === 'info' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    姓名
                  </label>
                  <input
                    type="text"
                    value={user.name}
                    disabled
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-[#141f1c] border border-gray-200 dark:border-[#283930] rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 cursor-not-allowed opacity-60"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    邮箱
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-[#141f1c] border border-gray-200 dark:border-[#283930] rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 cursor-not-allowed opacity-60"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    用户类型
                  </label>
                  <input
                    type="text"
                    value="学生"
                    disabled
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-[#141f1c] border border-gray-200 dark:border-[#283930] rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 cursor-not-allowed opacity-60"
                  />
                </div>

                {/* 注册时间（仅学生显示） */}
                {'createdAt' in user && user.createdAt && (
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                      注册时间
                    </label>
                    <input
                      type="text"
                      value={new Date(user.createdAt).toLocaleString('zh-CN')}
                      disabled
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-[#141f1c] border border-gray-200 dark:border-[#283930] rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 cursor-not-allowed opacity-60"
                    />
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200 dark:border-[#283930]">
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    💡 提示：基本信息无法修改。如需更改邮箱或姓名，请联系管理员。
                  </p>
                </div>
              </div>
            )}

            {/* 修改密码标签页 */}
            {activeTab === 'password' && (
              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                {error && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-sm">
                    ✓ {success}
                  </div>
                )}

                {/* 当前密码 */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    当前密码
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 material-symbols-outlined">
                      lock
                    </span>
                    <input
                      type={showOldPassword ? 'text' : 'password'}
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder="输入当前密码"
                      required
                      disabled={isSubmitting}
                      className="w-full pl-10 pr-12 py-3 bg-white dark:bg-[#141f1c] border border-gray-200 dark:border-[#283930] rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                      <span className="material-symbols-outlined">
                        {showOldPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* 新密码 */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    新密码
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 material-symbols-outlined">
                      lock_open
                    </span>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="输入新密码（至少 8 个字符）"
                      required
                      disabled={isSubmitting}
                      className="w-full pl-10 pr-12 py-3 bg-white dark:bg-[#141f1c] border border-gray-200 dark:border-[#283930] rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                      <span className="material-symbols-outlined">
                        {showNewPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    至少需要 8 个字符，包括字母和数字
                  </p>
                </div>

                {/* 确认新密码 */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    确认新密码
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 material-symbols-outlined">
                      check_circle
                    </span>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="重新输入新密码"
                      required
                      disabled={isSubmitting}
                      className="w-full pl-10 pr-12 py-3 bg-white dark:bg-[#141f1c] border border-gray-200 dark:border-[#283930] rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                      <span className="material-symbols-outlined">
                        {showConfirmPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* 提交按钮 */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin material-symbols-outlined">
                        hourglass_bottom
                      </span>
                      修改中...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined">done</span>
                      确认修改
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
