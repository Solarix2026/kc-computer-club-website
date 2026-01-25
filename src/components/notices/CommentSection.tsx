/* eslint-disable prettier/prettier */
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Loading } from '@/components/ui/Loading';

interface Comment {
  $id: string;
  authorName: string;
  content: string;
  createdAt: string;
  status: string;
  authorEmail?: string;
}

interface CommentSectionProps {
  targetType: 'notice' | 'activity';
  targetId: string;
  targetTitle?: string;
}

export const CommentSection = ({ targetType, targetId, targetTitle }: CommentSectionProps) => {
  const { user, isStudent } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authorName, setAuthorName] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);

  // 当用户登录时，自动填充用户信息
  useEffect(() => {
    if (isStudent && user && !('role' in user)) {
      setAuthorName(user.name);
      setAuthorEmail(user.email);
    }
  }, [isStudent, user]);

  // 加载评论
  useEffect(() => {
    const loadComments = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `/api/comments?targetType=${targetType}&targetId=${targetId}&onlyApproved=true`
        );
        const data = await response.json();
        if (data.success) {
          setComments(data.comments || []);
        }
      } catch (err: unknown) {
        console.error('加载评论失败:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadComments();
  }, [targetType, targetId]);

  // 检查是否在5分钟内
  const isWithin5Minutes = (createdAt: string) => {
    const created = new Date(createdAt).getTime();
    const now = new Date().getTime();
    return (now - created) < 5 * 60 * 1000; // 5 minutes in milliseconds
  };

  // 检查是否是评论作者
  const isCommentAuthor = (comment: Comment) => {
    return isStudent && user && user.email === comment.authorEmail;
  };

  const handleEditComment = async (commentId: string, newContent: string) => {
    if (!newContent.trim()) {
      setError('评论内容不能为空');
      return;
    }

    setIsEditSubmitting(true);
    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newContent.trim() }),
      });

      const data = await response.json();

      if (data.success) {
        setEditingId(null);
        setEditContent('');
        // 刷新评论列表
        const listResponse = await fetch(
          `/api/comments?targetType=${targetType}&targetId=${targetId}&onlyApproved=true`
        );
        const listData = await listResponse.json();
        if (listData.success) {
          setComments(listData.comments || []);
        }
      } else {
        setError(data.error || '编辑评论失败');
      }
    } catch {
      setError('网络错误，请重试');
    } finally {
      setIsEditSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('确定要删除这条评论吗？')) return;

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        // 刷新评论列表
        const listResponse = await fetch(
          `/api/comments?targetType=${targetType}&targetId=${targetId}&onlyApproved=true`
        );
        const listData = await listResponse.json();
        if (listData.success) {
          setComments(listData.comments || []);
        }
      } else {
        setError(data.error || '删除评论失败');
      }
    } catch {
      setError('网络错误，请重试');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitSuccess(false);

    // 验证
    if (!authorName.trim()) {
      setError('请输入昵称');
      return;
    }
    if (!content.trim()) {
      setError('请输入评论内容');
      return;
    }
    if (content.length > 500) {
      setError('评论内容不能超过500个字符');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetType,
          targetId,
          targetTitle,
          authorName: authorName.trim(),
          authorEmail: authorEmail.trim(),
          content: content.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSubmitSuccess(true);
        setContent('');
        // Keep authorName and authorEmail for next comment if user is logged in
        if (!isStudent || !user) {
          setAuthorName('');
          setAuthorEmail('');
        }

        // 刷新评论列表
        const listResponse = await fetch(
          `/api/comments?targetType=${targetType}&targetId=${targetId}&onlyApproved=true`
        );
        const listData = await listResponse.json();
        if (listData.success) {
          setComments(listData.comments || []);
        }

        // 3秒后隐藏成功消息
        setTimeout(() => setSubmitSuccess(false), 3000);
      } else {
        setError(data.error || '发布评论失败');
      }
    } catch {
      setError('网络错误，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mt-12 pt-8 border-t border-[#283930]">
      {/* 折叠标题 */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full mb-6 group"
      >
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-black dark:text-white group-hover:text-[#13ec80] transition-colors">
            评论区
          </h2>
          <span className="text-sm text-gray-600 dark:text-[#9db9ab] bg-white dark:bg-[#1a2c23] px-2 py-1 rounded-full">
            {comments.length}
          </span>
        </div>
        <span className={`material-symbols-outlined text-[#9db9ab] group-hover:text-[#13ec80] transition-all ${
          isExpanded ? 'rotate-180' : ''
        }`}>
          expand_more
        </span>
      </button>

      {/* 评论表单 */}
      {isExpanded && (
        <>
          <div className="bg-white dark:bg-[#1A2C23] rounded-xl border border-gray-200 dark:border-[#283930] p-6 mb-8 animate-in">
            <h3 className="text-lg font-bold text-black dark:text-white mb-4">发表评论</h3>

            {submitSuccess && (
              <div className="bg-[#13ec80]/10 border border-[#13ec80] text-[#13ec80] px-4 py-3 rounded-lg mb-4">
                <p className="text-sm font-medium">评论已发布</p>
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-4">
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 如果用户未登录，显示登录提示 */}
              {!isStudent || !user ? (
                <div className="bg-blue-500/10 border border-blue-500 text-blue-400 px-4 py-3 rounded-lg mb-4">
                  <p className="text-sm font-medium">
                    <span className="material-symbols-outlined text-sm align-middle mr-1">info</span>
                    请先登录以发表评论
                  </p>
                </div>
              ) : (
                <div className="bg-[#13ec80]/10 border border-[#13ec80] text-[#13ec80] px-4 py-3 rounded-lg mb-4">
                  <p className="text-sm font-medium">
                    <span className="material-symbols-outlined text-sm align-middle mr-1">verified_user</span>
                    以 <span className="font-bold">{user.name}</span> ({user.email}) 的身份发表评论
                  </p>
                </div>
              )}

              {/* 评论内容 */}
              <div>
                <textarea
                  placeholder="写下你的评论... (最多500个字符)"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  disabled={isSubmitting || !isStudent || !user}
                  maxLength={500}
                  rows={4}
                  className="w-full bg-white dark:bg-[#162a21] text-black dark:text-white rounded-lg border border-gray-300 dark:border-[#283930] px-4 py-3 placeholder-gray-500 dark:placeholder-[#9db9ab]/50 focus:outline-none focus:border-[#13ec80] focus:ring-1 focus:ring-[#13ec80]/20 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <p className="text-xs text-[#9db9ab] mt-2 text-right">
                  {content.length}/500
                </p>
              </div>

              {/* 提交按钮 */}
              <div className="flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting || !content.trim() || !isStudent || !user}
                >
                  {!isStudent || !user ? '请先登录' : isSubmitting ? '发布中...' : '发布评论'}
                </Button>
              </div>
            </form>
          </div>

          {/* 评论列表 */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loading size="sm" text="加载评论中..." />
            </div>
          ) : comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((comment) => {
                const canEditDelete = isCommentAuthor(comment) && isWithin5Minutes(comment.createdAt);
                return (
                  <div
                    key={comment.$id}
                    className="bg-white dark:bg-[#1A2C23] rounded-lg border border-gray-200 dark:border-[#283930] p-4"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-bold text-black dark:text-white">{comment.authorName}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#9db9ab]">
                          {new Date(comment.createdAt).toLocaleDateString('zh-CN')}
                        </span>
                        {canEditDelete && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => {
                                setEditingId(comment.$id);
                                setEditContent(comment.content);
                              }}
                              className="text-xs px-2 py-1 text-[#13ec80] hover:bg-[#13ec80]/10 rounded transition-colors"
                            >
                              编辑
                            </button>
                            <button
                              onClick={() => handleDeleteComment(comment.$id)}
                              className="text-xs px-2 py-1 text-red-400 hover:bg-red-500/10 rounded transition-colors"
                            >
                              删除
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    {editingId === comment.$id ? (
                      <div className="space-y-2">
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          maxLength={500}
                          rows={3}
                          className="w-full bg-white dark:bg-[#162a21] text-black dark:text-white rounded-lg border border-gray-300 dark:border-[#283930] px-3 py-2 placeholder-gray-500 dark:placeholder-[#9db9ab]/50 focus:outline-none focus:border-[#13ec80] focus:ring-1 focus:ring-[#13ec80]/20 resize-none"
                        />
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => {
                              setEditingId(null);
                              setEditContent('');
                            }}
                            className="text-xs px-3 py-1 text-gray-400 hover:text-white rounded transition-colors"
                          >
                            取消
                          </button>
                          <button
                            onClick={() => handleEditComment(comment.$id, editContent)}
                            disabled={isEditSubmitting}
                            className="text-xs px-3 py-1 bg-[#13ec80]/20 text-[#13ec80] hover:bg-[#13ec80]/30 rounded transition-colors disabled:opacity-50"
                          >
                            {isEditSubmitting ? '保存中...' : '保存'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-800 dark:text-[#E0E0E0] leading-relaxed">
                        {comment.content}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-4xl text-[#9db9ab] block mb-3">
                comment
              </span>
              <p className="text-[#9db9ab]">暂无评论，成为第一个评论者吧！</p>
            </div>
          )}
        </>
      )}
    </section>
  );
};
