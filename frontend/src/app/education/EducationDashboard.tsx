import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEducationStore } from '@/store/educationStore';
import { CheckCircle2, Circle, BookOpen, ChevronRight, Lock } from 'lucide-react';

const LOCKED_MSG_COOLDOWN = 4000;

export default function EducationDashboard() {
  const navigate = useNavigate();
  const { modules, isLoading, error } = useEducationStore();

  const [lockedMsg, setLockedMsg] = useState<string | null>(null);
  const lastShownAt = useRef<number>(0);
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const completed = modules.filter((m) => m.completed).length;

  const isModuleLocked = (order: number) => {
    if (order === 1) return false;
    const prev = modules.find((m) => m.order === order - 1);
    return !prev?.completed;
  };

  const handleLockedClick = (moduleOrder: number) => {
    const now = window.Date.now();
    if (now - lastShownAt.current < LOCKED_MSG_COOLDOWN) return;
    lastShownAt.current = now;

    const prev = modules.find((m) => m.order === moduleOrder - 1);
    setLockedMsg(`Complete "${prev?.title}" to unlock this module`);

    if (dismissTimer.current) clearTimeout(dismissTimer.current);
    dismissTimer.current = setTimeout(() => setLockedMsg(null), 3000);
  };

  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="size-6 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">Learn</h1>
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

      {/* Locked message */}
      {lockedMsg && (
        <div className="mb-4 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-2.5 flex items-center gap-2 text-sm text-yellow-700 dark:text-yellow-400 transition-all">
          <Lock className="size-3.5 shrink-0" />
          {lockedMsg}
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
          {modules.map((mod, idx) => {
            const locked = isModuleLocked(mod.order);
            return (
              <button
                key={mod.id}
                onClick={() =>
                  locked ? handleLockedClick(mod.order) : navigate(`/learn/modules/${mod.id}`)
                }
                className={`w-full text-left rounded-xl border bg-card p-5 flex items-center gap-4 group transition-colors
                  ${locked ? 'opacity-60 cursor-not-allowed' : 'hover:bg-accent/50 cursor-pointer'}`}
              >
                <div className="shrink-0">
                  {mod.completed ? (
                    <CheckCircle2 className="size-6 text-primary" />
                  ) : locked ? (
                    <Lock className="size-6 text-muted-foreground" />
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
                {!locked && (
                  <ChevronRight className="size-4 text-muted-foreground shrink-0 group-hover:translate-x-0.5 transition-transform" />
                )}
              </button>
            );
          })}

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
