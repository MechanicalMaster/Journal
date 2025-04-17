"use client"

import * as React from "react"

type ToastVariant = 'default' | 'success' | 'error' | 'destructive' | 'warning';

export interface ToastProps {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
  action?: React.ReactNode;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
}

interface ToastItem extends ToastProps {
  id: string;
}

export function useToast() {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const toast = React.useCallback(({ title, description, variant = 'default', duration = 3000, ...props }: ToastProps) => {
    const id = Math.random().toString(36).substring(2, 9);
    
    setToasts((prevToasts) => [
      ...prevToasts,
      { id, title, description, variant, duration, ...props },
    ]);

    return id;
  }, []);

  const dismiss = React.useCallback((id?: string) => {
    if (id) {
      setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
    } else {
      setToasts([]);
    }
  }, []);

  React.useEffect(() => {
    if (toasts.length === 0) return;

    const timers = toasts.map((toast) => {
      return setTimeout(() => {
        dismiss(toast.id);
      }, toast.duration);
    });

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [toasts, dismiss]);

  return { toast, dismiss, toasts };
}
