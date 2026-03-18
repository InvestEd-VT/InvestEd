import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';

import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  size?: 'sm' | 'md' | 'lg'; // optional if you want different sizes
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, asChild = false, size = 'md', ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';

    // Base styling for all buttons
    let baseStyles = `
      inline-flex items-center justify-center gap-2 whitespace-nowrap
      rounded-md text-sm font-medium transition-colors
      focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring
      disabled:pointer-events-none disabled:opacity-50
      h-9 px-4 py-2 bg-primary text-primary-foreground shadow hover:bg-primary/90
    `;

    // Optional: size overrides
    if (size === 'sm') baseStyles += ' h-8 px-3 text-xs';
    if (size === 'lg') baseStyles += ' h-10 px-8';

    return <Comp className={cn(baseStyles, className)} ref={ref} {...props} />;
  }
);

Button.displayName = 'Button';

export { Button };
