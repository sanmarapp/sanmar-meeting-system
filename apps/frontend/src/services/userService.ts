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

export interface LocationItem {
  id:      string;
  name:    string;
  city:    string;
  type:    string;
  address: string;
}

export const userService = {
  async listLocations(): Promise<LocationItem[]> {
    const { data } = await api.get<LocationItem[]>('/users/locations');
    return data;
  },

  async list(params?: UserListParams): Promise<PaginatedUsers> {
    const { data } = await api.get<PaginatedUsers>('/users', { params });
    return data;
  },

  async getById(id: string): Promise<AuthUser> {
    const { data } = await api.get<AuthUser>(`/users/${id}`);
    return data;
  },

  async updateProfile(id: string, dto: Partial<Pick<AuthUser, 'name' | 'notifyEmail' | 'notifyWhatsapp'>>): Promise<AuthUser> {
    const { data } = await api.patch<AuthUser>(`/users/${id}`, dto);
    return data;
  },

  async assignLocations(id: string, locationIds: string[]): Promise<AuthUser> {
    const { data } = await api.patch<AuthUser>(`/users/${id}`, { locationIds });
    return data;
  },

  async toggleActive(id: string): Promise<AuthUser> {
    const { data } = await api.patch<AuthUser>(`/users/${id}/toggle-active`);
    return data;
  },
};

export default userService;
