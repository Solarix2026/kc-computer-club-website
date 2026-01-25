/* eslint-disable prettier/prettier */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function StudentLoginPage() {
  const router = useRouter();
  const { login, user, isLoading, requirePasswordChange, changePassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isFormLoading, setIsFormLoading] = useState(false);
  
  // 强制修改密码模态框状态
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPasswordForChange, setCurrentPasswordForChange] = useState('');
  const [changePasswordError, setChangePasswordError] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Redirect to home if user already has a session and doesn't need password change
  useEffect(() => {
    if (!isLoading && user && !requirePasswordChange) {
      router.push('/');
    }
  }, [user, isLoading, requirePasswordChange, router]);

  // 显示强制修改密码模态框
  useEffect(() => {
    if (user && requirePasswordChange) {
      setShowChangePasswordModal(true);
      // 记住当前密码用于验证
      setCurrentPasswordForChange(password);
    }
  }, [user, requirePasswordChange, password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Email format validation: xxxxx(5-6)@kuencheng.edu.my (5-6 digits)
    const emailRegex = /^\d{5,6}@kuencheng\.edu\.my$/;
    if (!emailRegex.test(email)) {
      setError('邮箱格式错误。请使用格式：5-6位数字@kuencheng.edu.my（例如：12345@kuencheng.edu.my）');
      return;
    }

    setIsFormLoading(true);

    try {
      const result = await login(email, password);
      
      if (result.requirePasswordChange) {
        // 显示强制修改密码模态框
        setShowChangePasswordModal(true);
        setCurrentPasswordForChange(password);
      } else {
        router.push('/');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsFormLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangePasswordError('');

    // 验证新密码
    if (newPassword.length < 6) {
      setChangePasswordError('新密码至少需要6个字符');
      return;
    }

    if (newPassword === '11111111') {
      setChangePasswordError('新密码不能为默认密码');
      return;
    }

    if (newPassword !== confirmPassword) {
      setChangePasswordError('两次输入的密码不一致');
      return;
    }

    setIsChangingPassword(true);

    try {
      await changePassword(currentPasswordForChange, newPassword);
      setShowChangePasswordModal(false);
      router.push('/');
    } catch (err) {
      setChangePasswordError(err instanceof Error ? err.message : '修改密码失败');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Show loading state while checking session
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="animate-spin material-symbols-outlined text-primary text-4xl">
          hourglass_bottom
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-4 py-12 relative overflow-hidden">
      {/* 装饰背景 */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 right-20 w-72 h-72 bg-primary rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-primary rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* 卡片容器 */}
        <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-8 shadow-2xl">
          {/* 头部 */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary/10 mb-4">
              <span className="material-symbols-outlined text-primary text-3xl">
                account_circle
              </span>
            </div>
            <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">学生登录</h1>
            <p className="text-[var(--text-secondary)] text-sm">
              登录后可浏览公告、活动和参加报名
            </p>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* 表单 */}
          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            {/* 邮箱输入 */}
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                学号邮箱
              </label>
              <div className="relative flex items-center bg-[var(--input-bg)] border border-[var(--border)] rounded-lg focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-colors overflow-hidden">
                <span className="absolute left-3 text-[var(--text-secondary)] material-symbols-outlined">
                  mail
                </span>
                <input
                  type="text"
                  value={email.replace(/@kuencheng\.edu\.my$/, '')}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
                    setEmail(val ? `${val}@kuencheng.edu.my` : '');
                  }}
                  placeholder="123456"
                  required
                  maxLength={6}
                  className="flex-1 pl-10 pr-1 py-3 bg-transparent text-[var(--foreground)] placeholder-[var(--text-secondary)] focus:outline-none"
                />
                <span className="pl-1 pr-2 py-3 text-[var(--text-secondary)] text-xs whitespace-nowrap shrink-0 border-l border-[var(--border)]">@kuencheng.edu.my</span>
              </div>
            </div>

            {/* 密码输入 */}
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                密码
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] material-symbols-outlined">
                  lock
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-10 py-3 bg-[var(--input-bg)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--foreground)] transition-colors"
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? 'visibility' : 'visibility_off'}
                  </span>
                </button>
              </div>
            </div>

            {/* 登录按钮 */}
            <button
              type="submit"
              disabled={isFormLoading}
              className="w-full py-3 bg-primary text-[#102219] font-bold rounded-lg hover:opacity-90 disabled:opacity-50 transition-colors mt-6 flex items-center justify-center gap-2"
            >
              {isFormLoading ? (
                <>
                  <span className="animate-spin material-symbols-outlined">
                    hourglass_bottom
                  </span>
                  登录中...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">arrow_forward</span>
                  登录
                </>
              )}
            </button>
          </form>

          {/* 分隔线 */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--border)]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-[var(--surface)] text-[var(--text-secondary)]">或</span>
            </div>
          </div>

          {/* 忘记密码链接 */}
          <div className="text-center mb-4">
            <Link
              href="/auth/forgot-password"
              className="text-primary hover:opacity-80 text-sm font-medium transition-colors"
            >
              忘记密码？
            </Link>
          </div>

          {/* 管理员登录链接 */}
          <Link
            href="/admin/login"
            className="block w-full py-3 bg-[var(--surface-hover)] text-[var(--foreground)] font-medium rounded-lg hover:bg-[var(--border)] transition-colors text-center border border-[var(--border)] mb-6"
          >
            <span className="material-symbols-outlined inline mr-2 align-middle">
              security
            </span>
            管理员登录
          </Link>
        </div>

        {/* 返回主站链接 */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-[var(--text-secondary)] hover:text-[var(--foreground)] transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            返回主站
          </Link>
        </div>
      </div>

      {/* 强制修改密码模态框 */}
      {showChangePasswordModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-8 shadow-2xl max-w-md w-full">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-yellow-500/10 mb-4">
                <span className="material-symbols-outlined text-yellow-500 text-3xl">
                  lock_reset
                </span>
              </div>
              <h2 className="text-xl font-bold text-[var(--foreground)] mb-2">首次登录</h2>
              <p className="text-[var(--text-secondary)] text-sm">
                为了账户安全，请设置您的新密码
              </p>
            </div>

            {changePasswordError && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {changePasswordError}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  新密码
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] material-symbols-outlined">
                    lock
                  </span>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="至少6个字符"
                    required
                    minLength={6}
                    className="w-full pl-10 pr-4 py-3 bg-[var(--input-bg)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  确认新密码
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] material-symbols-outlined">
                    lock
                  </span>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="再次输入新密码"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-[var(--input-bg)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isChangingPassword}
                className="w-full py-3 bg-primary text-[#102219] font-bold rounded-lg hover:opacity-90 disabled:opacity-50 transition-colors mt-4 flex items-center justify-center gap-2"
              >
                {isChangingPassword ? (
                  <>
                    <span className="animate-spin material-symbols-outlined">
                      hourglass_bottom
                    </span>
                    修改中...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">check</span>
                    确认修改
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-[var(--text-secondary)] text-xs mt-4">
              * 新密码不能与默认密码相同
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
