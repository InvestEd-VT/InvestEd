import { Link } from 'react-router-dom';
import { NavUser } from '@/components/nav-user';
import { useAuthStore } from '@/store/authStore';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { StockSearch } from '@/components/trading';

export function Header() {
  const user = useAuthStore((s) => s.user);
  const userInfo = {
    name: `${user?.firstName ?? 'Guest'}${user?.lastName ? ` ${user.lastName}` : ''}`,
    email: user?.email ?? '',
    avatar: '/vite.svg',
  };
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-2 px-4 lg:gap-4 lg:px-6">
        <SidebarTrigger className="md:hidden -ml-1" />
        <Link to="/dashboard" className="flex flex-none items-center gap-3">
          <img src="/vite.svg" alt="InvestEd" className="h-8 w-8" />
          <span className="text-lg font-semibold">InvestEd</span>
        </Link>

        <div className="hidden flex-1 justify-center md:flex">
          <div className="w-full max-w-md">
            <StockSearch />
          </div>
        </div>

        <div className="ml-auto flex-none">
          <NavUser user={userInfo} />
        </div>
      </div>
    </header>
  );
}

export default Header;
