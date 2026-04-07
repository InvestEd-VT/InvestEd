import { useState, useRef, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { useEducationStore } from '@/store/educationStore';
import { Search, BookOpen } from 'lucide-react';

function ModuleSearch() {
  const modules = useEducationStore((s) => s.modules);
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const results = query.trim()
    ? modules.filter((m) => m.title.toLowerCase().includes(query.toLowerCase()))
    : [];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (id: string) => {
    setQuery('');
    setOpen(false);
    navigate(`/learn/modules/${id}`);
  };

  return (
    <div className="relative w-full max-w-md" ref={ref}>
      <div className="flex items-center gap-2 rounded-md border bg-background px-3 py-1.5">
        <Search className="size-4 text-muted-foreground shrink-0" />
        <input
          type="text"
          placeholder="Search modules..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>

      {open && results.length > 0 && (
        <div className="absolute top-full mt-1 w-full rounded-md border bg-popover shadow-md z-50">
          {results.map((m) => (
            <button
              key={m.id}
              onMouseDown={() => handleSelect(m.id)}
              className="flex items-center gap-3 w-full px-3 py-2.5 text-left hover:bg-accent transition-colors"
            >
              <BookOpen className="size-4 text-muted-foreground shrink-0" />
              <span className="text-sm">{m.title}</span>
              {m.completed && <span className="ml-auto text-xs text-primary">Completed</span>}
            </button>
          ))}
        </div>
      )}

      {open && query.trim() && results.length === 0 && (
        <div className="absolute top-full mt-1 w-full rounded-md border bg-popover shadow-md z-50 px-3 py-2.5 text-sm text-muted-foreground">
          No modules found for "{query}"
        </div>
      )}
    </div>
  );
}

export default function LearnLayout() {
  const fetchModules = useEducationStore((s) => s.fetchModules);

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
        style={
          {
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
          } as React.CSSProperties
        }
      >
        <div className="flex flex-1 flex-col">
          <SiteHeader searchOverride={<ModuleSearch />} />
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
              <Outlet />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
