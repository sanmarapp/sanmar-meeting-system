import { useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, CalendarDays, Building2, MapPin,
  Users, CheckSquare, Settings, LogOut, Bell, Store,
} from 'lucide-react';
import { cn } from '../../lib/cn';
import { useAuth } from '../../contexts/AuthContext';
import { useSidebar } from '../../contexts/SidebarContext';

// ─── Nav config ────────────────────────────────────────────────
const NAV_MAIN = [
  { to: '/dashboard',   label: 'Dashboard',   icon: LayoutDashboard },
  { to: '/bookings',    label: 'Bookings',    icon: CalendarDays    },
  { to: '/rooms',       label: 'Rooms',       icon: Building2       },
  { to: '/site-visits', label: 'Site Visits', icon: MapPin          },
  { to: '/fairs',       label: 'Property Fairs', icon: Store        },
];

const NAV_ADMIN = [
  { to: '/users',                   label: 'Users',          icon: Users       },
  { to: '/approvals',               label: 'Approvals',      icon: CheckSquare },
  { to: '/settings',                label: 'Settings',       icon: Settings    },
  { to: '/settings/notifications',  label: 'Notifications',  icon: Bell        },
];

// ─── Component ─────────────────────────────────────────────────
export function Sidebar() {
  const { user, logout } = useAuth();
  const navigate          = useNavigate();
  const location          = useLocation();
  const { isOpen, close } = useSidebar();

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' || user?.role === 'CORPORATE_ADMIN';

  // Auto-close drawer on navigation (mobile)
  useEffect(() => { close(); }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  const initials = user?.name
    ? user.name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 w-[228px] flex flex-col',
        'transition-transform duration-200 ease-in-out',
        // Desktop: always visible. Mobile: slide based on isOpen.
        'lg:translate-x-0',
        isOpen ? 'translate-x-0' : '-translate-x-full',
      )}
      style={{ background: '#1A1614' }}
      aria-label="Navigation"
    >
      {/* ── Logo ── */}
      <div className="px-5 pt-5 pb-4" style={{ borderBottom: '1px solid rgba(201,169,122,0.12)' }}>
        <img src="/logo.svg" alt="Sanmar" className="w-[108px] h-auto" draggable={false} />
        {user?.locations && user.locations.length > 0 && (
          <p className="text-[9px] font-normal uppercase tracking-[0.12em] mt-1.5 pl-0.5"
            style={{ color: 'rgba(201,169,122,0.5)' }}>
            {user.locations[0].name}
          </p>
        )}
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
        {NAV_MAIN.map(({ to, label, icon: Icon }) => (
          <SidebarLink key={to} to={to} icon={<Icon size={15} strokeWidth={1.75} />} label={label} />
        ))}

        {isAdmin && (
          <>
            <div className="px-3 pt-4 pb-1">
              <span className="text-[9px] font-normal uppercase tracking-[0.1em]"
                style={{ color: 'rgba(255,255,255,0.25)' }}>
                Manage
              </span>
            </div>
            {NAV_ADMIN.map(({ to, label, icon: Icon }) => (
              <SidebarLink key={to} to={to} icon={<Icon size={15} strokeWidth={1.75} />} label={label} />
            ))}
          </>
        )}
      </nav>

      {/* ── User footer ── */}
      <div className="px-3 py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div
          className="flex items-center gap-2.5 px-2 py-2 rounded-lg group cursor-default transition-colors"
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-normal shrink-0"
            style={{ background: 'rgba(201,169,122,0.2)', color: '#C9A97A' }}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-normal truncate" style={{ color: 'rgba(255,255,255,0.9)' }}>{user?.name}</p>
            <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>{user?.role}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded"
            style={{ color: 'rgba(255,255,255,0.4)' }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.color = '#C9A97A';
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(201,169,122,0.1)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.4)';
              (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
            }}
          >
            <LogOut size={13} strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </aside>
  );
}

// ─── SidebarLink ───────────────────────────────────────────────
function SidebarLink({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <NavLink to={to}>
      {({ isActive }) => (
        <span
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-normal transition-all duration-100 cursor-pointer"
          style={{
            background: isActive ? 'rgba(201,169,122,0.14)' : 'transparent',
            color: isActive ? '#C9A97A' : 'rgba(255,255,255,0.45)',
          }}
          onMouseEnter={e => {
            if (!isActive) {
              (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)';
              (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.75)';
            }
          }}
          onMouseLeave={e => {
            if (!isActive) {
              (e.currentTarget as HTMLElement).style.background = 'transparent';
              (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.45)';
            }
          }}
        >
          <span className="shrink-0" style={{ color: isActive ? '#C9A97A' : 'rgba(255,255,255,0.35)' }}>
            {icon}
          </span>
          <span className="flex-1 truncate">{label}</span>
        </span>
      )}
    </NavLink>
  );
}

export default Sidebar;
