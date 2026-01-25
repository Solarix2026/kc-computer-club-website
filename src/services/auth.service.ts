/* eslint-disable prettier/prettier */
import { databases } from './appwrite';
import { Query } from 'appwrite';
import { StudentUser, AdminUser } from '@/contexts/AuthContext';
import bcrypt from 'bcryptjs';
import CryptoJS from 'crypto-js';

/**
 * 认证服务
 * 使用 Appwrite Database 存储用户凭证（不使用 Appwrite Account）
 * 支持学生和管理员认证
 */

const APPWRITE_DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '';
const USERS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION || '';
const ADMINS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_ADMINS_COLLECTION || '';

// 加密密钥（用于加密敏感数据）
const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 'kc-computer-club-2024';

/**
 * 加密敏感数据
 */
export function encryptData(data: string): string {
  if (!data) return '';
  return CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
}

/**
 * 解密敏感数据
 */
export function decryptData(encryptedData: string): string {
  if (!encryptedData) return '';
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch {
    return '';
  }
}

/**
 * 默认学生密码
 */
export const DEFAULT_STUDENT_PASSWORD = '11111111';

/**
 * 哈希密码
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/**
 * 验证密码
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * ========================================
 * 学生认证
 * ========================================
 */

/**
 * 学生登录
 * @param email 学号邮箱 (格式: xxxxx@kuencheng.edu.my)
 * @param password 密码
 * @returns 学生用户信息和是否需要修改密码
 */
export async function studentLogin(
  email: string,
  password: string
): Promise<StudentUser & { requirePasswordChange: boolean }> {
  try {
    // 1. 从数据库查找学生
    const studentRecords = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      USERS_COLLECTION_ID,
      [Query.equal('email', email.toLowerCase().trim())]
    );

    if (studentRecords.documents.length === 0) {
      throw new Error('账号或密码错误');
    }

    const studentRecord = studentRecords.documents[0];

    // 2. 检查角色
    if (studentRecord.role !== 'student') {
      throw new Error('账号或密码错误');
    }

    // 3. 验证密码
    const passwordHash = studentRecord.passwordHash;
    if (!passwordHash) {
      throw new Error('账户未设置密码，请联系管理员');
    }

    const passwordMatch = await bcrypt.compare(password, passwordHash);
    if (!passwordMatch) {
      throw new Error('账号或密码错误');
    }

    // 4. 更新最后登录时间
    try {
      await databases.updateDocument(
        APPWRITE_DATABASE_ID,
        USERS_COLLECTION_ID,
        studentRecord.$id,
        {
          lastLogin: new Date().toISOString(),
        }
      );
    } catch (updateError) {
      console.warn('更新登录时间失败:', updateError);
      // 继续登录流程
    }

    // 5. 构建返回对象
    const studentUser: StudentUser & { requirePasswordChange: boolean } = {
      id: studentRecord.$id,
      email: studentRecord.email,
      name: studentRecord.chineseName || studentRecord.name || '',
      studentId: studentRecord.studentId || '',
      chineseName: studentRecord.chineseName || '',
      englishName: studentRecord.englishName || '',
      classNameCn: studentRecord.classNameCn || '',
      classNameEn: studentRecord.classNameEn || '',
      classCode: studentRecord.classCode || '',
      createdAt: studentRecord.createdAt || studentRecord.$createdAt,
      requirePasswordChange: studentRecord.requirePasswordChange === true,
    };

    // 6. 存储学生会话到 localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('studentSession', JSON.stringify(studentUser));
    }

    return studentUser;
  } catch (error: unknown) {
    const err = error as Error & { message?: string };
    throw new Error(err.message || '登录失败，请稍后重试');
  }
}

/**
 * 学生修改密码
 * @param studentId 学生文档ID
 * @param currentPassword 当前密码
 * @param newPassword 新密码
 */
export async function changeStudentPassword(
  studentId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> {
  try {
    // 1. 获取学生记录
    const studentRecord = await databases.getDocument(
      APPWRITE_DATABASE_ID,
      USERS_COLLECTION_ID,
      studentId
    );

    // 2. 验证当前密码
    const passwordHash = studentRecord.passwordHash;
    if (!passwordHash) {
      throw new Error('账户密码数据异常');
    }

    const isPasswordCorrect = await bcrypt.compare(currentPassword, passwordHash);
    if (!isPasswordCorrect) {
      throw new Error('当前密码不正确');
    }

    // 3. 检查新密码不能与默认密码相同
    if (newPassword === DEFAULT_STUDENT_PASSWORD) {
      throw new Error('新密码不能为默认密码');
    }

    // 4. 密码强度验证
    if (newPassword.length < 6) {
      throw new Error('新密码至少需要6个字符');
    }

    // 5. 更新密码
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await databases.updateDocument(
      APPWRITE_DATABASE_ID,
      USERS_COLLECTION_ID,
      studentId,
      {
        passwordHash: hashedNewPassword,
        requirePasswordChange: false,
        updatedAt: new Date().toISOString(),
      }
    );

    // 6. 更新 localStorage 中的 session
    if (typeof window !== 'undefined') {
      const sessionStr = localStorage.getItem('studentSession');
      if (sessionStr) {
        try {
          const session = JSON.parse(sessionStr);
          session.requirePasswordChange = false;
          localStorage.setItem('studentSession', JSON.stringify(session));
        } catch {
          // 忽略
        }
      }
    }

    console.log('学生密码更新成功');
  } catch (error) {
    const err = error as Error & { message?: string };
    console.error('修改密码失败:', err.message);
    throw new Error(err.message || '修改密码失败');
  }
}

/**
 * 学生登出
 */
export async function studentLogout(): Promise<void> {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('studentSession');
  }
  return Promise.resolve();
}

/**
 * 获取当前学生会话
 */
export async function getCurrentStudent(): Promise<(StudentUser & { requirePasswordChange: boolean }) | null> {
  try {
    if (typeof window === 'undefined') {
      return null;
    }

    const sessionStr = localStorage.getItem('studentSession');
    if (!sessionStr) {
      return null;
    }

    const session = JSON.parse(sessionStr) as StudentUser & { requirePasswordChange: boolean };
    
    // 验证会话是否仍然有效（可选：从数据库验证）
    try {
      const studentRecord = await databases.getDocument(
        APPWRITE_DATABASE_ID,
        USERS_COLLECTION_ID,
        session.id
      );
      
      if (!studentRecord || studentRecord.role !== 'student') {
        localStorage.removeItem('studentSession');
        return null;
      }
      
      // 更新会话数据（如果数据库有变更）
      return {
        id: studentRecord.$id,
        email: studentRecord.email,
        name: studentRecord.chineseName || studentRecord.name || '',
        studentId: studentRecord.studentId || '',
        chineseName: studentRecord.chineseName || '',
        englishName: studentRecord.englishName || '',
        classNameCn: studentRecord.classNameCn || '',
        classNameEn: studentRecord.classNameEn || '',
        classCode: studentRecord.classCode || '',
        createdAt: studentRecord.createdAt || studentRecord.$createdAt,
        requirePasswordChange: studentRecord.requirePasswordChange === true,
      };
    } catch {
      // 如果数据库验证失败，仍返回缓存的会话
      return session;
    }
  } catch {
    return null;
  }
}

/**
 * ========================================
 * 管理员认证
 * ========================================
 */

/**
 * 管理员登录
 * @param adminUsername 管理员用户名
 * @param password 密码
 */
export async function adminLogin(
  adminUsername: string,
  password: string
): Promise<AdminUser> {
  try {
    // 1. 从数据库查找管理员（使用用户名）
    const adminRecords = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      ADMINS_COLLECTION_ID,
      [Query.equal('username', adminUsername)]
    );

    if (adminRecords.documents.length === 0) {
      throw new Error('用户名或密码错误');
    }

    const adminRecord = adminRecords.documents[0];

    // 2. 检查管理员是否激活
    if (!adminRecord.isActive) {
      throw new Error('此账号已被禁用');
    }

    // 3. 验证密码哈希
    const passwordMatch = await bcrypt.compare(password, adminRecord.passwordHash);
    if (!passwordMatch) {
      throw new Error('用户名或密码错误');
    }

    // 4. 更新最后登录时间
    await databases.updateDocument(
      APPWRITE_DATABASE_ID,
      ADMINS_COLLECTION_ID,
      adminRecord.$id,
      {
        lastLogin: new Date().toISOString(),
      }
    );

    // 5. 获取关联的用户信息（如果有）
    let adminName = adminUsername;
    if (adminRecord.userId) {
      try {
        const userRecord = await databases.getDocument(
          APPWRITE_DATABASE_ID,
          USERS_COLLECTION_ID,
          adminRecord.userId
        );
        adminName = userRecord.name || adminUsername;
      } catch {
        adminName = adminUsername;
      }
    }

    const adminUser: AdminUser = {
      id: adminRecord.$id,
      email: adminRecord.username + '@admin.local',
      name: adminName,
      username: adminRecord.username,
      role: 'admin',
    };

    // 6. 存储管理员会话到 localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('adminSession', JSON.stringify(adminUser));
    }

    return adminUser;
  } catch (error: unknown) {
    const err = error as Error & { message?: string };
    throw new Error(err.message || '管理员登录失败');
  }
}

/**
 * 管理员修改密码
 */
export async function changeAdminPassword(
  identifier: string,
  currentPassword: string,
  newPassword: string
): Promise<void> {
  try {
    const adminRecords = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      ADMINS_COLLECTION_ID,
      [Query.equal('username', identifier)]
    );

    if (adminRecords.documents.length === 0) {
      throw new Error('管理员账户不存在');
    }

    const adminRecord = adminRecords.documents[0];

    const passwordHash = adminRecord.passwordHash || adminRecord.password;
    if (!passwordHash) {
      throw new Error('密码数据异常，请联系系统管理员');
    }

    const isPasswordCorrect = await bcrypt.compare(currentPassword, passwordHash);

    if (!isPasswordCorrect) {
      throw new Error('当前密码不正确');
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await databases.updateDocument(
      APPWRITE_DATABASE_ID,
      ADMINS_COLLECTION_ID,
      adminRecord.$id,
      {
        passwordHash: hashedNewPassword,
      }
    );

    console.log('管理员密码更新成功');
  } catch (error) {
    const err = error as Error & { message?: string };
    console.error('修改密码失败:', err.message);
    throw new Error(err.message || '修改密码失败');
  }
}

/**
 * 管理员登出
 */
export async function adminLogout(): Promise<void> {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('adminSession');
  }
  return Promise.resolve();
}

/**
 * 获取当前管理员会话
 */
export async function getCurrentAdmin(): Promise<AdminUser | null> {
  try {
    if (typeof window === 'undefined') {
      return null;
    }

    const sessionStr = localStorage.getItem('adminSession');
    if (!sessionStr) {
      return null;
    }

    return JSON.parse(sessionStr) as AdminUser;
  } catch {
    return null;
  }
}

/**
 * 获取管理员的活跃会话列表
 */
export async function getAdminSessions(): Promise<
  Array<{
    id: string;
    device: string;
    browser: string;
    location: string;
    ip: string;
    lastActive: string;
    isCurrent: boolean;
  }>
> {
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const now = new Date().toISOString();

  return [
    {
      id: 'session-1',
      device: userAgent.includes('Windows') ? 'Windows PC' : userAgent.includes('Mac') ? 'MacBook' : 'Device',
      browser: userAgent.includes('Chrome') ? 'Chrome' : userAgent.includes('Firefox') ? 'Firefox' : userAgent.includes('Safari') ? 'Safari' : 'Browser',
      location: '本地',
      ip: '127.0.0.1',
      lastActive: now,
      isCurrent: true,
    },
  ];
}

/**
 * 登出其他设备的会话
 */
export async function logoutOtherSession(sessionId: string): Promise<void> {
  console.log(`已登出会话: ${sessionId}`);
}

/**
 * ========================================
 * 会话检查
 * ========================================
 */

/**
 * 检查当前会话
 * @param preferredType 优先恢复的会话类型
 */
export async function checkSession(preferredType?: 'student' | 'admin'): Promise<{
  type: 'student' | 'admin' | null;
  user: (StudentUser & { requirePasswordChange?: boolean }) | AdminUser | null;
}> {
  try {
    if (typeof window === 'undefined') {
      return { type: null, user: null };
    }

    const checkAdminFirst = preferredType === 'admin';

    if (checkAdminFirst) {
      // 在 admin 页面，只检查 admin session
      try {
        const adminSession = localStorage.getItem('adminSession');
        if (adminSession) {
          const adminUser = JSON.parse(adminSession) as AdminUser;
          return {
            type: 'admin',
            user: adminUser,
          };
        }
      } catch (err) {
        console.warn('Failed to restore admin session:', (err as Error).message);
        localStorage.removeItem('adminSession');
      }
    } else {
      // 在非 admin 页面，只检查 student session
      try {
        const studentSession = localStorage.getItem('studentSession');
        if (studentSession) {
          const studentUser = JSON.parse(studentSession) as StudentUser & { requirePasswordChange: boolean };
          return {
            type: 'student',
            user: studentUser,
          };
        }
      } catch (err) {
        console.warn('Failed to restore student session:', (err as Error).message);
        localStorage.removeItem('studentSession');
      }
    }

    return { type: null, user: null };
  } catch (error) {
    console.log('checkSession error:', (error as Error).message);
    return { type: null, user: null };
  }
}

/**
 * ========================================
 * 密码重置（使用重置令牌）
 * ========================================
 */

/**
 * 验证重置密码令牌
 * @param token 重置令牌
 * @returns 令牌中的用户信息
 */
export function verifyResetToken(token: string): { userId: string; email: string; timestamp: number } | null {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const tokenData = JSON.parse(decoded);

    const { userId, email, timestamp } = tokenData;

    if (!userId || !email || !timestamp) {
      return null;
    }

    // 检查令牌是否过期（24小时）
    const RESET_TOKEN_EXPIRY = 24 * 60 * 60 * 1000;
    const currentTime = Date.now();
    const tokenAge = currentTime - timestamp;

    if (tokenAge > RESET_TOKEN_EXPIRY) {
      return null;
    }

    return { userId, email, timestamp };
  } catch (error) {
    console.error('令牌验证失败:', error);
    return null;
  }
}

/**
 * 生成重置密码令牌
 * @param userId 用户ID
 * @param email 用户邮箱
 * @returns 重置令牌
 */
export function generateResetToken(userId: string, email: string): string {
  const tokenData = {
    userId,
    email: email.toLowerCase(),
    timestamp: Date.now(),
  };

  return Buffer.from(JSON.stringify(tokenData)).toString('base64');
}

/**
 * 使用重置令牌重置密码（客户端调用 API）
 * @param token 重置令牌
 * @param newPassword 新密码
 * @returns 重置结果
 */
export async function resetPasswordWithToken(
  token: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || '密码重置失败');
    }

    return {
      success: true,
      message: data.message || '密码重置成功',
    };
  } catch (error) {
    console.error('重置密码失败:', error);
    throw new Error(error instanceof Error ? error.message : '密码重置失败');
  }
}
