/* eslint-disable prettier/prettier */
import { Client, Databases, Query } from 'appwrite';

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

const databases = new Databases(client);

// Type definitions
export interface Comment {
  $id: string;
  contentType: 'notice' | 'activity';
  contentId: string;
  nickname: string;
  email?: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  reply?: string; // 老师的回复
  replyAuthor?: string; // 回复者（老师）的名字
  replyAt?: string; // 回复时间
  isDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentInput {
  contentType: 'notice' | 'activity';
  contentId: string;
  nickname: string;
  email?: string;
  content: string;
  status?: 'pending' | 'approved';
}

export interface ReplyCommentInput {
  reply: string;
  replyAuthor: string; // 老师名字
}

// Comment Service
const mapToComment = (doc: Record<string, unknown>): Comment => {
  return {
    $id: doc.$id as string,
    contentType: doc.contentType as 'notice' | 'activity',
    contentId: doc.contentId as string,
    nickname: doc.nickname as string,
    email: (doc.email as string) || '',
    content: doc.content as string,
    status: doc.status as 'pending' | 'approved' | 'rejected',
    reply: (doc.reply as string) || undefined,
    replyAuthor: (doc.replyAuthor as string) || undefined,
    replyAt: (doc.replyAt as string) || undefined,
    isDeleted: (doc.isDeleted as boolean) || false,
    createdAt: doc.createdAt as string,
    updatedAt: doc.updatedAt as string,
  };
};

export const commentService = {

  // Get all comments (optionally filtered by status)
  async getAllComments(onlyApproved: boolean = false): Promise<Comment[]> {
    try {
      const queries = onlyApproved ? [Query.equal('status', 'approved')] : [];
      const response = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        'comments',
        queries
      );
      const comments = (response.documents || []).map(mapToComment);
      // 按createdAt降序排列，最新的在最前面
      return comments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.error('Failed to fetch comments:', error);
      throw error;
    }
  },

  // Get a single comment by ID
  async getCommentById(id: string): Promise<Comment> {
    try {
      const response = await databases.getDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        'comments',
        id
      );
      return mapToComment(response);
    } catch (error) {
      console.error(`Failed to fetch comment ${id}:`, error);
      throw error;
    }
  },

  // Create a new comment
  async createComment(input: CreateCommentInput): Promise<Comment> {
    try {
      const response = await databases.createDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        'comments',
        'unique()',
        {
          contentType: input.contentType,
          contentId: input.contentId,
          nickname: input.nickname,
          email: input.email || '',
          content: input.content,
          status: input.status || 'approved', // Auto-approve by default
          isDeleted: false,
        }
      );
      return mapToComment(response);
    } catch (error) {
      console.error('Failed to create comment:', error);
      throw error;
    }
  },

  // Update an existing comment
  async updateComment(id: string, input: Partial<Comment>): Promise<Comment> {
    try {
      const response = await databases.updateDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        'comments',
        id,
        {
          ...input,
        }
      );
      return mapToComment(response);
    } catch (error) {
      console.error(`Failed to update comment ${id}:`, error);
      throw error;
    }
  },

  // Reply to a comment (teacher only)
  async replyToComment(id: string, input: ReplyCommentInput): Promise<Comment> {
    try {
      const response = await databases.updateDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        'comments',
        id,
        {
          reply: input.reply,
          replyAuthor: input.replyAuthor,
          replyAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      );
      return mapToComment(response);
    } catch (error) {
      console.error(`Failed to reply to comment ${id}:`, error);
      throw error;
    }
  },

  // Edit comment content
  async editComment(id: string, content: string): Promise<Comment> {
    try {
      return this.updateComment(id, { content });
    } catch (error) {
      console.error(`Failed to edit comment ${id}:`, error);
      throw error;
    }
  },

  // Delete a comment
  async deleteComment(id: string): Promise<void> {
    try {
      await databases.deleteDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        'comments',
        id
      );
    } catch (error) {
      console.error(`Failed to delete comment ${id}:`, error);
      throw error;
    }
  },

  // Get comments for a specific target (notice or activity)
  async getCommentsByTarget(
    contentType: 'notice' | 'activity',
    contentId: string,
    onlyApproved: boolean = true
  ): Promise<Comment[]> {
    try {
      const queries = [Query.equal('contentType', contentType), Query.equal('contentId', contentId)];
      if (onlyApproved) {
        queries.push(Query.equal('status', 'approved'));
      }
      const response = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        'comments',
        queries
      );
      const comments = (response.documents || []).map(mapToComment);
      // 按createdAt降序排列，最新的在最前面
      return comments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.error(
        `Failed to fetch comments for ${contentType} ${contentId}:`,
        error
      );
      throw error;
    }
  },

  // Get comments by status
  async getCommentsByStatus(status: string): Promise<Comment[]> {
    try {
      const response = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        'comments',
        [Query.equal('status', status)]
      );
      const comments = (response.documents || []).map(mapToComment);
      // 按createdAt降序排列，最新的在最前面
      return comments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.error(`Failed to fetch comments with status ${status}:`, error);
      throw error;
    }
  },

  // Get pending comments for moderation
  async getPendingComments(): Promise<Comment[]> {
    try {
      return this.getCommentsByStatus('pending');
    } catch (error) {
      console.error('Failed to fetch pending comments:', error);
      throw error;
    }
  },

  // Approve a comment
  async approveComment(id: string): Promise<Comment> {
    try {
      return this.updateComment(id, { status: 'approved' });
    } catch (error) {
      console.error(`Failed to approve comment ${id}:`, error);
      throw error;
    }
  },

  // Reject a comment
  async rejectComment(id: string): Promise<Comment> {
    try {
      return this.updateComment(id, { status: 'rejected' });
    } catch (error) {
      console.error(`Failed to reject comment ${id}:`, error);
      throw error;
    }
  },

  // Search comments
  async searchComments(query: string): Promise<Comment[]> {
    try {
      const allComments = await this.getAllComments(false);
      return allComments.filter(
        (comment) =>
          comment.content.toLowerCase().includes(query.toLowerCase()) ||
          comment.nickname.toLowerCase().includes(query.toLowerCase())
      );
    } catch (error) {
      console.error('Failed to search comments:', error);
      throw error;
    }
  },

  // Get comment count for target
  async getCommentCount(contentId: string): Promise<number> {
    try {
      const allComments = await this.getAllComments(true);
      return allComments.filter((c) => c.contentId === contentId).length;
    } catch (error) {
      console.error(`Failed to get comment count for target ${contentId}:`, error);
      throw error;
    }
  },

  // Get total pending comments count
  async getPendingCommentCount(): Promise<number> {
    try {
      const pendingComments = await this.getPendingComments();
      return pendingComments.length;
    } catch (error) {
      console.error('Failed to get pending comment count:', error);
      throw error;
    }
  },
};
