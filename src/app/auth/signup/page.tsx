/* eslint-disable prettier/prettier */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { validateChineseName } from '@/services/auth.service';

export default function StudentSignupPage() {
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showVerificationNotice, setShowVerificationNotice] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Chinese name validation (2-3 characters)
    if (!validateChineseName(name)) {
      setError('姓名必须为2-3个中文字符（例如：张三、李小明）');
      return;
    }

    // Email format validation: xxxxx(5-6)@kuencheng.edu.my (5-6 digits)
    const emailRegex = /^\d{5,6}@kuencheng\.edu\.my$/;
    if (!emailRegex.test(email)) {
      setError('邮箱格式错误。请使用格式：5-6位数字@kuencheng.edu.my（例如：12345@kuencheng.edu.my）');
      return;
    }

    // Validation
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    if (password.length < 8) {
      setError('密码长度至少为 8 个字符');
      return;
    }

    setIsLoading(true);

    try {
      await signup(name, email, password);
      setShowVerificationNotice(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : '注册失败');
    } finally {
      setIsLoading(false);
    }
  };

  // Show verification notice after successful signup
  if (showVerificationNotice) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#102219] px-4 py-12 relative overflow-hidden">
        {/* 装饰背景 */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-72 h-72 bg-[#13ec80] rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-72 h-72 bg-[#13ec80] rounded-full blur-3xl"></div>
        </div>

        <div className="w-full max-w-md relative z-10">
          <div className="bg-[#1a2c23] rounded-2xl border border-[#283930] p-8 shadow-2xl text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#13ec80]/10 mb-6">
              <span className="material-symbols-outlined text-[#13ec80] text-4xl">
                mark_email_read
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">注册成功！</h1>
            <p className="text-[#9db9ab] mb-6">
              我们已向 <span className="text-[#13ec80] font-medium">{email}</span> 发送了验证邮件。
              <br />
              请检查您的邮箱并点击验证链接以激活账号。
            </p>
            <div className="bg-[#162a21] border border-[#283930] rounded-lg p-4 mb-6">
              <p className="text-sm text-[#9db9ab]">
                <span className="material-symbols-outlined text-amber-400 text-sm align-middle mr-1">info</span>
                如果没有收到邮件，请检查垃圾邮件文件夹
              </p>
            </div>
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center gap-2 w-full py-3 bg-[#13ec80] text-[#102219] font-bold rounded-lg hover:bg-[#0fd673] transition-colors"
            >
              <span className="material-symbols-outlined">login</span>
              前往登录
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
                person_add
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">创建账号</h1>
            <p className="text-[#9db9ab] text-sm">
              加入社团，参加精彩活动
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
            {/* 姓名输入 */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                姓名 <span className="text-[#9db9ab] text-xs font-normal">（2-4个中文字符）</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9db9ab] material-symbols-outlined">
                  person
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="张三 或 李小明"
                  required
                  maxLength={4}
                  className="w-full pl-10 pr-4 py-3 bg-[#162a21] border border-[#283930] rounded-lg text-white placeholder-[#5a6b63] focus:outline-none focus:border-[#13ec80] focus:ring-1 focus:ring-[#13ec80] transition-colors"
                />
              </div>
            </div>

            {/* 邮箱输入 */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                学号邮箱
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

            {/* 密码输入 */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                密码
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9db9ab] material-symbols-outlined">
                  lock
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-10 py-3 bg-[#162a21] border border-[#283930] rounded-lg text-white placeholder-[#5a6b63] focus:outline-none focus:border-[#13ec80] focus:ring-1 focus:ring-[#13ec80] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9db9ab] hover:text-white transition-colors"
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? 'visibility' : 'visibility_off'}
                  </span>
                </button>
              </div>
            </div>

            {/* 确认密码 */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                确认密码
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9db9ab] material-symbols-outlined">
                  lock_check
                </span>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-10 py-3 bg-[#162a21] border border-[#283930] rounded-lg text-white placeholder-[#5a6b63] focus:outline-none focus:border-[#13ec80] focus:ring-1 focus:ring-[#13ec80] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9db9ab] hover:text-white transition-colors"
                >
                  <span className="material-symbols-outlined">
                    {showConfirmPassword ? 'visibility' : 'visibility_off'}
                  </span>
                </button>
              </div>
            </div>

            {/* 注册按钮 */}
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
                  创建中...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">person_add</span>
                  创建账号
                </>
              )}
            </button>
          </form>

          {/* 分隔线 */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#283930]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-[#1a2c23] text-[#9db9ab]">或</span>
            </div>
          </div>

          {/* 管理员登录链接 */}
          <Link
            href="/admin/login"
            className="block w-full py-3 bg-[#283930] text-white font-medium rounded-lg hover:bg-[#344b3f] transition-colors text-center border border-[#3a5546] mb-6"
          >
            <span className="material-symbols-outlined inline mr-2 align-middle">
              security
            </span>
            管理员登录
          </Link>

          {/* 登录链接 */}
          <p className="text-center text-[#9db9ab] text-sm">
            已有账号？{' '}
            <Link
              href="/auth/login"
              className="text-[#13ec80] hover:text-[#0fd673] font-medium transition-colors"
            >
              直接登录
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
