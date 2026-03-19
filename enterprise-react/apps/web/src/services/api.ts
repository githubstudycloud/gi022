import { HttpClient } from '@enterprise/utils';

import { useAuthStore } from '@/store/auth';

export const apiClient = new HttpClient({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  timeout: 15_000,
});

// Request interceptor — inject auth token
apiClient.addRequestInterceptor((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    return {
      ...config,
      headers: { ...config.headers, Authorization: `Bearer ${token}` },
    };
  }
  return config;
});

// Response interceptor — handle 401
apiClient.addResponseInterceptor((response) => {
  const res = response as { code?: number; message?: string };
  if (res.code === 401) {
    useAuthStore.getState().logout();
    window.location.href = '/login';
  }
  return response;
});

export default apiClient;
