import { type ReactNode, useRef, useEffect, useState } from 'react';
import {
  Bell, MapPin, Menu, X,
  CheckCircle2, CalendarDays, XCircle, ArrowLeft,
  Clock,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/cn';
import { useAuth } from '../../contexts/AuthContext';
import { useSidebar } from '../../contexts/SidebarContext';
import { useNotifications } from '../../contexts/NotificationContext';

// ─── Types ─────────────────────────────────────────────────────
interface HeaderProps {
  title:      string;
  subtitle?:  string;
  action?:    ReactNode;
  backHref?:  string;
  className?: string;
  badge?:     ReactNode;  // optional badge next to title (e.g. count)
}

// ─── Header ────────────────────────────────────────────────────
export function Header({ title, subtitle, action, backHref, className, badge }: HeaderProps) {
  const { user }            = useAuth();
  const { toggle, isOpen }  = useSidebar();
  const navigate            = useNavigate();
  const { notifications, unreadCount, markAllRead } = useNotifications();

  const location = user?.locations?.[0]?.name ?? 'Dhaka HQ';

  const [bellOpen, setBellOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  // Close notification panel on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setBellOpen(false);
      }
    }
    if (bellOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [bellOpen]);

  function handleBellClick() {
    setBellOpen(v => !v);
    if (!bellOpen && unreadCount > 0) markAllRead();
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-50 shrink-0',
        'bg-white/95 backdrop-blur-sm',
        'border-b border-neutral-150',
        'flex items-center justify-between px-5 gap-3',
        className,
      )}
      style={{ height: 'var(--header-h)' }}
    >
      {/* ── Left ── */}
      <div className="flex items-center gap-2.5 min-w-0">
        {/* Mobile hamburger */}
        {!backHref && (
          <button
            onClick={toggle}
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg border border-neutral-200 bg-white hover:bg-neutral-75 text-neutral-500 transition-colors shrink-0"
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
          >
            {isOpen
              ? <X    size={14} strokeWidth={2} />
              : <Menu size={14} strokeWidth={2} />
            }
          </button>
        )}

        {/* Back button */}
        {backHref && (
          <button
            onClick={() => navigate(backHref)}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-neutral-200 bg-white hover:bg-neutral-75 text-neutral-500 transition-colors shrink-0"
            aria-label="Go back"
          >
            <ArrowLeft size={14} strokeWidth={2} />
          </button>
        )}

        {/* Title block */}
        <div className="min-w-0 flex items-center gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-[15px] font-normal text-neutral-900 leading-none tracking-tight truncate">
                {title}
              </h1>
              {badge}
            </div>
            {subtitle && (
              <p className="text-xs text-neutral-400 leading-none mt-1 truncate">{subtitle}</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Right ── */}
      <div className="flex items-center gap-1.5 shrink-0">

        {/* Location pill */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-normal text-neutral-500 bg-neutral-75 border border-neutral-150 select-none">
          <MapPin size={10} strokeWidth={2.5} className="text-neutral-400" />
          {location}
        </div>

        {/* Notification bell */}
        <div className="relative" ref={bellRef}>
          <button
            onClick={handleBellClick}
            className={cn(
              'relative w-8 h-8 flex items-center justify-center rounded-lg border transition-colors',
              bellOpen
                ? 'bg-neutral-100 border-neutral-200 text-neutral-700'
                : 'bg-white border-neutral-200 text-neutral-500 hover:bg-neutral-75 hover:text-neutral-700',
            )}
            aria-label="Notifications"
            aria-expanded={bellOpen}
          >
            <Bell size={14} strokeWidth={1.75} />
            {unreadCount > 0 && (
              <span
                className="absolute top-1 right-1 min-w-[14px] h-[14px] rounded-full text-white flex items-center justify-center px-0.5 leading-none border-[1.5px] border-white text-[9px] font-normal"
                style={{ background: '#DC2626' }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notification dropdown */}
          {bellOpen && (
            <div
              className="absolute right-0 top-[calc(100%+6px)] w-[340px] bg-white rounded-xl z-60 overflow-hidden animate-scale-in"
              style={{ boxShadow: 'var(--shadow-dropdown)' }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
                <div>
                  <p className="text-sm font-normal text-neutral-900">Notifications</p>
                  {unreadCount > 0 && (
                    <p className="text-xs text-neutral-400 mt-0.5">{unreadCount} unread</p>
                  )}
                </div>
                {notifications.length > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-primary-500 hover:text-primary-700 transition-colors px-2 py-1 rounded-md hover:bg-primary-50"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {/* List */}
              <div className="max-h-[380px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                    <div className="w-10 h-10 rounded-xl bg-neutral-75 flex items-center justify-center mb-3">
                      <Bell size={18} strokeWidth={1.25} className="text-neutral-300" />
                    </div>
                    <p className="text-sm text-neutral-500 font-normal">No notifications</p>
                    <p className="text-xs text-neutral-400 mt-0.5">Booking updates will appear here</p>
                  </div>
                ) : (
                  notifications.map(n => (
                    <NotificationItem key={n.id} notification={n} />
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Page CTA */}
        {action}
      </div>
    </header>
  );
}

// ─── NotificationItem ──────────────────────────────────────────
type NotificationType = { id: string; type: string; title: string; body: string; read: boolean; createdAt: string };

function NotificationItem({ notification: n }: { notification: NotificationType }) {
  const iconConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
    approved:  { icon: CheckCircle2,  color: 'text-success',         bg: 'bg-success-50'  },
    rejected:  { icon: XCircle,       color: 'text-danger-500',      bg: 'bg-danger-50'   },
    pending:   { icon: CalendarDays,  color: 'text-warning-500',     bg: 'bg-warning-50'  },
    cancelled: { icon: XCircle,       color: 'text-neutral-400',     bg: 'bg-neutral-100' },
  };

  const cfg = iconConfig[n.type] ?? { icon: Bell, color: 'text-neutral-400', bg: 'bg-neutral-100' };
  const IconComp = cfg.icon;

  const timeAgo = (() => {
    const diff = Date.now() - new Date(n.createdAt).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1)  return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)  return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  })();

  return (
    <div
      className={cn(
        'flex items-start gap-3 px-4 py-3.5 transition-colors',
        'border-b border-neutral-50 last:border-0',
        !n.read ? 'bg-primary-25' : 'hover:bg-neutral-50',
      )}
    >
      {/* Icon */}
      <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5', cfg.bg)}>
        <IconComp size={14} strokeWidth={1.75} className={cfg.color} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-neutral-800 leading-snug">{n.title}</p>
        <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed line-clamp-2">{n.body}</p>
        <div className="flex items-center gap-1 mt-1.5">
          <Clock size={9} strokeWidth={2} className="text-neutral-300" />
          <p className="text-[10px] text-neutral-400">{timeAgo}</p>
        </div>
      </div>

      {/* Unread dot */}
      {!n.read && (
        <div className="w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0 mt-1.5 animate-pulse-dot" />
      )}
    </div>
  );
}

export default Header;
