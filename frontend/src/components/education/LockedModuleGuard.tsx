import { Navigate, useParams } from 'react-router-dom';
import { useEducationStore } from '@/store/educationStore';

interface LockedModuleGuardProps {
  children: React.ReactNode;
}

export default function LockedModuleGuard({ children }: LockedModuleGuardProps) {
  const { id } = useParams<{ id: string }>();
  const modules = useEducationStore((s) => s.modules);

  // If modules haven't loaded yet let the child render — the layout
  // fetches modules before this guard is ever reached
  if (modules.length === 0) return <>{children}</>;

  const current = modules.find((m) => m.id === id);

  // Unknown module — let ModuleRouter handle the redirect
  if (!current) return <>{children}</>;

  // First module is always unlocked
  if (current.order === 1) return <>{children}</>;

  const previous = modules.find((m) => m.order === current.order - 1);
  const isLocked = !previous?.completed;

  if (isLocked) return <Navigate to="/learn" replace />;

  return <>{children}</>;
}
