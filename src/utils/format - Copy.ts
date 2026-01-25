/* eslint-disable prettier/prettier */
import {
  format,
  formatDistanceToNow,
  isToday,
  isYesterday,
  parse,
} from 'date-fns';
import { zhCN } from 'date-fns/locale';

// 格式化日期为 YYYY-MM-DD
export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'yyyy-MM-dd', { locale: zhCN });
};

// 格式化日期时间为 YYYY-MM-DD HH:mm
export const formatDateTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'yyyy-MM-dd HH:mm', { locale: zhCN });
};

// 格式化日期时间为 YYYY-MM-DD HH:mm:ss
export const formatDateTimeWithSeconds = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'yyyy-MM-dd HH:mm:ss', { locale: zhCN });
};

// 相对时间格式 （如：2小时前）
export const formatRelativeTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(dateObj, { locale: zhCN, addSuffix: true });
};

// 智能格式化时间（今天/昨天或具体日期）
export const formatSmartTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isToday(dateObj)) {
    return `今天 ${format(dateObj, 'HH:mm')}`;
  }

  if (isYesterday(dateObj)) {
    return `昨天 ${format(dateObj, 'HH:mm')}`;
  }

  return format(dateObj, 'yyyy-MM-dd HH:mm', { locale: zhCN });
};

// 格式化时间为 HH:mm
export const formatTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'HH:mm', { locale: zhCN });
};

// 格式化月份和日期 MM-dd
export const formatMonthDay = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'MM-dd', { locale: zhCN });
};

// 解析日期字符串
export const parseDate = (
  dateString: string,
  formatString: string = 'yyyy-MM-dd'
): Date => {
  return parse(dateString, formatString, new Date());
};

// 检查是否已过期（用于活动报名截止）
export const isExpired = (deadline: Date | string): boolean => {
  const deadlineDate =
    typeof deadline === 'string' ? new Date(deadline) : deadline;
  return new Date() > deadlineDate;
};

// 获取剩余时间（毫秒）
export const getTimeRemaining = (deadline: Date | string): number => {
  const deadlineDate =
    typeof deadline === 'string' ? new Date(deadline) : deadline;
  return Math.max(0, deadlineDate.getTime() - new Date().getTime());
};

// 格式化剩余时间为可读格式
export const formatTimeRemaining = (deadline: Date | string): string => {
  const remaining = getTimeRemaining(deadline);

  if (remaining === 0) {
    return '已过期';
  }

  const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) {
    return `剩余 ${days} 天 ${hours} 小时`;
  }

  if (hours > 0) {
    return `剩余 ${hours} 小时 ${minutes} 分钟`;
  }

  return `剩余 ${minutes} 分钟`;
};

// 获取当前日期（今天）
export const getTodayStart = (): Date => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

// 获取明天日期
export const getTomorrowStart = (): Date => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow;
};

// 获取下周日期
export const getNextWeekStart = (): Date => {
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  nextWeek.setHours(0, 0, 0, 0);
  return nextWeek;
};

// 将日期时间组合（分别输入日期和时间）
export const combineDateAndTime = (date: Date, time: string): Date => {
  const [hours, minutes] = time.split(':').map(Number);
  const combined = new Date(date);
  combined.setHours(hours, minutes, 0, 0);
  return combined;
};
