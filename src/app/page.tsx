/* eslint-disable prettier/prettier */
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { StudentLayout } from '@/components/layout/StudentLayout';
import { HeroSection } from '@/components/sections/HeroSection';
import { NoticesSection, EventsSection } from '@/components/sections/NoticesSection';
import { ActiveProjectsSection } from '@/components/sections/ActiveProjectsSection';
import AttendanceWidget from '@/components/attendance/AttendanceWidget';

// 默认数据结构
interface Notice {
  id: string;
  title: string;
  summary: string;
  category: string;
  icon: string;
  iconColor: string;
  publishedAt: string | Date;
}

interface Activity {
  id: string;
  title: string;
  category: string;
  date: string | Date;
  time: string;
  location: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  contributors: number;
  repoUrl?: string;
}

// 模拟数据
const defaultNotices: Notice[] = [
  {
    id: '1',
    title: '服务器维护通知',
    summary: '本周五晚 10:00 进行系统维护，届时服务将暂停。',
    category: '系统',
    icon: 'warning',
    iconColor: 'orange',
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: '2',
    title: '编程马拉松获奖名单',
    summary: '恭喜 NullPointer 队荣获第一名！',
    category: '新闻',
    icon: 'emoji_events',
    iconColor: 'green',
    publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
  {
    id: '3',
    title: '新设备入驻机房',
    summary: 'VR 设备现已开放借用，请到 304 室办理。',
    category: '更新',
    icon: 'science',
    iconColor: 'blue',
    publishedAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
  },
];

const defaultActivities: Activity[] = [
  {
    id: '1',
    title: 'React 入门工作坊',
    category: '工作坊',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    time: '17:00',
    location: '402 室',
  },
  {
    id: '2',
    title: 'LAN Party 游戏之夜',
    category: '社交',
    date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    time: '20:00',
    location: '大礼堂',
  },
];

const defaultProjects: Project[] = [
  {
    id: '1',
    title: '神经网络可视化工具',
    description: '一个基于 Web 的工具，实时可视化神经网络的学习过程。',
    contributors: 3,
    repoUrl: 'https://github.com',
  },
  {
    id: '2',
    title: '复古游戏引擎',
    description: '使用 C++ 构建的轻量级 2D 平台游戏引擎。',
    contributors: 2,
    repoUrl: 'https://github.com',
  },
  {
    id: '3',
    title: 'UniSchedule 课表应用',
    description: '开源的学生课程表管理移动应用。',
    contributors: 5,
    repoUrl: 'https://github.com',
  },
];

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const [notices, setNotices] = useState<Notice[]>(defaultNotices);
  const [activities, setActivities] = useState<Activity[]>(defaultActivities);
  const [projects, setProjects] = useState<Project[]>(defaultProjects);
  const [clubStats, setClubStats] = useState<{ activeUsers: number; capacityPercent: number } | null>(null);
  const [featuredProject, setFeaturedProject] = useState<{ title: string; contributors: number } | null>(null);
  const [clubStatus, setClubStatus] = useState<string>('正在招收新成员');

  // 获取公告数据
  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const response = await fetch('/api/notices?onlyPublished=true');
        if (response.ok) {
          const data = await response.json();
          const noticesData = data.notices || data;
          if (Array.isArray(noticesData) && noticesData.length > 0) {
            // 转换 API 响应格式为组件需要的格式
            const formattedNotices = noticesData
              .slice(0, 3)
              .map((notice: Record<string, unknown>) => ({
                id: (notice.$id || notice.id) as string,
                title: notice.title as string,
                summary: ((notice.content as string)?.substring(0, 100) || '') as string,
                category: (notice.category || '其他') as string,
                icon: mapCategoryToIcon((notice.category || '其他') as string),
                iconColor: mapCategoryToColor((notice.category || '其他') as string),
                publishedAt: (notice.publishedAt || notice.createdAt || notice.$createdAt) as string,
              }));
            setNotices(formattedNotices);
          }
        }
      } catch (error) {
        console.error('Failed to fetch notices:', error);
      }
    };
    fetchNotices();
  }, []);

  // 获取活动数据
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await fetch('/api/activities?onlyPublished=true');
        if (response.ok) {
          const data = await response.json();
          const activitiesData = data.activities || data;
          if (Array.isArray(activitiesData) && activitiesData.length > 0) {
            // 转换 API 响应格式为组件需要的格式
            const formattedActivities = activitiesData
              .slice(0, 2)
              .map((activity: Record<string, unknown>) => ({
                id: (activity.$id || activity.id) as string,
                title: activity.title as string,
                category: (activity.category || '活动') as string,
                date: (activity.startTime || new Date()) as string | Date,
                time: activity.startTime ? new Date(activity.startTime as string).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) : '待定',
                location: (activity.location || '待定') as string,
              }));
            setActivities(formattedActivities);
          }
        }
      } catch (error) {
        console.error('Failed to fetch activities:', error);
      }
    };
    fetchActivities();
  }, []);

  // 获取项目数据
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/projects');
        if (response.ok) {
          const data = await response.json();
          const projectsArray = data.projects || data;
          if (Array.isArray(projectsArray) && projectsArray.length > 0) {
            // 转换 API 响应格式为组件需要的格式
            const formattedProjects = projectsArray
              .slice(0, 3)
              .map((project: any) => ({
                id: project.$id || project.id || project.projectId,
                title: project.title,
                description: project.description,
                contributors: (project.members?.length || 0) + 1,
                repoUrl: project.projectLink,
              }));
            setProjects(formattedProjects.length > 0 ? formattedProjects : defaultProjects);
            
            // 设置特色项目（最新批准的项目或第一个项目）
            const approvedProjects = projectsArray.filter((p: any) => p.status === 'approved');
            const featuredProj = approvedProjects.length > 0 ? approvedProjects[0] : projectsArray[0];
            if (featuredProj) {
              setFeaturedProject({
                title: featuredProj.title || '待定',
                contributors: (featuredProj.members?.length || 0) + 1,
              });
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch projects:', error);
      }
    };
    fetchProjects();
  }, []);

  // 获取俱乐部统计
  useEffect(() => {
    const fetchClubStats = async () => {
      try {
        const response = await fetch('/api/club-settings');
        if (response.ok) {
          const data = await response.json();
          if (data && !data.error) {
            // 使用真实的统计数据
            setClubStats({
              activeUsers: data.activeMembers || 24,
              capacityPercent: Math.min(Math.round((data.activeMembers || 24) / 50 * 100), 100),
            });
            // 设置俱乐部招新状态
            if (data.recruitmentStatus) {
              setClubStatus(data.recruitmentStatus);
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch club stats:', error);
      }
    };
    fetchClubStats();
  }, []);

  return (
    <StudentLayout>
      {/* 主内容 */}
      <main className="flex-1 w-full max-w-300 mx-auto px-4 py-12 sm:px-6 lg:px-8 space-y-12">
        {/* Hero 区域 */}
        <HeroSection
          clubName="电脑学会"
          statusText={clubStatus}
          activeUsers={clubStats?.activeUsers || 24}
          capacityPercent={clubStats?.capacityPercent || 45}
          heroImage="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop"
          heroImageAlt="Tech Club Hero"
        />

        {/* 点名系统 */}
        {user && !('role' in user) && (
          <AttendanceWidget
            studentId={user.id}
            studentName={user.name}
            studentEmail={user.email}
          />
        )}

        {/* 公告与活动 Bento Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 公告区域 - 占 2 列 */}
          <NoticesSection notices={notices} />

          {/* 活动区域 - 占 1 列 */}
          <EventsSection activities={activities} />
        </section>

        {/* 活跃项目部分 */}
        <ActiveProjectsSection />
      </main>
    </StudentLayout>
  );
}

// 辅助函数：根据分类映射图标
function mapCategoryToIcon(category: string): string {
  const iconMap: Record<string, string> = {
    '系统': 'warning',
    '新闻': 'emoji_events',
    '更新': 'science',
    '活动': 'calendar_month',
    '紧急': 'priority_high',
    '公告': 'campaign',
    default: 'info',
  };
  return iconMap[category] || iconMap.default;
}

// 辅助函数：根据分类映射颜色
function mapCategoryToColor(category: string): string {
  const colorMap: Record<string, string> = {
    '系统': 'orange',
    '新闻': 'green',
    '更新': 'blue',
    '活动': 'purple',
    '紧急': 'red',
    '公告': 'green',
    default: 'blue',
  };
  return colorMap[category] || colorMap.default;}