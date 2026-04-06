import { useNavigate } from 'react-router-dom';
import { useEducationStore } from '@/store/educationStore';
import PageHeader from '@/components/ui/PageHeader';
import { CheckCircle2, Circle, BookOpen, ChevronRight } from 'lucide-react';

export default function EducationDashboard() {
  const navigate = useNavigate();
  const { modules, isLoading, error } = useEducationStore();

  const completed = modules.filter((m) => m.completed).length;

  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="size-6 text-primary" />
          <PageHeader title="Learn" />
        </div>
        <p className="text-muted-foreground text-sm">
          Build your options trading knowledge one module at a time.
        </p>
        {modules.length > 0 && (
          <div className="mt-4 flex items-center gap-3">
            <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${(completed / modules.length) * 100}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {completed} / {modules.length} complete
            </span>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      )}

      {/* Module list */}
      {!isLoading && (
        <div className="space-y-3">
          {modules.map((mod, idx) => (
            <button
              key={mod.id}
              onClick={() => navigate(`/learn/modules/${mod.id}`)}
              className="w-full text-left rounded-xl border bg-card hover:bg-accent/50 transition-colors p-5 flex items-center gap-4 group cursor-pointer"
            >
              <div className="shrink-0">
                {mod.completed ? (
                  <CheckCircle2 className="size-6 text-primary" />
                ) : (
                  <Circle className="size-6 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs text-muted-foreground font-mono">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span className="font-semibold text-sm truncate">{mod.title}</span>
                  {mod.completed && (
                    <span className="ml-auto text-xs text-primary font-medium shrink-0">
                      Completed
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-1">{mod.description}</p>
              </div>
              <ChevronRight className="size-4 text-muted-foreground shrink-0 group-hover:translate-x-0.5 transition-transform" />
            </button>
          ))}

          {modules.length === 0 && !isLoading && (
            <div className="text-center py-16 text-muted-foreground text-sm">
              No modules available yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
