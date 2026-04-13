import * as React from 'react';
import { cn } from '@/lib/utils';

type PageHeaderProps = {
  title?: React.ReactNode;
  children?: React.ReactNode;
  subtitle?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
};

const SIZE_MAP: Record<NonNullable<PageHeaderProps['size']>, string> = {
  sm: 'text-lg font-semibold',
  md: 'text-2xl font-bold',
  lg: 'text-3xl font-bold',
  xl: 'text-4xl font-bold',
};

export default function PageHeader({
  title,
  children,
  subtitle,
  size = 'md',
  className,
}: PageHeaderProps) {
  const content = title ?? children;

  return (
    <div>
      <h1 className={cn(`${SIZE_MAP[size]} tracking-tight`, className)}>{content}</h1>
      {subtitle && <p className="text-muted-foreground mt-2">{subtitle}</p>}
    </div>
  );
}
