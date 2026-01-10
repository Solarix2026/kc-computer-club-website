/* eslint-disable prettier/prettier */
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  studentSignup,
  studentLogin,
  adminLogin,
  studentLogout,
  adminLogout,
  checkSession,
} from '@/services/auth.service';

export interface StudentUser {
  id: string;
  email: string;
  name: string;
  studentId?: string;
  major?: string;
  year?: string;
  createdAt: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin';
}

export type AuthUser = StudentUser | AdminUser;

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isStudent: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  adminLogin: (adminEmail: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        // 首先尝试从 localStorage 恢复学生会话
        const savedStudentSession = localStorage.getItem('studentSession');
        if (savedStudentSession) {
          try {
            const studentUser = JSON.parse(savedStudentSession) as StudentUser;
            setUser(studentUser);
            setIsLoading(false);
            return;
          } catch {
            // localStorage 数据损坏，继续尝试 Appwrite
            localStorage.removeItem('studentSession');
          }
        }

        // 然后尝试 Appwrite session
        const sessionInfo = await checkSession();
        if (sessionInfo.user) {
          setUser(sessionInfo.user);
          // 保存到 localStorage 作为备份
          if (sessionInfo.type === 'student') {
            localStorage.setItem('studentSession', JSON.stringify(sessionInfo.user));
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Failed to check session:', err);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkExistingSession();
  }, []);

  const login = async (email: string, password: string) => {
    setError(null);
    try {
      const studentUser = await studentLogin(email, password);
      setUser(studentUser);
      // 保存到 localStorage 作为备份
      localStorage.setItem('studentSession', JSON.stringify(studentUser));
    } catch (err: unknown) {
      const error = err as Error & { message?: string };
      const errorMsg = error.message || '登录失败';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    setError(null);
    try {
      const studentUser = await studentSignup(name, email, password);
      setUser(studentUser);
      // 保存到 localStorage 作为备份
      localStorage.setItem('studentSession', JSON.stringify(studentUser));
    } catch (err: unknown) {
      const error = err as Error & { message?: string };
      const errorMsg = error.message || '注册失败';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const handleAdminLogin = async (adminUsername: string, password: string) => {
    setError(null);
    try {
      const adminUser = await adminLogin(adminUsername, password);
      setUser(adminUser);
    } catch (err: unknown) {
      const error = err as Error & { message?: string };
      const errorMsg = error.message || '管理员登录失败';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const logout = async () => {
    setError(null);
    try {
      // 尝试登出当前用户（不论是学生还是管理员）
      if (user && 'role' in user && user.role === 'admin') {
        await adminLogout();
      } else {
        await studentLogout();
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      // 清除保存的 session
      localStorage.removeItem('studentSession');
      localStorage.removeItem('adminSession');
    }
  };

  const value = {
    user,
    isLoading,
    isStudent: user ? !('role' in user) : false,
    isAdmin: user ? 'role' in user && user.role === 'admin' : false,
    login,
    signup,
    adminLogin: handleAdminLogin,
    logout,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
