import { type ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { SidebarProvider, useSidebar } from '../../contexts/SidebarContext';

// ─── Inner shell (needs sidebar context) ───────────────────────
function Shell({ children }: { children: ReactNode }) {
  const { isOpen, close } = useSidebar();

  return (
    <div className="flex min-h-screen bg-neutral-100">

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-[1px] lg:hidden"
          onClick={close}
          aria-hidden
        />
      )}

      <Sidebar />

      {/* Content — offset on desktop, full-width on mobile */}
      <main className="flex-1 lg:ml-[228px] flex flex-col min-h-screen overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}

// ─── AppShell — wraps Shell with SidebarProvider ───────────────
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <Shell>{children}</Shell>
    </SidebarProvider>
  );
}

export default AppShell;
