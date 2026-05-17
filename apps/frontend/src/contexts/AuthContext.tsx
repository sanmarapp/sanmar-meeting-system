import {
  createContext, useContext, useState, useEffect,
  useCallback, type ReactNode,
} from 'react';
import { authService, type AuthUser, type LoginDto } from '../services/authService';

// ─── Types ─────────────────────────────────────────────────────
interface AuthContextValue {
  user:        AuthUser | null;
  token:       string | null;
  isLoading:   boolean;
  isAuthenticated: boolean;
  login:       (dto: LoginDto) => Promise<{ mustChangePassword: boolean }>;
  logout:      () => Promise<void>;
  refreshUser: () => Promise<void>;
}

// ─── Context ───────────────────────────────────────────────────
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = 'sanmar_token';
const USER_KEY  = 'sanmar_user';

// ─── Provider ──────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,      setUser]      = useState<AuthUser | null>(null);
  const [token,     setToken]     = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Rehydrate from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser  = localStorage.getItem(USER_KEY);
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        // Verify token still valid
        authService.getProfile().then(setUser).catch(() => {
          clearAuth();
        });
      } catch {
        clearAuth();
      }
    }
    setIsLoading(false);
  }, []);

  function clearAuth() {
    setUser(null);
    setToken(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  const login = useCallback(async (dto: LoginDto) => {
    const response = await authService.login(dto);
    setToken(response.token);
    setUser(response.user);
    localStorage.setItem(TOKEN_KEY, response.token);
    localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    return { mustChangePassword: response.mustChangePassword };
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    clearAuth();
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const fresh = await authService.getProfile();
      setUser(fresh);
      localStorage.setItem(USER_KEY, JSON.stringify(fresh));
    } catch {
      clearAuth();
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      user, token, isLoading,
      isAuthenticated: !!user && !!token,
      login, logout, refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ──────────────────────────────────────────────────────
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}

export default AuthProvider;
