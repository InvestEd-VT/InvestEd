import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEducationStore } from '@/store/educationStore';
import { ArrowLeft, ArrowRight, CheckCircle2, Lock } from 'lucide-react';

interface ModuleNavigationProps {
  moduleId: string;
}

export default function ModuleNavigation({ moduleId }: ModuleNavigationProps) {
  const navigate = useNavigate();
  const { modules, markComplete } = useEducationStore();
  const [completing, setCompleting] = useState(false);

  const currentMod = modules.find((m) => m.id === moduleId);
  const nextMod = modules.find((m) => m.order === (currentMod?.order ?? 0) + 1);
  const isCompleted = currentMod?.completed ?? false;
  const isLastModule = !nextMod;

  const handleComplete = async () => {
    if (!moduleId || isCompleted || completing) return;
    setCompleting(true);
    await markComplete(moduleId);
    setCompleting(false);
  };

  const handleNext = () => {
    if (nextMod) {
      window.scrollTo(0, 0);
      navigate(`/learn/modules/${nextMod.id}`);
    }
  };

  return (
    <div className="flex items-center justify-between mt-8">
      {/* Back to Learn */}
      <button
        onClick={() => navigate('/learn')}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to Learn
      </button>

      {/* Mark as Complete */}
      <button
        onClick={handleComplete}
        disabled={isCompleted || completing}
        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all
          ${
            isCompleted
              ? 'bg-primary/10 text-primary cursor-default'
              : 'bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 cursor-pointer'
          }`}
      >
        {isCompleted ? (
          <>
            <CheckCircle2 className="size-4" />
            Completed
          </>
        ) : completing ? (
          'Saving...'
        ) : (
          'Mark as Complete'
        )}
      </button>

      {/* Next Module */}
      {!isLastModule && (
        <button
          onClick={handleNext}
          disabled={!isCompleted}
          className={`flex items-center gap-1.5 text-sm transition-colors
            ${
              isCompleted
                ? 'text-muted-foreground hover:text-foreground'
                : 'text-muted-foreground/40 cursor-not-allowed'
            }`}
        >
          {isCompleted ? (
            <>
              Next Module
              <ArrowRight className="size-4" />
            </>
          ) : (
            <>
              <Lock className="size-3.5" />
              Next Module
            </>
          )}
        </button>
      )}

      {/* Spacer when last module so Mark as Complete stays centered */}
      {isLastModule && <div className="w-24" />}
    </div>
  );
}
