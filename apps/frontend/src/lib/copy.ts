/**
 * Sanmar Brand Voice — Copy constants
 * Luxury real estate tone: calm, authoritative, precise.
 * Never generic. Never casual.
 */

export const APP = {
  name: 'Sanmar Meeting System',
  shortName: 'Sanmar',
  tagline: 'Meeting rooms and site visits, managed with precision.',
  company: 'Sanmar Properties',
} as const;

export const AUTH = {
  loginTitle: 'Welcome back.',
  loginSubtitle: 'Sign in to manage your meetings and site visits.',
  loginCta: 'Sign In',
  logoutLabel: 'Sign Out',
  changePasswordTitle: 'Update your password.',
  changePasswordSubtitle: 'Choose a strong password to secure your account.',
  changePasswordCta: 'Update Password',
} as const;

export const DASHBOARD = {
  greeting: (name: string) => `Good ${getTimeOfDay()}, ${name}.`,
  todayMeetings: "Today's Meetings",
  roomsAvailable: 'Rooms Available',
  pendingApproval: 'Pending Approval',
  siteVisitsWeek: 'Site Visits This Week',
  upcomingBookings: 'Upcoming Bookings',
  recentVisits: 'Recent Site Visits',
} as const;

export const BOOKINGS = {
  title: 'Bookings',
  subtitle: 'Reserve and manage meeting room allocations.',
  newBookingCta: 'New Booking',
  noBookings: 'No bookings scheduled yet.',
  noBookingsHint: 'Reserve a space for your next meeting or discussion.',
  noBookingsCta: 'Schedule Your First Meeting',
  filterPlaceholder: 'Search bookings…',
  statusLabels: {
    PENDING:   'Pending Approval',
    APPROVED:  'Confirmed',
    REJECTED:  'Rejected',
    CANCELLED: 'Cancelled',
    COMPLETED: 'Completed',
  },
} as const;

export const ROOMS = {
  title: 'Rooms',
  subtitle: 'Browse and check availability across all locations.',
  noRooms: 'No rooms match your criteria.',
  noRoomsCta: 'Clear filters',
  availableLabel: 'Available',
  occupiedLabel: 'Occupied',
} as const;

export const SITE_VISITS = {
  title: 'Site Visits',
  subtitle: 'Schedule and track client property visits.',
  newVisitCta: 'Schedule Visit',
  noVisits: 'No site visits scheduled.',
  noVisitsHint: 'Coordinate your next client site walkthrough.',
  noVisitsCta: 'Schedule a Visit',
  statusLabels: {
    SCHEDULED:  'Scheduled',
    COMPLETED:  'Completed',
    CANCELLED:  'Cancelled',
    NO_SHOW:    'No Show',
  },
} as const;

export const ERRORS = {
  generic:     'Something went wrong. Please try again.',
  network:     'Unable to reach the server. Check your connection.',
  unauthorized:'Your session has expired. Please sign in again.',
  forbidden:   'You do not have permission to perform this action.',
  notFound:    'The requested resource could not be found.',
  validation:  'Please check the highlighted fields and try again.',
} as const;

export const EMPTY_STATES = {
  noData:    { title: 'Nothing here yet.',         hint: 'Data will appear here once available.' },
  noResults: { title: 'No results found.',          hint: 'Try adjusting your search or filters.' },
  noAccess:  { title: 'Access restricted.',         hint: 'Contact your administrator for access.' },
  error:     { title: 'Unable to load content.',    hint: 'Please refresh the page or try again later.' },
} as const;

// ─── Helpers ───────────────────────────────────────────────────
function getTimeOfDay(): string {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
