/* eslint-disable prettier/prettier */
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/contexts/AuthContext';
import AttendanceWidget from '@/components/attendance/AttendanceWidget';
import StudentAttendanceRecords from '@/components/attendance/StudentAttendanceRecords';

interface AttendanceRecord {
  id: string;
  sessionTitle: string;
  location: string;
  date: string;
  time: string;
  status: 'present' | 'absent' | 'late';
}

interface AttendanceConfig {
  dayOfWeek: number;
  session1Start: { hour: number; minute: number };
  session1Duration: number;
  session2Start: { hour: number; minute: number };
  session2Duration: number;
}

// 模拟历史数据
const mockHistory: AttendanceRecord[] = [
  {
    id: '1',
    sessionTitle: '第一时段 (15:20)',
    location: '电脑室',
    date: '2026-01-08',
    time: '15:22',
    status: 'present',
  },
  {
    id: '2',
    sessionTitle: '第二时段 (16:35)',
    location: '电脑室',
    date: '2026-01-03',
    time: '16:38',
    status: 'present',
  },
  {
    id: '3',
    sessionTitle: '第一时段 (15:20)',
    location: '电脑室',
    date: '2025-12-27',
    time: '-',
    status: 'absent',
  },
];

export default function AttendancePage() {
  const { user, isStudent, isLoading: authLoading } = useAuth();
  const [history] = useState<AttendanceRecord[]>(mockHistory);
  const [showDebugButton, setShowDebugButton] = useState(false);
  const [attendanceConfig, setAttendanceConfig] = useState<AttendanceConfig | null>(null);

  // 获取点名配置
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('/api/attendance');
        const data = await response.json();
        if (data.config) {
          setAttendanceConfig(data.config);
        }
      } catch (error) {
        console.error('获取点名配置失败:', error);
      }
    };
    fetchConfig();
  }, []);

  // 检查 URL 参数是否有 debug=true
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('debug') === 'true') {
      setShowDebugButton(true);
    }
  }, []);

  // 格式化点名时间显示
  const formatAttendanceTime = () => {
    if (!attendanceConfig) {
      return '加载中...';
    }
    
    const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const dayName = dayNames[attendanceConfig.dayOfWeek];
    
    const s1Start = `${attendanceConfig.session1Start.hour}:${String(attendanceConfig.session1Start.minute).padStart(2, '0')}`;
    const s1End = `${attendanceConfig.session1Start.hour}:${String(attendanceConfig.session1Start.minute + attendanceConfig.session1Duration).padStart(2, '0')}`;
    
    const s2Start = `${attendanceConfig.session2Start.hour}:${String(attendanceConfig.session2Start.minute).padStart(2, '0')}`;
    const s2End = `${attendanceConfig.session2Start.hour}:${String(attendanceConfig.session2Start.minute + attendanceConfig.session2Duration).padStart(2, '0')}`;
    
    return `每${dayName} ${s1Start}-${s1End} 和 ${s2Start}-${s2End}`;
  };

  const statusLabels: Record<string, string> = {
    present: '出席',
    absent: '缺席',
    late: '迟到',
  };

  const statusColors: Record<string, string> = {
    present: 'bg-[#13ec80]/10 text-[#13ec80] border border-[#13ec80]/30',
    absent: 'bg-[#2a3c34] text-[#8a9e94] border border-[#3a4c44]',
    late: 'bg-amber-500/10 text-amber-400 border border-amber-500/30',
  };

  // 等待认证加载
  if (authLoading) {
    return (
      <div className="relative flex min-h-screen w-full flex-col bg-[#102219] overflow-x-hidden">
        <Header
          navItems={[
            { label: '首页', href: '/' },
            { label: '关于', href: '/about' },
            { label: '公告', href: '/notices' },
            { label: '活动', href: '/activities' },
          ]}
        />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <span className="material-symbols-outlined text-4xl text-[#13ec80] animate-spin">sync</span>
            <p className="text-[#8a9e94] mt-4">加载中...</p>
          </div>
        </main>
      </div>
    );
  }

  // 未登录时显示登录提示
  if (!user) {
    return (
      <div className="relative flex min-h-screen w-full flex-col bg-[#102219] overflow-x-hidden">
        <Header
          navItems={[
            { label: '首页', href: '/' },
            { label: '关于', href: '/about' },
            { label: '公告', href: '/notices' },
            { label: '活动', href: '/activities' },
          ]}
        />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="bg-[#1a2c24] border border-[#2a3c34] rounded-2xl p-8 text-center max-w-md">
            <span className="material-symbols-outlined text-6xl text-[#13ec80] mb-4">login</span>
            <h2 className="text-2xl font-bold text-white mb-2">请先登录</h2>
            <p className="text-[#8a9e94] mb-6">您需要登录学生账号才能进行点名</p>
            <Link 
              href="/auth?redirect=/attendance"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#13ec80] text-[#102219] font-semibold rounded-xl hover:bg-[#0fd673] transition-all"
            >
              <span className="material-symbols-outlined">login</span>
              前往登录
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-[#102219] overflow-x-hidden">
      {/* 顶部导航 */}
      <Header
        navItems={[
          { label: '首页', href: '/' },
          { label: '关于', href: '/about' },
          { label: '公告', href: '/notices' },
          { label: '活动', href: '/activities' },
        ]}
      />

      {/* 主要内容区 */}
      <main className="flex-1 flex flex-col items-center p-4 py-8 lg:p-10">
        <div className="w-full max-w-2xl flex flex-col gap-8">
          {/* 页面标题 */}
          <div className="text-center">
            <h1 className="text-3xl font-black text-white mb-2">
              社团点名
            </h1>
            <p className="text-[#8a9e94]">
              {user ? `欢迎，${user.name}` : '请在规定时间内完成点名'}
            </p>
          </div>

          {/* 点名组件 */}
          <AttendanceWidget
            studentId={user?.id || ''}
            studentName={user?.name || ''}
            studentEmail={user?.email || ''}
            showDebugButton={showDebugButton || !isStudent}
            onCheckInSuccess={() => {
              console.log('点名成功');
            }}
          />

          {/* 历史记录部分 */}
          <div className="mt-8">
            <StudentAttendanceRecords />
          </div>
        </div>

        {/* 提示信息 */}
        <div className="w-full max-w-2xl bg-[#1a2c24] border border-[#2a3c34] rounded-xl p-4 text-center">
          <p className="text-[#8a9e94] text-sm">
            <span className="material-symbols-outlined text-sm align-middle mr-1">info</span>
            点名时间：{formatAttendanceTime()}
          </p>
        </div>
      </main>
    </div>
  );
}
