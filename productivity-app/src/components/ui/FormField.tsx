import React, { forwardRef, useId } from 'react';
import { cn } from '@/utils/helpers';
import { AlertCircle, Check } from 'lucide-react';

// Type for input elements with accessible props
type InputElement = React.ReactElement<{
  id?: string;
  className?: string;
  [key: string]: any;
}>;

interface FormFieldProps {
  label: string;
  error?: string;
  success?: string;
  hint?: string;
  required?: boolean;
  children: InputElement;
  className?: string;
}

export const FormField = forwardRef<HTMLDivElement, FormFieldProps>(
  ({ label, error, success, hint, required, children, className }, ref) => {
    const id = useId();
    const fieldId = children.props.id || `field-${id}`;
    const errorId = error ? `error-${id}` : undefined;
    const hintId = hint ? `hint-${id}` : undefined;

    // Clone the child element to add accessibility attributes
    const childWithProps = React.cloneElement(children, {
      id: fieldId,
      'aria-invalid': !!error,
      'aria-describedby': [errorId, hintId].filter(Boolean).join(' ') || undefined,
      'aria-required': required,
      className: cn(
        children.props.className,
        error && 'border-red-300 focus:border-red-300 focus:ring-red-200',
        success && 'border-green-300 focus:border-green-300 focus:ring-green-200'
      )
    });

    return (
      <div ref={ref} className={cn('space-y-2', className)}>
        <label
          htmlFor={fieldId}
          className={cn(
            'block text-sm font-medium',
            error ? 'text-red-700 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'
          )}
        >
          {label}
          {required && (
            <span className="text-red-500 ml-1" aria-label="required">*</span>
          )}
        </label>

        {childWithProps}

        {hint && (
          <p id={hintId} className="text-sm text-gray-600 dark:text-gray-400">
            {hint}
          </p>
        )}

        {error && (
          <p
            id={errorId}
            role="alert"
            aria-live="polite"
            className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </p>
        )}

        {success && (
          <p
            role="status"
            aria-live="polite"
            className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400"
          >
            <Check className="w-4 h-4 flex-shrink-0" />
            {success}
          </p>
        )}
      </div>
    );
  }
);

FormField.displayName = 'FormField';
