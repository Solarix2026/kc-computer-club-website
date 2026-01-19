/* eslint-disable prettier/prettier */
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { StudentLayout } from '@/components/layout/StudentLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Loading } from '@/components/ui/Loading';
import { useAuth } from '@/contexts/AuthContext';

interface SignupFormData {
  fullName: string;
  email: string;
  studentId: string;
  grade: string;
  phone: string;
  additionalInfo: string;
}

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

const GRADE_OPTIONS = [
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

const MOCK_ACTIVITY: Activity = {
  id: '1',
  title: 'Python 数据科学入门工作坊',
  description: '面向初学者的 Python 数据科学工作坊，学习 Pandas 和 NumPy 基础。',
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
};

export default function ActivitySignupPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [activity, setActivity] = useState<Activity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<SignupFormData>({
    fullName: '',
    email: user?.email || '',
    studentId: '',
    grade: '',
    phone: '',
    additionalInfo: '',
  });

  useEffect(() => {
    // Redirect if not logged in
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }

    const loadActivity = async () => {
      try {
        setIsLoading(true);
        // In real app, fetch from API
        setActivity(MOCK_ACTIVITY);
        setFormData(prev => ({
          ...prev,
          email: user?.email || '',
        }));
      } catch (error) {
        console.error('Failed to load activity:', error);
        alert('Failed to load activity');
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading) {
      loadActivity();
    }
  }, [user, authLoading, router]);

  const handleInputChange = (field: keyof SignupFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.fullName.trim()) {
      alert('Please enter your full name');
      return;
    }
    if (!formData.grade) {
      alert('Please select your grade');
      return;
    }
    if (!formData.phone.trim()) {
      alert('Please enter your phone number');
      return;
    }

    setIsSubmitting(true);
    try {
      // In real app, submit to API
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert('Successfully signed up for this activity!');
      setTimeout(() => {
        router.push(`/activities/${params.id}`);
      }, 1500);
    } catch (error) {
      console.error('Signup failed:', error);
      alert('Failed to sign up. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <StudentLayout>
        <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: 'var(--background)', minHeight: '400px' }}>
          <Loading size="lg" text="加载中..." />
        </div>
      </StudentLayout>
    );
  }

  if (!activity) {
    return (
      <StudentLayout>
        <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: 'var(--background)', minHeight: '400px' }}>
          <div className="text-center">
            <span className="material-symbols-outlined text-5xl mb-4" style={{ color: 'var(--primary)' }}>error</span>
            <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>活动未找到</h2>
            <Link href="/activities">
              <Button variant="primary">返回活动列表</Button>
            </Link>
          </div>
        </div>
      </StudentLayout>
    );
  }

  const isFull = activity.currentParticipants >= activity.maxParticipants;
  const isDeadlinePassed = new Date(activity.signupDeadline) < new Date();

  return (
    <StudentLayout>
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
        {/* 面包屑导航 */}
        <nav className="flex items-center text-sm mb-8 font-medium" style={{ color: 'var(--text-secondary)' }}>
          <Link href="/activities" className="transition-colors" style={{ color: 'var(--text-secondary)' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}>
            活动
          </Link>
          <span className="mx-2">/</span>
          <Link href={`/activities/${params.id}`} className="transition-colors" style={{ color: 'var(--text-secondary)' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}>
            {activity.title}
          </Link>
          <span className="mx-2">/</span>
          <span style={{ color: 'var(--foreground)' }}>报名</span>
        </nav>

        {/* 页面头部 */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2" style={{ color: 'var(--foreground)' }}>
            活动报名
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            填写以下信息完成对《{activity.title}》的报名
          </p>
        </div>

        {/* 活动摘要卡片 */}
        <div className="mb-8 rounded-xl border p-6" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
          <div className="flex gap-6 items-start">
            {/* 活动图片 */}
            <div className="w-32 h-32 rounded-lg flex-shrink-0 overflow-hidden">
              <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${activity.coverImage})` }} />
            </div>

            {/* 活动信息 */}
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
                {activity.title}
              </h2>
              <div className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined">calendar_today</span>
                  <span>{new Date(activity.startTime).toLocaleDateString('zh-CN')} {new Date(activity.startTime).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined">location_on</span>
                  <span>{activity.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined">group</span>
                  <span>{activity.currentParticipants} / {activity.maxParticipants} 人</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 报名状态提示 */}
        {isFull && (
          <div className="mb-8 rounded-lg border-l-4 p-4" style={{ backgroundColor: 'rgb(239, 68, 68)', borderColor: 'rgb(220, 38, 38)', color: 'white' }}>
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined mt-0.5">info</span>
              <div>
                <p className="font-semibold">报名已满</p>
                <p className="text-sm opacity-90">此活动报名人数已达上限，无法继续报名。</p>
              </div>
            </div>
          </div>
        )}

        {isDeadlinePassed && !isFull && (
          <div className="mb-8 rounded-lg border-l-4 p-4" style={{ backgroundColor: 'rgb(245, 158, 11)', borderColor: 'rgb(217, 119, 6)', color: 'white' }}>
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined mt-0.5">warning</span>
              <div>
                <p className="font-semibold">报名截止</p>
                <p className="text-sm opacity-90">报名截止时间已过，但您仍可以尝试报名。</p>
              </div>
            </div>
          </div>
        )}

        {/* 报名表格 */}
        <div className="rounded-xl border p-8" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 全名 */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
                全名 <span style={{ color: 'var(--primary)' }}>*</span>
              </label>
              <Input
                type="text"
                placeholder="请输入您的全名"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>

            {/* 邮箱 */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
                邮箱地址
              </label>
              <Input
                type="email"
                placeholder="your.email@school.edu"
                value={formData.email}
                disabled
              />
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                账户邮箱地址，无法修改
              </p>
            </div>

            {/* 学号 */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
                学号
              </label>
              <Input
                type="text"
                placeholder="例如: 2024001"
                value={formData.studentId}
                onChange={(e) => handleInputChange('studentId', e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            {/* 年级 */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
                年级 <span style={{ color: 'var(--primary)' }}>*</span>
              </label>
              <Select
                options={GRADE_OPTIONS}
                value={formData.grade}
                onChange={(e) => handleInputChange('grade', e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            {/* 电话 */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
                电话号码 <span style={{ color: 'var(--primary)' }}>*</span>
              </label>
              <Input
                type="tel"
                placeholder="例如: +60 1-XXXX-XXXX"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>

            {/* 附加信息 */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
                附加信息
              </label>
              <textarea
                placeholder="请输入任何补充信息（可选）"
                value={formData.additionalInfo}
                onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
                disabled={isSubmitting}
                rows={5}
                className="w-full rounded-lg border p-3 text-sm transition-all focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  borderColor: 'var(--card-border)',
                  color: 'var(--foreground)',
                  '--tw-ring-color': 'var(--primary)',
                } as React.CSSProperties}
              />
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                您可以在此说明任何相关的信息，例如特殊需求或备注
              </p>
            </div>

            {/* 行动按钮 */}
            <div className="flex gap-4 pt-6">
              <Button
                variant="primary"
                type="submit"
                disabled={isSubmitting || isFull}
                className="flex-1"
                style={{
                  opacity: isSubmitting || isFull ? 0.5 : 1,
                  cursor: isSubmitting || isFull ? 'not-allowed' : 'pointer',
                }}
              >
                {isSubmitting ? (
                  <>
                    <span className="material-symbols-outlined animate-spin mr-2">hourglass_empty</span>
                    提交中...
                  </>
                ) : isFull ? (
                  '报名已满'
                ) : (
                  '确认报名'
                )}
              </Button>
              <Link href={`/activities/${params.id}`} className="flex-1">
                <Button variant="secondary" className="w-full">
                  取消
                </Button>
              </Link>
            </div>
          </form>
        </div>
      </main>
    </StudentLayout>
  );
}
