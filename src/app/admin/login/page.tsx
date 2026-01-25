/* eslint-disable prettier/prettier */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

// ========================================
// 管理员登录页面
// 参考: admin_login/code.html
// ========================================

export default function AdminLoginPage() {
  const router = useRouter();
  const { adminLogin } = useAuth();
  const [adminUsername, setAdminUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await adminLogin(adminUsername, password);
      router.push('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a1220] px-4 py-12 relative overflow-hidden">
      {/* 装饰背景 */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 right-20 w-72 h-72 bg-[#137fec] rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-[#137fec] rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* 卡片容器 */}
        <div className="bg-[#1a2838] rounded-2xl border border-[#283a4f] p-8 shadow-2xl">
          {/* 头部 */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-[#137fec]/10 mb-4">
              <span className="material-symbols-outlined text-[#137fec] text-3xl">
                admin_panel_settings
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">管理员登录</h1>
            <p className="text-[#7a8fa5] text-sm">
              电脑学会官网管理后台
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
            {/* 管理员用户名 */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                管理员用户名
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7a8fa5] material-symbols-outlined">
                  person
                </span>
                <input
                  type="text"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  placeholder="请输入用户名"
                  required
                  disabled={isLoading}
                  className="w-full pl-10 pr-4 py-3 bg-[#141f2e] border border-[#283a4f] rounded-lg text-white placeholder-[#5a6b7f] focus:outline-none focus:border-[#137fec] focus:ring-1 focus:ring-[#137fec] transition-colors disabled:opacity-50"
                />
              </div>
            </div>

            {/* 密码 */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                密码
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7a8fa5] material-symbols-outlined">
                  lock
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                  className="w-full pl-10 pr-10 py-3 bg-[#141f2e] border border-[#283a4f] rounded-lg text-white placeholder-[#5a6b7f] focus:outline-none focus:border-[#137fec] focus:ring-1 focus:ring-[#137fec] transition-colors disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7a8fa5] hover:text-white transition-colors disabled:opacity-50"
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
              disabled={isLoading}
              className="w-full py-3 bg-[#137fec] text-white font-bold rounded-lg hover:bg-[#0f6ecf] disabled:opacity-50 transition-colors mt-6 flex items-center justify-center gap-2"
            >
              {isLoading ? (
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
              <div className="w-full border-t border-[#283a4f]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-[#1a2838] text-[#7a8fa5]">或</span>
            </div>
          </div>

          {/* 学生登录链接 */}
          <Link
            href="/auth/login"
            className="block w-full py-3 bg-[#283a4f] text-white font-medium rounded-lg hover:bg-[#354860] transition-colors text-center border border-[#3a4f67] mb-6"
          >
            <span className="material-symbols-outlined inline mr-2 align-middle">
              school
            </span>
            学生登录
          </Link>

          {/* 说明文本 */}
          <p className="text-center text-[#7a8fa5] text-xs">
            非管理员用户请使用学生账号登录
          </p>
        </div>

        {/* 返回主站链接 */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-[#7a8fa5] hover:text-white transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            返回主站
          </Link>
        </div>
      </div>
    </div>
  );
}
