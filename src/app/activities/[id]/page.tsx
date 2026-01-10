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

// 临时模拟数据
const MOCK_ACTIVITIES = [
  {
    id: '1',
    title: 'Python 数据科学入门工作坊',
    description: '面向初学者的 Python 数据科学工作坊，学习 Pandas 和 NumPy 基础。本次工作坊将带你探索数据科学的奇妙世界，从零基础开始学习如何使用 Python 进行数据分析。',
    category: 'workshop',
    date: '2024-01-24',
    time: '下午 5:00',
    location: '科学楼 304',
    instructor: 'Dr. Sarah Jenkins',
    capacity: 40,
    registered: 24,
    status: 'open',
    imageUrl: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=1200&h=675&fit=crop',
    whatYouLearn: [
      '搭建 Python 数据科学开发环境',
      '使用 Pandas DataFrame 进行数据操作',
      '使用 NumPy 进行基础统计分析',
      '使用 Matplotlib 进行数据可视化',
    ],
    requirements: '请携带已安装 Python 3.8+ 的笔记本电脑。如需帮助安装，请提前15分钟到达。',
  },
  {
    id: '2',
    title: 'LAN Party: Overwatch 2',
    description: '周五游戏之夜！带上你的设备来参加激动人心的 Overwatch 2 对战。我们将进行团队竞技比赛，还有丰厚的奖品等你来拿！',
    category: 'social',
    date: '2024-01-28',
    time: '晚上 7:00',
    location: '学生活动中心',
    instructor: null,
    capacity: 50,
    registered: 32,
    status: 'open',
    imageUrl: 'https://images.unsplash.com/photo-1493711662062-fa541f7f3d24?w=1200&h=675&fit=crop',
    whatYouLearn: [],
    requirements: '请携带自己的游戏设备和耳机。',
  },
  {
    id: '3',
    title: '网络安全基础讲座',
    description: '了解网络安全的基本概念，学习如何保护你的数字身份。本讲座将涵盖常见的网络威胁、密码安全、以及如何识别钓鱼攻击。',
    category: 'workshop',
    date: '2024-02-05',
    time: '下午 3:00',
    location: '图书馆报告厅',
    instructor: 'Prof. Mike Chen',
    capacity: 60,
    registered: 45,
    status: 'open',
    imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&h=675&fit=crop',
    whatYouLearn: [
      '了解常见的网络安全威胁',
      '学习创建和管理强密码',
      '识别钓鱼邮件和诈骗网站',
      '保护个人隐私的最佳实践',
    ],
    requirements: null,
  },
  {
    id: '4',
    title: '2024 全球黑客马拉松',
    description: '48小时编程马拉松，挑战你的创造力和技术能力。今年的主题是"可持续未来"，邀请你开发解决环境问题的创新解决方案。',
    category: 'hackathon',
    date: '2024-02-15',
    time: '全天',
    location: '创新中心',
    instructor: null,
    capacity: 200,
    registered: 156,
    status: 'open',
    imageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&h=675&fit=crop',
    whatYouLearn: [],
    requirements: '团队必须由3-5人组成。请提前组队或在 Discord #team-formation 频道寻找队友。',
  },
  {
    id: '5',
    title: 'Web 开发训练营',
    description: '为期一周的 Web 开发集训，从 HTML/CSS 到 React 全栈开发。本训练营适合有一定编程基础的学生。',
    category: 'workshop',
    date: '2024-02-20',
    time: '每天下午 2:00',
    location: '计算机实验室',
    instructor: 'Alex Chen',
    capacity: 30,
    registered: 30,
    status: 'closed',
    imageUrl: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&h=675&fit=crop',
    whatYouLearn: [
      'HTML5 和 CSS3 基础',
      'JavaScript ES6+ 语法',
      'React 框架入门',
      '构建完整的 Web 应用',
    ],
    requirements: '需要有基础的编程知识。请携带笔记本电脑。',
  },
];

const YEAR_OPTIONS = [
  { value: '', label: '选择年级/专业' },
  { value: 'freshman_cs', label: '大一 - 计算机科学' },
  { value: 'sophomore_cs', label: '大二 - 计算机科学' },
  { value: 'junior_cs', label: '大三 - 计算机科学' },
  { value: 'senior_cs', label: '大四 - 计算机科学' },
  { value: 'freshman_other', label: '大一 - 其他专业' },
  { value: 'sophomore_other', label: '大二 - 其他专业' },
  { value: 'junior_other', label: '大三 - 其他专业' },
  { value: 'senior_other', label: '大四 - 其他专业' },
  { value: 'graduate', label: '研究生' },
  { value: 'other', label: '其他' },
];

export default function ActivityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [activity, setActivity] = useState<(typeof MOCK_ACTIVITIES)[0] | null>(null);
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
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadActivity = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/activities/${params.id}`);
        const data = await response.json();
        
        if (data.success) {
          setActivity({
            ...data.activity,
            id: data.activity.$id,
            time: data.activity.startTime,
            whatYouLearn: data.activity.description?.split('。').filter(Boolean) || [],
            requirements: '请携带笔记本电脑。',
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

    if (!formData.name.trim()) {
      newErrors.name = '请输入姓名';
    }

    if (!formData.studentId.trim()) {
      newErrors.studentId = '请输入学号';
    } else if (!/^\d{6,12}$/.test(formData.studentId)) {
      newErrors.studentId = '学号格式不正确';
    }

    if (!formData.email.trim()) {
      newErrors.email = '请输入邮箱';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '邮箱格式不正确';
    }

    if (!formData.yearMajor) {
      newErrors.yearMajor = '请选择年级/专业';
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
  const capacityPercent = Math.round((activity.registered / activity.capacity) * 100);

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
                style={{ backgroundImage: `url(${activity.imageUrl})` }}
              >
                <div className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent flex items-end p-6">
                  <div className="w-full">
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                          activity.status === 'open'
                            ? 'bg-[#13ec80] text-[#102219]'
                            : 'bg-red-500 text-white'
                        }`}
                      >
                        {activity.status === 'open' ? '开放报名' : '已截止'}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-black/50 text-white border border-white/20 text-xs font-medium backdrop-blur-sm">
                        容量: {activity.registered}/{activity.capacity}
                      </span>
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
                        {activity.date} • {activity.time}
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
                  {activity.instructor && (
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full bg-[#13ec80]/10 flex items-center justify-center text-[#13ec80]">
                        <span className="material-symbols-outlined">person</span>
                      </div>
                      <div>
                        <p className="text-xs text-[#9db9ab] font-medium uppercase">讲师</p>
                        <p className="text-sm font-semibold text-white">{activity.instructor}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* 容量进度条 */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-[#9db9ab]">报名进度</span>
                    <span className="text-white font-medium">
                      {activity.registered}/{activity.capacity} ({capacityPercent}%)
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

                {/* 描述内容 */}
                <div className="prose prose-sm prose-invert max-w-none text-gray-300">
                  <p>{activity.description}</p>

                  {activity.whatYouLearn.length > 0 && (
                    <>
                      <h4 className="text-white font-bold mt-6 mb-3">你将学到：</h4>
                      <ul className="list-disc pl-5 space-y-1 marker:text-[#13ec80]">
                        {activity.whatYouLearn.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </>
                  )}

                  {activity.requirements && (
                    <div className="mt-6 p-4 bg-amber-500/10 text-amber-200 rounded-lg border border-amber-500/20 flex items-start gap-3">
                      <span className="material-symbols-outlined text-xl">info</span>
                      <span>{activity.requirements}</span>
                    </div>
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
              {activity.status === 'open' ? (
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
                    {/* 姓名 */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-gray-300" htmlFor="name">
                        姓名 <span className="text-red-400">*</span>
                      </label>
                      <Input
                        id="name"
                        placeholder="请输入您的姓名"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        rightIcon={<span className="material-symbols-outlined text-[20px]">badge</span>}
                        error={errors.name}
                      />
                    </div>

                    {/* 学号 */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-gray-300" htmlFor="studentId">
                        学号 <span className="text-red-400">*</span>
                      </label>
                      <Input
                        id="studentId"
                        placeholder="请输入您的学号"
                        value={formData.studentId}
                        onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                        rightIcon={<span className="material-symbols-outlined text-[20px]">numbers</span>}
                        error={errors.studentId}
                      />
                    </div>

                    {/* 邮箱 */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-gray-300" htmlFor="email">
                        邮箱 <span className="text-red-400">*</span>
                      </label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="example@school.edu"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        rightIcon={<span className="material-symbols-outlined text-[20px]">mail</span>}
                        error={errors.email}
                      />
                      <p className="text-xs text-[#9db9ab]">我们将通过此邮箱发送活动确认信息</p>
                    </div>

                    {/* 年级/专业 */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-gray-300" htmlFor="yearMajor">
                        年级/专业 <span className="text-red-400">*</span>
                      </label>
                      <Select
                        id="yearMajor"
                        options={YEAR_OPTIONS}
                        value={formData.yearMajor}
                        onChange={(e) => setFormData({ ...formData, yearMajor: e.target.value })}
                        error={errors.yearMajor}
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
