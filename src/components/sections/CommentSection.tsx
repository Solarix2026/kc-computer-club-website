'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';

// 评论类型
interface Comment {
  id: string;
  nickname: string;
  email?: string;
  content: string;
  createdAt: string;
  likes: number;
  isAdmin?: boolean;
  replies?: Comment[];
}

interface CommentSectionProps {
  targetType: 'notice' | 'activity';
  targetId: string;
  comments?: Comment[];
  onSubmit?: (data: { nickname: string; email?: string; content: string }) => void;
}

// 模拟评论数据
const mockComments: Comment[] = [
  {
    id: '1',
    nickname: 'Alex Chen',
    content: '这次活动安排得很好！请问有没有相关的学习资料可以提前预习？',
    createdAt: '2024-01-15T14:30:00Z',
    likes: 5,
    replies: [
      {
        id: '1-1',
        nickname: '管理员小李',
        content:
          '@Alex Chen 感谢你的支持！学习资料我们会在活动前一天通过邮件发送给所有报名的同学。',
        createdAt: '2024-01-15T15:00:00Z',
        likes: 2,
        isAdmin: true,
      },
    ],
  },
  {
    id: '2',
    nickname: 'David Kim',
    content: `关于环境搭建，这是我常用的配置命令：

\`\`\`bash
python3 -m venv myenv
source myenv/bin/activate
pip install requests pandas
\`\`\`

Mac/Linux 下亲测可用！`,
    createdAt: '2024-01-15T13:45:00Z',
    likes: 8,
  },
  {
    id: '3',
    nickname: 'Emily Wang',
    content: '期待这次活动！会有披萨吗？🍕',
    createdAt: '2024-01-15T13:15:00Z',
    likes: 12,
  },
];

// 排序选项
const sortOptions = [
  { value: 'newest', label: '最新优先' },
  { value: 'oldest', label: '最早优先' },
  { value: 'top', label: '热门优先' },
];

// 格式化时间
function formatTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes} 分钟前`;
  if (hours < 24) return `${hours} 小时前`;
  if (days < 7) return `${days} 天前`;
  return date.toLocaleDateString('zh-CN');
}

/* eslint-disable @typescript-eslint/no-unused-vars */
export function CommentSection({
  targetType: _targetType,
  targetId: _targetId,
  comments = mockComments,
  onSubmit,
}: CommentSectionProps) {
  const [sortBy, setSortBy] = useState('newest');
  const [newComment, setNewComment] = useState({
    nickname: '',
    email: '',
    content: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [replyTo, setReplyTo] = useState<string | null>(null);

  // 根据排序选项排序评论
  const sortedComments = [...comments].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'top':
        return b.likes - a.likes;
      default:
        return 0;
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newComment.nickname.trim() || !newComment.content.trim()) {
      return;
    }

    setIsSubmitting(true);

    // 模拟提交
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (onSubmit) {
      onSubmit({
        nickname: newComment.nickname,
        email: newComment.email || undefined,
        content: newComment.content,
      });
    }

    setNewComment({ nickname: '', email: '', content: '' });
    setIsSubmitting(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  // 评论卡片组件
  const CommentCard = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => (
    <div className={`group flex gap-4 ${isReply ? 'mt-4' : ''}`}>
      {/* 头像和连接线 */}
      <div className="flex flex-col items-center">
        {/* 回复的弯角连接线 */}
        {isReply && (
          <div className="relative">
            <div className="absolute -top-6 -left-6 w-6 h-6 border-b border-l border-white/10 rounded-bl-xl"></div>
          </div>
        )}
        {/* 头像 */}
        <div
          className={`
            flex items-center justify-center rounded-full shrink-0 z-10
            ${isReply ? 'w-8 h-8 text-sm' : 'w-10 h-10'}
            ${comment.isAdmin ? 'bg-primary text-black ring-2 ring-primary' : 'bg-[#283930] text-white ring-2 ring-white/10'}
          `}
        >
          <span className="material-symbols-outlined text-base">
            {comment.isAdmin ? 'shield_person' : 'person'}
          </span>
        </div>
        {/* 连接线 */}
        {!isReply && comment.replies && comment.replies.length > 0 && (
          <div className="w-px h-full bg-white/10 my-2"></div>
        )}
      </div>

      {/* 评论内容 */}
      <div className="flex-1 pb-4">
        <div
          className={`
            flex flex-col rounded-xl p-4 border transition-colors
            ${
              comment.isAdmin
                ? 'bg-[#1A2C23]/50 border-primary/20 hover:border-primary/40'
                : 'bg-[#1A2C23] border-transparent hover:border-white/10'
            }
          `}
        >
          {/* 头部信息 */}
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-white text-sm">{comment.nickname}</span>
              <span
                className={`
                  text-xs px-2 py-0.5 rounded-full
                  ${
                    comment.isAdmin
                      ? 'bg-primary/20 text-primary border border-primary/20'
                      : 'bg-white/5 text-gray-400'
                  }
                `}
              >
                {comment.isAdmin ? '管理员' : '成员'}
              </span>
              <span className="text-gray-500 text-xs">• {formatTime(comment.createdAt)}</span>
            </div>
            <button className="text-gray-500 hover:text-white transition-colors">
              <span className="material-symbols-outlined text-lg">more_horiz</span>
            </button>
          </div>

          {/* 评论内容 */}
          <div className="text-sm leading-relaxed mb-3 whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>
            {comment.content.includes('```') ? (
              // 简单的代码块渲染
              <div>
                {comment.content.split('```').map((part, index) =>
                  index % 2 === 1 ? (
                    <div
                      key={index}
                      className="bg-[#102219] p-3 rounded-lg border border-white/10 font-mono text-xs text-primary overflow-x-auto my-2"
                    >
                      <code>{part.replace(/^[a-z]+\n/, '')}</code>
                    </div>
                  ) : (
                    <p key={index}>{part}</p>
                  )
                )}
              </div>
            ) : (
              <p>{comment.content}</p>
            )}
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-1.5 text-gray-500 hover:text-primary transition-colors group/btn">
              <span className="material-symbols-outlined text-lg">thumb_up</span>
              <span className="text-xs font-medium">{comment.likes}</span>
            </button>
            <button
              onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
              className="flex items-center gap-1.5 text-gray-500 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-lg">chat_bubble</span>
              <span className="text-xs font-medium">回复</span>
            </button>
          </div>
        </div>

        {/* 回复表单 */}
        {replyTo === comment.id && (
          <div className="mt-4 bg-[#1A2C23]/50 rounded-xl p-4 border border-white/10">
            <textarea
              className="w-full bg-transparent text-white placeholder-gray-600 border-0 focus:ring-0 resize-none text-sm min-h-20"
              placeholder={`回复 @${comment.nickname}...`}
            />
            <div className="flex justify-end gap-2 mt-2">
              <Button variant="ghost" size="sm" onClick={() => setReplyTo(null)}>
                取消
              </Button>
              <Button variant="primary" size="sm">
                发送回复
              </Button>
            </div>
          </div>
        )}

        {/* 嵌套回复 */}
        {comment.replies &&
          comment.replies.map((reply) => (
            <CommentCard key={reply.id} comment={reply} isReply={true} />
          ))}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      {/* 标题和排序 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">讨论区 ({comments.length})</h2>
        <div className="w-full md:w-45">
          <Select
            options={sortOptions}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          />
        </div>
      </div>

      {/* 评论输入框 */}
      <form onSubmit={handleSubmit} className="bg-[#1A2C23]/50 rounded-xl border border-white/10">
        <div className="flex flex-col md:flex-row gap-0">
          {/* 头像 */}
          <div className="hidden md:flex p-4 pr-0 items-start">
            <div className="w-10 h-10 rounded-full bg-[#283930] flex items-center justify-center ring-2 ring-white/10">
              <span className="material-symbols-outlined">person</span>
            </div>
          </div>

          {/* 输入区域 */}
          <div className="flex-1 flex flex-col">
            {/* 昵称和邮箱输入 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 pb-0">
              <input
                type="text"
                placeholder="您的昵称 *"
                value={newComment.nickname}
                onChange={(e) => setNewComment((prev) => ({ ...prev, nickname: e.target.value }))}
                className="w-full bg-[#102219] border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
                required
              />
              <input
                type="email"
                placeholder="您的邮箱（选填，用于接收回复通知）"
                value={newComment.email}
                onChange={(e) => setNewComment((prev) => ({ ...prev, email: e.target.value }))}
                className="w-full bg-[#102219] border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
              />
            </div>

            {/* 评论内容 */}
            <textarea
              className="w-full bg-transparent text-white placeholder-gray-600 border-0 focus:ring-0 resize-none p-4 min-h-25 text-sm"
              placeholder="分享您的想法..."
              value={newComment.content}
              onChange={(e) => setNewComment((prev) => ({ ...prev, content: e.target.value }))}
              required
            />

            {/* 工具栏 */}
            <div className="flex items-center justify-between px-4 pb-4 pt-2 border-t border-white/10">
              <div className="flex items-center gap-1 text-gray-500">
                <button
                  type="button"
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors group"
                  title="粗体"
                >
                  <span className="material-symbols-outlined text-lg group-hover:text-primary">
                    format_bold
                  </span>
                </button>
                <button
                  type="button"
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors group"
                  title="斜体"
                >
                  <span className="material-symbols-outlined text-lg group-hover:text-primary">
                    format_italic
                  </span>
                </button>
                <button
                  type="button"
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors group"
                  title="代码块"
                >
                  <span className="material-symbols-outlined text-lg group-hover:text-primary">
                    code
                  </span>
                </button>
                <button
                  type="button"
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors group"
                  title="插入链接"
                >
                  <span className="material-symbols-outlined text-lg group-hover:text-primary">
                    link
                  </span>
                </button>
              </div>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isSubmitting}
                className="shadow-[0_0_15px_rgba(19,236,128,0.2)] hover:shadow-[0_0_20px_rgba(19,236,128,0.4)]"
              >
                发表评论
              </Button>
            </div>
          </div>
        </div>
      </form>

      {/* 成功提示 */}
      {showSuccess && (
        <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl flex items-center gap-3">
          <span className="material-symbols-outlined text-primary">check_circle</span>
          <p className="text-sm text-primary">评论已成功发表！</p>
        </div>
      )}

      {/* 管理员提示 */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex gap-4 items-start">
        <span className="material-symbols-outlined text-primary shrink-0 mt-0.5">info</span>
        <div>
          <p className="text-sm font-bold text-primary mb-1">温馨提示</p>
          <p className="text-sm text-gray-400">
            请保持讨论与主题相关，文明发言。如有其他问题，欢迎加入我们的 Discord 频道进行交流。
          </p>
        </div>
      </div>

      {/* 评论列表 */}
      <div className="flex flex-col gap-2 mt-2">
        {sortedComments.map((comment) => (
          <CommentCard key={comment.id} comment={comment} />
        ))}
      </div>

      {/* 加载更多 */}
      {comments.length > 0 && (
        <div className="flex justify-center pt-4">
          <button className="text-gray-400 hover:text-primary text-sm font-bold py-2 px-6 rounded-full border border-white/10 hover:border-primary/50 transition-all flex items-center gap-2 bg-[#1A2C23]">
            加载更多评论
            <span className="material-symbols-outlined text-lg">expand_more</span>
          </button>
        </div>
      )}
    </div>
  );
}
