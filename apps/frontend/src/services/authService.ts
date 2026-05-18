import { api } from './api';

// ─── Types (mirrors backend DTOs) ─────────────────────────────
export interface LoginDto {
  email:    string;
  password: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword:     string;
}

// Mirrors the UserRole enum in prisma/schema.prisma exactly
export type UserRole =
  | 'ADMIN'           // Master admin — full system access
  | 'SUPER_ADMIN'     // Super admin — full system + config access
  | 'CORPORATE_ADMIN' // Corporate office admin — approves bookings
  | 'DEPT_MANAGER'    // Head of Department — notification-only, no approval authority
  | 'EMPLOYEE'        // Regular staff — books rooms, views own history
  | 'RECEPTIONIST'    // Front desk — operational scheduling support
  | 'SITE_ADMIN';     // Project site manager — manages site visits

export interface AuthUser {
  id:                 string;
  email:              string;
  name:               string;
  role:               UserRole;
  employeeId:         string;
  designation:        string;
  departmentId:       string;
  department?:        { id: string; name: string };
  locations?:         Array<{ id: string; name: string }>;
  isActive:           boolean;
  mustChangePassword: boolean;
  notifyEmail:        boolean;
  notifyWhatsapp:     boolean;
  lastLoginAt?:       string;
}

export interface LoginResponse {
  user:               AuthUser;
  token:              string;
  mustChangePassword: boolean;
}

// ─── Auth service ──────────────────────────────────────────────
export const authService = {
  async login(dto: LoginDto): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>('/auth/login', dto);
    return data;
  },

  async getProfile(): Promise<AuthUser> {
    const { data } = await api.get<AuthUser>('/auth/me');
    return data;
  },

  async changePassword(dto: ChangePasswordDto): Promise<void> {
    await api.post('/auth/change-password', dto);
  },

  async logout(): Promise<void> {
    try { await api.post('/auth/logout'); } catch { /* ignore */ }
  },
};

export default authService;
