import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import PerformanceChart from '@/components/portfolio/PerformanceChart';
import TopPositionsList from '@/components/portfolio/TopPositionsList';
import RecentTransactions from '@/components/portfolio/RecentTransactions';
import { SectionCards } from '@/components/section-cards';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

import { useEffect } from 'react';
import usePortfolioStore from '@/store/portfolioStore';
import PortfolioValueCard from '@/components/portfolio/PortfolioValueCard';

export default function Dashboard() {
  const fetchPortfolio = usePortfolioStore((s) => s.fetchPortfolio);

  useEffect(() => {
    fetchPortfolio();

    const onVisibility = () => {
      if (document.visibilityState === 'visible') fetchPortfolio();
    };

    const onFocus = () => fetchPortfolio();

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('focus', onFocus);

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('focus', onFocus);
    };
  }, [fetchPortfolio]);

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
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <PortfolioValueCard />
              </div>
              <SectionCards />
              <div className="px-4 lg:px-6">
                <PerformanceChart period="all" />
              </div>
              <div className="px-4 lg:px-6">
                <TopPositionsList />
              </div>
              <div className="px-4 lg:px-6">
                <RecentTransactions />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
