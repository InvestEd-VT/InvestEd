import { useEffect } from 'react';
import { SectionCards } from '@/components/section-cards'
import TopPositionsList from '@/components/portfolio/TopPositionsList'
import CashBalanceCard from '@/components/portfolio/CashBalanceCard'
import usePortfolioStore from '@/store/portfolioStore'

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-28 bg-gray-100 animate-pulse rounded-md" />
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const fetchPortfolio = usePortfolioStore((s) => s.fetchPortfolio);
  const isLoading = usePortfolioStore((s) => s.isLoading);
  const error = usePortfolioStore((s) => s.error);
  const portfolioData = usePortfolioStore((s) => s.data);

  // Fetch on mount
  useEffect(() => {
    fetchPortfolio();

    // Refresh on tab focus / visibility change so data is fresh when user returns
    const onFocus = () => fetchPortfolio();
    const onVisibility = () => {
      if (document.visibilityState === 'visible') fetchPortfolio();
    };

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [fetchPortfolio]);

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col gap-4">
        {/* Dev-only quick debug: show how many option positions are present */}
        {import.meta.env.DEV && (
          <div className="px-4 lg:px-6 text-sm text-muted-foreground">
            Option positions: {portfolioData?.positions?.filter((p: any) => (p.positionType || '').toUpperCase() === 'OPTION').length ?? 0}
          </div>
        )}
        {/* Show loading skeleton when there is no cached data and we're fetching */}
        {isLoading && !usePortfolioStore.getState().data ? (
          <LoadingSkeleton />
        ) : (
          <SectionCards />
        )}

        {/* Portfolio trend is shown as a dedicated card in the SectionCards above */}
        <div className="px-4 lg:px-6 grid gap-4">
          <CashBalanceCard />
          {/* Show an inline error banner if fetch failed */}
          {error && (
            <div className="mb-4 rounded-md bg-red-50 border border-red-100 p-3 text-sm text-red-800">
              {error}
            </div>
          )}
        </div>

  <TopPositionsList />
      </div>
    </div>
  )
}
