import { useState, useEffect } from 'react';
import { PageShell } from '@/components/layout/PageShell';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency, formatPercent, pnlColor } from '@/utils/format';
import { useAuthStore } from '@/store/authStore';
import api from '@/services/api';

interface LeaderboardEntry {
  rank: number;
  firstName: string;
  lastName: string;
  userId: string;
  pnl: number;
  pnlPercent: number;
}

export default function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const currentUserId = useAuthStore((s) => s.user?.id);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const { data } = await api.get<{
          leaderboard: LeaderboardEntry[];
          currentUserId: string;
        }>('/leaderboard');
        setEntries(data.leaderboard);
      } catch {
        // Error handled by empty state
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  if (isLoading) {
    return (
      <PageShell>
        <div className="space-y-6 max-w-3xl">
          <Skeleton className="h-8 w-48" />
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Leaderboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Top traders ranked by portfolio profit and loss
          </p>
        </div>

        {entries.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm">No leaderboard data available yet.</p>
          </div>
        ) : (
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-12 px-4 py-3 text-[11px] font-medium text-gray-400 uppercase tracking-wider bg-gray-50">
              <span className="col-span-1">Rank</span>
              <span className="col-span-5">Name</span>
              <span className="col-span-3 text-right">P&L ($)</span>
              <span className="col-span-3 text-right">P&L (%)</span>
            </div>

            {/* Rows */}
            <div className="divide-y divide-gray-200">
              {entries.map((entry) => {
                const isCurrentUser = entry.userId === currentUserId;
                return (
                  <div
                    key={entry.userId}
                    className={`grid grid-cols-12 items-center px-4 py-3.5 text-sm transition-colors ${
                      isCurrentUser ? 'bg-blue-50 border-l-2 border-l-blue-500' : 'hover:bg-gray-50'
                    }`}
                  >
                    <span className="col-span-1 font-semibold text-gray-500">
                      {entry.rank <= 3 ? (
                        <span
                          className={
                            entry.rank === 1
                              ? 'text-yellow-500'
                              : entry.rank === 2
                                ? 'text-gray-400'
                                : 'text-amber-600'
                          }
                        >
                          #{entry.rank}
                        </span>
                      ) : (
                        `#${entry.rank}`
                      )}
                    </span>
                    <span className="col-span-5 font-medium text-gray-900">
                      {entry.firstName} {entry.lastName}
                      {isCurrentUser && (
                        <span className="ml-2 text-[10px] font-semibold text-blue-500 uppercase">
                          You
                        </span>
                      )}
                    </span>
                    <span className={`col-span-3 text-right font-semibold ${pnlColor(entry.pnl)}`}>
                      {formatCurrency(entry.pnl)}
                    </span>
                    <span
                      className={`col-span-3 text-right font-medium ${pnlColor(entry.pnlPercent)}`}
                    >
                      {formatPercent(entry.pnlPercent)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
}
