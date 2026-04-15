import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { XIcon, ArrowRightIcon, ArrowLeftIcon } from 'lucide-react';

export interface TourStep {
  title: string;
  description: string;
  selector?: string;
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
      title: 'Dashboard',
      description:
        'This is your dashboard — a quick overview of your portfolio performance, recent activity, and open positions.',
      selector: undefined,
    },
    {
      title: 'Portfolio',
      description: 'View your cash balance, deployed options, and overall portfolio value here.',
      selector: 'a[href="/portfolio"]',
    },
    {
      title: 'Trade Stocks & Options',
      description:
        'Open a stock page and use the trade flow to buy or sell options contracts with your virtual cash.',
      selector: '[data-slot=sidebar] a[href^="/stock"]',
    },
    {
      title: 'Transactions',
      description:
        'View your full trade history, filter by symbol or type, and track every buy and sell you have made.',
      selector: 'a[href="/transactions"]',
    },
    {
      title: 'Learn',
      description: 'Browse educational modules to learn about options and trading strategies.',
      selector: 'a[href="/learn"]',
    },
  ];

  const tourSteps = steps ?? defaultSteps;
  const [index, setIndex] = useState(0);
  const step = tourSteps[index];

  useEffect(() => {
    if (!open) {
      setIndex(0);
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setIndex((i) => Math.min(tourSteps.length - 1, i + 1));
      if (e.key === 'ArrowLeft') setIndex((i) => Math.max(0, i - 1));
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const handleNext = () => {
    if (index >= tourSteps.length - 1) {
      onClose();
      onFinish?.();
      return;
    }
    setIndex((i) => i + 1);
  };

  const handlePrev = () => setIndex((i) => Math.max(0, i - 1));

  const [style, setStyle] = useState<React.CSSProperties | undefined>(undefined);
  const [highlightStyle, setHighlightStyle] = useState<React.CSSProperties | undefined>(undefined);

  type HighlightRect = {
    left: number;
    top: number;
    width: number;
    height: number;
    radius: number;
  };

  const [highlightRect, setHighlightRect] = useState<HighlightRect | undefined>(undefined);

  const [maskId] = useState(() => `platform-tour-mask-${Math.random().toString(36).slice(2, 9)}`);

  useEffect(() => {
    if (!open || !step?.selector) {
      setStyle(undefined);
      setHighlightStyle(undefined);
      setHighlightRect(undefined);
      return;
    }
    const el = document.querySelector(step.selector);
    if (!el) {
      setStyle(undefined);
      setHighlightStyle(undefined);
      setHighlightRect(undefined);
      return;
    }
    const rect = el.getBoundingClientRect();

    try {
      (el as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    } catch {
      /* ignore */
    }

    const comp = getComputedStyle(el as Element);
    const borderRadius = comp.borderRadius || '8px';
    const padding = 6;

    const highlight = {
      position: 'fixed',
      left: rect.left - padding,
      top: rect.top - padding,
      width: rect.width + padding * 2,
      height: rect.height + padding * 2,
      border: '2px solid rgba(59,130,246,0.95)',
      boxShadow: '0 0 0 4px rgba(59,130,246,0.2)',
      borderRadius,
      zIndex: 9999,
      pointerEvents: 'none',
    } as React.CSSProperties;

    setHighlightStyle(highlight);
    setHighlightRect({
      left: rect.left - padding,
      top: rect.top - padding,
      width: rect.width + padding * 2,
      height: rect.height + padding * 2,
      radius: parseFloat(borderRadius) || 8,
    });

    const spaceRight = window.innerWidth - rect.right;
    const cardWidth = Math.min(420, Math.max(300, window.innerWidth * 0.3));
    const top = Math.max(12, rect.top);

    if (spaceRight > cardWidth + 20) {
      setStyle({
        position: 'fixed',
        left: rect.right + 16,
        top,
        zIndex: 10000,
      });
    } else if (rect.top > 240) {
      setStyle({
        position: 'fixed',
        left: Math.max(12, rect.left),
        top: rect.top - 220,
        zIndex: 10000,
      });
    } else {
      setStyle({
        position: 'fixed',
        left: Math.max(12, rect.left),
        top: rect.bottom + 12,
        zIndex: 10000,
      });
    }
  }, [index, step, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0" style={{ zIndex: 9998 }}>
      {/* Dimmed overlay with cutout for highlighted element */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 9998 }}
        width="100%"
        height="100%"
      >
        <defs>
          <mask id={maskId}>
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {highlightRect && (
              <rect
                x={highlightRect.left}
                y={highlightRect.top}
                rx={highlightRect.radius}
                ry={highlightRect.radius}
                width={highlightRect.width}
                height={highlightRect.height}
                fill="black"
              />
            )}
          </mask>
        </defs>
        {/* Reduced opacity — was 0.65, now 0.35 so content is still visible */}
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(0,0,0,0.35)"
          mask={`url(#${maskId})`}
        />
      </svg>

      {/* Invisible click-to-close backdrop */}
      <div className="absolute inset-0" style={{ zIndex: 9998 }} onClick={onClose} />

      {/* Highlight border around target element */}
      {highlightStyle && <div style={{ ...highlightStyle, zIndex: 9999 }} aria-hidden />}

      {/* Tour card */}
      {style ? (
        <div style={{ ...style, zIndex: 10000 }}>
          <TourCard
            step={step}
            index={index}
            total={tourSteps.length}
            onPrev={handlePrev}
            onNext={handleNext}
            onClose={onClose}
          />
        </div>
      ) : (
        <div
          className="fixed inset-0 flex items-center justify-center pointer-events-none"
          style={{ zIndex: 10000 }}
        >
          <div className="pointer-events-auto">
            <TourCard
              step={step}
              index={index}
              total={tourSteps.length}
              onPrev={handlePrev}
              onNext={handleNext}
              onClose={onClose}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function TourCard({
  step,
  index,
  total,
  onPrev,
  onNext,
  onClose,
}: {
  step: TourStep;
  index: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
}) {
  return (
    <Card className="w-[min(420px,90vw)] shadow-xl">
      <div className="flex items-start justify-between p-4 pb-2">
        <div>
          <h3 className="text-lg font-semibold">{step.title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
        </div>
        <button
          onClick={onClose}
          aria-label="Close tour"
          className="text-muted-foreground hover:text-foreground transition-colors ml-3 shrink-0"
        >
          <XIcon className="size-4" />
        </button>
      </div>
      <CardContent className="pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onPrev} disabled={index === 0}>
              <ArrowLeftIcon className="size-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onNext}>
              {index === total - 1 ? 'Finish' : 'Next'}
              <ArrowRightIcon className="size-4 ml-1" />
            </Button>
          </div>
          <div className="text-xs text-muted-foreground">
            {index + 1} / {total}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default PlatformTour;
