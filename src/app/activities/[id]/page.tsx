/* eslint-disable prettier/prettier */
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Loading } from '@/components/ui/Loading';
import { useAuth } from '@/contexts/AuthContext';

interface Activity {
  id?: string;
  $id?: string;
  title: string;
  description: string;
  category: string;
  startTime: string;
  endTime: string;
  signupDeadline: string;
  location: string;
  organizer: string | null;
  maxParticipants: number;
  currentParticipants: number;
  status: string;
  coverImage: string;
  allowedGrades?: string;
}

// 临时模拟数据
const MOCK_ACTIVITIES: Activity[] = [
  {
    id: '1',
    title: 'Python 数据科学入门工作坊',
    description: '面向初学者的 Python 数据科学工作坊，学习 Pandas 和 NumPy 基础。本次工作坊将带你探索数据科学的奇妙世界，从零基础开始学习如何使用 Python 进行数据分析。',
    category: '工作坊',
    startTime: '2026-01-24T17:00:00Z',
    endTime: '2026-01-24T19:00:00Z',
    signupDeadline: '2026-01-23T23:59:00Z',
    location: '科学楼 304',
    organizer: 'Dr. Sarah Jenkins',
    maxParticipants: 40,
    currentParticipants: 24,
    status: 'published',
    coverImage: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&h=450&fit=crop',
  },
  {
    id: '2',
    title: 'LAN Party: Overwatch 2',
    description: '周五游戏之夜！带上你的设备来参加激动人心的 Overwatch 2 对战。我们将进行团队竞技比赛，还有丰厚的奖品等你来拿！',
    category: '其他',
    startTime: '2026-01-28T19:00:00Z',
    endTime: '2026-01-28T22:00:00Z',
    signupDeadline: '2026-01-27T23:59:00Z',
    location: '学生活动中心',
    organizer: null,
    maxParticipants: 50,
    currentParticipants: 32,
    status: 'published',
    coverImage: 'https://images.unsplash.com/photo-1493711662062-fa541f7f3d24?w=800&h=450&fit=crop',
  },
  {
    id: '3',
    title: '网络安全基础讲座',
    description: '了解网络安全的基本概念，学习如何保护你的数字身份。本讲座将涵盖常见的网络威胁、密码安全、以及如何识别钓鱼攻击。',
    category: '讲座',
    startTime: '2026-02-05T15:00:00Z',
    endTime: '2026-02-05T17:00:00Z',
    signupDeadline: '2026-02-04T23:59:00Z',
    location: '图书馆报告厅',
    organizer: 'Prof. Mike Chen',
    maxParticipants: 60,
    currentParticipants: 45,
    status: 'published',
    coverImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&h=450&fit=crop',
  },
];

const YEAR_OPTIONS = [
  { value: '', label: '选择年级' },
  { value: 'junior_1', label: '初一' },
  { value: 'junior_2', label: '初二' },
  { value: 'junior_3', label: '初三' },
  { value: 'senior_1_science', label: '高一理科' },
  { value: 'senior_2_science', label: '高二理科' },
  { value: 'senior_3_science', label: '高三理科' },
  { value: 'senior_1_commerce', label: '高一纯商' },
  { value: 'senior_2_commerce', label: '高二纯商' },
  { value: 'senior_3_commerce', label: '高三纯商' },
  { value: 'senior_1_arts', label: '高一文' },
  { value: 'senior_2_arts', label: '高二文' },
  { value: 'senior_3_arts', label: '高三文' },
];

export default function ActivityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  // 表单状态
  const [formData, setFormData] = useState({
    name: '',
    studentId: '',
    email: '',
    yearMajor: '',
    className: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 初始化表单数据从用户邮箱
  useEffect(() => {
    if (user?.email) {
      // 从邮箱提取前5-6位数字
      const emailPrefix = user.email.replace(/[^0-9]/g, '').slice(0, 6);
      setFormData((prev) => ({
        ...prev,
        name: emailPrefix,
        studentId: emailPrefix,
        email: user.email,
      }));
    }
  }, [user?.email]);

  useEffect(() => {
    const loadActivity = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/activities/${params.id}`);
        const data = await response.json();
        
        if (data.success && data.activity) {
          const activity = data.activity;
          // 检查报名是否已截止
          const signupDeadline = activity.signupDeadline ? new Date(activity.signupDeadline) : null;
          const isDeadlinePassed = signupDeadline ? signupDeadline < new Date() : false;
          
          setActivity({
            id: activity.$id,
            $id: activity.$id,
            title: activity.title,
            description: activity.description,
            category: activity.category,
            startTime: activity.startTime,
            endTime: activity.endTime,
            signupDeadline: activity.signupDeadline,
            location: activity.location,
            organizer: activity.organizer || null,
            maxParticipants: activity.maxParticipants || 0,
            currentParticipants: activity.currentParticipants || 0,
            status: isDeadlinePassed ? 'closed' : 'published',
            coverImage: activity.coverImage || 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&h=450&fit=crop',
            allowedGrades: activity.allowedGrades,
          });
        } else {
          const found = MOCK_ACTIVITIES.find((a) => a.id === params.id);
          setActivity(found || null);
        }
      } catch (err) {
        console.error('加载活动失败:', err);
        const found = MOCK_ACTIVITIES.find((a) => a.id === params.id);
        setActivity(found || null);
      } finally {
        setIsLoading(false);
      }
    };

    loadActivity();
  }, [params.id]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.yearMajor) {
      newErrors.yearMajor = '请选择年级';
    }

    if (!formData.className.trim()) {
      newErrors.className = '请输入班级';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/signups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          activityId: params.id,
          activityTitle: activity?.title,
          studentName: formData.name,
          studentEmail: formData.email,
          studentId: formData.studentId,
          year: formData.yearMajor,
          className: formData.className,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setToastType('success');
        setToastMessage('报名成功！我们将通过邮件发送确认信息。');
        setShowToast(true);

        // 重置表单
        setFormData({
          name: '',
          studentId: '',
          email: '',
          yearMajor: '',
          className: '',
        });

        // 3秒后跳转
        setTimeout(() => {
          router.push('/activities');
        }, 3000);
      } else {
        setToastType('error');
        setToastMessage(data.error || '报名失败，请重试');
        setShowToast(true);
      }
    } catch (err) {
      console.error('报名失败:', err);
      setToastType('error');
      setToastMessage('网络错误，请重试');
      setShowToast(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#102219]">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loading size="lg" text="加载活动详情..." />
        </main>
        <Footer />
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="min-h-screen flex flex-col bg-[#102219]">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center py-20">
          <span className="material-symbols-outlined text-6xl text-[#9db9ab] mb-4">event_busy</span>
          <h1 className="text-2xl font-bold text-white mb-2">活动不存在</h1>
          <p className="text-[#9db9ab] mb-6">请检查链接是否正确，或返回活动列表</p>
          <Link href="/activities">
            <Button variant="primary" leftIcon="arrow_back">
              返回活动列表
            </Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  // 分类样式供后续扩展使用
  // const categoryStyle = CATEGORY_STYLES[activity.category] || CATEGORY_STYLES.workshop;
  const capacityPercent = activity.maxParticipants > 0 
    ? Math.round((activity.currentParticipants / activity.maxParticipants) * 100)
    : 0;

  // 格式化日期时间
  const formatDateTime = (isoString: string) => {
    if (!isoString) return '未知';
    const date = new Date(isoString);
    return `${date.toLocaleDateString('zh-CN')} ${date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`;
  };

  // 检查截止日期
  const getDeadlineStatus = () => {
    if (!activity.signupDeadline) return { text: '未设置', color: 'text-gray-400' };
    const deadline = new Date(activity.signupDeadline);
    const now = new Date();
    const daysRemaining = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysRemaining < 0) {
      return { text: '已截止', color: 'text-red-400' };
    } else if (daysRemaining === 0) {
      return { text: '今天截止', color: 'text-amber-400' };
    } else if (daysRemaining <= 3) {
      return { text: `还剩 ${daysRemaining} 天`, color: 'text-amber-400' };
    } else {
      return { text: `还剩 ${daysRemaining} 天`, color: 'text-[#13ec80]' };
    }
  };

  const deadlineStatus = getDeadlineStatus();

  return (
    <div className="min-h-screen flex flex-col bg-[#102219]">
      <Header />

      <main className="flex-1 w-full max-w-300 mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 面包屑导航 */}
        <nav className="flex items-center text-sm text-[#9db9ab] mb-6 font-medium">
          <Link href="/" className="hover:text-[#13ec80] transition-colors">
            首页
          </Link>
          <span className="mx-2">/</span>
          <Link href="/activities" className="hover:text-[#13ec80] transition-colors">
            活动
          </Link>
          <span className="mx-2">/</span>
          <span className="text-white truncate max-w-50">{activity.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* 左侧：活动详情 */}
          <div className="lg:col-span-7">
            {/* 详情卡片 */}
            <div className="bg-[#1A2C23] rounded-xl shadow-sm overflow-hidden border border-[#283930]">
              {/* Hero 图片 */}
              <div
                className="h-48 md:h-64 w-full bg-cover bg-center relative"
                style={{ backgroundImage: `url(${activity.coverImage})` }}
              >
                <div className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent flex items-end p-6">
                  <div className="w-full">
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                          activity.status === 'published'
                            ? 'bg-[#13ec80] text-[#102219]'
                            : 'bg-red-500 text-white'
                        }`}
                      >
                        {activity.status === 'published' ? '开放报名' : '已截止'}
                      </span>
                      {activity.maxParticipants > 0 && (
                        <span className="px-3 py-1 rounded-full bg-black/50 text-white border border-white/20 text-xs font-medium backdrop-blur-sm">
                          容量: {activity.currentParticipants}/{activity.maxParticipants}
                        </span>
                      )}
                    </div>
                    <h1 className="text-white text-2xl md:text-3xl font-bold tracking-tight">
                      {activity.title}
                    </h1>
                  </div>
                </div>
              </div>

              <div className="p-6 md:p-8">
                {/* 元信息栏 */}
                <div className="flex flex-wrap gap-y-4 gap-x-8 pb-6 border-b border-[#283930] mb-6">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-[#13ec80]/10 flex items-center justify-center text-[#13ec80]">
                      <span className="material-symbols-outlined">schedule</span>
                    </div>
                    <div>
                      <p className="text-xs text-[#9db9ab] font-medium uppercase">日期时间</p>
                      <p className="text-sm font-semibold text-white">
                        {formatDateTime(activity.startTime)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-[#13ec80]/10 flex items-center justify-center text-[#13ec80]">
                      <span className="material-symbols-outlined">location_on</span>
                    </div>
                    <div>
                      <p className="text-xs text-[#9db9ab] font-medium uppercase">地点</p>
                      <p className="text-sm font-semibold text-white">{activity.location}</p>
                    </div>
                  </div>
                  {activity.organizer && (
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full bg-[#13ec80]/10 flex items-center justify-center text-[#13ec80]">
                        <span className="material-symbols-outlined">person</span>
                      </div>
                      <div>
                        <p className="text-xs text-[#9db9ab] font-medium uppercase">组织者</p>
                        <p className="text-sm font-semibold text-white">{activity.organizer}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-[#13ec80]/10 flex items-center justify-center text-[#13ec80]">
                      <span className="material-symbols-outlined">event</span>
                    </div>
                    <div>
                      <p className="text-xs text-[#9db9ab] font-medium uppercase">报名截止</p>
                      <p className={`text-sm font-semibold ${deadlineStatus.color}`}>{deadlineStatus.text}</p>
                    </div>
                  </div>
                </div>

                {/* 容量进度条 */}
                {activity.maxParticipants > 0 && (
                  <div className="mb-6">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-[#9db9ab]">报名进度</span>
                      <span className="text-white font-medium">
                        {activity.currentParticipants}/{activity.maxParticipants} ({capacityPercent}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[#283930] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          capacityPercent >= 100 ? 'bg-red-500' : 'bg-[#13ec80]'
                        }`}
                        style={{ width: `${Math.min(capacityPercent, 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* 描述内容 */}
                <div className="prose prose-sm prose-invert max-w-none text-gray-300">
                  <p>{activity.description}</p>

                  <h4 className="text-white font-bold mt-6 mb-3">活动须知：</h4>
                  <ul className="list-disc pl-5 space-y-1 marker:text-[#13ec80]">
                    <li>请准时到达活动地点</li>
                    <li>携带必要的设备（如工作坊需要笔记本电脑）</li>
                    <li>如需取消报名，请提前24小时通知</li>
                  </ul>

                  {activity.category === '工作坊' && (
                    <p className="mt-4 text-sm bg-amber-500/10 text-amber-200 p-3 rounded-lg border border-amber-500/20 flex items-start gap-2">
                      <span className="material-symbols-outlined text-lg">info</span>
                      <span>工作坊期间请保持安静，尊重讲师和其他参与者。</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* 返回链接 */}
            <div className="mt-6">
              <Link
                href="/activities"
                className="inline-flex items-center gap-2 text-sm font-medium text-[#9db9ab] hover:text-[#13ec80] transition-colors"
              >
                <span className="material-symbols-outlined text-lg">arrow_back</span>
                返回活动列表
              </Link>
            </div>
          </div>

          {/* 右侧：报名表单 */}
          <div className="lg:col-span-5">
            <div className="sticky top-24">
              {activity.status === 'published' ? (
                <div className="bg-[#1A2C23] rounded-xl shadow-sm border border-[#283930] p-6 md:p-8 relative overflow-hidden">
                  {/* 装饰线条 */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-[#13ec80] to-emerald-600"></div>

                  <div className="flex items-center gap-3 mb-6">
                    <div className="size-10 rounded bg-[#13ec80] flex items-center justify-center text-[#102219]">
                      <span className="material-symbols-outlined">edit_square</span>
                    </div>
                    <h3 className="text-xl font-bold text-white">立即报名</h3>
                  </div>

                  <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    {/* 姓名 - 只读 */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-gray-300" htmlFor="name">
                        姓名 <span className="text-red-400">*</span>
                      </label>
                      <Input
                        id="name"
                        placeholder="请输入您的姓名"
                        value={formData.name}
                        disabled
                        rightIcon={<span className="material-symbols-outlined text-[20px]">badge</span>}
                      />
                      <p className="text-xs text-[#9db9ab]">自动从邮箱提取</p>
                    </div>

                    {/* 学号 - 只读 */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-gray-300" htmlFor="studentId">
                        学号 <span className="text-red-400">*</span>
                      </label>
                      <Input
                        id="studentId"
                        placeholder="请输入您的学号"
                        value={formData.studentId}
                        disabled
                        rightIcon={<span className="material-symbols-outlined text-[20px]">numbers</span>}
                      />
                      <p className="text-xs text-[#9db9ab]">自动从邮箱提取</p>
                    </div>

                    {/* 邮箱 - 只读 */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-gray-300" htmlFor="email">
                        邮箱 <span className="text-red-400">*</span>
                      </label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="example@school.edu"
                        value={formData.email}
                        disabled
                        rightIcon={<span className="material-symbols-outlined text-[20px]">mail</span>}
                      />
                      <p className="text-xs text-[#9db9ab]">我们将通过此邮箱发送活动确认信息</p>
                    </div>

                    {/* 年级 */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-gray-300" htmlFor="yearMajor">
                        年级 <span className="text-red-400">*</span>
                      </label>
                      <Select
                        id="yearMajor"
                        options={
                          // 如果设置了允许的年级，则只显示那些年级
                          activity.allowedGrades
                            ? YEAR_OPTIONS.filter(
                                (opt) =>
                                  opt.value === '' ||
                                  JSON.parse(activity.allowedGrades || '[]').includes(opt.value)
                              )
                            : YEAR_OPTIONS
                        }
                        value={formData.yearMajor}
                        onChange={(e) => setFormData({ ...formData, yearMajor: e.target.value })}
                        error={errors.yearMajor}
                      />
                      {activity.allowedGrades && JSON.parse(activity.allowedGrades).length > 0 && (
                        <p className="text-xs text-[#9db9ab]">
                          仅限{' '}
                          {JSON.parse(activity.allowedGrades)
                            .map((g: string) => YEAR_OPTIONS.find((o) => o.value === g)?.label || g)
                            .join('、')}{' '}
                          学生报名
                        </p>
                      )}
                    </div>

                    {/* 班级 */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-gray-300" htmlFor="className">
                        班级 <span className="text-red-400">*</span>
                      </label>
                      <Input
                        id="className"
                        placeholder="请输入您的班级，例如：初一 A 班"
                        value={formData.className}
                        onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                        rightIcon={<span className="material-symbols-outlined text-[20px]">groups</span>}
                        error={errors.className}
                      />
                    </div>

                    {/* 提交按钮 */}
                    <div className="pt-2">
                      <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        glow
                        isLoading={isSubmitting}
                        rightIcon="arrow_forward"
                        className="w-full"
                      >
                        确认报名
                      </Button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="bg-[#1A2C23] rounded-xl shadow-sm border border-[#283930] p-6 md:p-8 text-center">
                  <span className="material-symbols-outlined text-5xl text-red-400 mb-4">
                    event_busy
                  </span>
                  <h3 className="text-xl font-bold text-white mb-2">报名已截止</h3>
                  <p className="text-[#9db9ab] mb-6">
                    该活动报名已结束，请关注其他活动
                  </p>
                  <Link href="/activities">
                    <Button variant="secondary" leftIcon="event">
                      浏览其他活动
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />

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
    </div>
  );
}
