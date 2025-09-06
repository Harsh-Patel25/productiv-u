import toast, { 
  Toaster as HotToaster, 
  type Toast as HotToast,
  resolveValue
} from 'react-hot-toast';
import { 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  X, 
  AlertTriangle 
} from 'lucide-react';
import { cn } from '@/utils/helpers';

// Toast notification service
export const toastService = {
  success: (message: string, options?: any) => {
    toast.success(message, {
      duration: 4000,
      position: 'top-right',
      ...options,
    });
  },

  error: (message: string, options?: any) => {
    toast.error(message, {
      duration: 5000,
      position: 'top-right',
      ...options,
    });
  },

  info: (message: string, options?: any) => {
    toast(message, {
      duration: 4000,
      position: 'top-right',
      icon: <Info className="w-5 h-5 text-blue-500" />,
      ...options,
    });
  },

  warning: (message: string, options?: any) => {
    toast(message, {
      duration: 4000,
      position: 'top-right',
      icon: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
      ...options,
    });
  },

  loading: (message: string, options?: any) => {
    return toast.loading(message, {
      position: 'top-right',
      ...options,
    });
  },

  dismiss: (toastId?: string) => {
    toast.dismiss(toastId);
  },

  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    },
    options?: any
  ) => {
    return toast.promise(promise, messages, {
      position: 'top-right',
      ...options,
    });
  },
};

// Custom toast icons
const ToastIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'success':
      return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    case 'error':
      return <AlertCircle className="w-5 h-5 text-red-500" />;
    case 'loading':
      return (
        <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
      );
    default:
      return <Info className="w-5 h-5 text-blue-500" />;
  }
};

// Custom Toaster component
export function Toaster() {
  return (
    <HotToaster
      position="top-right"
      gutter={8}
      containerClassName="z-50"
      toastOptions={{
        duration: 4000,
        className: '',
        style: {
          background: 'transparent',
          boxShadow: 'none',
          padding: 0,
          margin: 0,
        },
      }}
    >
      {(t: HotToast) => (
        <div
          className={cn(
            'flex items-center gap-3 p-4 rounded-lg shadow-lg border transition-all duration-300 transform',
            'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700',
            'max-w-md w-full',
            t.visible ? 'animate-slide-down opacity-100 scale-100' : 'animate-slide-up opacity-0 scale-95'
          )}
        >
          {/* Icon */}
          <div className="flex-shrink-0">
            {t.icon || <ToastIcon type={t.type} />}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {resolveValue(t.message, t)}
            </div>
          </div>

          {/* Dismiss button */}
          <button
            onClick={() => toast.dismiss(t.id)}
            className="flex-shrink-0 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
      )}
    </HotToaster>
  );
}

// Utility hook for toast notifications
export function useToast() {
  return {
    toast: toastService,
    success: toastService.success,
    error: toastService.error,
    info: toastService.info,
    warning: toastService.warning,
    loading: toastService.loading,
    dismiss: toastService.dismiss,
    promise: toastService.promise,
  };
}
