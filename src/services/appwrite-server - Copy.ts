/* eslint-disable prettier/prettier */
/**
 * Appwrite 服务器端客户端
 * 使用 API Key 进行服务器端操作（绕过客户端权限限制）
 * 
 * 仅在 API 路由中使用此客户端，不要在客户端代码中导入
 */
import { Client, Databases, ID, Query } from 'node-appwrite';

// 验证环境变量
const APPWRITE_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '';
const APPWRITE_PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '';
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY || '';

if (!APPWRITE_ENDPOINT || !APPWRITE_PROJECT_ID) {
  console.warn('Appwrite 服务器端配置不完整');
}

// 创建服务器端客户端
const serverClient = new Client();

serverClient
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID);

// 设置 API Key（服务器端权限）
if (APPWRITE_API_KEY) {
  serverClient.setKey(APPWRITE_API_KEY);
}

const serverDatabases = new Databases(serverClient);

export { serverClient, serverDatabases, ID, Query };
export default serverClient;
