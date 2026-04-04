import { useLocation } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { StockSearch } from '@/components/trading/StockSearch';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/portfolio': 'Portfolio',
  '/transactions': 'Transactions',
  '/learn': 'Learn',
  '/settings': 'Settings',
  '/help': 'Help',
  '/search': 'Search',
};

export function SiteHeader() {
  const location = useLocation();
  const title =
    pageTitles[location.pathname] ||
    (location.pathname.startsWith('/stock') ? 'Trade' : 'InvestEd');

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b border-gray-200 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
        <h1 className="text-sm font-medium text-gray-500">{title}</h1>

        {/* Stock search bar — centered */}
        <div className="hidden md:flex flex-1 justify-center max-w-md mx-auto">
          <StockSearch />
        </div>
      </div>
    </header>
  );
}
