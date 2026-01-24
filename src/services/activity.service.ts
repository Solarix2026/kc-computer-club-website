/* eslint-disable prettier/prettier */
import { Client, Databases, Query } from 'appwrite';

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

const databases = new Databases(client);

// Type definitions
export interface Activity {
  $id: string;
  title: string;
  description: string;
  category: string;
  startTime: string; // ISO datetime (YYYY-MM-DDTHH:mm:ss.sssZ)
  endTime: string; // ISO datetime (YYYY-MM-DDTHH:mm:ss.sssZ)
  location: string;
  maxParticipants?: number;
  currentParticipants: number;
  signupDeadline: string; // ISO datetime
  signupFormFields: string; // JSON string of form fields
  organizer: string;
  organizerId: string;
  status: 'draft' | 'published' | 'ongoing' | 'completed' | 'cancelled';
  visibility: 'public' | 'internal';
  coverImage?: string;
  allowedGrades?: string; // JSON string of allowed grades array
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateActivityInput {
  title: string;
  description: string;
  category: string;
  startTime: string; // ISO datetime
  endTime: string; // ISO datetime
  location: string;
  maxParticipants?: number;
  currentParticipants?: number;
  signupDeadline: string; // ISO datetime
  signupFormFields?: string;
  organizer: string;
  organizerId: string;
  status: 'draft' | 'published';
  visibility?: 'public' | 'internal';
  coverImage?: string | null;
  allowedGrades?: string | null; // JSON string of allowed grades array
}

export interface UpdateActivityInput {
  title?: string;
  description?: string;
  category?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  maxParticipants?: number;
  currentParticipants?: number;
  signupDeadline?: string;
  signupFormFields?: string;
  organizer?: string;
  organizerId?: string;
  status?: 'draft' | 'published' | 'ongoing' | 'completed' | 'cancelled';
  visibility?: 'public' | 'internal';
  coverImage?: string | null;
  allowedGrades?: (string | null);
}

// Activity Service
export const activityService = {
  /**
   * 获取所有活动（可选过滤已发布和可见范围）
   * @param onlyPublished - 仅获取已发布活动
   * @param visibility - 可见范围过滤：'public' 仅公开，'all' 包含内部（需登录）
   */
  async getAllActivities(onlyPublished: boolean = false, visibility: 'public' | 'all' = 'all'): Promise<Activity[]> {
    try {
      const queries: ReturnType<typeof Query.equal>[] = [];
      
      if (onlyPublished) {
        queries.push(Query.equal('status', 'published'));
      }
      
      const response = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        'activities',
        queries
      );
      let activities = (response.documents as unknown as Activity[]) || [];
      
      // 如果只要公开活动，在客户端过滤掉内部活动
      // 这样可以正确处理 visibility 为 null/undefined 的情况（视为公开）
      if (visibility === 'public') {
        activities = activities.filter(activity => 
          activity.visibility !== 'internal'
        );
      }
      
      // 按createdAt降序排列，最新的在最前面
      return activities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.error('Failed to fetch activities:', error);
      throw error;
    }
  },

  // Get a single activity by ID
  async getActivityById(id: string): Promise<Activity> {
    try {
      const response = await databases.getDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        'activities',
        id
      );
      return response as unknown as Activity;
    } catch (error) {
      console.error(`Failed to fetch activity ${id}:`, error);
      throw error;
    }
  },

  // Create a new activity
  async createActivity(input: CreateActivityInput): Promise<Activity> {
    try {
      const now = new Date().toISOString();
      const response = await databases.createDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        'activities',
        'unique()',
        {
          title: input.title,
          description: input.description,
          category: input.category,
          startTime: input.startTime,
          endTime: input.endTime,
          location: input.location,
          maxParticipants: input.maxParticipants || 0,
          currentParticipants: input.currentParticipants || 0,
          signupDeadline: input.signupDeadline,
          signupFormFields: input.signupFormFields || JSON.stringify([]),
          organizer: input.organizer,
          organizerId: input.organizerId,
          status: input.status,
          visibility: input.visibility || 'public',
          coverImage: input.coverImage || undefined,
          allowedGrades: input.allowedGrades || undefined,
          createdAt: now,
          updatedAt: now,
        }
      );
      return response as unknown as Activity;
    } catch (error) {
      console.error('Failed to create activity:', error);
      throw error;
    }
  },

  // Update an existing activity
  async updateActivity(id: string, input: UpdateActivityInput): Promise<Activity> {
    try {
      const response = await databases.updateDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        'activities',
        id,
        {
          ...input,
        }
      );
      return response as unknown as Activity;
    } catch (error) {
      console.error(`Failed to update activity ${id}:`, error);
      throw error;
    }
  },

  // Delete an activity
  async deleteActivity(id: string): Promise<void> {
    try {
      await databases.deleteDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        'activities',
        id
      );
    } catch (error) {
      console.error(`Failed to delete activity ${id}:`, error);
      throw error;
    }
  },

  // Search activities by title or location
  async searchActivities(query: string): Promise<Activity[]> {
    try {
      const allActivities = await this.getAllActivities();
      return allActivities.filter(
        (activity) =>
          activity.title.toLowerCase().includes(query.toLowerCase()) ||
          activity.location.toLowerCase().includes(query.toLowerCase())
      );
    } catch (error) {
      console.error('Failed to search activities:', error);
      throw error;
    }
  },

  // Get activities by category
  async getActivitiesByCategory(category: string): Promise<Activity[]> {
    try {
      const response = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        'activities',
        [Query.equal('category', category), Query.equal('status', 'published')]
      );
      const activities = (response.documents as unknown as Activity[]) || [];
      // 按createdAt降序排列，最新的在最前面
      return activities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.error(`Failed to fetch activities for category ${category}:`, error);
      throw error;
    }
  },

  // Get activities by status
  async getActivitiesByStatus(status: string): Promise<Activity[]> {
    try {
      const response = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        'activities',
        [Query.equal('status', status)]
      );
      const activities = (response.documents as unknown as Activity[]) || [];
      // 按createdAt降序排列，最新的在最前面
      return activities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.error(`Failed to fetch activities with status ${status}:`, error);
      throw error;
    }
  },

  // Get upcoming activities (future dates)
  async getUpcomingActivities(): Promise<Activity[]> {
    try {
      const now = new Date().toISOString();
      const allActivities = await this.getAllActivities(true);
      return allActivities.filter((activity) => activity.startTime >= now);
    } catch (error) {
      console.error('Failed to fetch upcoming activities:', error);
      throw error;
    }
  },

  // Increment participant count
  async incrementRegisteredCount(id: string): Promise<Activity> {
    try {
      const activity = await this.getActivityById(id);
      return this.updateActivity(id, {
        currentParticipants: activity.currentParticipants + 1,
      });
    } catch (error) {
      console.error(`Failed to increment participant count for activity ${id}:`, error);
      throw error;
    }
  },

  // Decrement participant count
  async decrementRegisteredCount(id: string): Promise<Activity> {
    try {
      const activity = await this.getActivityById(id);
      return this.updateActivity(id, {
        currentParticipants: Math.max(0, activity.currentParticipants - 1),
      });
    } catch (error) {
      console.error(`Failed to decrement participant count for activity ${id}:`, error);
      throw error;
    }
  },
};
