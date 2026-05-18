import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, X, ShieldCheck, Shield, Eye, User as UserIcon, MapPin, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { userService, type LocationItem } from '../services/userService';
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
  { label: 'Super Admin',     value: 'SUPER_ADMIN' },
  { label: 'Admin',           value: 'ADMIN' },
  { label: 'Corporate Admin', value: 'CORPORATE_ADMIN' },
  { label: 'HoD',             value: 'DEPT_MANAGER' },
  { label: 'Sales HOD',       value: 'SALES_HOD' },
  { label: 'Sales Team',      value: 'SALES_TEAM' },
  { label: 'CSD Team',        value: 'CSD_TEAM' },
  { label: 'Employee',        value: 'EMPLOYEE' },
  { label: 'Receptionist',    value: 'RECEPTIONIST' },
  { label: 'Site Admin',      value: 'SITE_ADMIN' },
];

const ROLE_BADGE: Record<string, 'brand' | 'info' | 'success' | 'neutral' | 'warning'> = {
  SUPER_ADMIN:     'brand',
  ADMIN:           'brand',
  CORPORATE_ADMIN: 'brand',
  DEPT_MANAGER:    'info',
  SALES_HOD:       'info',
  SALES_TEAM:      'success',
  CSD_TEAM:        'success',
  EMPLOYEE:        'neutral',
  RECEPTIONIST:    'neutral',
  SITE_ADMIN:      'warning',
};

const ROLE_LABEL: Record<string, string> = {
  SUPER_ADMIN:     'Super Admin',
  ADMIN:           'Admin',
  CORPORATE_ADMIN: 'Corporate Admin',
  DEPT_MANAGER:    'Head of Dept',
  SALES_HOD:       'Sales HOD',
  SALES_TEAM:      'Sales Team',
  CSD_TEAM:        'CSD Team',
  EMPLOYEE:        'Employee',
  RECEPTIONIST:    'Receptionist',
  SITE_ADMIN:      'Site Admin',
};

const ROLE_ICON: Record<string, React.ReactNode> = {
  SUPER_ADMIN:     <ShieldCheck size={12} strokeWidth={1.75} />,
  ADMIN:           <ShieldCheck size={12} strokeWidth={1.75} />,
  CORPORATE_ADMIN: <ShieldCheck size={12} strokeWidth={1.75} />,
  DEPT_MANAGER:    <Shield size={12} strokeWidth={1.75} />,
  SALES_HOD:       <Shield size={12} strokeWidth={1.75} />,
  SALES_TEAM:      <UserIcon size={12} strokeWidth={1.75} />,
  CSD_TEAM:        <UserIcon size={12} strokeWidth={1.75} />,
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
  const qc = useQueryClient();
  const isAdmin = me?.role === 'ADMIN' || me?.role === 'SUPER_ADMIN' || me?.role === 'CORPORATE_ADMIN';

  const [roleFilter,   setRoleFilter]   = useState<RoleFilter>('ALL');
  const [search,       setSearch]       = useState('');
  const [selectedUser, setSelectedUser] = useState<AuthUser | null>(null);
  const [pendingLocs,  setPendingLocs]  = useState<string[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn:  () => userService.list({ limit: 100 }),
    enabled:  isAdmin,
  });

  const { data: locations = [] } = useQuery<LocationItem[]>({
    queryKey: ['locations'],
    queryFn:  () => userService.listLocations(),
    enabled:  isAdmin,
  });

  const assignMutation = useMutation({
    mutationFn: ({ userId, locationIds }: { userId: string; locationIds: string[] }) =>
      userService.assignLocations(userId, locationIds),
    onSuccess: () => {
      toast.success('Tower assignment saved');
      qc.invalidateQueries({ queryKey: ['users'] });
      setSelectedUser(null);
    },
    onError: () => toast.error('Failed to save assignment'),
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

  function openUser(u: AuthUser) {
    setSelectedUser(u);
    setPendingLocs((u.locations ?? []).map((l: { id: string }) => l.id));
  }

  function toggleLoc(locId: string) {
    setPendingLocs(prev =>
      prev.includes(locId) ? prev.filter(id => id !== locId) : [...prev, locId],
    );
  }

  function saveAssignment() {
    if (!selectedUser) return;
    assignMutation.mutate({ userId: selectedUser.id, locationIds: pendingLocs });
  }

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
                  <th className="px-4 py-3 text-left text-[11px] font-normal text-neutral-400 uppercase tracking-wider">Tower</th>
                  <th className="px-4 py-3 text-left text-[11px] font-normal text-neutral-400 uppercase tracking-wider">Last Login</th>
                  <th className="px-4 py-3 text-left text-[11px] font-normal text-neutral-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <SkeletonTable rows={8} />
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-20">
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
                      className="transition-colors cursor-pointer"
                      style={{ borderBottom: '1px solid #F5F3F0' }}
                      onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = '#FAFAF9')}
                      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
                      onClick={() => openUser(u)}
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

                      {/* Tower */}
                      <td className="px-4 py-3.5">
                        {(u.locations ?? []).length > 0 ? (
                          <div className="flex flex-col gap-0.5">
                            {(u.locations as Array<{ id: string; name: string; city: string }>).map(l => (
                              <span key={l.id} className="flex items-center gap-1 text-xs text-neutral-600">
                                <MapPin size={10} strokeWidth={1.75} style={{ color: '#C9A97A' }} />
                                {l.city}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-neutral-300">—</span>
                        )}
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
      {/* ── Tower Assignment Drawer ── */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setSelectedUser(null)}>
          <div
            className="relative h-full w-full max-w-[360px] bg-white shadow-xl flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-5" style={{ borderBottom: '1px solid #F0EDE9' }}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-normal text-neutral-500">Assign Tower</p>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="p-1 rounded hover:bg-neutral-100 transition-colors"
                >
                  <X size={14} strokeWidth={1.75} className="text-neutral-400" />
                </button>
              </div>
              <div className="flex items-center gap-2.5 mt-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-normal shrink-0"
                  style={{ background: 'rgba(201,169,122,0.12)', color: '#826B52' }}
                >
                  {initials(selectedUser.name)}
                </div>
                <div>
                  <p className="text-sm font-normal text-neutral-900">{selectedUser.name}</p>
                  <p className="text-xs text-neutral-400">{selectedUser.email}</p>
                </div>
              </div>
            </div>

            {/* Location toggles */}
            <div className="flex-1 px-6 py-5 space-y-3 overflow-y-auto">
              <p className="text-xs text-neutral-400 uppercase tracking-wider mb-4">Select office location(s)</p>
              {locations.length === 0 ? (
                <p className="text-sm text-neutral-400">No locations found in the system.</p>
              ) : (
                locations.map((loc) => {
                  const active = pendingLocs.includes(loc.id);
                  return (
                    <button
                      key={loc.id}
                      onClick={() => toggleLoc(loc.id)}
                      className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border text-left transition-all"
                      style={{
                        borderColor: active ? '#C9A97A' : '#E8E4DF',
                        background:  active ? 'rgba(201,169,122,0.06)' : 'transparent',
                      }}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: active ? 'rgba(201,169,122,0.15)' : 'rgba(0,0,0,0.04)' }}
                      >
                        <MapPin size={14} strokeWidth={1.75} style={{ color: active ? '#C9A97A' : '#9CA3AF' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-normal text-neutral-900">{loc.name}</p>
                        <p className="text-xs text-neutral-400">{loc.city}</p>
                      </div>
                      {active && (
                        <ChevronRight size={14} strokeWidth={1.75} style={{ color: '#C9A97A', flexShrink: 0 }} />
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4" style={{ borderTop: '1px solid #F0EDE9' }}>
              <button
                onClick={saveAssignment}
                disabled={assignMutation.isPending}
                className="w-full py-2.5 rounded-xl text-sm font-normal transition-opacity"
                style={{ background: '#1A1614', color: '#C9A97A', opacity: assignMutation.isPending ? 0.6 : 1 }}
              >
                {assignMutation.isPending ? 'Saving…' : 'Save Assignment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

export default UsersPage;
