/* eslint-disable prettier/prettier */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { requestPasswordReset } from '@/services/auth.service';

// ========================================
// 忘记密码页面
// ========================================

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Email format validation: xxxxx(5-6)@kuencheng.edu.my (5-6 digits)
    const emailRegex = /^\d{5,6}@kuencheng\.edu\.my$/;
    if (!emailRegex.test(email)) {
      setError('邮箱格式错误。请使用格式：5-6位数字@kuencheng.edu.my（例如：12345@kuencheng.edu.my）');
      return;
    }

    setIsLoading(true);

    try {
      await requestPasswordReset(email);
      setSuccess('密码重置邮件已发送至您的邮箱，请检查邮件并按照链接重置密码');
      setEmail('');
    } catch (err) {
      setError(err instanceof Error ? err.message : '发送重置邮件失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#102219] px-4 py-12 relative overflow-hidden">
      {/* 装饰背景 */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 right-20 w-72 h-72 bg-[#13ec80] rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-[#13ec80] rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* 卡片容器 */}
        <div className="bg-[#1a2c23] rounded-2xl border border-[#283930] p-8 shadow-2xl">
          {/* 头部 */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-[#13ec80]/10 mb-4">
              <span className="material-symbols-outlined text-[#13ec80] text-3xl">
                mail
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">忘记密码？</h1>
            <p className="text-[#9db9ab] text-sm">
              输入您的邮箱地址，我们将发送密码重置链接
            </p>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* 成功提示 */}
          {success && (
            <div className="mb-6 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
              {success}
            </div>
          )}

          {/* 表单 */}
          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-4 mb-6">
              {/* 邮箱输入 */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  邮箱地址
                </label>
                <div className="relative flex items-center bg-[#162a21] border border-[#283930] rounded-lg focus-within:border-[#13ec80] focus-within:ring-1 focus-within:ring-[#13ec80] transition-colors overflow-hidden">
                  <span className="absolute left-3 text-[#9db9ab] material-symbols-outlined">
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
                    className="flex-1 pl-10 pr-1 py-3 bg-transparent text-white placeholder-[#5a6b63] focus:outline-none"
                  />
                  <span className="pl-1 pr-2 py-3 text-[#9db9ab] text-xs whitespace-nowrap shrink-0 border-l border-[#3a5047]">@kuencheng.edu.my</span>
                </div>
              </div>

              {/* 提交按钮 */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-[#13ec80] text-[#102219] font-bold rounded-lg hover:bg-[#0fd673] disabled:opacity-50 transition-colors mt-6 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin material-symbols-outlined">
                      hourglass_bottom
                    </span>
                    发送中...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">send</span>
                    发送重置链接
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="mb-6 p-4 rounded-lg bg-[#13ec80]/10 border border-[#13ec80]/20">
              <p className="text-[#13ec80] text-sm">
                重置链接已发送，请检查您的邮箱
              </p>
            </div>
          )}

          {/* 分隔线 */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#283930]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-[#1a2c23] text-[#9db9ab]">或</span>
            </div>
          </div>

          {/* 返回登录链接 */}
          <p className="text-center text-[#9db9ab] text-sm">
            记起密码了？{' '}
            <Link
              href="/auth/login"
              className="text-[#13ec80] hover:text-[#0fd673] font-medium transition-colors"
            >
              返回登录
            </Link>
          </p>

          {/* 没有账号链接 */}
          <p className="text-center text-[#9db9ab] text-sm mt-3">
            还没有账号？{' '}
            <Link
              href="/auth/signup"
              className="text-[#13ec80] hover:text-[#0fd673] font-medium transition-colors"
            >
              立即注册
            </Link>
          </p>
        </div>

        {/* 返回主站链接 */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-[#9db9ab] hover:text-white transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            返回主站
          </Link>
        </div>
      </div>
    </div>
  );
}
