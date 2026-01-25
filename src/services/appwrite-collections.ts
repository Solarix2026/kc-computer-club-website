/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Client, Databases, Query, ID } from 'appwrite';

export const createAppwriteClient = () => {
  const client = new Client();

  client
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'http://localhost/v1')
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '');

  return client;
};

export const createDatabasesInstance = (client: Client) => {
  return new Databases(client);
};

// Collections 常量
export const COLLECTIONS = {
  USERS: 'users',
  ADMINS: 'admins',
  NOTICES: 'notices',
  ACTIVITIES: 'activities',
  SIGNUPS: 'signups',
  COMMENTS: 'comments',
  AI_CHATS: 'ai_chats',
  CLUB_INFO: 'club_info',
} as const;

// 文档创建接口
export interface DocumentCreateOptions {
  permissions?: string[];
}

// 文档查询接口
export interface DocumentQueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

// 通用文档管理类
export class AppwriteCollectionManager {
  private databases: Databases;
  private databaseId: string;

  constructor(databaseId: string = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'kccomputer') {
    const client = createAppwriteClient();
    this.databases = createDatabasesInstance(client);
    this.databaseId = databaseId;
  }

  /**
   * 创建文档
   */
  async create<T extends Record<string, any>>(
    collectionId: string,
    data: T,
    options?: DocumentCreateOptions
  ): Promise<T & { $id: string }> {
    try {
      const documentId = ID.unique();
      const response = await this.databases.createDocument(
        this.databaseId,
        collectionId,
        documentId,
        data,
        options?.permissions
      );
      return response as unknown as T & { $id: string };
    } catch (error: any) {
      throw new Error(`创建文档失败 (${collectionId}): ${error.message}`);
    }
  }

  /**
   * 获取单个文档
   */
  async get<T extends Record<string, any>>(
    collectionId: string,
    documentId: string
  ): Promise<T & { $id: string }> {
    try {
      const response = await this.databases.getDocument(
        this.databaseId,
        collectionId,
        documentId
      );
      return response as unknown as T & { $id: string };
    } catch (error: any) {
      throw new Error(`获取文档失败 (${collectionId}/${documentId}): ${error.message}`);
    }
  }

  /**
   * 列表查询
   */
  async list<T extends Record<string, any>>(
    collectionId: string,
    queries?: string[],
    options?: DocumentQueryOptions
  ): Promise<{ documents: (T & { $id: string })[]; total: number }> {
    try {
      const queryArray: string[] = queries || [];

      if (options?.limit) {
        queryArray.push(`limit=${options.limit}`);
      }

      if (options?.offset) {
        queryArray.push(`offset=${options.offset}`);
      }

      if (options?.orderBy) {
        const direction = options.orderDirection === 'desc' ? 'DESC' : 'ASC';
        queryArray.push(`orderBy=${options.orderBy},${direction}`);
      }

      const response = await this.databases.listDocuments(
        this.databaseId,
        collectionId,
        queryArray as any
      );

      return {
        documents: response.documents as unknown as (T & { $id: string })[],
        total: response.total,
      };
    } catch (error: any) {
      throw new Error(`列表查询失败 (${collectionId}): ${error.message}`);
    }
  }

  /**
   * 更新文档
   */
  async update<T extends Record<string, any>>(
    collectionId: string,
    documentId: string,
    data: Partial<T>,
    options?: DocumentCreateOptions
  ): Promise<T & { $id: string }> {
    try {
      const response = await this.databases.updateDocument(
        this.databaseId,
        collectionId,
        documentId,
        data,
        options?.permissions
      );
      return response as unknown as T & { $id: string };
    } catch (error: any) {
      throw new Error(`更新文档失败 (${collectionId}/${documentId}): ${error.message}`);
    }
  }

  /**
   * 删除文档
   */
  async delete(collectionId: string, documentId: string): Promise<void> {
    try {
      await this.databases.deleteDocument(
        this.databaseId,
        collectionId,
        documentId
      );
    } catch (error: any) {
      throw new Error(`删除文档失败 (${collectionId}/${documentId}): ${error.message}`);
    }
  }

  /**
   * 批量删除
   */
  async deleteMany(
    collectionId: string,
    queries: string[]
  ): Promise<{ deletedCount: number }> {
    try {
      const { documents } = await this.list(collectionId, queries, {
        limit: 1000,
      });

      for (const doc of documents) {
        await this.delete(collectionId, doc.$id);
      }

      return { deletedCount: documents.length };
    } catch (error: any) {
      throw new Error(`批量删除失败 (${collectionId}): ${error.message}`);
    }
  }

  /**
   * 搜索文档
   */
  async search<T extends Record<string, any>>(
    collectionId: string,
    searchField: string,
    searchValue: string,
    options?: DocumentQueryOptions
  ): Promise<{ documents: (T & { $id: string })[]; total: number }> {
    try {
      const queries = [`search=${searchField}:${searchValue}`];

      return this.list<T>(collectionId, queries, options);
    } catch (error: any) {
      throw new Error(`搜索失败 (${collectionId}): ${error.message}`);
    }
  }

  /**
   * 条件查询
   */
  async findBy<T extends Record<string, any>>(
    collectionId: string,
    field: string,
    value: any,
    options?: DocumentQueryOptions
  ): Promise<{ documents: (T & { $id: string })[]; total: number }> {
    try {
      const queries = [`${field}=${value}`];

      return this.list<T>(collectionId, queries, options);
    } catch (error: any) {
      throw new Error(`条件查询失败 (${collectionId}): ${error.message}`);
    }
  }

  /**
   * 获取数据库ID
   */
  getDatabaseId(): string {
    return this.databaseId;
  }
}

// 导出单例
export const collectionManager = new AppwriteCollectionManager();
