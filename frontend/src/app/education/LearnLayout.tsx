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
      <SidebarInset
        className="bg-white text-gray-900"
        style={{
          '--card': 'oklch(1 0 0)',
          '--card-foreground': 'oklch(0.145 0 0)',
          '--muted': 'oklch(0.97 0 0)',
          '--muted-foreground': 'oklch(0.556 0 0)',
          '--border': 'oklch(0.922 0 0)',
          '--input': 'oklch(0.922 0 0)',
          '--primary': 'oklch(0.205 0 0)',
          '--primary-foreground': 'oklch(0.985 0 0)',
          '--secondary': 'oklch(0.97 0 0)',
          '--secondary-foreground': 'oklch(0.205 0 0)',
          '--accent': 'oklch(0.97 0 0)',
          '--accent-foreground': 'oklch(0.205 0 0)',
          '--destructive': 'oklch(0.577 0.245 27.325)',
          '--background': 'oklch(1 0 0)',
          '--foreground': 'oklch(0.145 0 0)',
          '--popover': 'oklch(1 0 0)',
          '--popover-foreground': 'oklch(0.145 0 0)',
        } as React.CSSProperties}
      >
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
