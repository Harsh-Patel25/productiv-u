import React from 'react';
import { cn } from '@/utils/helpers';
import { Loader2 } from 'lucide-react';

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const variants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary', 
  danger: 'btn-danger',
  success: 'btn-success'
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2',
  lg: 'px-6 py-3 text-lg'
};

export function LoadingButton({
  loading = false,
  loadingText = 'Loading...',
  variant = 'primary',
  size = 'md',
  disabled,
  children,
  className,
  ...props
}: LoadingButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
      className={cn(
        variants[variant],
        sizes[size],
        'relative flex items-center justify-center gap-2 transition-all duration-200',
        (disabled || loading) && 'opacity-70 cursor-not-allowed',
        className
      )}
    >
      {loading && (
        <Loader2 
          className="w-4 h-4 animate-spin" 
          aria-hidden="true"
        />
      )}
      <span className={cn(loading && 'opacity-0')}>
        {children}
      </span>
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
          {loadingText}
        </span>
      )}
    </button>
  );
}
