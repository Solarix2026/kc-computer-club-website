/* eslint-disable prettier/prettier */
'use client';

import React, { useState, useEffect } from 'react';

interface AttendanceStatus {
  isAttendanceOpen: boolean;
  session: {
    sessionTime: string;
    minutesRemaining: number;
  } | null;
  message: string;
  weekNumber: number;
  debugMode?: boolean;
  codeEnabled?: boolean;
  hasCode?: boolean;
  config?: {
    dayOfWeek: number;
    session1Start: { hour: number; minute: number };
    session1Duration: number;
    session2Start: { hour: number; minute: number };
    session2Duration: number;
  };
}

interface AttendanceWidgetProps {
  studentId?: string;
  studentName?: string;
  studentEmail?: string;
  onCheckInSuccess?: () => void;
  showDebugButton?: boolean;
}

export default function AttendanceWidget({
  studentId = '',
  studentName = '',
  studentEmail = '',
  onCheckInSuccess,
  showDebugButton = false,
}: AttendanceWidgetProps) {
  const [status, setStatus] = useState<AttendanceStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [debugMode, setDebugMode] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [requireCode, setRequireCode] = useState(false);

  // 获取点名状态
  const fetchAttendanceStatus = async () => {
    try {
      const response = await fetch('/api/attendance');
      const data = await response.json();
      setStatus(data);
      setDebugMode(data.debugMode || false);
      // 如果开启了验证码功能，显示验证码输入框
      if (data.codeEnabled && data.hasCode) {
        setRequireCode(true);
      } else {
        setRequireCode(false);
      }
      setError('');
    } catch (err) {
      const error = err as Error & { message?: string };
      setError('无法获取点名状态：' + (error.message || '未知错误'));
    }
  };

  // 切换调试模式
  const toggleDebugMode = async () => {
    try {
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle-debug',
          enabled: !debugMode,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setDebugMode(data.debugMode);
        setMessage(data.message);
        // 重新获取状态
        await fetchAttendanceStatus();
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      const error = err as Error & { message?: string };
      setError('切换调试模式失败：' + (error.message || '未知错误'));
    }
  };

  // 点名
  const handleCheckIn = async () => {
    if (!studentId || !studentName || !studentEmail) {
      // 未登录，重定向到登录页面
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login?redirect=/attendance';
      }
      return;
    }

    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          studentName,
          studentEmail,
          verificationCode: requireCode ? verificationCode : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // 如果需要验证码
        if (data.requireCode) {
          setRequireCode(true);
        }
        setError(data.error || '点名失败');
        setIsLoading(false);
        return;
      }

      setMessage(`点名成功！时段: ${data.record.sessionTime}`);
      setHasCheckedIn(true);
      setVerificationCode(''); // 清除验证码
      onCheckInSuccess?.();

      // 5秒后清除成功消息
      setTimeout(() => {
        setMessage('');
      }, 5000);
    } catch (err) {
      const error = err as Error & { message?: string };
      setError('点名失败：' + (error.message || '未知错误'));
    } finally {
      setIsLoading(false);
    }
  };

  // 初始化：获取初始状态
  useEffect(() => {
    fetchAttendanceStatus();

    // 每 10 秒检查一次点名状态
    const interval = setInterval(fetchAttendanceStatus, 10000);

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, []);

  if (!status) {
    return (
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="mt-3 text-[var(--text-secondary)]">加载中...</p>
      </div>
    );
  }

  return (
    <div className={`relative rounded-2xl border transition-all duration-300 overflow-hidden ${
      status.isAttendanceOpen 
        ? 'bg-[linear-to-br] from-[var(--surface)] to-primary/10 border-primary/30 shadow-[0_0_30px_rgba(19,236,128,0.15)]' 
        : 'bg-[var(--surface)] border-[var(--border)]'
    }`}>
      {/* 顶部装饰线 */}
      <div className={`h-1 w-full ${status.isAttendanceOpen ? 'bg-primary' : 'bg-[var(--border)]'}`}></div>
      
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="flex items-center gap-2 text-lg font-bold text-[var(--foreground)]">
            <span className="material-symbols-outlined text-primary">assignment</span>
            点名系统
            {debugMode && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-amber-500/20 text-amber-400 rounded-full border border-amber-500/30">
                调试模式
              </span>
            )}
          </h3>
          <span className="px-3 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full border border-primary/20">
            第 {status.weekNumber} 周
          </span>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {status.isAttendanceOpen ? (
            <>
              {/* 点名开放时的信息 */}
              <div className="bg-[var(--surface-hover)] border border-[var(--border)] rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-2xl">schedule</span>
                  <div>
                    <p className="text-[var(--foreground)] font-bold text-lg">{status.session?.sessionTime}</p>
                    <p className="text-[var(--text-secondary)] text-sm">当前点名时段</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-amber-400 font-bold text-lg animate-pulse">
                    {status.session?.minutesRemaining} 分钟
                  </p>
                  <p className="text-[var(--text-secondary)] text-sm">剩余时间</p>
                </div>
              </div>

              {/* 验证码输入框 */}
              {requireCode && !hasCheckedIn && (
                <div className="bg-[var(--surface-hover)] border border-amber-500/30 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="material-symbols-outlined text-amber-400">pin</span>
                    <p className="text-amber-400 font-medium">请输入验证码</p>
                  </div>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="输入4位验证码"
                    maxLength={4}
                    className="w-full px-4 py-3 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg text-[var(--foreground)] text-center text-2xl font-mono tracking-widest placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-amber-500/50"
                  />
                  <p className="text-[var(--text-secondary)] text-xs mt-2 text-center">
                    请向在场的管理员获取验证码
                  </p>
                </div>
              )}

              {/* 点名按钮 */}
              <button
                onClick={handleCheckIn}
                disabled={isLoading || hasCheckedIn || (requireCode && verificationCode.length !== 4)}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                  hasCheckedIn
                    ? 'bg-primary text-[var(--surface)] cursor-default'
                    : isLoading
                    ? 'bg-primary/50 text-[var(--surface)] cursor-wait'
                    : (requireCode && verificationCode.length !== 4)
                    ? 'bg-[var(--border)] text-[var(--text-secondary)] cursor-not-allowed'
                    : 'bg-primary hover:bg-primary-hover text-[var(--surface)] hover:shadow-[0_0_20px_rgba(19,236,128,0.4)] active:scale-[0.98]'
                }`}
              >
                {isLoading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin">hourglass_bottom</span>
                    点名中...
                  </>
                ) : hasCheckedIn ? (
                  <>
                    <span className="material-symbols-outlined">check_circle</span>
                    已点名
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">touch_app</span>
                    立即点名
                  </>
                )}
              </button>
            </>
          ) : (
            /* 非点名时间 */
            <div className="bg-[var(--surface-hover)] border border-[var(--border)] rounded-xl p-5 text-center">
              <span className="material-symbols-outlined text-[var(--text-secondary)] text-4xl mb-3">schedule</span>
              <p className="text-[var(--foreground)] font-medium mb-2">当前不在点名时间</p>
              <div className="text-[var(--text-secondary)] text-sm space-y-1">
                {status.config ? (
                  <>
                    <p>点名时间：{['周日', '周一', '周二', '周三', '周四', '周五', '周六'][status.config.dayOfWeek]}</p>
                    <div className="flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-primary text-sm">location_on</span>
                      <span>
                        {String(status.config.session1Start.hour).padStart(2, '0')}:
                        {String(status.config.session1Start.minute).padStart(2, '0')}-
                        {String(status.config.session1Start.hour + Math.floor((status.config.session1Start.minute + status.config.session1Duration) / 60)).padStart(2, '0')}:
                        {String((status.config.session1Start.minute + status.config.session1Duration) % 60).padStart(2, '0')}
                      </span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-primary text-sm">location_on</span>
                      <span>
                        {String(status.config.session2Start.hour).padStart(2, '0')}:
                        {String(status.config.session2Start.minute).padStart(2, '0')}-
                        {String(status.config.session2Start.hour + Math.floor((status.config.session2Start.minute + status.config.session2Duration) / 60)).padStart(2, '0')}:
                        {String((status.config.session2Start.minute + status.config.session2Duration) % 60).padStart(2, '0')}
                      </span>
                    </div>
                  </>
                ) : (
                  <p>加载点名时间中...</p>
                )}
              </div>
            </div>
          )}

          {/* 成功/错误消息 */}
          {message && (
            <div className="flex items-center gap-2 p-3 bg-primary/10 border border-primary/30 rounded-lg">
              <span className="material-symbols-outlined text-primary">check_circle</span>
              <p className="text-primary text-sm font-medium">{message}</p>
            </div>
          )}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <span className="material-symbols-outlined text-red-400">error</span>
              <p className="text-red-400 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Debug 按钮 */}
          {showDebugButton && (
            <div className="pt-4 border-t border-[var(--border)]">
              <button
                onClick={toggleDebugMode}
                className={`w-full py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                  debugMode
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30'
                    : 'bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:bg-[var(--card-hover)] hover:text-[var(--foreground)] border border-[var(--border)]'
                }`}
              >
                <span className="material-symbols-outlined text-sm">bug_report</span>
                {debugMode ? '关闭调试模式' : '开启调试模式（测试点名）'}
              </button>
              {debugMode && (
                <p className="mt-2 text-xs text-amber-400/70 text-center">
                  调试模式已开启，可在任何时间进行点名测试
                </p>
              )}
            </div>
          )}
          
          {/* 调试快捷键提示 */}
          {!showDebugButton && (
            <div className="pt-4 border-t border-[var(--border)]">
              <p className="text-xs text-[var(--text-secondary)] text-center">
                💡 提示：按 <kbd className="px-2 py-1 bg-[var(--surface-hover)] border border-[var(--border)] rounded text-xs font-mono">Ctrl+Shift+D</kbd> 显示调试功能
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
