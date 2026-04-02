import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { NavUser } from '@/components/nav-user';
import { useAuthStore } from '@/store/authStore';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useEducationStore } from '@/store/educationStore';
import { Search, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

export function LearnHeader() {
  const user = useAuthStore((s) => s.user);
  const modules = useEducationStore((s) => s.modules);
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const userInfo = {
    name: `${user?.firstName ?? 'Guest'}${user?.lastName ? ` ${user.lastName}` : ''}`,
    email: user?.email ?? '',
    avatar: '/vite.svg',
  };

  const results = query.trim()
    ? modules.filter((m) => m.title.toLowerCase().includes(query.toLowerCase()))
    : [];

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
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
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-2 px-4 lg:gap-4 lg:px-6">
        <SidebarTrigger className="md:hidden -ml-1" />
        <Link to="/dashboard" className="flex flex-none items-center gap-3">
          <img src="/vite.svg" alt="InvestEd" className="h-8 w-8" />
          <span className="text-lg font-semibold">InvestEd</span>
        </Link>

        {/* Module search */}
        <div className="hidden flex-1 justify-center md:flex">
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
        </div>

        <div className="ml-auto flex-none">
          <NavUser user={userInfo} />
        </div>
      </div>
    </header>
  );
}

export default LearnHeader;
