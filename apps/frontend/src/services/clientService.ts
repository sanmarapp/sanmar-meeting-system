import { api } from './api';

export interface Client {
  id:      string;
  name:    string;
  email?:  string;
  phone?:  string;
  company?: string;
}

export const clientService = {
  async list(search?: string): Promise<Client[]> {
    const { data } = await api.get<Client[]>('/clients', {
      params: search ? { search } : undefined,
    });
    return data;
  },
};

export default clientService;
