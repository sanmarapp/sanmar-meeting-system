import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { PageLoader } from './components/ui/Spinner';
import { LoginPage }     from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { BookingsPage }       from './pages/BookingsPage';
import { NewBookingPage }     from './pages/NewBookingPage';
import { BookingDetailPage }  from './pages/BookingDetailPage';
import { RoomsPage }          from './pages/RoomsPage';
import { RoomDetailPage }     from './pages/RoomDetailPage';
import { SiteVisitsPage }     from './pages/SiteVisitsPage';
import { SiteVisitDetailPage } from './pages/SiteVisitDetailPage';
import { NewSiteVisitPage }   from './pages/NewSiteVisitPage';
import { ApprovalsPage }      from './pages/ApprovalsPage';
import { UsersPage }          from './pages/UsersPage';
import { SettingsPage }                from './pages/SettingsPage';
import { NotificationSettingsPage }   from './pages/NotificationSettingsPage';
import { FairsPage }                  from './pages/FairsPage';
import { AuditLogPage }               from './pages/AuditLogPage';
import { ReportsPage }                from './pages/ReportsPage';

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
      <Route path="/rooms"              element={<PrivateRoute><RoomsPage /></PrivateRoute>} />
      <Route path="/rooms/:id"          element={<PrivateRoute><RoomDetailPage /></PrivateRoute>} />
      <Route path="/site-visits"        element={<PrivateRoute><SiteVisitsPage /></PrivateRoute>} />
      <Route path="/site-visits/new"    element={<PrivateRoute><NewSiteVisitPage /></PrivateRoute>} />
      <Route path="/site-visits/:id"    element={<PrivateRoute><SiteVisitDetailPage /></PrivateRoute>} />
      <Route path="/users"           element={<PrivateRoute><UsersPage /></PrivateRoute>} />
      <Route path="/approvals"       element={<PrivateRoute><ApprovalsPage /></PrivateRoute>} />
      <Route path="/settings"        element={<PrivateRoute><SettingsPage /></PrivateRoute>} />
      <Route path="/settings/notifications" element={<PrivateRoute><NotificationSettingsPage /></PrivateRoute>} />
      <Route path="/fairs"      element={<PrivateRoute><FairsPage /></PrivateRoute>} />
      <Route path="/audit-logs" element={<PrivateRoute><AuditLogPage /></PrivateRoute>} />
      <Route path="/reports"    element={<PrivateRoute><ReportsPage /></PrivateRoute>} />

      {/* Default redirects */}
      <Route path="/"  element={<Navigate to="/dashboard" replace />} />
      <Route path="*"  element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}


export default App;
