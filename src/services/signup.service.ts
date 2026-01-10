/* eslint-disable prettier/prettier */
import { Client, Databases, Query } from 'appwrite';

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

const databases = new Databases(client);

// Type definitions
export interface Signup {
  $id: string;
  activityId: string;
  email: string;
  formData: Record<string, string>;
  phone?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'attended';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSignupInput {
  activityId: string;
  activityTitle?: string;
  studentName: string;
  studentEmail: string;
  studentId?: string;
  year?: string;
  className?: string;
  phone?: string;
  status?: 'pending' | 'confirmed';
  formData?: Record<string, string>;
}

export interface UpdateSignupInput {
  status?: 'pending' | 'confirmed' | 'cancelled' | 'attended';
  phone?: string;
  notes?: string;
  formData?: Record<string, string>;
}

// Signup Service
export const signupService = {
  // Get all signups (optionally filtered by activity)
  async getAllSignups(activityId?: string): Promise<Signup[]> {
    try {
      const queries = activityId ? [Query.equal('activityId', activityId)] : [];
      const response = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        'signups',
        queries
      );
      const signups = (response.documents as unknown as Signup[]) || [];
      // 按createdAt降序排列，最新的在最前面
      return signups.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.error('Failed to fetch signups:', error);
      throw error;
    }
  },

  // Get a single signup by ID
  async getSignupById(id: string): Promise<Signup> {
    try {
      const response = await databases.getDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        'signups',
        id
      );
      return response as unknown as Signup;
    } catch (error) {
      console.error(`Failed to fetch signup ${id}:`, error);
      throw error;
    }
  },

  // Create a new signup
  async createSignup(input: CreateSignupInput): Promise<Signup> {
    try {
      // 准备 formData - 包含学生的所有信息
      const formDataObj = {
        studentName: input.studentName,
        studentEmail: input.studentEmail,
        studentId: input.studentId || '',
        year: input.year || '',
        className: input.className || '',
        activityTitle: input.activityTitle || '',
        ...input.formData,
      };

      const response = await databases.createDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        'signups',
        'unique()',
        {
          activityId: input.activityId,
          email: input.studentEmail, // 使用数据库中的字段名
          formData: JSON.stringify(formDataObj), // 将 formData 转为 JSON 字符串
          status: input.status || 'pending',
          phone: input.phone || '',
          notes: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      );
      return response as unknown as Signup;
    } catch (error) {
      console.error('Failed to create signup:', error);
      throw error;
    }
  },

  // Update an existing signup
  async updateSignup(id: string, input: UpdateSignupInput): Promise<Signup> {
    try {
      const response = await databases.updateDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        'signups',
        id,
        input
      );
      return response as unknown as Signup;
    } catch (error) {
      console.error(`Failed to update signup ${id}:`, error);
      throw error;
    }
  },

  // Delete a signup
  async deleteSignup(id: string): Promise<void> {
    try {
      await databases.deleteDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        'signups',
        id
      );
    } catch (error) {
      console.error(`Failed to delete signup ${id}:`, error);
      throw error;
    }
  },

  // Get signups by activity ID
  async getSignupsByActivity(activityId: string): Promise<Signup[]> {
    try {
      const response = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        'signups',
        [Query.equal('activityId', activityId)]
      );
      const signups = (response.documents as unknown as Signup[]) || [];
      // 按createdAt降序排列，最新的在最前面
      return signups.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.error(`Failed to fetch signups for activity ${activityId}:`, error);
      throw error;
    }
  },

  // Get signups by status
  async getSignupsByStatus(status: string): Promise<Signup[]> {
    try {
      const response = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        'signups',
        [Query.equal('status', status)]
      );
      const signups = (response.documents as unknown as Signup[]) || [];
      // 按createdAt降序排列，最新的在最前面
      return signups.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.error(`Failed to fetch signups with status ${status}:`, error);
      throw error;
    }
  },

  // Get signups by email
  async getSignupsByEmail(email: string): Promise<Signup[]> {
    try {
      const allSignups = await this.getAllSignups();
      return allSignups.filter(
        (signup) => signup.email.toLowerCase() === email.toLowerCase()
      );
    } catch (error) {
      console.error(`Failed to fetch signups for email ${email}:`, error);
      throw error;
    }
  },

  // Search signups
  async searchSignups(query: string): Promise<Signup[]> {
    try {
      const allSignups = await this.getAllSignups();
      return allSignups.filter(
        (signup) =>
          signup.email.toLowerCase().includes(query.toLowerCase())
      );
    } catch (error) {
      console.error('Failed to search signups:', error);
      throw error;
    }
  },

  // Get signup count for activity
  async getSignupCount(activityId: string): Promise<number> {
    try {
      const signups = await this.getSignupsByActivity(activityId);
      return signups.length;
    } catch (error) {
      console.error(`Failed to get signup count for activity ${activityId}:`, error);
      throw error;
    }
  },

  // Get confirmed signup count for activity
  async getConfirmedSignupCount(activityId: string): Promise<number> {
    try {
      const signups = await this.getSignupsByActivity(activityId);
      return signups.filter((s) => s.status === 'confirmed').length;
    } catch (error) {
      console.error(
        `Failed to get confirmed signup count for activity ${activityId}:`,
        error
      );
      throw error;
    }
  },

  // Export signups as CSV
  async exportSignupsAsCSV(activityId: string): Promise<string> {
    try {
      const signups = await this.getSignupsByActivity(activityId);

      // CSV header
      const headers = [
        '姓名',
        '邮箱',
        '学号',
        '年级',
        '班级',
        '状态',
        '报名时间',
      ];
      const rows = signups.map((signup) => {
        let formDataObj = {} as Record<string, string>;
        try {
          if (typeof signup.formData === 'string') {
            formDataObj = JSON.parse(signup.formData);
          } else {
            formDataObj = signup.formData as Record<string, string>;
          }
        } catch (e) {
          console.error('Failed to parse formData:', e);
        }

        return [
          formDataObj.studentName || '',
          signup.email,
          formDataObj.studentId || '',
          formDataObj.year || '',
          formDataObj.className || '',
          signup.status,
          new Date(signup.createdAt).toLocaleDateString('zh-CN'),
        ];
      });

      // Combine header and rows
      const csvContent = [
        headers.join(','),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
      ].join('\n');

      return csvContent;
    } catch (error) {
      console.error('Failed to export signups as CSV:', error);
      throw error;
    }
  },
};
