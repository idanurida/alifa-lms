// lib/api/response.ts
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export function successResponse<T>(data: T, message?: string): ApiResponse<T> {
  return {
    success: true,
    data,
    message
  };
}

export function errorResponse(message: string, error?: any): ApiResponse {
  console.error('API Error:', error);
  return {
    success: false,
    error: message
  };
}