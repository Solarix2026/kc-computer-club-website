/* eslint-disable prettier/prettier */
'use client';

import { useState, useRef, useEffect } from 'react';
import { useTheme, ThemeMode } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

/**
 * 主题切换组件
 * 支持浅色/深色/跟随系统 + 自定义主题色
 */

interface ThemeToggleProps {
  /** 是否显示颜色选择 */
  showColorPicker?: boolean;
  /** 紧凑模式（仅图标） */
  compact?: boolean;
  /** 额外类名 */
  className?: string;
}

export function ThemeToggle({ 
  showColorPicker = true, 
  compact = false,
  className 
}: ThemeToggleProps) {
  const { mode, setMode, resolvedMode, colors, presetColors, applyPreset } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 确保组件在客户端渲染
  useEffect(() => {
    setMounted(true);
  }, []);

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const modeOptions: { value: ThemeMode; label: string; icon: string }[] = [
    { value: 'light', label: '浅色', icon: 'light_mode' },
    { value: 'dark', label: '深色', icon: 'dark_mode' },
    { value: 'system', label: '跟随系统', icon: 'settings_brightness' },
  ];

  const currentModeIcon = mode === 'system' 
    ? 'settings_brightness' 
    : resolvedMode === 'dark' 
      ? 'dark_mode' 
      : 'light_mode';

  // 在客户端渲染之前显示占位符
  if (!mounted) {
    return (
      <div className={cn(
        'p-2 rounded-lg bg-[var(--surface-hover)]',
        compact ? 'w-9 h-9' : 'w-24 h-9',
        className
      )} />
    );
  }

  if (compact) {
    return (
      <button
        onClick={() => {
          // 循环切换：light -> dark -> system -> light
          const nextMode = mode === 'light' ? 'dark' : mode === 'dark' ? 'system' : 'light';
          setMode(nextMode);
        }}
        className={cn(
          'p-2 rounded-lg transition-colors',
          'bg-[var(--surface-hover)] hover:bg-[var(--border)] text-[var(--foreground)]',
          className
        )}
        title={`当前: ${modeOptions.find(m => m.value === mode)?.label}`}
      >
        <span className="material-symbols-outlined text-[20px]">
          {currentModeIcon}
        </span>
      </button>
    );
  }

  return (
    <div ref={dropdownRef} className={cn('relative', className)}>
      {/* 触发按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-xl transition-all',
          'bg-[var(--surface-hover)] hover:bg-[var(--border)] text-[var(--foreground)]',
          'text-sm font-medium',
          isOpen && 'ring-2 ring-primary/50'
        )}
      >
        <span className="material-symbols-outlined text-[20px]">
          {currentModeIcon}
        </span>
        <span className="hidden sm:inline">主题</span>
        <span className="material-symbols-outlined text-[16px]">
          {isOpen ? 'expand_less' : 'expand_more'}
        </span>
      </button>

      {/* 下拉菜单 */}
      {isOpen && (
        <div className={cn(
          'absolute right-0 mt-2 w-64 z-50',
          'bg-[var(--surface)] rounded-2xl shadow-xl',
          'border border-[var(--border)]',
          'overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200'
        )}>
          {/* 主题模式选择 */}
          <div className="p-3 border-b border-[var(--border)]">
            <p className="text-xs text-[var(--text-secondary)] font-medium mb-2 uppercase tracking-wider px-1">
              外观模式
            </p>
            <div className="flex gap-1">
              {modeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setMode(option.value)}
                  className={cn(
                    'flex-1 flex flex-col items-center gap-1 p-2 rounded-lg transition-all',
                    mode === option.value
                      ? 'bg-primary/20 text-primary'
                      : 'hover:bg-[var(--surface-hover)] text-[var(--text-secondary)]'
                  )}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {option.icon}
                  </span>
                  <span className="text-xs font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 主题色选择 */}
          {showColorPicker && (
            <div className="p-3">
              <p className="text-xs text-[var(--text-secondary)] font-medium mb-2 uppercase tracking-wider px-1">
                主题颜色
              </p>
              <div className="grid grid-cols-4 gap-2">
                {presetColors.map((preset) => (
                  <button
                    key={preset.color}
                    onClick={() => applyPreset(preset.color)}
                    className={cn(
                      'flex flex-col items-center gap-1 p-2 rounded-lg transition-all',
                      'hover:bg-[var(--surface-hover)]',
                      colors.primary === preset.color && 'ring-2 ring-offset-2 ring-offset-[var(--surface)]'
                    )}
                    style={{ 
                      '--tw-ring-color': preset.color 
                    } as React.CSSProperties}
                    title={preset.name}
                  >
                    <div 
                      className="w-6 h-6 rounded-full shadow-inner"
                      style={{ backgroundColor: preset.color }}
                    />
                    <span className="text-[10px] text-[var(--text-secondary)] truncate w-full text-center">
                      {preset.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
