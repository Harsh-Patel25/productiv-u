// Form validation utilities
export interface ValidationRule<T = any> {
  message: string;
  validate: (value: T) => boolean;
}

export interface FieldError {
  message: string;
  type: string;
}

export interface ValidationSchema {
  [key: string]: ValidationRule[];
}

export class FormValidator {
  private schema: ValidationSchema;
  private errors: Record<string, FieldError> = {};

  constructor(schema: ValidationSchema) {
    this.schema = schema;
  }

  // Validate a single field
  validateField(name: string, value: any): FieldError | null {
    const rules = this.schema[name];
    if (!rules) return null;

    for (const rule of rules) {
      if (!rule.validate(value)) {
        const error = { message: rule.message, type: 'validation' };
        this.errors[name] = error;
        return error;
      }
    }

    delete this.errors[name];
    return null;
  }

  // Validate all fields
  validateAll(data: Record<string, any>): Record<string, FieldError> {
    this.errors = {};

    Object.keys(this.schema).forEach(fieldName => {
      this.validateField(fieldName, data[fieldName]);
    });

    return this.errors;
  }

  // Get current errors
  getErrors(): Record<string, FieldError> {
    return this.errors;
  }

  // Check if form is valid
  isValid(): boolean {
    return Object.keys(this.errors).length === 0;
  }
}

// Common validation rules
export const ValidationRules = {
  required: (message: string = 'This field is required'): ValidationRule => ({
    message,
    validate: (value: any) => value !== null && value !== undefined && value !== ''
  }),

  minLength: (min: number, message?: string): ValidationRule => ({
    message: message || `Must be at least ${min} characters`,
    validate: (value: string) => !value || value.length >= min
  }),

  maxLength: (max: number, message?: string): ValidationRule => ({
    message: message || `Must be no more than ${max} characters`,
    validate: (value: string) => !value || value.length <= max
  }),

  email: (message: string = 'Must be a valid email'): ValidationRule => ({
    message,
    validate: (value: string) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  }),

  pattern: (regex: RegExp, message: string): ValidationRule => ({
    message,
    validate: (value: string) => !value || regex.test(value)
  }),

  dateRange: (min?: Date, max?: Date, message?: string): ValidationRule => ({
    message: message || 'Date is out of range',
    validate: (value: string | Date) => {
      if (!value) return true;
      const date = new Date(value);
      if (min && date < min) return false;
      if (max && date > max) return false;
      return true;
    }
  }),

  custom: (validateFn: (value: any) => boolean, message: string): ValidationRule => ({
    message,
    validate: validateFn
  })
};

// Task form validation schema
export const taskValidationSchema: ValidationSchema = {
  title: [
    ValidationRules.required('Task title is required'),
    ValidationRules.minLength(3, 'Title must be at least 3 characters'),
    ValidationRules.maxLength(100, 'Title must be less than 100 characters')
  ],
  description: [
    ValidationRules.maxLength(500, 'Description must be less than 500 characters')
  ],
  category: [
    ValidationRules.required('Please select a category')
  ],
  dueDate: [
    ValidationRules.dateRange(
      new Date(), 
      new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      'Due date must be between today and one year from now'
    )
  ]
};

// Habit form validation schema
export const habitValidationSchema: ValidationSchema = {
  title: [
    ValidationRules.required('Habit title is required'),
    ValidationRules.minLength(3, 'Title must be at least 3 characters'),
    ValidationRules.maxLength(80, 'Title must be less than 80 characters')
  ],
  targetCount: [
    ValidationRules.required('Target count is required'),
    ValidationRules.custom((value) => Number(value) > 0, 'Target count must be greater than 0'),
    ValidationRules.custom((value) => Number(value) <= 50, 'Target count must be 50 or less')
  ]
};

// Challenge form validation schema
export const challengeValidationSchema: ValidationSchema = {
  title: [
    ValidationRules.required('Challenge title is required'),
    ValidationRules.minLength(5, 'Title must be at least 5 characters'),
    ValidationRules.maxLength(120, 'Title must be less than 120 characters')
  ],
  description: [
    ValidationRules.required('Challenge description is required'),
    ValidationRules.minLength(10, 'Description must be at least 10 characters'),
    ValidationRules.maxLength(300, 'Description must be less than 300 characters')
  ],
  targetValue: [
    ValidationRules.required('Target value is required'),
    ValidationRules.custom((value) => Number(value) > 0, 'Target value must be greater than 0')
  ],
  startDate: [
    ValidationRules.required('Start date is required')
  ],
  endDate: [
    ValidationRules.required('End date is required')
  ]
};
