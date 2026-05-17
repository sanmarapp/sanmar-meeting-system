import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface SidebarContextValue {
  isOpen: boolean;
  open:   () => void;
  close:  () => void;
  toggle: () => void;
}

const SidebarContext = createContext<SidebarContextValue>({
  isOpen: false,
  open:   () => {},
  close:  () => {},
  toggle: () => {},
});

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const open   = useCallback(() => { setIsOpen(true);  document.body.style.overflow = 'hidden'; }, []);
  const close  = useCallback(() => { setIsOpen(false); document.body.style.overflow = '';       }, []);
  const toggle = useCallback(() => setIsOpen(v => {
    document.body.style.overflow = v ? '' : 'hidden';
    return !v;
  }), []);

  return (
    <SidebarContext.Provider value={{ isOpen, open, close, toggle }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}
