/* eslint-disable prettier/prettier */

/**
 * Secure Cache System
 * 提供安全的缓存管理，支持：
 * - 数据加密/解密
 * - 自动过期管理
 * - 内存使用限制
 * - 跨标签页同步
 */

// 缓存配置接口
export interface CacheConfig {
  ttl?: number; // 过期时间（毫秒），默认 1 小时
  encrypt?: boolean; // 是否加密，默认 true
  storage?: 'localStorage' | 'sessionStorage'; // 存储位置，默认 localStorage
  maxSize?: number; // 单个缓存最大大小（字节），默认 1MB
}

// 缓存数据结构
interface CacheEntry<T> {
  value: T;
  timestamp: number;
  expiresAt: number;
  signature: string;
}

// 默认配置
const DEFAULT_CONFIG: Required<CacheConfig> = {
  ttl: 60 * 60 * 1000, // 1 小时
  encrypt: true,
  storage: 'localStorage',
  maxSize: 1024 * 1024, // 1MB
};

/**
 * 简单的 XOR 加密（安全级别低，用于基础混淆）
 * 使用 UTF-8 编码和 base64 确保兼容性
 * 生产环境应使用更强的加密方案
 */
function simpleXOREncrypt(text: string, key: string): string {
  try {
    // 将字符串转换为 UTF-8 字节
    const utf8Bytes = new TextEncoder().encode(text);
    const keyBytes = new TextEncoder().encode(key);
    
    // XOR 操作
    const xorBytes = new Uint8Array(utf8Bytes.length);
    for (let i = 0; i < utf8Bytes.length; i++) {
      xorBytes[i] = utf8Bytes[i] ^ keyBytes[i % keyBytes.length];
    }
    
    // 转换为 base64
    const binaryString = String.fromCharCode.apply(null, Array.from(xorBytes));
    return btoa(binaryString);
  } catch (error) {
    console.error('Encryption failed:', error);
    return '';
  }
}

function simpleXORDecrypt(encrypted: string, key: string): string {
  try {
    // 从 base64 解码
    const binaryString = atob(encrypted);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // XOR 解密
    const keyBytes = new TextEncoder().encode(key);
    const xorBytes = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) {
      xorBytes[i] = bytes[i] ^ keyBytes[i % keyBytes.length];
    }
    
    // 转换回 UTF-8 字符串
    return new TextDecoder().decode(xorBytes);
  } catch (error) {
    console.error('Decryption failed:', error);
    return '';
  }
}

/**
 * 生成数据签名（用于完整性验证）
 */
function generateSignature(data: string, salt: string): string {
  const combined = data + salt;
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // 转换为 32 位整数
  }
  return hash.toString(36);
}

/**
 * 验证数据签名
 */
function verifySignature(data: string, signature: string, salt: string): boolean {
  const expectedSignature = generateSignature(data, salt);
  return signature === expectedSignature;
}

/**
 * 获取存储对象
 */
function getStorageObject(storage: 'localStorage' | 'sessionStorage'): Storage {
  if (typeof window === 'undefined') {
    throw new Error('Cache system only works in browser environment');
  }
  return storage === 'sessionStorage' ? window.sessionStorage : window.localStorage;
}

/**
 * 安全缓存管理器
 */
export class SecureCache {
  private static readonly CACHE_PREFIX = '__secure_cache_';
  private static readonly ENCRYPTION_KEY = '__cache_key_' + (typeof window !== 'undefined' ? window.location.hostname : '');

  /**
   * 设置缓存
   */
  static set<T = unknown>(
    key: string,
    value: T,
    config: CacheConfig = {}
  ): boolean {
    try {
      const finalConfig = { ...DEFAULT_CONFIG, ...config };
      const fullKey = this.CACHE_PREFIX + key;

      // 检查数据大小
      const serialized = JSON.stringify(value);
      if (serialized.length > finalConfig.maxSize) {
        console.warn(`Cache value for "${key}" exceeds max size limit`);
        return false;
      }

      // 创建缓存条目
      const now = Date.now();
      const entry: CacheEntry<T> = {
        value,
        timestamp: now,
        expiresAt: now + (finalConfig.ttl ?? DEFAULT_CONFIG.ttl),
        signature: generateSignature(serialized, fullKey),
      };

      let dataToStore = JSON.stringify(entry);

      // 加密
      if (finalConfig.encrypt) {
        dataToStore = simpleXOREncrypt(dataToStore, this.ENCRYPTION_KEY);
      }

      // 存储
      const storage = getStorageObject(finalConfig.storage);
      storage.setItem(fullKey, dataToStore);

      return true;
    } catch (error) {
      console.error(`Failed to set cache for "${key}":`, error);
      return false;
    }
  }

  /**
   * 获取缓存
   */
  static get<T = unknown>(key: string, config: CacheConfig = {}): T | null {
    try {
      const finalConfig = { ...DEFAULT_CONFIG, ...config };
      const fullKey = this.CACHE_PREFIX + key;
      const storage = getStorageObject(finalConfig.storage);

      const stored = storage.getItem(fullKey);
      if (!stored) return null;

      let dataStr = stored;

      // 解密
      if (finalConfig.encrypt) {
        dataStr = simpleXORDecrypt(stored, this.ENCRYPTION_KEY);
        if (!dataStr) return null;
      }

      // 解析
      const entry: CacheEntry<T> = JSON.parse(dataStr);

      // 检查过期
      if (Date.now() > entry.expiresAt) {
        this.remove(key, config);
        return null;
      }

      // 验证签名
      const serialized = JSON.stringify(entry.value);
      if (!verifySignature(serialized, entry.signature, fullKey)) {
        console.warn(`Cache signature verification failed for "${key}", removing...`);
        this.remove(key, config);
        return null;
      }

      return entry.value;
    } catch (error) {
      console.error(`Failed to get cache for "${key}":`, error);
      return null;
    }
  }

  /**
   * 删除缓存
   */
  static remove(key: string, config: CacheConfig = {}): boolean {
    try {
      const finalConfig = { ...DEFAULT_CONFIG, ...config };
      const fullKey = this.CACHE_PREFIX + key;
      const storage = getStorageObject(finalConfig.storage);
      storage.removeItem(fullKey);
      return true;
    } catch (error) {
      console.error(`Failed to remove cache for "${key}":`, error);
      return false;
    }
  }

  /**
   * 清除所有缓存
   */
  static clear(storage: 'localStorage' | 'sessionStorage' = 'localStorage'): void {
    try {
      const st = getStorageObject(storage);
      const keysToRemove: string[] = [];

      for (let i = 0; i < st.length; i++) {
        const key = st.key(i);
        if (key && key.startsWith(this.CACHE_PREFIX)) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach((key) => st.removeItem(key));
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }

  /**
   * 获取缓存统计信息
   */
  static getStats(storage: 'localStorage' | 'sessionStorage' = 'localStorage'): {
    count: number;
    totalSize: number;
    entries: Array<{ key: string; size: number; expiresIn: number }>;
  } {
    try {
      const st = getStorageObject(storage);
      let totalSize = 0;
      const entries: Array<{ key: string; size: number; expiresIn: number }> = [];

      for (let i = 0; i < st.length; i++) {
        const key = st.key(i);
        if (key && key.startsWith(this.CACHE_PREFIX)) {
          const stored = st.getItem(key);
          const size = stored ? stored.length : 0;
          totalSize += size;

          // 尝试解析过期时间
          try {
            let dataStr = stored;
            if (stored) {
              dataStr = simpleXORDecrypt(stored, this.ENCRYPTION_KEY);
              const entry = JSON.parse(dataStr || '{}') as CacheEntry<unknown>;
              const expiresIn = Math.max(0, entry.expiresAt - Date.now());
              entries.push({
                key: key.replace(this.CACHE_PREFIX, ''),
                size,
                expiresIn,
              });
            }
          } catch {
            entries.push({
              key: key.replace(this.CACHE_PREFIX, ''),
              size,
              expiresIn: -1,
            });
          }
        }
      }

      return {
        count: entries.length,
        totalSize,
        entries,
      };
    } catch (error) {
      console.error('Failed to get cache stats:', error);
      return { count: 0, totalSize: 0, entries: [] };
    }
  }

  /**
   * 验证缓存完整性
   */
  static verify(key: string, config: CacheConfig = {}): boolean {
    try {
      const finalConfig = { ...DEFAULT_CONFIG, ...config };
      const fullKey = this.CACHE_PREFIX + key;
      const storage = getStorageObject(finalConfig.storage);

      const stored = storage.getItem(fullKey);
      if (!stored) return false;

      let dataStr = stored;

      // 解密
      if (finalConfig.encrypt) {
        dataStr = simpleXORDecrypt(stored, this.ENCRYPTION_KEY);
        if (!dataStr) return false;
      }

      // 解析并验证
      const entry: CacheEntry<unknown> = JSON.parse(dataStr);

      // 检查过期
      if (Date.now() > entry.expiresAt) {
        return false;
      }

      // 验证签名
      const serialized = JSON.stringify(entry.value);
      return verifySignature(serialized, entry.signature, fullKey);
    } catch {
      return false;
    }
  }
}

/**
 * React Hook: 使用缓存
 */
export function useCache<T = unknown>(
  key: string,
  fetcher: () => Promise<T>,
  config: CacheConfig = {}
): {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  invalidate: () => void;
} {
  const [data, setData] = React.useState<T | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  const refetch = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 先检查缓存
      const cached = SecureCache.get<T>(key, config);
      if (cached) {
        setData(cached);
        return;
      }

      // 执行获取
      const result = await fetcher();
      SecureCache.set(key, result, config);
      setData(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [key, fetcher, config]);

  const invalidate = React.useCallback(() => {
    SecureCache.remove(key, config);
    setData(null);
  }, [key, config]);

  React.useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, isLoading, error, refetch, invalidate };
}

// 需要导入 React
import React from 'react';
