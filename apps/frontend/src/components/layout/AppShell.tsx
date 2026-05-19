import { type ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { SidebarProvider, useSidebar } from '../../contexts/SidebarContext';

// ─── Inner shell ───────────────────────────────────────────────
function Shell({ children }: { children: ReactNode }) {
  const { isOpen, close } = useSidebar();

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-app)' }}>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-[2px] lg:hidden animate-fade-in"
          onClick={close}
          aria-hidden
        />
      )}

      {/* Sidebar */}
      <Sidebar />

      {/* Main content — offset by sidebar width on desktop */}
      <main
        className="flex-1 flex flex-col min-h-screen overflow-x-hidden"
        style={{ marginLeft: 'var(--sidebar-w)' }}
      >
        <div className="lg:block hidden" />
        {children}
      </main>

    </div>
  );
}

// ─── AppShell (public API) ─────────────────────────────────────
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <Shell>{children}</Shell>
    </SidebarProvider>
  );
}

export default AppShell;
