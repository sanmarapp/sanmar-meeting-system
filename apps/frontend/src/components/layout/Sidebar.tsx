import { useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, CalendarDays, Building2, MapPin,
  Users, CheckSquare, Settings, LogOut, Bell,
  Store, ClipboardList, BarChart2, ChevronRight,
} from 'lucide-react';
import { cn } from '../../lib/cn';
import { useAuth } from '../../contexts/AuthContext';
import { useSidebar } from '../../contexts/SidebarContext';

// ─── Nav config ────────────────────────────────────────────────
const NAV_MAIN = [
  { to: '/dashboard',   label: 'Dashboard',      icon: LayoutDashboard },
  { to: '/bookings',    label: 'Bookings',        icon: CalendarDays    },
  { to: '/rooms',       label: 'Rooms',           icon: Building2       },
  { to: '/site-visits', label: 'Site Visits',     icon: MapPin          },
  { to: '/fairs',       label: 'Property Fairs',  icon: Store           },
];

const NAV_ADMIN = [
  { to: '/approvals',              label: 'Approvals',    icon: CheckSquare   },
  { to: '/users',                  label: 'Users',        icon: Users         },
  { to: '/reports',                label: 'Reports',      icon: BarChart2     },
  { to: '/audit-logs',             label: 'Audit Log',    icon: ClipboardList },
  { to: '/settings',               label: 'Settings',     icon: Settings      },
  { to: '/settings/notifications', label: 'Notifications',icon: Bell          },
];

// ─── Sidebar ───────────────────────────────────────────────────
export function Sidebar() {
  const { user, logout } = useAuth();
  const navigate          = useNavigate();
  const location          = useLocation();
  const { isOpen, close } = useSidebar();

  const isAdmin = ['ADMIN','SUPER_ADMIN','CORPORATE_ADMIN'].includes(user?.role ?? '');

  // Close on mobile navigation
  useEffect(() => { close(); }, [location.pathname]); // eslint-disable-line

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
        'fixed inset-y-0 left-0 z-40 flex flex-col',
        'transition-transform duration-200 ease-out will-change-transform',
        'lg:translate-x-0',
        isOpen ? 'translate-x-0' : '-translate-x-full',
      )}
      style={{
        width: 'var(--sidebar-w)',
        background: 'var(--sidebar-bg)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}
      aria-label="Main navigation"
    >
      {/* ── Logo area ── */}
      <div
        className="flex items-center px-4 shrink-0"
        style={{
          height: 'var(--header-h)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <img
          src="/logo.svg"
          alt="Sanmar"
          className="w-[104px] h-auto"
          draggable={false}
        />
      </div>

      {/* ── Navigation ── */}
      <nav
        className="flex-1 overflow-y-auto px-2 py-3 scrollbar-hidden"
        aria-label="Sidebar navigation"
      >
        {/* Main nav */}
        <div className="space-y-0.5">
          {NAV_MAIN.map(({ to, label, icon: Icon }) => (
            <SidebarLink
              key={to}
              to={to}
              icon={<Icon size={14} strokeWidth={1.75} />}
              label={label}
            />
          ))}
        </div>

        {/* Admin section */}
        {isAdmin && (
          <div className="mt-6">
            <p
              className="px-3 mb-1.5 text-[10px] font-normal uppercase tracking-widest"
              style={{ color: 'rgba(255,255,255,0.22)' }}
            >
              Manage
            </p>
            <div className="space-y-0.5">
              {NAV_ADMIN.map(({ to, label, icon: Icon }) => (
                <SidebarLink
                  key={to}
                  to={to}
                  icon={<Icon size={14} strokeWidth={1.75} />}
                  label={label}
                />
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* ── User footer ── */}
      <div
        className="px-2 py-3 shrink-0"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        {/* User card */}
        <div className="group flex items-center gap-2.5 px-3 py-2.5 rounded-lg cursor-default transition-colors duration-100 hover:bg-white/5">
          {/* Avatar */}
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-normal shrink-0 select-none"
            style={{
              background: 'rgba(201,169,122,0.18)',
              color: '#C9A97A',
            }}
          >
            {initials}
          </div>

          {/* Name + role */}
          <div className="flex-1 min-w-0">
            <p
              className="text-sm font-normal truncate leading-tight"
              style={{ color: 'rgba(255,255,255,0.88)' }}
            >
              {user?.name}
            </p>
            <p
              className="text-xs truncate leading-tight mt-0.5"
              style={{ color: 'rgba(255,255,255,0.36)' }}
            >
              {formatRole(user?.role)}
            </p>
          </div>

          {/* Logout — revealed on hover */}
          <button
            onClick={handleLogout}
            title="Sign out"
            className={cn(
              'opacity-0 group-hover:opacity-100',
              'w-6 h-6 flex items-center justify-center rounded-md',
              'transition-all duration-100 shrink-0',
              'hover:bg-white/10',
            )}
            style={{ color: 'rgba(255,255,255,0.40)' }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.color = '#C9A97A';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.40)';
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
function SidebarLink({
  to,
  icon,
  label,
}: {
  to:    string;
  icon:  React.ReactNode;
  label: string;
}) {
  return (
    <NavLink to={to} className="block">
      {({ isActive }) => (
        <span
          className={cn(
            'relative flex items-center gap-2.5 px-3 py-[7px] rounded-lg text-sm font-normal',
            'transition-colors duration-100 cursor-pointer select-none',
            isActive
              ? 'nav-item-active'
              : 'text-[rgba(255,255,255,0.45)] hover:bg-white/[0.05] hover:text-[rgba(255,255,255,0.78)]',
          )}
        >
          {/* Icon */}
          <span
            className={cn(
              'shrink-0 flex items-center transition-colors duration-100',
              isActive
                ? 'text-[#C9A97A]'
                : 'text-[rgba(255,255,255,0.32)]',
            )}
          >
            {icon}
          </span>

          {/* Label */}
          <span className="flex-1 truncate">{label}</span>

          {/* Active chevron hint */}
          {isActive && (
            <ChevronRight
              size={11}
              strokeWidth={2}
              className="shrink-0 opacity-50"
              style={{ color: '#C9A97A' }}
            />
          )}
        </span>
      )}
    </NavLink>
  );
}

// ─── Role formatter ────────────────────────────────────────────
function formatRole(role?: string): string {
  if (!role) return '';
  const map: Record<string, string> = {
    SUPER_ADMIN:     'Super Admin',
    ADMIN:           'Administrator',
    CORPORATE_ADMIN: 'Corporate Admin',
    DEPT_MANAGER:    'Dept. Manager',
    SALES_HOD:       'Sales HOD',
    SALES_TEAM:      'Sales Team',
    CSD_TEAM:        'CSD Team',
    EMPLOYEE:        'Employee',
  };
  return map[role] ?? role;
}

export default Sidebar;
