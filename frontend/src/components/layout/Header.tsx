import { Link } from 'react-router-dom';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { StockSearch } from '@/components/trading';

export function Header() {
  return (
    <header className="sticky top-0 bg-zinc-950 flex h-(--header-height) shrink-0 items-center gap-2 border-b border-zinc-900 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-2 px-4 lg:gap-4 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Link to="/dashboard" className="flex flex-none items-center gap-3">
          <span className="text-lg font-semibold">InvestEd</span>
        </Link>

        <div className="hidden flex-1 justify-center md:flex">
          <div className="w-full max-w-md">
            <StockSearch />
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
