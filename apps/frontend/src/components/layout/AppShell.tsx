import { type ReactNode } from 'react';
import { Sidebar } from './Sidebar';

interface AppShellProps {
  children: ReactNode;
}

/**
 * AppShell — the fixed chrome that wraps every authenticated page.
 * Sidebar (228px fixed left) + scrollable main content area.
 */
export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-neutral-100">
      <Sidebar />
      {/* Offset content by sidebar width */}
      <main className="flex-1 ml-[228px] flex flex-col min-h-screen overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}

export default AppShell;
