import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { PageLoader } from './components/ui/Spinner';
import { LoginPage }     from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { BookingsPage }       from './pages/BookingsPage';
import { NewBookingPage }     from './pages/NewBookingPage';
import { BookingDetailPage }  from './pages/BookingDetailPage';
import { RoomsPage }          from './pages/RoomsPage';
import { SiteVisitsPage }     from './pages/SiteVisitsPage';
import { NewSiteVisitPage }   from './pages/NewSiteVisitPage';
import { ApprovalsPage }      from './pages/ApprovalsPage';
import { UsersPage }          from './pages/UsersPage';
import { SettingsPage }       from './pages/SettingsPage';

// ─── Route guard ───────────────────────────────────────────────
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <PageLoader />;
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <PageLoader />;
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <>{children}</>;
}

// ─── App ───────────────────────────────────────────────────────
function App() {
  return (
    <Routes>
      {/* Public */}
      <Route
        path="/login"
        element={<PublicRoute><LoginPage /></PublicRoute>}
      />

      {/* Protected */}
      <Route
        path="/dashboard"
        element={<PrivateRoute><DashboardPage /></PrivateRoute>}
      />

      {/* Built pages */}
      <Route
        path="/bookings"
        element={<PrivateRoute><BookingsPage /></PrivateRoute>}
      />
      <Route
        path="/bookings/new"
        element={<PrivateRoute><NewBookingPage /></PrivateRoute>}
      />
      <Route
        path="/bookings/:id"
        element={<PrivateRoute><BookingDetailPage /></PrivateRoute>}
      />
      <Route path="/rooms"           element={<PrivateRoute><RoomsPage /></PrivateRoute>} />
      <Route path="/site-visits"     element={<PrivateRoute><SiteVisitsPage /></PrivateRoute>} />
      <Route path="/site-visits/new" element={<PrivateRoute><NewSiteVisitPage /></PrivateRoute>} />
      <Route path="/users"           element={<PrivateRoute><UsersPage /></PrivateRoute>} />
      <Route path="/approvals"       element={<PrivateRoute><ApprovalsPage /></PrivateRoute>} />
      <Route path="/settings"        element={<PrivateRoute><SettingsPage /></PrivateRoute>} />

      {/* Default redirects */}
      <Route path="/"  element={<Navigate to="/dashboard" replace />} />
      <Route path="*"  element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

// ─── Coming soon placeholder ───────────────────────────────────
import { AppShell } from './components/layout/AppShell';
import { Header }   from './components/layout/Header';
import { EmptyState } from './components/ui/EmptyState';

function ComingSoon({ title }: { title: string }) {
  return (
    <AppShell>
      <Header title={title} />
      <div className="flex-1 flex items-center justify-center">
        <EmptyState
          variant="generic"
          title={`${title} coming soon.`}
          hint="This page is part of the next build phase."
        />
      </div>
    </AppShell>
  );
}

export default App;
