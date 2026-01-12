/* eslint-disable prettier/prettier */
'use client';

import { useState, useEffect } from 'react';
import { ProjectChecklist, ChecklistItem } from '@/types';

interface ProjectChecklistProps {
  projectId: string;
  checklist?: ProjectChecklist;
  isReadOnly?: boolean;
  onChecklistUpdate?: (updatedChecklist: ProjectChecklist) => void;
}

export function ProjectChecklistComponent({
  projectId,
  checklist: initialChecklist,
  isReadOnly = false,
  onChecklistUpdate,
}: ProjectChecklistProps) {
  const [checklist, setChecklist] = useState<ProjectChecklist | null>(initialChecklist || null);
  const [isLoading, setIsLoading] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemDescription, setNewItemDescription] = useState('');

  // 计算进度百分比
  const calculateProgress = (items: ChecklistItem[]): number => {
    if (items.length === 0) return 0;
    const completed = items.filter(item => item.completed).length;
    return Math.round((completed / items.length) * 100);
  };

  // 切换检查清单项目
  const handleToggleItem = async (itemId: string) => {
    if (isReadOnly || !checklist) return;

    setIsLoading(true);
    try {
      const updatedItems = checklist.items.map(item =>
        item.id === itemId
          ? {
              ...item,
              completed: !item.completed,
              completedAt: !item.completed ? new Date().toISOString() : undefined,
            }
          : item
      );

      const updatedChecklist = {
        ...checklist,
        items: updatedItems,
        updatedAt: new Date().toISOString(),
      };

      // 调用 API 更新
      const response = await fetch(`/api/projects/${projectId}/checklist`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: updatedItems }),
      });

      if (!response.ok) {
        throw new Error('更新检查清单失败');
      }

      setChecklist(updatedChecklist);
      onChecklistUpdate?.(updatedChecklist);
    } catch (err) {
      console.error('更新检查清单失败:', err);
      alert('更新检查清单失败');
    } finally {
      setIsLoading(false);
    }
  };

  // 添加新项目
  const handleAddItem = async () => {
    if (!newItemTitle.trim() || !checklist) return;

    setIsLoading(true);
    try {
      const newItem: ChecklistItem = {
        id: Date.now().toString(),
        title: newItemTitle,
        description: newItemDescription || undefined,
        completed: false,
      };

      const updatedItems = [...checklist.items, newItem];
      const updatedChecklist = {
        ...checklist,
        items: updatedItems,
        updatedAt: new Date().toISOString(),
      };

      // 调用 API 更新
      const response = await fetch(`/api/projects/${projectId}/checklist`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: updatedItems }),
      });

      if (!response.ok) {
        throw new Error('添加项目失败');
      }

      setChecklist(updatedChecklist);
      setNewItemTitle('');
      setNewItemDescription('');
      onChecklistUpdate?.(updatedChecklist);
    } catch (err) {
      console.error('添加项目失败:', err);
      alert('添加项目失败');
    } finally {
      setIsLoading(false);
    }
  };

  // 删除项目
  const handleDeleteItem = async (itemId: string) => {
    if (isReadOnly || !checklist) return;

    setIsLoading(true);
    try {
      const updatedItems = checklist.items.filter(item => item.id !== itemId);
      const updatedChecklist = {
        ...checklist,
        items: updatedItems,
        updatedAt: new Date().toISOString(),
      };

      // 调用 API 更新
      const response = await fetch(`/api/projects/${projectId}/checklist`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: updatedItems }),
      });

      if (!response.ok) {
        throw new Error('删除项目失败');
      }

      setChecklist(updatedChecklist);
      onChecklistUpdate?.(updatedChecklist);
    } catch (err) {
      console.error('删除项目失败:', err);
      alert('删除项目失败');
    } finally {
      setIsLoading(false);
    }
  };

  if (!checklist || !checklist.items || checklist.items.length === 0) {
    return (
      <div className="bg-[#1a2c24] rounded-2xl p-6 lg:p-8 border border-white/10">
        <h3 className="text-lg font-bold mb-4">项目检查清单</h3>
        <p className="text-gray-400 mb-6">还没有检查清单项目</p>

        {!isReadOnly && (
          <div className="space-y-4">
            <input
              type="text"
              value={newItemTitle}
              onChange={(e) => setNewItemTitle(e.target.value)}
              placeholder="输入任务标题..."
              className="w-full px-4 py-3 rounded-lg bg-[#101922] border border-[#2a3c34] text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#13ec80]"
              disabled={isLoading}
            />
            <textarea
              value={newItemDescription}
              onChange={(e) => setNewItemDescription(e.target.value)}
              placeholder="输入任务描述（可选）..."
              rows={2}
              className="w-full px-4 py-3 rounded-lg bg-[#101922] border border-[#2a3c34] text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#13ec80] resize-none"
              disabled={isLoading}
            />
            <button
              onClick={handleAddItem}
              disabled={isLoading || !newItemTitle.trim()}
              className="w-full px-4 py-2 bg-[#13ec80] hover:bg-[#0fd673] text-[#102219] font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '添加中...' : '添加第一个任务'}
            </button>
          </div>
        )}
      </div>
    );
  }

  const progress = calculateProgress(checklist.items);

  return (
    <div className="bg-[#1a2c24] rounded-2xl p-6 lg:p-8 border border-white/10">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold">项目检查清单</h3>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-2xl font-black text-[#13ec80]">{progress}%</p>
            <p className="text-xs text-gray-400">进度</p>
          </div>
        </div>
      </div>

      {/* 进度条 */}
      <div className="mb-6">
        <div className="w-full h-2 bg-[#101922] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#13ec80] transition-all"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          {checklist.items.filter(item => item.completed).length} / {checklist.items.length} 已完成
        </p>
      </div>

      {/* 检查清单项目 */}
      <div className="space-y-2 mb-6">
        {checklist.items.map((item, index) => (
          <div
            key={item.id}
            className="flex items-start gap-3 p-3 rounded-lg bg-[#101922] hover:bg-[#1a2c24] transition-colors group"
          >
            <input
              type="checkbox"
              checked={item.completed}
              onChange={() => handleToggleItem(item.id)}
              disabled={isReadOnly || isLoading}
              className="mt-1 w-5 h-5 rounded cursor-pointer"
            />
            <div className="flex-1 min-w-0">
              <p
                className={`font-medium transition-all ${
                  item.completed
                    ? 'text-gray-500 line-through'
                    : 'text-white'
                }`}
              >
                {item.title}
              </p>
              {item.description && (
                <p className="text-sm text-gray-400 mt-1">{item.description}</p>
              )}
              {item.completedAt && (
                <p className="text-xs text-gray-500 mt-1">
                  ✓ 完成于 {new Date(item.completedAt).toLocaleDateString('zh-CN')}
                </p>
              )}
            </div>
            {!isReadOnly && (
              <button
                onClick={() => handleDeleteItem(item.id)}
                disabled={isLoading}
                className="flex-shrink-0 p-1 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
              >
                <span className="material-symbols-outlined text-lg">delete</span>
              </button>
            )}
          </div>
        ))}
      </div>

      {/* 添加新项目表单 */}
      {!isReadOnly && (
        <div className="border-t border-[#2a3c34] pt-4 space-y-3">
          <input
            type="text"
            value={newItemTitle}
            onChange={(e) => setNewItemTitle(e.target.value)}
            placeholder="输入新任务..."
            className="w-full px-3 py-2 rounded-lg bg-[#101922] border border-[#2a3c34] text-white placeholder:text-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#13ec80]"
            disabled={isLoading}
          />
          <textarea
            value={newItemDescription}
            onChange={(e) => setNewItemDescription(e.target.value)}
            placeholder="任务描述（可选）..."
            rows={2}
            className="w-full px-3 py-2 rounded-lg bg-[#101922] border border-[#2a3c34] text-white placeholder:text-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#13ec80] resize-none"
            disabled={isLoading}
          />
          <button
            onClick={handleAddItem}
            disabled={isLoading || !newItemTitle.trim()}
            className="w-full px-3 py-2 bg-[#13ec80] hover:bg-[#0fd673] text-[#102219] font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {isLoading ? '添加中...' : '添加任务'}
          </button>
        </div>
      )}
    </div>
  );
}
