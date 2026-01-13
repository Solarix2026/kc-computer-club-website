/* eslint-disable prettier/prettier */
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { ImageCarousel } from '@/components/notices/ImageCarousel';
import { CommentForm } from '@/components/comments/CommentForm';
import { CommentList } from '@/components/comments/CommentList';
import { Comment } from '@/services/comment.service';
import { Notice } from '@/services/notice.service';

/* 临时模拟数据 - 已禁用，使用数据库中的真实数据
const MOCK_NOTICES = [
  {
    id: '1',
    title: '2024年全球黑客马拉松报名开启',
    excerpt: '年度黑客马拉松活动现已开放报名，邀请所有编程爱好者参与这场48小时的创意与技术盛宴...',
    content: `
      <p class="lead text-xl text-[#9db9ab] font-medium mb-6">
        呼唤所有程序员、设计师和创新者！年度全球黑客马拉松再次来袭，今年我们将比以往更加精彩。准备好你的键盘，迎接48小时紧张刺激的创意与问题解决之旅。
      </p>

      <h2 class="text-2xl font-bold mt-8 mb-4 text-white">活动概述</h2>
      <p class="mb-4">
        电脑学会很高兴地宣布，<strong class="text-white">2024年全球黑客马拉松</strong>报名正式开启。本次活动将汇聚来自各个学科的学生，共同协作开发解决现实问题的软件方案。无论你是经验丰富的开发者还是刚刚起步的新手，这里都有你的一席之地。
      </p>
      <p class="mb-4">
        今年的主题是 <span class="font-mono bg-[#1E2E25] px-1.5 py-0.5 rounded text-sm text-primary">"可持续未来"</span>。我们将挑战各团队开发针对环境可持续性、资源管理或绿色技术的应用程序。
      </p>

      <h3 class="text-xl font-bold mt-8 mb-4 text-white">参赛规则</h3>
      <ul class="list-disc pl-5 space-y-2 marker:text-primary mb-6">
        <li>团队必须由 3-5 名成员组成。</li>
        <li>所有代码必须在活动期间编写；允许使用预先编写的库，但必须声明。</li>
        <li>项目必须托管在公开的 GitHub 仓库中。</li>
        <li>最终提交截止时间为周日中午 12:00。</li>
      </ul>

      <blockquote class="border-l-4 border-primary pl-4 italic bg-[#1A2C23] p-4 rounded-r-lg my-8">
        "创新是区分领导者和跟随者的标志。这次黑客马拉松是你在可持续技术领域引领潮流的机会。"
      </blockquote>

      <h3 class="text-xl font-bold mt-8 mb-4 text-white">报名流程</h3>
      <p class="mb-4">
        报名前请确保已组建团队。如果你还没有团队，可以加入我们的 <a href="#" class="text-primary hover:underline">Discord 服务器</a>，在 <code class="font-mono bg-[#1E2E25] px-1.5 py-0.5 rounded text-sm text-primary">#team-formation</code> 频道寻找队友。准备好后，点击下方报名按钮。
      </p>
    `,
    category: 'event',
    tags: ['公告', '比赛'],
    author: 'Alex Chen',
    date: '2024-01-15',
    status: 'published',
    imageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&h=675&fit=crop',
    readTime: '5 分钟',
    attachments: [
      { name: 'Hackathon_规则手册_v2.pdf', type: 'pdf', size: '2.4 MB' },
      { name: '活动日程表.png', type: 'image', size: '1.8 MB' },
    ],
  },
  {
    id: '2',
    title: '服务器维护通知',
    excerpt: '俱乐部服务器将于本周日进行升级维护，届时部分服务可能暂时无法访问...',
    content: `
      <p class="lead text-xl text-[#9db9ab] font-medium mb-6">
        为了提升服务质量和系统安全性，俱乐部服务器将进行定期维护升级。
      </p>

      <h2 class="text-2xl font-bold mt-8 mb-4 text-white">维护时间</h2>
      <p class="mb-4">
        <strong class="text-white">日期：</strong>2024年1月14日（周日）<br/>
        <strong class="text-white">时间：</strong>凌晨 2:00 - 6:00（预计4小时）
      </p>

      <h3 class="text-xl font-bold mt-8 mb-4 text-white">影响范围</h3>
      <ul class="list-disc pl-5 space-y-2 marker:text-primary mb-6">
        <li>俱乐部官网可能间歇性无法访问</li>
        <li>在线活动报名系统暂停服务</li>
        <li>AI 聊天助手暂时离线</li>
      </ul>

      <blockquote class="border-l-4 border-primary pl-4 italic bg-[#1A2C23] p-4 rounded-r-lg my-8">
        维护期间请耐心等待，如有紧急事务请通过邮件联系我们。
      </blockquote>
    `,
    category: 'urgent',
    tags: ['紧急', '维护'],
    author: 'Sarah Jones',
    date: '2024-01-12',
    status: 'published',
    imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&h=675&fit=crop',
    readTime: '2 分钟',
    attachments: [],
  },
  {
    id: '3',
    title: 'Python 工作坊系列课程',
    excerpt: '为初学者准备的Python编程工作坊即将开课，涵盖基础语法到实战项目开发...',
    content: `
      <p class="lead text-xl text-[#9db9ab] font-medium mb-6">
        想要学习编程却不知从何开始？我们的 Python 工作坊系列课程专为零基础学员设计！
      </p>

      <h2 class="text-2xl font-bold mt-8 mb-4 text-white">课程安排</h2>
      <p class="mb-4">
        本次工作坊共分为 <strong class="text-white">6 期</strong>，每周六下午举行，从基础语法到实战项目逐步进阶。
      </p>

      <h3 class="text-xl font-bold mt-8 mb-4 text-white">课程大纲</h3>
      <ul class="list-disc pl-5 space-y-2 marker:text-primary mb-6">
        <li>第1期：Python 安装与开发环境搭建</li>
        <li>第2期：变量、数据类型与基础运算</li>
        <li>第3期：条件判断与循环</li>
        <li>第4期：函数与模块</li>
        <li>第5期：文件处理与异常</li>
        <li>第6期：实战项目：制作简易游戏</li>
      </ul>
    `,
    category: 'general',
    tags: ['课程', '工作坊'],
    author: 'Mike Ross',
    date: '2024-01-10',
    status: 'published',
    imageUrl: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=1200&h=675&fit=crop',
    readTime: '4 分钟',
    attachments: [
      { name: 'Python课程大纲.pdf', type: 'pdf', size: '1.2 MB' },
    ],
  },
];
*/

// const RELATED_NOTICES_DISABLED = [
//   { id: '2', title: '服务器维护通知', date: '2024-01-12' },
//   { id: '3', title: 'Python 工作坊系列课程', date: '2024-01-10' },
//   { id: '4', title: '招募执行委员会成员', date: '2024-01-08' },
// ];

const TAG_STYLES: Record<string, { bg: string; text: string }> = {
  '公告': { bg: 'bg-primary/10', text: 'text-primary' },
  '比赛': { bg: 'bg-purple-500/10', text: 'text-purple-400' },
  '紧急': { bg: 'bg-amber-500/10', text: 'text-amber-400' },
  '维护': { bg: 'bg-red-500/10', text: 'text-red-400' },
  '课程': { bg: 'bg-blue-500/10', text: 'text-blue-400' },
  '工作坊': { bg: 'bg-cyan-500/10', text: 'text-cyan-400' },
};

// 计算阅读时间
function calculateReadingTime(content: string): number {
  if (!content) return 1;
  // 移除HTML标签
  const text = content.replace(/<[^>]*>/g, '');
  // 计算中文字数（每个字为1）+ 英文单词数（每个单词为1）
  const chineseChars = text.match(/[\u4e00-\u9fa5]/g)?.length || 0;
  const englishWords = text.match(/\b[a-zA-Z]+\b/g)?.length || 0;
  // 假设平均阅读速度为中文300字/分钟，英文200字/分钟
  const readingTime = Math.ceil((chineseChars / 300 + englishWords / 200) / 2);
  return Math.max(1, readingTime);
}

export default function NoticeDetailPage() {
  const params = useParams();
  const [notice, setNotice] = useState<Notice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copySuccess, setCopySuccess] = useState(false);
  const [error, setError] = useState('');
  const [relatedNotices, setRelatedNotices] = useState<Notice[]>([]);
  
  // 评论状态
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [showComments, setShowComments] = useState(true);

  useEffect(() => {
    const loadNotice = async () => {
      try {
        setIsLoading(true);
        setError('');
        const response = await fetch(`/api/notices/${params.id}`);
        const data = await response.json();

        if (data.success) {
          setNotice(data.notice);
          
          // 加载相关公告（同一分类，最多3条）
          try {
            const relatedResponse = await fetch(`/api/notices?category=${data.notice.category}&limit=5`);
            const relatedData = await relatedResponse.json();
            if (relatedData.success && relatedData.notices) {
              // 改进图像处理：确保所有相关公告都有有效的图像
              const filtered = relatedData.notices
                .filter((n: Notice) => n.$id !== params.id)
                .map((n: Notice) => {
                  const nWithCover = n as Notice & { coverImage?: string };
                  return {
                    ...n,
                    // 增强图像处理
                    images: Array.isArray(n.images) ? n.images : 
                      (nWithCover.coverImage ? (
                        Array.isArray(nWithCover.coverImage) ? nWithCover.coverImage :
                        (typeof nWithCover.coverImage === 'string' ? (() => {
                          try {
                            const parsed = JSON.parse(nWithCover.coverImage);
                            return Array.isArray(parsed) ? parsed : [nWithCover.coverImage];
                          } catch {
                            return [nWithCover.coverImage];
                          }
                        })() : [])
                      ) : []),
                  };
                })
                .slice(0, 3);
              setRelatedNotices(filtered);
            }
          } catch (relatedErr) {
            console.warn('Failed to load related notices:', relatedErr);
          }
        } else {
          setError(data.error || '加载公告失败');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载失败');
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      loadNotice();
    }
  }, [params.id]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // 加载评论函数
  const loadComments = async (noticeId: string) => {
    try {
      setIsLoadingComments(true);
      const response = await fetch(`/api/comments?contentType=notice&contentId=${noticeId}`);
      const data = await response.json();
      if (data.success) {
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error('加载评论失败:', error);
    } finally {
      setIsLoadingComments(false);
    }
  };

  // 当 notice 加载完成后，加载评论
  useEffect(() => {
    if (notice?.$id) {
      loadComments(notice.$id);
    }
  }, [notice?.$id]);  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#102219]">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loading size="lg" text="加载公告详情..." />
        </main>
        <Footer />
      </div>
    );
  }

  if (!notice || error) {
    return (
      <div className="min-h-screen flex flex-col bg-[#102219]">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center py-20">
          <span className="material-symbols-outlined text-6xl text-[#9db9ab] mb-4">article_shortcut</span>
          <h1 className="text-2xl font-bold text-white mb-2">{error || '公告不存在'}</h1>
          <p className="text-[#9db9ab] mb-6">请检查链接是否正确，或返回公告列表</p>
          <Link href="/notices">
            <Button variant="primary" leftIcon="arrow_back">
              返回公告列表
            </Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  // 分类样式供后续扩展使用
  // const categoryStyle = CATEGORY_STYLES[notice.category] || CATEGORY_STYLES.general;

  return (
    <div className="min-h-screen flex flex-col bg-[#102219]">
      <Header />

      <main className="flex-1 w-full mx-auto py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* 左侧：文章内容 */}
            <article className="flex-1 min-w-0">
              {/* 面包屑导航 */}
              <nav className="flex items-center text-sm text-[#9db9ab] mb-6 font-medium">
                <Link href="/" className="hover:text-[#13ec80] transition-colors">
                  首页
                </Link>
                <span className="mx-2">/</span>
                <Link href="/notices" className="hover:text-[#13ec80] transition-colors">
                  公告
                </Link>
                <span className="mx-2">/</span>
                <span className="text-white truncate max-w-50">{notice.title}</span>
              </nav>

              {/* 文章头部 */}
              <header className="mb-8">
                {/* 标签 */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {Array.isArray(notice.tags) && notice.tags.map((tag: string) => {
                    const style = TAG_STYLES[tag] || { bg: 'bg-gray-500/10', text: 'text-gray-400' };
                    return (
                      <span
                        key={tag}
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${style.bg} ${style.text} border border-current/20`}
                      >
                        {tag}
                      </span>
                    );
                  })}
                </div>

                {/* 标题 */}
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight mb-4 tracking-[-0.02em]">
                  {notice.title}
                </h1>

                {/* 元信息 */}
                <div className="flex items-center gap-4 text-sm text-[#9db9ab] flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                    <span>{new Date(notice.createdAt).toLocaleDateString('zh-CN')}</span>
                  </div>
                  <span className="w-1 h-1 rounded-full bg-[#9db9ab]"></span>
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px]">person</span>
                    <span>{notice.author}</span>
                  </div>
                  <span className="w-1 h-1 rounded-full bg-[#9db9ab]"></span>
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px]">schedule</span>
                    <span>{calculateReadingTime(notice.content)} 分钟阅读</span>
                  </div>
                </div>

                {/* 最后编辑者信息 */}
                {notice.lastEditorName && (
                  <div className="mt-4 pt-4 border-t border-[#283930] text-xs text-[#9db9ab]">
                    <span>最后编辑：{notice.lastEditorName}</span>
                    {notice.updatedAt && notice.updatedAt !== notice.createdAt && (
                      <span> • {new Date(notice.updatedAt).toLocaleDateString('zh-CN')}</span>
                    )}
                  </div>
                )}
              </header>

              {/* 图片轮播 */}
              {notice.images && notice.images.length > 0 && (
                <div className="my-10">
                  <ImageCarousel images={notice.images} title={notice.title} showThumbnails={true} />
                </div>
              )}

              {/* 文章内容 */}
              <div
                className="prose prose-lg prose-invert max-w-none text-[#E0E0E0] wrap-break-word whitespace-normal [&_a]:text-primary [&_a]:no-underline hover:[&_a]:underline [&_strong]:text-white [&_code]:bg-[#1E2E25] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:text-primary [&_p]:mb-4 [&_p]:wrap-break-word [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-white [&_h2]:mt-8 [&_h2]:mb-4 [&_h2]:wrap-break-word [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-white [&_h3]:mt-6 [&_h3]:mb-3 [&_h3]:wrap-break-word [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_li]:text-[#E0E0E0] [&_li]:wrap-break-word [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:bg-[#1A2C23] [&_blockquote]:p-4 [&_blockquote]:rounded-r-lg [&_blockquote]:my-8 [&_blockquote]:wrap-break-word"
                dangerouslySetInnerHTML={{ __html: notice.content }}
              />

              {/* 底部互动区域 */}
              <div className="flex items-center justify-between pt-8 border-t border-[#283930] flex-wrap gap-4">
                <Link
                  href="/notices"
                  className="inline-flex items-center gap-2 text-sm font-medium text-[#9db9ab] hover:text-[#13ec80] transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">arrow_back</span>
                  返回公告列表
                </Link>
                <div className="flex gap-2 flex-wrap">
                  {/* 复制链接 */}
                  <button
                    title="复制链接"
                    className={`p-2 rounded-full transition-colors ${
                      copySuccess
                        ? 'text-[#13ec80] bg-[#13ec80]/10'
                        : 'text-[#9db9ab] hover:text-[#13ec80] hover:bg-[#13ec80]/10'
                    }`}
                    onClick={handleCopyLink}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {copySuccess ? 'check_circle' : 'link'}
                    </span>
                  </button>
                  
                  {/* 打印 */}
                  <button
                    title="打印公告"
                    className="p-2 rounded-full text-[#9db9ab] hover:text-[#13ec80] hover:bg-[#13ec80]/10 transition-colors"
                    onClick={handlePrint}
                  >
                    <span className="material-symbols-outlined text-[20px]">print</span>
                  </button>
                  
                  {/* 分享到微信 */}
                  <button
                    title="分享"
                    className="p-2 rounded-full text-[#9db9ab] hover:text-[#13ec80] hover:bg-[#13ec80]/10 transition-colors"
                    onClick={() => {
                      // 可集成QR代码或分享弹窗
                      alert('分享链接：' + window.location.href);
                    }}
                  >
                    <span className="material-symbols-outlined text-[20px]">share</span>
                  </button>
                </div>
              </div>
            </article>

            {/* 右侧：侧边栏 */}
            <aside className="hidden lg:block w-80 shrink-0">
              <div className="sticky top-24 space-y-8">
                {/* 相关公告 */}
                <div className="bg-[#1A2C23] rounded-xl border border-[#283930] p-5 shadow-sm">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#9db9ab] mb-4">
                    相关公告
                  </h3>
                  <div className="space-y-4">
                    {relatedNotices.length > 0 ? (
                      relatedNotices.map((relatedNotice, index) => (
                        <div key={relatedNotice.$id}>
                          {index > 0 && <hr className="border-[#283930] mb-4" />}
                          <Link href={`/notices/${relatedNotice.$id}`} className="block group">
                            <span className="text-xs text-[#13ec80] mb-1 block">
                              {new Date(relatedNotice.createdAt).toLocaleDateString('zh-CN')}
                            </span>
                            <h4 className="text-sm font-bold text-white group-hover:text-[#13ec80] transition-colors line-clamp-2">
                              {relatedNotice.title}
                            </h4>
                          </Link>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-[#9db9ab]">暂无相关公告</p>
                    )}
                  </div>
                  <Link
                    href="/notices"
                    className="inline-block mt-4 text-xs font-bold text-[#13ec80] hover:text-white transition-colors"
                  >
                    查看所有公告 →
                  </Link>
                </div>

                {/* 下一个活动 */}
                <div className="bg-linear-to-br from-[#1A2C23] to-[#102219] rounded-xl border border-[#283930] p-5 relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#13ec80]/20 blur-2xl rounded-full"></div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4 relative z-10">
                    近期活动
                  </h3>
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-[#13ec80]/20 p-2 rounded-lg text-[#13ec80]">
                        <span className="material-symbols-outlined">code</span>
                      </div>
                      <div>
                        <p className="text-white font-bold text-sm">代码之夜</p>
                        <p className="text-[#9db9ab] text-xs">每周例会</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-300 mb-4">
                      <span className="material-symbols-outlined text-[16px]">event</span>
                      <span>周五 • 下午 6:00</span>
                    </div>
                    <Link href="/activities">
                      <Button variant="secondary" size="sm" className="w-full">
                        查看活动详情
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </aside>
          </div>

          {/* 评论区 */}
          <div className="mt-12 pt-8 border-t border-[#283930]">
            <div className="bg-[#1A2C23] rounded-xl overflow-hidden">
              <div className="flex items-center gap-3 p-6 md:p-8">
                <div className="size-10 rounded-full bg-[#13ec80]/10 flex items-center justify-center text-[#13ec80]">
                  <span className="material-symbols-outlined">comment</span>
                </div>
                <h3 className="text-xl font-bold text-white">公告评论</h3>
                <span className="text-sm text-[#9db9ab] ml-auto">
                  {comments.length} 条评论
                </span>
                <button
                  onClick={() => setShowComments(!showComments)}
                  className="p-2 hover:bg-[#283930] rounded-lg transition-colors text-[#13ec80]"
                  title={showComments ? '隐藏评论' : '显示评论'}
                >
                  <span className="material-symbols-outlined">
                    {showComments ? 'expand_less' : 'expand_more'}
                  </span>
                </button>
              </div>

              {showComments && (
                <>
                  {isLoadingComments ? (
                    <div className="text-center py-8 px-6 md:px-8">
                      <Loading size="md" text="加载评论..." />
                    </div>
                  ) : (
                    <div className="px-6 md:px-8 pb-6 md:pb-8">
                      {/* 评论列表 */}
                      <div className="mb-8">
                        <CommentList
                          comments={comments}
                          contentType="notice"
                          contentId={notice?.$id || ''}
                          onCommentDeleted={() => notice?.$id && loadComments(notice.$id)}
                        />
                      </div>

                      {/* 评论表单 */}
                      <div className="pt-6">
                        <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                          <span className="material-symbols-outlined text-lg">edit_note</span>
                          发表评论
                        </h4>
                        <CommentForm
                          contentType="notice"
                          contentId={notice?.$id || ''}
                          onCommentSubmitted={() => notice?.$id && loadComments(notice.$id)}
                        />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
