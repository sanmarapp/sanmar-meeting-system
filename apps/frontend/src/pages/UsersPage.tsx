import { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, X, ShieldCheck, Shield, Eye, User as UserIcon } from 'lucide-react';
import { userService } from '../services/userService';
import { type AuthUser } from '../services/authService';
import { AppShell } from '../components/layout/AppShell';
import { Header } from '../components/layout/Header';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { SkeletonTable } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { useAuth } from '../contexts/AuthContext';

// ─── Config ────────────────────────────────────────────────────
type RoleFilter = AuthUser['role'] | 'ALL';

const ROLE_TABS: { label: string; value: RoleFilter }[] = [
  { label: 'All',             value: 'ALL' },
  { label: 'Admin',           value: 'ADMIN' },
  { label: 'Corporate Admin', value: 'CORPORATE_ADMIN' },
  { label: 'HoD',             value: 'DEPT_MANAGER' },
  { label: 'Employee',        value: 'EMPLOYEE' },
  { label: 'Receptionist',    value: 'RECEPTIONIST' },
  { label: 'Site Admin',      value: 'SITE_ADMIN' },
];

const ROLE_BADGE: Record<string, 'brand' | 'info' | 'success' | 'neutral' | 'warning'> = {
  ADMIN:           'brand',
  CORPORATE_ADMIN: 'brand',
  DEPT_MANAGER:    'info',
  EMPLOYEE:        'success',
  RECEPTIONIST:    'neutral',
  SITE_ADMIN:      'warning',
};

const ROLE_LABEL: Record<string, string> = {
  ADMIN:           'Admin',
  CORPORATE_ADMIN: 'Corporate Admin',
  DEPT_MANAGER:    'Head of Dept',
  EMPLOYEE:        'Employee',
  RECEPTIONIST:    'Receptionist',
  SITE_ADMIN:      'Site Admin',
};

const ROLE_ICON: Record<string, React.ReactNode> = {
  ADMIN:           <ShieldCheck size={12} strokeWidth={1.75} />,
  CORPORATE_ADMIN: <ShieldCheck size={12} strokeWidth={1.75} />,
  DEPT_MANAGER:    <Shield size={12} strokeWidth={1.75} />,
  EMPLOYEE:        <UserIcon size={12} strokeWidth={1.75} />,
  RECEPTIONIST:    <UserIcon size={12} strokeWidth={1.75} />,
  SITE_ADMIN:      <Eye size={12} strokeWidth={1.75} />,
};

function initials(name: string) {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

function fmtLastLogin(iso?: string) {
  if (!iso) return 'Never';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ─── Component ─────────────────────────────────────────────────
export function UsersPage() {
  const { user: me } = useAuth();
  const isAdmin = me?.role === 'ADMIN';

  const [roleFilter, setRoleFilter] = useState<RoleFilter>('ALL');
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn:  () => userService.list({ limit: 100 }),
    enabled:  isAdmin,
  });

  const allUsers = data?.data ?? [];

  const filtered = useMemo(() => {
    return allUsers.filter((u: AuthUser) => {
      const matchRole   = roleFilter === 'ALL' || u.role === roleFilter;
      const matchSearch = !search.trim() ||
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.designation?.toLowerCase().includes(search.toLowerCase());
      return matchRole && matchSearch;
    });
  }, [allUsers, roleFilter, search]);

  const clearFilters = useCallback(() => { setSearch(''); setRoleFilter('ALL'); }, []);
  const hasFilters = roleFilter !== 'ALL' || !!search;

  if (!isAdmin) {
    return (
      <AppShell>
        <Header title="Users" />
        <div className="flex-1 flex items-center justify-center">
          <EmptyState variant="access" title="Admin access required" hint="Only Administrators can manage users." />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <Header
        title="Users"
        subtitle={isLoading ? 'Loading…' : `${filtered.length} of ${allUsers.length} user${allUsers.length !== 1 ? 's' : ''}`}
      />

      <div className="flex-1 p-6 space-y-4 animate-fade-in">

        {/* ── Filters ── */}
        <div className="bg-white border border-neutral-200 rounded-xl px-4 pt-3 pb-4 shadow-xs space-y-3">
          <div className="flex items-center gap-0.5 flex-wrap">
            {ROLE_TABS.map(({ label, value }) => {
              const active = roleFilter === value;
              return (
                <button
                  key={value}
                  onClick={() => setRoleFilter(value)}
                  className="text-sm px-3 py-1.5 rounded-lg font-normal transition-all duration-100 select-none"
                  style={{
                    background: active ? 'rgba(130,107,82,0.1)' : 'transparent',
                    color: active ? '#826B52' : 'rgba(0,0,0,0.5)',
                  }}
                  onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.04)'; }}
                  onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  {label}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <Input
                placeholder="Search by name, email or designation…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                prefix={<Search size={14} strokeWidth={1.75} />}
                fullWidth
              />
            </div>
            {hasFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-700 whitespace-nowrap transition-colors">
                <X size={12} strokeWidth={2} /> Clear
              </button>
            )}
          </div>
        </div>

        {/* ── Table ── */}
        <div className="bg-white border border-neutral-200 rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid #F0EDE9' }}>
                  <th className="px-5 py-3 text-left text-[11px] font-normal text-neutral-400 uppercase tracking-wider">User</th>
                  <th className="px-4 py-3 text-left text-[11px] font-normal text-neutral-400 uppercase tracking-wider">Role</th>
                  <th className="px-4 py-3 text-left text-[11px] font-normal text-neutral-400 uppercase tracking-wider">Department</th>
                  <th className="px-4 py-3 text-left text-[11px] font-normal text-neutral-400 uppercase tracking-wider">Last Login</th>
                  <th className="px-4 py-3 text-left text-[11px] font-normal text-neutral-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <SkeletonTable rows={8} />
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-20">
                      <EmptyState
                        variant="search"
                        title={hasFilters ? 'No users match your search' : 'No users found'}
                        action={hasFilters ? { label: 'Clear filters', onClick: clearFilters } : undefined}
                        className="py-0"
                      />
                    </td>
                  </tr>
                ) : (
                  filtered.map((u: AuthUser) => (
                    <tr
                      key={u.id}
                      className="transition-colors"
                      style={{ borderBottom: '1px solid #F5F3F0' }}
                      onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = '#FAFAF9')}
                      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
                    >
                      {/* User avatar + name */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-normal shrink-0"
                            style={{ background: u.id === me?.id ? 'rgba(130,107,82,0.15)' : 'rgba(0,0,0,0.06)', color: u.id === me?.id ? '#826B52' : '#6B7280' }}
                          >
                            {initials(u.name)}
                          </div>
                          <div>
                            <p className="font-normal text-neutral-900">
                              {u.name}
                              {u.id === me?.id && <span className="ml-1.5 text-xs text-neutral-400">(you)</span>}
                            </p>
                            <p className="text-xs text-neutral-400">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-4 py-3.5">
                        <Badge variant={ROLE_BADGE[u.role] ?? 'neutral'}>
                          <span className="flex items-center gap-1">
                            {ROLE_ICON[u.role]}
                            {u.role.charAt(0) + u.role.slice(1).toLowerCase()}
                          </span>
                        </Badge>
                      </td>

                      {/* Department */}
                      <td className="px-4 py-3.5">
                        <p className="text-neutral-700 truncate max-w-[150px]">{u.department?.name ?? '—'}</p>
                        {u.designation && <p className="text-xs text-neutral-400 truncate max-w-[150px]">{u.designation}</p>}
                      </td>

                      {/* Last login */}
                      <td className="px-4 py-3.5">
                        <p className="text-neutral-600 text-xs">{fmtLastLogin(u.lastLoginAt)}</p>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <Badge variant={u.isActive ? 'success' : 'neutral'} dot>
                          {u.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default UsersPage;
