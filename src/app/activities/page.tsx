/* eslint-disable prettier/prettier */
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Loading } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';

interface Activity {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  time: string;
  location: string;
  instructor: string | null;
  capacity: number;
  registered: number;
  status: string;
  imageUrl: string;
  isPinned: boolean;
  [key: string]: unknown;
}

// 临时模拟数据
const MOCK_ACTIVITIES = [
  {
    id: '1',
    title: 'Python 数据科学入门工作坊',
    description: '面向初学者的 Python 数据科学工作坊，学习 Pandas 和 NumPy 基础',
    category: 'workshop',
    date: '2024-01-24',
    time: '下午 5:00',
    location: '科学楼 304',
    instructor: 'Dr. Sarah Jenkins',
    capacity: 40,
    registered: 24,
    status: 'open',
    imageUrl: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&h=450&fit=crop',
    isPinned: true,
  },
  {
    id: '2',
    title: 'LAN Party: Overwatch 2',
    description: '周五游戏之夜！带上你的设备来参加激动人心的 Overwatch 2 对战',
    category: 'social',
    date: '2024-01-28',
    time: '晚上 7:00',
    location: '学生活动中心',
    instructor: null,
    capacity: 50,
    registered: 32,
    status: 'open',
    imageUrl: 'https://images.unsplash.com/photo-1493711662062-fa541f7f3d24?w=800&h=450&fit=crop',
    isPinned: false,
  },
  {
    id: '3',
    title: '网络安全基础讲座',
    description: '了解网络安全的基本概念，学习如何保护你的数字身份',
    category: 'workshop',
    date: '2024-02-05',
    time: '下午 3:00',
    location: '图书馆报告厅',
    instructor: 'Prof. Mike Chen',
    capacity: 60,
    registered: 45,
    status: 'open',
    imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&h=450&fit=crop',
    isPinned: false,
  },
  {
    id: '4',
    title: '2024 全球黑客马拉松',
    description: '48小时编程马拉松，挑战你的创造力和技术能力',
    category: 'hackathon',
    date: '2024-02-15',
    time: '全天',
    location: '创新中心',
    instructor: null,
    capacity: 200,
    registered: 156,
    status: 'open',
    imageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&h=450&fit=crop',
    isPinned: true,
  },
  {
    id: '5',
    title: 'Web 开发训练营',
    description: '为期一周的 Web 开发集训，从 HTML/CSS 到 React 全栈开发',
    category: 'workshop',
    date: '2024-02-20',
    time: '每天下午 2:00',
    location: '计算机实验室',
    instructor: 'Alex Chen',
    capacity: 30,
    registered: 30,
    status: 'closed',
    imageUrl: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=450&fit=crop',
    isPinned: false,
  },
];

const CATEGORY_OPTIONS = [
  { value: 'all', label: '所有分类' },
  { value: 'workshop', label: '工作坊' },
  { value: 'hackathon', label: '黑客马拉松' },
  { value: 'social', label: '社交活动' },
];

const STATUS_OPTIONS = [
  { value: 'all', label: '所有状态' },
  { value: 'open', label: '开放报名' },
  { value: 'closed', label: '已截止' },
];

const CATEGORY_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  workshop: { bg: 'bg-blue-500/10', text: 'text-blue-400', label: '工作坊' },
  hackathon: { bg: 'bg-purple-500/10', text: 'text-purple-400', label: '黑客马拉松' },
  social: { bg: 'bg-amber-500/10', text: 'text-amber-400', label: '社交活动' },
};

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  useEffect(() => {
    const loadActivities = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/activities?onlyPublished=true');
        const data = await response.json();
        
        if (data.success && data.activities) {
          setActivities(data.activities.map((activity: Record<string, unknown>) => ({
            ...activity,
            id: (activity as Record<string, unknown>).$id as string,
            time: (activity as Record<string, unknown>).startTime as string,
            status: (activity as Record<string, unknown>).status === 'published' ? 'open' : 'closed',
          } as Activity)));
        } else {
          setActivities(MOCK_ACTIVITIES);
        }
        // 默认选中第一个活动
        setTimeout(() => {
          if (data.activities && data.activities.length > 0) {
            setSelectedActivity({
              ...(data.activities[0] as Record<string, unknown>),
              id: (data.activities[0] as Record<string, unknown>).$id as string,
              time: (data.activities[0] as Record<string, unknown>).startTime as string,
            } as Activity);
          } else if (MOCK_ACTIVITIES.length > 0) {
            setSelectedActivity(MOCK_ACTIVITIES[0]);
          }
        }, 100);
      } catch (err) {
        console.error('加载活动失败:', err);
        setActivities(MOCK_ACTIVITIES);
        if (MOCK_ACTIVITIES.length > 0) {
          setSelectedActivity(MOCK_ACTIVITIES[0]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadActivities();
  }, []);

  // 过滤活动
  const filteredActivities = activities.filter((activity) => {
    const matchesSearch =
      activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || activity.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || activity.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#102219]">
      <Header />

      <main className="flex-1 w-full max-w-350 mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2">
            近期活动
          </h1>
          <p className="text-[#9db9ab]">
            浏览并报名参加俱乐部的工作坊、黑客马拉松和社交活动
          </p>
        </div>

        {/* 搜索和过滤 */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1">
            <Input
              placeholder="搜索活动..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<span className="material-symbols-outlined text-[20px]">search</span>}
            />
          </div>
          <div className="w-full sm:w-40">
            <Select
              options={CATEGORY_OPTIONS}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-40">
            <Select
              options={STATUS_OPTIONS}
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loading size="lg" text="加载活动中..." />
          </div>
        ) : filteredActivities.length === 0 ? (
          <EmptyState
            icon="event"
            title="暂无活动"
            description="没有找到符合条件的活动，请尝试调整筛选条件"
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* 左侧：活动列表 */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">活动列表</h3>
                <span className="text-xs font-medium bg-[#13ec80]/20 text-[#13ec80] px-2 py-1 rounded-full">
                  {filteredActivities.filter((a) => a.status === 'open').length} 个开放
                </span>
              </div>

              {filteredActivities.map((activity) => {
                const isSelected = selectedActivity?.id === activity.id;
                const categoryStyle = CATEGORY_STYLES[activity.category] || CATEGORY_STYLES.workshop;

                return (
                  <div
                    key={activity.id}
                    onClick={() => setSelectedActivity(activity)}
                    className={`group cursor-pointer rounded-xl bg-[#1A2C23] p-4 transition-all hover:shadow-lg ${
                      isSelected
                        ? 'border-l-4 border-[#13ec80] shadow-[0_2px_8px_rgba(0,0,0,0.1)]'
                        : 'border border-transparent hover:border-[#283930]'
                    }`}
                  >
                    <div className="flex gap-4">
                      <div
                        className="bg-cover bg-center rounded-lg size-16 shrink-0"
                        style={{ backgroundImage: `url(${activity.imageUrl})` }}
                      />
                      <div className="flex flex-col justify-center min-w-0">
                        <p
                          className={`text-base font-bold leading-tight truncate ${
                            isSelected ? 'text-white' : 'text-gray-200'
                          }`}
                        >
                          {activity.title}
                        </p>
                        <p className="text-[#9db9ab] text-sm font-normal mt-1 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                          {activity.date}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${categoryStyle.bg} ${categoryStyle.text}`}
                          >
                            {categoryStyle.label}
                          </span>
                          {activity.status === 'closed' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-500/10 text-red-400">
                              已截止
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 右侧：活动详情 */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              {selectedActivity ? (
                <ActivityDetail activity={selectedActivity} />
              ) : (
                <div className="bg-[#1A2C23] rounded-xl border border-[#283930] p-12 text-center">
                  <span className="material-symbols-outlined text-5xl text-[#9db9ab] mb-4">
                    touch_app
                  </span>
                  <p className="text-[#9db9ab]">选择左侧的活动查看详情</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

// 活动详情组件
interface ActivityDetailProps {
  activity: (typeof MOCK_ACTIVITIES)[0];
}

function ActivityDetail({ activity }: ActivityDetailProps) {
  // 分类样式供后续扩展使用
  // const categoryStyle = CATEGORY_STYLES[activity.category] || CATEGORY_STYLES.workshop;
  const capacityPercent = Math.round((activity.registered / activity.capacity) * 100);

  return (
    <>
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
              <h2 className="text-white text-2xl md:text-3xl font-bold tracking-tight">
                {activity.title}
              </h2>
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
            
            <h4 className="text-white font-bold mt-4 mb-2">活动须知：</h4>
            <ul className="list-disc pl-5 space-y-1 marker:text-[#13ec80]">
              <li>请准时到达活动地点</li>
              <li>携带必要的设备（如工作坊需要笔记本电脑）</li>
              <li>如需取消报名，请提前24小时通知</li>
            </ul>

            {activity.category === 'workshop' && (
              <p className="mt-4 text-sm bg-amber-500/10 text-amber-200 p-3 rounded-lg border border-amber-500/20 flex items-start gap-2">
                <span className="material-symbols-outlined text-lg">info</span>
                <span>工作坊期间请保持安静，尊重讲师和其他参与者。</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 报名表单 */}
      {activity.status === 'open' && (
        <Link
          href={`/activities/${activity.id}`}
          className="block bg-[#1A2C23] rounded-xl shadow-sm border border-[#283930] p-6 md:p-8 relative overflow-hidden group hover:border-[#13ec80]/50 transition-colors"
        >
          {/* 装饰线条 */}
          <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-[#13ec80] to-emerald-600"></div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded bg-[#13ec80] flex items-center justify-center text-[#102219]">
                <span className="material-symbols-outlined">edit_square</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">立即报名</h3>
                <p className="text-sm text-[#9db9ab]">点击进入报名页面填写信息</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-[#13ec80] text-3xl group-hover:translate-x-1 transition-transform">
              arrow_forward
            </span>
          </div>
        </Link>
      )}
    </>
  );
}
