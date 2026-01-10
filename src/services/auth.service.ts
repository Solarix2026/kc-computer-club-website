/* eslint-disable prettier/prettier */
import { account, databases } from './appwrite';
import { ID, Query } from 'appwrite';
import { StudentUser, AdminUser } from '@/contexts/AuthContext';
import bcrypt from 'bcryptjs';

/**
 * 学生用户认证服务
 * 使用 Appwrite 进行身份验证
 */

const APPWRITE_DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '';
const USERS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION || '';
const ADMINS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_ADMINS_COLLECTION || '';

/**
 * 验证中文姓名（2-4个汉字）
 */
export function validateChineseName(name: string): boolean {
  const chineseNameRegex = /^[\u4e00-\u9fa5]{2,4}$/;
  return chineseNameRegex.test(name);
}

/**
 * 学生注册
 * @param name 姓名（2-4个中文字符）
 * @param email 邮箱 (格式: xxxxx@kuencheng.edu.my)
 * @param password 密码
 */
export async function studentSignup(
  name: string,
  email: string,
  password: string
): Promise<StudentUser> {
  try {
    // 验证姓名格式
    if (!validateChineseName(name)) {
      throw new Error('姓名必须为2-4个中文字符');
    }

    // 1. 使用 Appwrite Account 创建用户
    const appwriteUser = await account.create(
      ID.unique(),
      email,
      password,
      name
    );
    // 2. 创建临时会话以发送验证邮件（稍后会删除）
    try {
      // 创建临时会话
      await account.createEmailPasswordSession(email, password);
      
      // 发送验证邮件
      await account.createVerification(
        `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email`
      );
      // Verification email sent successfully
      
      // 删除临时会话，强制用户必须验证邮件后再登录
      await account.deleteSession('current');
    } catch (verifyError) {
      console.error('发送验证邮件失败:', verifyError);
      const err = verifyError as Error & { message?: string };
      console.warn('Appwrite SMTP 可能未配置。错误:', err.message);
      // 尝试清理会话
      try {
        await account.deleteSession('current');
      } catch {
        // 忽略清理错误
      }
      // 继续注册流程，验证邮件发送失败不阻止注册
    }

    // 3. 创建学生记录到数据库
    const now = new Date().toISOString();
    const studentRecord = await databases.createDocument(
      APPWRITE_DATABASE_ID,
      USERS_COLLECTION_ID,
      appwriteUser.$id,
      {
        email,
        name,
        role: 'student',
        createdAt: now,
        updatedAt: now,
      }
    );

    return {
      id: studentRecord.$id,
      email: studentRecord.email,
      name: studentRecord.name,
      createdAt: studentRecord.createdAt,
    };
  } catch (error: unknown) {
    const err = error as Error & { message?: string; code?: number; type?: string };
    console.error('Signup error:', err);
    
    if (err.message?.includes('already') || err.message?.includes('exists')) {
      throw new Error('此邮箱已被注册，请使用其他邮箱');
    }
    if (err.message?.includes('姓名')) {
      throw err;
    }
    throw new Error(err.message || '注册失败，请稍后重试');
  }
}

/**
 * 学生登录
 * @param email 邮箱
 * @param password 密码
 */
export async function studentLogin(
  email: string,
  password: string
): Promise<StudentUser> {
  try {
    // 1. 删除任何现有的会话，防止冲突
    try {
      await account.deleteSession('current');
    } catch {
      // 如果没有会话，忽略错误
    }

    // 2. 使用 Appwrite Account 创建会话
    await account.createEmailPasswordSession(email, password);

    // 3. 获取当前登录用户信息
    const appwriteUser = await account.get();

    // 4. 检查邮箱是否已验证
    if (!appwriteUser.emailVerification) {
      // 登出未验证的用户
      await account.deleteSession('current');
      throw new Error('请先验证您的邮箱。请检查邮件并点击验证链接。');
    }

    // 5. 从数据库获取学生详细信息
    const studentRecords = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      USERS_COLLECTION_ID,
      [Query.equal('email', email)]
    );

    if (studentRecords.documents.length === 0) {
      throw new Error('用户不存在');
    }

    const studentRecord = studentRecords.documents[0];

    return {
      id: studentRecord.$id,
      email: studentRecord.email,
      name: studentRecord.name,
      studentId: studentRecord.studentId || undefined,
      major: studentRecord.major || undefined,
      year: studentRecord.year || undefined,
      createdAt: studentRecord.createdAt,
    };
  } catch (error: unknown) {
    const err = error as Error & { message?: string };
    if (err.message?.includes('Invalid credentials')) {
      throw new Error('邮箱或密码错误');
    }
    if (err.message?.includes('验证')) {
      throw err;
    }
    throw new Error(err.message || '登录失败，请稍后重试');
  }
}

/**
 * 获取当前登录的学生用户
 */
export async function getCurrentStudent(): Promise<StudentUser | null> {
  try {
    const appwriteUser = await account.get();

    // 从数据库获取学生详细信息
    const studentRecords = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      USERS_COLLECTION_ID,
      [Query.equal('email', appwriteUser.email)]
    );

    if (studentRecords.documents.length === 0) {
      return null;
    }

    const studentRecord = studentRecords.documents[0];

    return {
      id: studentRecord.$id,
      email: studentRecord.email,
      name: studentRecord.name,
      studentId: studentRecord.studentId || undefined,
      major: studentRecord.major || undefined,
      year: studentRecord.year || undefined,
      createdAt: studentRecord.createdAt,
    };
  } catch {
    return null;
  }
}

/**
 * 学生登出
 */
export async function studentLogout(): Promise<void> {
  try {
    // 删除所有会话
    await account.deleteSession('current');
  } catch (error: unknown) {
    const err = error as Error & { message?: string };
    throw new Error(err.message || '登出失败');
  }
}

/**
 * 发送邮箱验证邮件
 */
export async function sendVerificationEmail(): Promise<void> {
  try {
    await account.createVerification(
      `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email`
    );
  } catch (error: unknown) {
    const err = error as Error & { message?: string };
    throw new Error(err.message || '发送验证邮件失败');
  }
}

/**
 * 完成邮箱验证
 * @param userId 用户 ID
 * @param secret 验证令牌
 */
export async function verifyEmail(userId: string, secret: string): Promise<void> {
  console.log('=== CLIENT: verifyEmail called ===', { userId, secretLength: secret?.length });
  
  try {
    // 使用 API 路由验证邮箱（服务器端操作，不需要客户端 session）
    console.log('Calling /api/auth/verify-email...');
    const response = await fetch('/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, secret }),
    });

    console.log('API response status:', response.status);
    const responseData = await response.json();
    console.log('API response data:', responseData);

    if (!response.ok) {
      throw new Error(responseData.error || '邮箱验证失败');
    }

    // 注意：不尝试更新数据库，因为此时客户端没有活跃会话
    // Appwrite 的邮箱验证已在 API 路由中成功完成
    console.log('=== CLIENT: Email verification SUCCESS ===');
  } catch (error: unknown) {
    const err = error as Error & { message?: string };
    console.error('=== CLIENT: Email verification FAILED ===', err.message);
    throw new Error(err.message || '邮箱验证失败，链接可能已过期');
  }
}

/**
 * 检查邮箱是否已验证
 */
export async function isEmailVerified(): Promise<boolean> {
  try {
    const user = await account.get();
    return user.emailVerification;
  } catch {
    return false;
  }
}

/**
 * 请求密码重置邮件
 * @param email 学生邮箱
 */
export async function requestPasswordReset(email: string): Promise<void> {
  try {
    // Appwrite 会发送密码重置邮件
    await account.createRecovery(
      email,
      `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`
    );
  } catch (error: unknown) {
    const err = error as Error & { message?: string };
    throw new Error(err.message || '发送重置邮件失败');
  }
}

/**
 * 重置密码
 * @param userId 用户 ID
 * @param secret 重置令牌
 * @param newPassword 新密码
 */
export async function resetPassword(
  userId: string,
  secret: string,
  newPassword: string
): Promise<void> {
  try {
    await account.updateRecovery(userId, secret, newPassword);
  } catch (error: unknown) {
    const err = error as Error & { message?: string };
    throw new Error(err.message || '密码重置失败，令牌可能已过期');
  }
}

/**
 * 修改密码
 * @param oldPassword 旧密码
 * @param newPassword 新密码
 */
export async function changePassword(
  oldPassword: string,
  newPassword: string
): Promise<void> {
  try {
    await account.updatePassword(newPassword, oldPassword);
  } catch (error: unknown) {
    const err = error as Error & { message?: string };
    throw new Error(err.message || '密码修改失败');
  }
}

/**
 * ========================================
 * 管理员认证
 * ========================================
 */

/**
 * 管理员登录
 * @param adminEmail 管理员邮箱
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
        // 如果关联用户不存在，使用用户名
        adminName = adminUsername;
      }
    }

    const adminUser: AdminUser = {
      id: adminRecord.$id,
      email: adminRecord.username + '@admin.local',
      name: adminName,
      role: 'admin',
    };

    // 6. 存储管理员会话到 localStorage（用于页面刷新后恢复）
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
 * 获取当前登录的管理员用户
 */
export async function getCurrentAdmin(): Promise<AdminUser | null> {
  try {
    const appwriteUser = await account.get();

    // 从数据库验证是否是管理员
    const adminRecords = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      ADMINS_COLLECTION_ID,
      [Query.equal('email', appwriteUser.email)]
    );

    if (adminRecords.documents.length === 0) {
      return null;
    }

    const adminRecord = adminRecords.documents[0];

    return {
      id: adminRecord.$id,
      email: adminRecord.email,
      name: adminRecord.name,
      role: 'admin',
    };
  } catch {
    return null;
  }
}

/**
 * 管理员登出
 * 注意: 管理员用户没有 Appwrite Account 会话，只需清空本地存储
 */
export async function adminLogout(): Promise<void> {
  // 管理员登出：清空 localStorage 中的会话
  if (typeof window !== 'undefined') {
    localStorage.removeItem('adminSession');
  }
  return Promise.resolve();
}

/**
 * 检查当前会话
 */
export async function checkSession(): Promise<{
  type: 'student' | 'admin' | null;
  user: StudentUser | AdminUser | null;
}> {
  try {
    console.log('=== checkSession called ===');
    
    // 首先检查 localStorage 中是否有管理员会话
    try {
      const adminSession = localStorage.getItem('adminSession');
      if (adminSession) {
        const adminUser = JSON.parse(adminSession) as AdminUser;
        console.log('Admin session restored from localStorage');
        return {
          type: 'admin',
          user: adminUser,
        };
      }
    } catch (err) {
      console.warn('Failed to restore admin session from localStorage:', (err as Error).message);
    }

    // 检查 Appwrite 学生会话
    try {
      const appwriteUser = await account.get();
      console.log('appwriteUser found:', appwriteUser.email);

      // 检查是否是学生
      try {
        const studentRecords = await databases.listDocuments(
          APPWRITE_DATABASE_ID,
          USERS_COLLECTION_ID,
          [Query.equal('email', appwriteUser.email)]
        );

        if (studentRecords.documents.length > 0) {
          const studentRecord = studentRecords.documents[0];
          console.log('Student session restored:', studentRecord.name);
          return {
            type: 'student',
            user: {
              id: studentRecord.$id,
              email: studentRecord.email,
              name: studentRecord.name,
              createdAt: studentRecord.createdAt,
            },
          };
        }
      } catch (studentError) {
        console.warn('Student check failed:', (studentError as Error).message);
      }
    } catch (appwriteError) {
      console.log('No Appwrite session:', (appwriteError as Error).message);
    }

    console.log('No user session found');
    return { type: null, user: null };
  } catch (error) {
    console.log('=== checkSession error ===', (error as Error).message);
    return { type: null, user: null };
  }
}
