import { api } from './api';
import { type AuthUser } from './authService';

export interface UserListParams {
  page?:   number;
  limit?:  number;
  search?: string;
  role?:   string;
}

export interface PaginatedUsers {
  data:  AuthUser[];
  total: number;
  page:  number;
  limit: number;
}

export const userService = {
  async list(params?: UserListParams): Promise<PaginatedUsers> {
    const { data } = await api.get<PaginatedUsers>('/users', { params });
    return data;
  },

  async getById(id: string): Promise<AuthUser> {
    const { data } = await api.get<AuthUser>(`/users/${id}`);
    return data;
  },

  async toggleActive(id: string): Promise<AuthUser> {
    const { data } = await api.patch<AuthUser>(`/users/${id}/toggle-active`);
    return data;
  },

  async updateProfile(id: string, dto: Partial<Pick<AuthUser, 'name' | 'notifyEmail' | 'notifyWhatsapp'>>): Promise<AuthUser> {
    const { data } = await api.patch<AuthUser>(`/users/${id}`, dto);
    return data;
  },
};

export default userService;
