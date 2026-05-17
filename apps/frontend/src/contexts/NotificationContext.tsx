import {
  createContext, useContext, useEffect, useRef, useState,
  useCallback, type ReactNode,
} from 'react';
import { io, type Socket } from 'socket.io-client';
import { toast } from 'sonner';
import { CheckCircle2, XCircle, CalendarDays } from 'lucide-react';
import { useAuth } from './AuthContext';

// ─── Types ─────────────────────────────────────────────────────
export interface AppNotification {
  id:        string;
  type:      'approved' | 'rejected' | 'pending' | 'cancelled';
  title:     string;
  body:      string;
  read:      boolean;
  createdAt: string;
  bookingId?: string;
}

interface NotificationContextValue {
  notifications:  AppNotification[];
  unreadCount:    number;
  connected:      boolean;
  markAllRead:    () => void;
  clearAll:       () => void;
}

// ─── Context ───────────────────────────────────────────────────
const NotificationContext = createContext<NotificationContextValue>({
  notifications: [],
  unreadCount:   0,
  connected:     false,
  markAllRead:   () => {},
  clearAll:      () => {},
});

const MAX_NOTIFICATIONS = 50;
const WS_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:3000';

// ─── Provider ──────────────────────────────────────────────────
export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user, token } = useAuth();
  const socketRef       = useRef<Socket | null>(null);

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [connected, setConnected]         = useState(false);

  const addNotification = useCallback((n: AppNotification) => {
    setNotifications(prev => {
      const next = [n, ...prev].slice(0, MAX_NOTIFICATIONS);
      return next;
    });
    // Show toast
    const icons: Record<string, React.ReactNode> = {
      approved:  <CheckCircle2 size={16} className="text-success" />,
      rejected:  <XCircle size={16} className="text-danger" />,
      pending:   <CalendarDays size={16} className="text-warning" />,
      cancelled: <XCircle size={16} className="text-neutral-400" />,
    };
    toast(n.title, {
      description: n.body,
      icon: icons[n.type],
      duration: 5000,
    });
  }, []);

  useEffect(() => {
    if (!user || !token) return;

    const socket = io(`${WS_URL}/notifications`, {
      auth:        { token },
      transports:  ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionAttempts: 10,
    });

    socketRef.current = socket;

    socket.on('connect',    () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    // Direct notification to this user
    socket.on('notification', (payload: AppNotification) => {
      addNotification(payload);
    });

    // Role-based broadcast — filter on client by role
    socket.on('notification:role', (payload: AppNotification & { role: string }) => {
      if (user.role === payload.role || user.role === 'ADMIN') {
        addNotification({ ...payload });
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [user?.id, token]); // eslint-disable-line react-hooks/exhaustive-deps

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => setNotifications([]), []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, connected, markAllRead, clearAll }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
