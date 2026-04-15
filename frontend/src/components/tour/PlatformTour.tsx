import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { XIcon, ArrowRightIcon, ArrowLeftIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TourStep {
  title: string;
  description: string;
  selector?: string; // optional CSS selector to point at
}

interface PlatformTourProps {
  open: boolean;
  onClose: () => void;
  onFinish?: () => void;
  steps?: TourStep[];
}

export function PlatformTour({ open, onClose, onFinish, steps }: PlatformTourProps) {
  const defaultSteps: TourStep[] = [
    {
      title: 'Your Portfolio',
      description: 'View your cash balance, deployed options, and overall portfolio value here.',
      selector: '[data-slot=card][data-slot~=card-header]'
    },
    {
      title: 'Trade Stocks & Options',
      description: 'Open a stock page and use the trade flow to buy or sell options.',
      selector: '[data-slot=sidebar] a[href^="/stock"]'
    },
    {
      title: 'Learn',
      description: 'Browse educational modules to learn about options and trading.',
      selector: 'a[href="/learn"]'
    },
  ];

  const tourSteps = steps ?? defaultSteps;
  const [index, setIndex] = useState(0);
  const step = tourSteps[index];

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setIndex((i) => Math.min(tourSteps.length - 1, i + 1));
      if (e.key === 'ArrowLeft') setIndex((i) => Math.max(0, i - 1));
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  const handleNext = () => {
    if (index >= tourSteps.length - 1) {
      onFinish?.();
      onClose();
      return;
    }
    setIndex((i) => i + 1);
  };

  const handlePrev = () => setIndex((i) => Math.max(0, i - 1));

  // Try to position near a target element if selector provided and render a highlight
  const [style, setStyle] = useState<React.CSSProperties | undefined>(undefined);
  const [highlightStyle, setHighlightStyle] = useState<React.CSSProperties | undefined>(
    undefined
  );
  const [highlightRect, setHighlightRect] = useState<
    | { left: number; top: number; width: number; height: number; radius: number }
    | undefined
  >(undefined);
  const [maskId] = useState(() => `platform-tour-mask-${Math.random().toString(36).slice(2, 9)}`);

  useEffect(() => {
    if (!step?.selector) {
      setStyle(undefined);
      setHighlightStyle(undefined);
      return;
    }
    const el = document.querySelector(step.selector!);
    if (!el) {
      setStyle(undefined);
      setHighlightStyle(undefined);
      return;
    }
    const rect = el.getBoundingClientRect();

    // Auto-scroll the target into view so the highlight is visible
    try {
      (el as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    } catch {
      /* ignore */
    }

    // Position the card to the right of the element if there is space, otherwise below
    const spaceRight = window.innerWidth - rect.right;
    const spaceBelow = window.innerHeight - rect.bottom;
    const cardWidth = Math.min(420, Math.max(300, window.innerWidth * 0.3));
    const top = Math.max(12, rect.top + window.scrollY);

    // Compute highlight styling (border + subtle glow)
    const comp = getComputedStyle(el as Element);
    const borderRadius = comp.borderRadius || '8px';
    const highlight = {
      position: 'absolute',
      left: rect.left + window.scrollX,
      top: rect.top + window.scrollY,
      width: rect.width,
      height: rect.height,
      border: '2px solid rgba(59,130,246,0.95)',
      boxShadow: '0 8px 24px rgba(0,0,0,0.25), 0 0 0 8px rgba(59,130,246,0.08)',
      borderRadius,
      zIndex: 1000,
      pointerEvents: 'none',
    } as React.CSSProperties;

    setHighlightStyle(highlight);
    setHighlightRect({ left: rect.left + window.scrollX, top: rect.top + window.scrollY, width: rect.width, height: rect.height, radius: parseFloat(borderRadius as string) || 8 });

    if (spaceRight > cardWidth + 20) {
      setStyle({ position: 'absolute', left: rect.right + 12 + window.scrollX, top: top, zIndex: 1002 });
    } else if (spaceBelow > 220) {
      setStyle({
        position: 'absolute',
        left: Math.max(12, rect.left + window.scrollX),
        top: rect.bottom + 12 + window.scrollY,
        zIndex: 1002,
      });
    } else {
      setStyle(undefined);
    }
  }, [index, step]);

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className={cn('fixed inset-0 flex items-center justify-center pointer-events-none')}>
        {/* If style defined, render floating card; otherwise center */}
        {/* Spotlight mask (dims page but leaves highlighted rect transparent) */}
        {highlightRect && (
          <svg
            className="absolute inset-0 w-screen h-screen pointer-events-none"
            width="100%"
            height="100%"
            viewBox={`0 0 ${window.innerWidth} ${window.innerHeight}`}
            aria-hidden
          >
            <defs>
              <mask id={maskId} x="0" y="0" width="100%" height="100%">
                <rect x="0" y="0" width="100%" height="100%" fill="white" />
                <rect
                  x={highlightRect.left}
                  y={highlightRect.top}
                  rx={highlightRect.radius}
                  ry={highlightRect.radius}
                  width={highlightRect.width}
                  height={highlightRect.height}
                  fill="black"
                />
              </mask>
            </defs>
            <rect x="0" y="0" width="100%" height="100%" fill="rgba(0,0,0,0.65)" mask={`url(#${maskId})`} />
          </svg>
        )}

        {/* Highlight box for the target element (if present) */}
        {highlightStyle && <div style={highlightStyle} className="rounded" aria-hidden />}
        <div style={style} className={cn('pointer-events-auto')}>
          <Card className="w-[min(420px,90vw)]">
            <div className="flex items-start justify-between p-4">
              <div>
                <h3 className="text-lg font-semibold">{step.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
              </div>
              <button onClick={onClose} aria-label="Close tour" className="text-muted-foreground">
                <XIcon />
              </button>
            </div>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" onClick={handlePrev} disabled={index === 0}>
                    <ArrowLeftIcon />
                  </Button>
                  <Button variant="ghost" onClick={handleNext}>
                    {index === tourSteps.length - 1 ? 'Finish' : 'Next'} <ArrowRightIcon />
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground">{index + 1} / {tourSteps.length}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default PlatformTour;
