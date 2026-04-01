import AppSidebarSimple from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import PerformanceChart from '@/components/portfolio/PerformanceChart';
import TopPositionsList from '@/components/portfolio/TopPositionsList';
import RecentTransactions from '@/components/portfolio/RecentTransactions';
import { SectionCards } from '@/components/section-cards';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

// data.json removed: TopPositionsList will display real/store-driven data
import { useEffect } from 'react';
import usePortfolioStore from '@/store/portfolioStore';
import PortfolioValueCard from '@/components/portfolio/PortfolioValueCard';

export default function Dashboard() {
  // Select the fetch function directly to keep a stable reference
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
  <AppSidebarSimple variant="inset" />
      <SidebarInset>
        <div className="flex flex-1 flex-col">
          <Header />
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <PortfolioValueCard />
              </div>
              <SectionCards />
              <div className="px-4 lg:px-6">
                <PerformanceChart period="all" />
              </div>
              <TopPositionsList />
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

