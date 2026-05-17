import { api } from './api';

export interface Site {
  id:       string;
  name:     string;
  address?: string;
  type?:    string;
}

export const siteService = {
  async list(search?: string): Promise<Site[]> {
    const { data } = await api.get<Site[]>('/sites', {
      params: search ? { search } : undefined,
    });
    return data;
  },
};

export default siteService;
