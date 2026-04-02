import { Outlet } from 'react-router-dom';
import { AppSidebar } from '@/components/app-sidebar';
import LearnHeader from '@/components/layout/LearnHeader';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { useEffect } from 'react';
import { useEducationStore } from '@/store/educationStore';

export default function LearnLayout() {
  const fetchModules = useEducationStore((s) => s.fetchModules);

  // Fetch modules once at layout level so both the header search
  // and the child pages share the same already-loaded data
  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <div className="flex flex-1 flex-col">
          <LearnHeader />
          <div className="@container/main flex flex-1 flex-col">
            <Outlet />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
