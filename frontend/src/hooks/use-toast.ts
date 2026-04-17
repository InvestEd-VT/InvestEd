import { toast as sonnerToast } from 'sonner';

interface ToastOptions {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

/**
 * Hook to show toast notifications using Sonner
 */
export const useToast = () => {
  const toast = (options: ToastOptions) => {
    const { title, description, variant = 'default' } = options;
    const message = title ? (description ? `${title}: ${description}` : title) : description;

    if (variant === 'destructive') {
      sonnerToast.error(message);
    } else {
      sonnerToast.success(message);
    }
  };

  return { toast };
};
