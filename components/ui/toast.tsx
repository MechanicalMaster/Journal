"use client"

import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

// Toast types and interfaces
type ToastVariant = 'default' | 'success' | 'error' | 'destructive' | 'warning';

interface ToastProps {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastItem extends ToastProps {
  id: string;
}

// Create context for toast functionality
type ToastContextType = {
  toast: (props: ToastProps) => string;
  dismiss: (id: string) => void;
  toasts: ToastItem[];
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Toast provider component
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = useCallback(({ title, description, variant = 'default', duration = 3000 }: ToastProps) => {
    const id = Math.random().toString(36).substring(2, 9);
    
    setToasts((prevToasts) => [
      ...prevToasts,
      { id, title, description, variant, duration },
    ]);

    return id;
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  useEffect(() => {
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

  return (
    <ToastContext.Provider value={{ toast, dismiss, toasts }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

// Hook to use toast functionality
export function useToast() {
  const context = useContext(ToastContext);
  
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  
  return context;
}

// Toast container component
function ToastContainer() {
  const { toasts, dismiss } = useToast();
  
  return (
    <div className="fixed bottom-0 right-0 z-50 flex flex-col items-end p-4 gap-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={() => dismiss(toast.id)} />
      ))}
    </div>
  );
}

// Individual toast component
function Toast({ id, title, description, variant = 'default', onClose }: ToastItem & { onClose: () => void }) {
  return (
    <div
      className={cn(
        'relative flex w-full max-w-md overflow-hidden rounded-lg p-4 shadow-lg transition-all',
        'animate-in slide-in-from-right-full',
        {
          'bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100': variant === 'default',
          'bg-green-100 text-green-900 dark:bg-green-800 dark:text-green-100': variant === 'success',
          'bg-red-100 text-red-900 dark:bg-red-800 dark:text-red-100': variant === 'error' || variant === 'destructive',
          'bg-yellow-100 text-yellow-900 dark:bg-yellow-800 dark:text-yellow-100': variant === 'warning',
        }
      )}
    >
      <div className="flex-1">
        <h3 className="font-medium">{title}</h3>
        {description && <p className="mt-1 text-sm opacity-90">{description}</p>}
      </div>
      <button
        onClick={onClose}
        className="ml-4 inline-flex h-6 w-6 items-center justify-center rounded-md text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </button>
    </div>
  );
}

export type { ToastProps };
