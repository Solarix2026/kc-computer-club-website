/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios';
import { getAuthToken } from './storage';

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Unauthorized - token expired
      console.error('Unauthorized - please login again');
      // 可以在这里触发重定向到登录页
    }
    return Promise.reject(error);
  }
);

export interface ApiOptions {
  headers?: Record<string, string>;
  params?: Record<string, any>;
  timeout?: number;
}

// GET request
export const apiGet = async <T = any>(
  url: string,
  options?: ApiOptions
): Promise<T> => {
  try {
    const response: AxiosResponse<T> = await apiClient.get(url, {
      headers: options?.headers,
      params: options?.params,
      timeout: options?.timeout,
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// POST request
export const apiPost = async <T = any>(
  url: string,
  data?: any,
  options?: ApiOptions
): Promise<T> => {
  try {
    const response: AxiosResponse<T> = await apiClient.post(url, data, {
      headers: options?.headers,
      params: options?.params,
      timeout: options?.timeout,
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// PUT request
export const apiPut = async <T = any>(
  url: string,
  data?: any,
  options?: ApiOptions
): Promise<T> => {
  try {
    const response: AxiosResponse<T> = await apiClient.put(url, data, {
      headers: options?.headers,
      params: options?.params,
      timeout: options?.timeout,
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// PATCH request
export const apiPatch = async <T = any>(
  url: string,
  data?: any,
  options?: ApiOptions
): Promise<T> => {
  try {
    const response: AxiosResponse<T> = await apiClient.patch(url, data, {
      headers: options?.headers,
      params: options?.params,
      timeout: options?.timeout,
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// DELETE request
export const apiDelete = async <T = any>(
  url: string,
  options?: ApiOptions
): Promise<T> => {
  try {
    const response: AxiosResponse<T> = await apiClient.delete(url, {
      headers: options?.headers,
      params: options?.params,
      timeout: options?.timeout,
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Error handler
const handleApiError = (error: any): Error => {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message || error.message;
    const statusCode = error.response?.status;

    console.error(`API Error [${statusCode}]: ${message}`);

    return new Error(message);
  }

  if (error instanceof Error) {
    return error;
  }

  return new Error('Unknown error occurred');
};

export default apiClient;
