import type { UserProfile, CurrentUser, QueryParams, PageResponse } from '@enterprise/types'
import { getApiClient } from '../client'

export const userApi = {
  getCurrentUser: () =>
    getApiClient().get<CurrentUser>('/users/me'),

  updateProfile: (data: Partial<UserProfile>) =>
    getApiClient().put<UserProfile>('/users/me', data),

  changePassword: (data: { oldPassword: string; newPassword: string }) =>
    getApiClient().post('/users/me/password', data),

  getUsers: (params: QueryParams) =>
    getApiClient().get<PageResponse<UserProfile>>('/users', { params }),

  getUserById: (id: number | string) =>
    getApiClient().get<UserProfile>(`/users/${id}`),

  createUser: (data: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>) =>
    getApiClient().post<UserProfile>('/users', data),

  updateUser: (id: number | string, data: Partial<UserProfile>) =>
    getApiClient().put<UserProfile>(`/users/${id}`, data),

  deleteUser: (id: number | string) =>
    getApiClient().delete(`/users/${id}`),
}
