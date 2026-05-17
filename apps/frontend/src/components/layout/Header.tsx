import { type ReactNode, useRef, useEffect, useState } from 'react';
import { Bell, MapPin, Menu, X, CheckCircle2, CalendarDays, XCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/cn';
import { useAuth } from '../../contexts/AuthContext';
import { useSidebar } from '../../contexts/SidebarContext';
import { useNotifications } from '../../contexts/NotificationContext';

// ─── Types ─────────────────────────────────────────────────────
interface HeaderProps {
  title:     string;
  subtitle?: string;
  action?:   ReactNode;
  backHref?: string;
  className?: string;
}

// ─── Component ─────────────────────────────────────────────────
export function Header({ title, subtitle, action, backHref, className }: HeaderProps) {
  const { user }          = useAuth();
  const { toggle, isOpen } = useSidebar();
  const navigate           = useNavigate();
  const { notifications, unreadCount, markAllRead } = useNotifications();

  const location = user?.locations?.[0]?.name ?? 'Dhaka HQ';

  const [bellOpen, setBellOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  // Close bell dropdown on outside click
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
        'sticky top-0 z-30 h-[54px] bg-white border-b border-neutral-200',
        'flex items-center justify-between px-4 lg:px-6 shrink-0 gap-3',
        className,
      )}
    >
      {/* Left — hamburger (mobile) + back button + title */}
      <div className="flex items-center gap-2 min-w-0">
        {/* Hamburger — mobile only, hidden when backHref present */}
        {!backHref && (
          <button
            onClick={toggle}
            className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-500 transition-colors shrink-0"
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
          >
            {isOpen ? <X size={15} strokeWidth={2} /> : <Menu size={15} strokeWidth={2} />}
          </button>
        )}

        {/* Back button — detail pages */}
        {backHref && (
          <button
            onClick={() => navigate(backHref)}
            className="flex items-center justify-center w-8 h-8 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-500 transition-colors shrink-0"
            aria-label="Go back"
          >
            <ArrowLeft size={15} strokeWidth={2} />
          </button>
        )}

        <div className="min-w-0">
          <h1 className="font-display text-xl font-semibold text-neutral-900 leading-tight truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-neutral-500 leading-none mt-0.5 truncate">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Right — location + bell + CTA */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Location pill — hidden on very small screens */}
        <div className="hidden sm:flex items-center gap-1.5 bg-neutral-100 border border-neutral-200 rounded-lg px-2.5 py-1.5 text-xs font-normal text-neutral-600">
          <MapPin size={11} strokeWidth={2} className="text-neutral-400" />
          {location}
        </div>

        {/* Notification bell */}
        <div className="relative" ref={bellRef}>
          <button
            onClick={handleBellClick}
            className="relative w-8 h-8 flex items-center justify-center rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-500 transition-colors"
            aria-label="Notifications"
          >
            <Bell size={14} strokeWidth={1.75} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[14px] h-[14px] rounded-full bg-danger text-white text-[9px] font-normal flex items-center justify-center px-0.5 leading-none border border-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notification dropdown */}
          {bellOpen && (
            <div className="absolute right-0 top-[calc(100%+6px)] w-[320px] bg-white border border-neutral-200 rounded-xl shadow-lg z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
                <p className="text-sm font-normal text-neutral-800">Notifications</p>
                {notifications.length > 0 && (
                  <button onClick={markAllRead} className="text-xs text-primary-500 hover:text-primary-700 font-normal transition-colors">
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-[360px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                    <Bell size={24} strokeWidth={1.25} className="text-neutral-200 mb-2" />
                    <p className="text-sm text-neutral-400">No notifications yet</p>
                    <p className="text-xs text-neutral-300 mt-0.5">Booking updates will appear here.</p>
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

        {action}
      </div>
    </header>
  );
}

// ─── Notification item ─────────────────────────────────────────
function NotificationItem({ notification: n }: { notification: { id: string; type: string; title: string; body: string; read: boolean; createdAt: string } }) {
  const iconMap: Record<string, ReactNode> = {
    approved:  <CheckCircle2 size={14} strokeWidth={1.75} className="text-success" />,
    rejected:  <XCircle size={14} strokeWidth={1.75} className="text-danger" />,
    pending:   <CalendarDays size={14} strokeWidth={1.75} className="text-warning" />,
    cancelled: <XCircle size={14} strokeWidth={1.75} className="text-neutral-400" />,
  };

  const timeAgo = (() => {
    const diff = Date.now() - new Date(n.createdAt).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1)  return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  })();

  return (
    <div
      className={cn(
        'flex items-start gap-3 px-4 py-3 border-b border-neutral-50 last:border-0',
        !n.read && 'bg-primary-50/40',
      )}
    >
      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
        style={{ background: 'rgba(0,0,0,0.04)' }}>
        {iconMap[n.type] ?? <Bell size={14} strokeWidth={1.75} className="text-neutral-400" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-normal text-neutral-800 leading-snug">{n.title}</p>
        <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">{n.body}</p>
        <p className="text-[10px] text-neutral-300 mt-1">{timeAgo}</p>
      </div>
      {!n.read && (
        <div className="w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0 mt-1.5" />
      )}
    </div>
  );
}

export default Header;
