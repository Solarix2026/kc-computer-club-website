/* eslint-disable prettier/prettier */
'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

/**
 * 主题上下文
 * 支持浅色主题、深色主题和自定义主题色
 */

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeColors {
  primary: string;
  primaryHover: string;
  primaryLight: string;
  primaryGlow: string;
}

interface ThemeContextType {
  // 主题模式
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  
  // 实际显示的主题（解析 system 后的结果）
  resolvedMode: 'light' | 'dark';
  
  // 主题颜色
  colors: ThemeColors;
  setColors: (colors: Partial<ThemeColors>) => void;
  
  // 预设主题色
  presetColors: { name: string; color: string }[];
  applyPreset: (color: string) => void;
  
  // 呼吸灯效果控制
  breathingEffectEnabled: boolean;
  setBreathingEffectEnabled: (enabled: boolean) => void;
  
  // 重置为默认
  resetTheme: () => void;
}

// 默认绿色主题
const DEFAULT_COLORS: ThemeColors = {
  primary: '#13ec80',
  primaryHover: '#0fd673',
  primaryLight: 'rgba(19, 236, 128, 0.1)',
  primaryGlow: 'rgba(19, 236, 128, 0.3)',
};

// 预设主题色
const PRESET_COLORS = [
  { name: '翠绿', color: '#13ec80' },
  { name: '天蓝', color: '#137fec' },
  { name: '紫罗兰', color: '#8b5cf6' },
  { name: '玫瑰红', color: '#f43f5e' },
  { name: '琥珀', color: '#f59e0b' },
  { name: '青色', color: '#06b6d4' },
  { name: '粉红', color: '#ec4899' },
  { name: '石灰', color: '#84cc16' },
];

// 从颜色生成主题色变量（包括 RGB 值用于呼吸灯）
function generateColorsFromPrimary(primary: string): ThemeColors {
  // 简单的颜色变化算法
  const hex = primary.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // 稍微暗一点的 hover 颜色
  const hoverR = Math.max(0, r - 20);
  const hoverG = Math.max(0, g - 20);
  const hoverB = Math.max(0, b - 20);
  
  return {
    primary,
    primaryHover: `#${hoverR.toString(16).padStart(2, '0')}${hoverG.toString(16).padStart(2, '0')}${hoverB.toString(16).padStart(2, '0')}`,
    primaryLight: `rgba(${r}, ${g}, ${b}, 0.1)`,
    primaryGlow: `rgba(${r}, ${g}, ${b}, 0.3)`,
  };
}

// 从十六进制颜色提取 RGB 值
function extractRGB(hexColor: string): string {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  return `${r}, ${g}, ${b}`;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY_MODE = 'theme-mode';
const STORAGE_KEY_COLORS = 'theme-colors';
const STORAGE_KEY_BREATHING = 'breathing-effect-enabled';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('system');
  const [resolvedMode, setResolvedMode] = useState<'light' | 'dark'>('dark');
  const [colors, setColorsState] = useState<ThemeColors>(DEFAULT_COLORS);
  const [breathingEffectEnabled, setBreathingEffectEnabledState] = useState(true);
  const [mounted, setMounted] = useState(false);

  // 应用主题到 DOM
  const applyTheme = useCallback((isDark: boolean, themeColors: ThemeColors, breathingEnabled: boolean) => {
    const root = document.documentElement;
    
    // 应用主题模式
    if (isDark) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
    
    // 应用主题颜色 + RGB 值用于呼吸灯
    root.style.setProperty('--primary', themeColors.primary);
    root.style.setProperty('--primary-hover', themeColors.primaryHover);
    root.style.setProperty('--primary-light', themeColors.primaryLight);
    root.style.setProperty('--primary-glow', themeColors.primaryGlow);
    root.style.setProperty('--primary-rgb', extractRGB(themeColors.primary));
    
    // 应用呼吸灯效果开关到全局类
    if (breathingEnabled) {
      root.classList.add('breathing-enabled');
      root.classList.remove('breathing-disabled');
    } else {
      root.classList.remove('breathing-enabled');
      root.classList.add('breathing-disabled');
    }
  }, []);

  // 初始化主题
  useEffect(() => {
    // 从 localStorage 读取
    const storedMode = localStorage.getItem(STORAGE_KEY_MODE) as ThemeMode | null;
    const storedColors = localStorage.getItem(STORAGE_KEY_COLORS);
    const storedBreathing = localStorage.getItem(STORAGE_KEY_BREATHING);
    
    if (storedMode) {
      setModeState(storedMode);
    }
    
    if (storedColors) {
      try {
        const parsed = JSON.parse(storedColors);
        setColorsState(parsed);
      } catch {
        // 忽略解析错误
      }
    }
    
    if (storedBreathing !== null) {
      setBreathingEffectEnabledState(storedBreathing === 'true');
    }
    
    setMounted(true);
  }, []);

  // 监听系统主题变化
  useEffect(() => {
    if (!mounted) return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      if (mode === 'system') {
        setResolvedMode(e.matches ? 'dark' : 'light');
      }
    };
    
    // 初始解析
    if (mode === 'system') {
      setResolvedMode(mediaQuery.matches ? 'dark' : 'light');
    } else {
      setResolvedMode(mode);
    }
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [mode, mounted]);

  // 应用主题变化
  useEffect(() => {
    if (!mounted) return;
    applyTheme(resolvedMode === 'dark', colors, breathingEffectEnabled);
  }, [resolvedMode, colors, breathingEffectEnabled, mounted, applyTheme]);

  // 设置主题模式
  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode);
    localStorage.setItem(STORAGE_KEY_MODE, newMode);
  }, []);

  // 设置主题颜色
  const setColors = useCallback((newColors: Partial<ThemeColors>) => {
    setColorsState(prev => {
      const updated = { ...prev, ...newColors };
      localStorage.setItem(STORAGE_KEY_COLORS, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // 设置呼吸灯效果
  const setBreathingEffectEnabled = useCallback((enabled: boolean) => {
    setBreathingEffectEnabledState(enabled);
    localStorage.setItem(STORAGE_KEY_BREATHING, enabled.toString());
  }, []);

  // 应用预设颜色
  const applyPreset = useCallback((color: string) => {
    const newColors = generateColorsFromPrimary(color);
    setColors(newColors);
  }, [setColors]);

  // 重置主题
  const resetTheme = useCallback(() => {
    setModeState('system');
    setColorsState(DEFAULT_COLORS);
    setBreathingEffectEnabledState(true);
    localStorage.removeItem(STORAGE_KEY_MODE);
    localStorage.removeItem(STORAGE_KEY_COLORS);
    localStorage.removeItem(STORAGE_KEY_BREATHING);
  }, []);

  // 防止 SSR 闪烁
  if (!mounted) {
    return (
      <div style={{ visibility: 'hidden' }}>
        {children}
      </div>
    );
  }

  return (
    <ThemeContext.Provider
      value={{
        mode,
        setMode,
        resolvedMode,
        colors,
        setColors,
        presetColors: PRESET_COLORS,
        applyPreset,
        breathingEffectEnabled,
        setBreathingEffectEnabled,
        resetTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  // 如果在 ThemeProvider 外部使用，返回默认值（用于 SSR）
  if (context === undefined) {
    return {
      mode: 'system' as ThemeMode,
      setMode: () => {},
      resolvedMode: 'dark' as const,
      colors: DEFAULT_COLORS,
      setColors: () => {},
      presetColors: PRESET_COLORS,
      applyPreset: () => {},
      breathingEffectEnabled: true,
      setBreathingEffectEnabled: () => {},
      resetTheme: () => {},
    };
  }
  return context;
}
