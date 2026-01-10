/* eslint-disable prettier/prettier */
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Loading } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';

// 临时模拟数据
interface NormalizedNotice {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  date?: string;
  status?: string;
  imageUrl?: string;
  readTime?: string;
  isPinned: boolean;
  $id?: string;
  content?: string;
  createdAt?: string;
  images?: string[];
  tags?: string[];
}

const MOCK_NOTICES: NormalizedNotice[] = [
  {
    id: '1',
    title: '2024年全球黑客马拉松报名开启',
    excerpt: '年度黑客马拉松活动现已开放报名，邀请所有编程爱好者参与这场48小时的创意与技术盛宴...',
    category: 'event',
    author: 'Alex Chen',
    date: '2024-01-15',
    status: 'published',
    imageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&h=450&fit=crop',
    readTime: '5 分钟',
    isPinned: true,
  },
  {
    id: '2',
    title: '服务器维护通知',
    excerpt: '俱乐部服务器将于本周日进行升级维护，届时部分服务可能暂时无法访问...',
    category: 'urgent',
    author: 'Sarah Jones',
    date: '2024-01-12',
    status: 'published',
    imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=450&fit=crop',
    readTime: '2 分钟',
    isPinned: false,
  },
  {
    id: '3',
    title: 'Python 工作坊系列课程',
    excerpt: '为初学者准备的Python编程工作坊即将开课，涵盖基础语法到实战项目开发...',
    category: 'general',
    author: 'Mike Ross',
    date: '2024-01-10',
    status: 'published',
    imageUrl: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&h=450&fit=crop',
    readTime: '4 分钟',
    isPinned: false,
  },
  {
    id: '4',
    title: '招募执行委员会成员',
    excerpt: '俱乐部现招募新一届执行委员会成员，包括财务主管和秘书等职位...',
    category: 'general',
    author: 'Alex Chen',
    date: '2024-01-08',
    status: 'published',
    imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=450&fit=crop',
    readTime: '3 分钟',
    isPinned: false,
  },
  {
    id: '5',
    title: 'LAN Party：周五游戏之夜',
    excerpt: '带上你的设备，加入我们的局域网派对！我们准备了零食和游戏...',
    category: 'event',
    author: 'Mike Ross',
    date: '2024-01-05',
    status: 'published',
    imageUrl: 'https://images.unsplash.com/photo-1493711662062-fa541f7f3d24?w=800&h=450&fit=crop',
    readTime: '2 分钟',
    isPinned: false,
  },
  {
    id: '6',
    title: '开源项目贡献指南',
    excerpt: '想要参与开源项目但不知从何开始？本指南将带你了解如何为开源社区做贡献...',
    category: 'general',
    author: 'Sarah Jones',
    date: '2024-01-03',
    status: 'published',
    imageUrl: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=800&h=450&fit=crop',
    readTime: '6 分钟',
    isPinned: false,
  },
];

const CATEGORY_OPTIONS = [
  { value: 'all', label: '所有分类' },
  { value: 'general', label: '常规公告' },
  { value: 'event', label: '活动通知' },
  { value: 'urgent', label: '紧急通知' },
];

const CATEGORY_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  general: { bg: 'bg-blue-500/10', text: 'text-blue-400', label: '常规' },
  event: { bg: 'bg-purple-500/10', text: 'text-purple-400', label: '活动' },
  urgent: { bg: 'bg-amber-500/10', text: 'text-amber-400', label: '紧急' },
};

export default function NoticesPage() {
  const [notices, setNotices] = useState<NormalizedNotice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const loadNotices = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/notices?onlyPublished=true');
        const data = await response.json();
        if (data.success && data.notices) {
          const normalizedNotices = data.notices.map((notice: Record<string, unknown>) => {
            // 更强大的图像处理逻辑
            let imageUrl = 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&h=450&fit=crop';
            
            // 尝试从 images 数组获取第一张图片（由 parseNotice 处理）
            if (notice.images && Array.isArray(notice.images) && notice.images.length > 0) {
              const firstImage = notice.images[0];
              if (firstImage && typeof firstImage === 'string' && firstImage.trim().length > 0) {
                imageUrl = firstImage.trim();
              }
            }
            // 如果没有 images，尝试从 coverImage 获取（原始字段）
            else if (notice.coverImage) {
              try {
                const parsed = JSON.parse(notice.coverImage as string);
                if (Array.isArray(parsed) && parsed.length > 0) {
                  const first = parsed[0];
                  if (first && typeof first === 'string' && first.trim().length > 0) {
                    imageUrl = first.trim();
                  }
                }
              } catch {
                // coverImage 不是有效的 JSON，尝试直接作为 URL
                if (typeof notice.coverImage === 'string' && notice.coverImage.trim().length > 0) {
                  imageUrl = notice.coverImage.trim();
                }
              }
            }
            
            return {
              ...notice,
              id: notice.$id,
              excerpt: (typeof notice.content === 'string' ? notice.content.substring(0, 150) + '...' : ''),
              imageUrl: imageUrl,
              tags: Array.isArray(notice.tags) ? notice.tags : (notice.tags && typeof notice.tags === 'string' ? JSON.parse(notice.tags) : []),
              isPinned: false,
            };
          });
          setNotices(normalizedNotices);
        }
      } catch (err) {
        console.error('加载公告失败:', err);
        // 如果API失败，使用模拟数据
        setNotices(MOCK_NOTICES);
      } finally {
        setIsLoading(false);
      }
    };
    loadNotices();
  }, []);

  // 过滤公告
  const filteredNotices = notices.filter((notice) => {
    const matchesSearch =
      notice.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notice.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || notice.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // 分离置顶和普通公告
  const pinnedNotices = filteredNotices.filter((n) => n.isPinned);
  const regularNotices = filteredNotices.filter((n) => !n.isPinned);

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
          <span className="text-white">公告</span>
        </nav>

        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2">
            公告中心
          </h1>
          <p className="text-[#9db9ab]">
            了解俱乐部最新动态、活动通知和重要公告
          </p>
        </div>

        {/* 搜索和过滤 */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1">
            <Input
              placeholder="搜索公告标题或内容..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<span className="material-symbols-outlined text-[20px]">search</span>}
            />
          </div>
          <div className="w-full sm:w-48">
            <Select
              options={CATEGORY_OPTIONS}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loading size="lg" text="加载公告中..." />
          </div>
        ) : filteredNotices.length === 0 ? (
          <EmptyState
            icon="article"
            title="暂无公告"
            description="没有找到符合条件的公告，请尝试调整搜索条件"
          />
        ) : (
          <div className="space-y-8">
            {/* 置顶公告 */}
            {pinnedNotices.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#13ec80]">push_pin</span>
                  置顶公告
                </h2>
                <div className="grid gap-6">
                  {pinnedNotices.map((notice) => (
                    <NoticeCard key={notice.id} notice={notice} featured />
                  ))}
                </div>
              </div>
            )}

            {/* 普通公告列表 */}
            {regularNotices.length > 0 && (
              <div>
                {pinnedNotices.length > 0 && (
                  <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#9db9ab]">article</span>
                    全部公告
                  </h2>
                )}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {regularNotices.map((notice) => (
                    <NoticeCard key={notice.id} notice={notice} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 分页（暂时静态） */}
        {filteredNotices.length > 0 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            <button className="px-4 py-2 rounded-lg bg-[#1A2C23] text-[#9db9ab] hover:bg-[#283930] transition-colors text-sm font-medium border border-[#283930]">
              上一页
            </button>
            <button className="px-4 py-2 rounded-lg bg-[#13ec80] text-[#102219] font-bold text-sm">
              1
            </button>
            <button className="px-4 py-2 rounded-lg bg-[#1A2C23] text-white hover:bg-[#283930] transition-colors text-sm font-medium border border-[#283930]">
              2
            </button>
            <button className="px-4 py-2 rounded-lg bg-[#1A2C23] text-white hover:bg-[#283930] transition-colors text-sm font-medium border border-[#283930]">
              3
            </button>
            <button className="px-4 py-2 rounded-lg bg-[#1A2C23] text-[#9db9ab] hover:bg-[#283930] transition-colors text-sm font-medium border border-[#283930]">
              下一页
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

// 公告卡片组件
interface NoticeCardProps {
  notice: (typeof MOCK_NOTICES)[0];
  featured?: boolean;
}

function NoticeCard({ notice, featured = false }: NoticeCardProps) {
  const categoryStyle = CATEGORY_STYLES[notice.category] || CATEGORY_STYLES.general;

  if (featured) {
    return (
      <Link
        href={`/notices/${notice.id}`}
        className="group block rounded-xl overflow-hidden bg-[#1A2C23] border border-[#283930] hover:border-[#13ec80]/50 transition-all"
      >
        <div className="flex flex-col md:flex-row">
          {/* 图片 */}
          <div className="md:w-80 h-48 md:h-auto relative overflow-hidden">
            <div
              className="absolute inset-0 bg-cover bg-center transform transition-transform duration-500 group-hover:scale-105"
              style={{ backgroundImage: `url(${notice.imageUrl})` }}
            />
            <div className="absolute inset-0 bg-linear-to-r from-[#1A2C23]/80 to-transparent" />
          </div>

          {/* 内容 */}
          <div className="flex-1 p-6">
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant="primary" className="bg-[#13ec80]/10! text-[#13ec80]! border border-[#13ec80]/20">
                置顶
              </Badge>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${categoryStyle.bg} ${categoryStyle.text} border border-current/20`}>
                {categoryStyle.label}
              </span>
            </div>

            {/* 标签 */}
            {notice.tags && notice.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {notice.tags.map((tag, idx) => (
                  <span key={idx} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#283946] text-[#9db9ab] border border-[#3a4d5c]">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#13ec80] transition-colors line-clamp-2">
              {notice.title}
            </h3>

            <p className="text-[#9db9ab] text-sm mb-4 line-clamp-2">
              {notice.excerpt}
            </p>

            <div className="flex items-center gap-4 text-xs text-[#9db9ab]">
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                <span>{notice.date}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">person</span>
                <span>{notice.author}</span>
              </div>
              <div className="flex items-center gap-1 text-[#13ec80]">
                <span className="material-symbols-outlined text-[16px]">schedule</span>
                <span>{notice.readTime}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/notices/${notice.id}`}
      className="group block rounded-xl overflow-hidden bg-[#1A2C23] border border-[#283930] hover:border-[#13ec80]/50 transition-all"
    >
      {/* 图片 */}
      <div className="aspect-video relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center transform transition-transform duration-500 group-hover:scale-105"
          style={{ backgroundImage: `url(${notice.imageUrl})` }}
        />
        <div className="absolute inset-0 bg-linear-to-t from-[#1A2C23] to-transparent opacity-60" />
        
        {/* 分类标签 */}
        <div className="absolute top-3 left-3">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${categoryStyle.bg} ${categoryStyle.text} backdrop-blur-sm`}>
            {categoryStyle.label}
          </span>
        </div>
      </div>

      {/* 内容 */}
      <div className="p-5">
        <h3 className="text-base font-bold text-white mb-2 group-hover:text-[#13ec80] transition-colors line-clamp-2">
          {notice.title}
        </h3>

        {/* 标签 */}
        {notice.tags && notice.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {notice.tags.slice(0, 2).map((tag, idx) => (
              <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#283946] text-[#9db9ab] border border-[#3a4d5c]">
                {tag}
              </span>
            ))}
            {notice.tags.length > 2 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#283946] text-[#9db9ab] border border-[#3a4d5c]">
                +{notice.tags.length - 2}
              </span>
            )}
          </div>
        )}

        <p className="text-[#9db9ab] text-sm mb-4 line-clamp-2">
          {notice.excerpt}
        </p>

        <div className="flex items-center justify-between text-xs text-[#9db9ab]">
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">calendar_today</span>
            <span>{notice.date}</span>
          </div>
          <div className="flex items-center gap-1 text-[#13ec80]">
            <span className="material-symbols-outlined text-[14px]">schedule</span>
            <span>{notice.readTime}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
