import { format, isToday, isYesterday, isTomorrow, differenceInDays, endOfDay } from 'date-fns';
import type { Task, Challenge, Priority, TaskStatus } from '../types';
import { clsx, type ClassValue } from 'clsx';

// Class name utility
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// ID generation - Fixed collision bug
export function generateId(): string {
  // Use crypto.randomUUID if available (modern browsers)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Enhanced fallback with microsecond precision to prevent collisions
  const now = performance.now().toString(36);
  const random = Math.random().toString(36).substr(2);
  const counter = (Date.now() % 1000000).toString(36);
  
  return `${now}-${random}-${counter}`;
}

// Date formatting utilities
export function formatDate(date: Date, pattern: string = 'MMM dd, yyyy'): string {
  return format(date, pattern);
}

export function formatRelativeDate(date: Date): string {
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  if (isYesterday(date)) return 'Yesterday';
  
  const daysDiff = differenceInDays(date, new Date());
  if (daysDiff > 0 && daysDiff <= 7) {
    return `In ${daysDiff} day${daysDiff > 1 ? 's' : ''}`;
  }
  if (daysDiff < 0 && daysDiff >= -7) {
    return `${Math.abs(daysDiff)} day${Math.abs(daysDiff) > 1 ? 's' : ''} ago`;
  }
  
  return formatDate(date);
}

export function formatTime(date: Date, use24Hour: boolean = false): string {
  return format(date, use24Hour ? 'HH:mm' : 'h:mm a');
}

// Task utilities
export function getTaskStatus(task: Task): TaskStatus {
  if (task.status === 'completed') return 'completed';
  if (task.dueDate && task.dueDate < new Date()) return 'overdue';
  return 'pending';
}

export function getPriorityColor(priority: Priority): string {
  switch (priority) {
    case 'high': return 'text-red-600 bg-red-50 border-red-200';
    case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'low': return 'text-green-600 bg-green-50 border-green-200';
    default: return 'text-gray-600 bg-gray-50 border-gray-200';
  }
}

export function getPriorityIcon(priority: Priority): string {
  switch (priority) {
    case 'high': return '🔴';
    case 'medium': return '🟡';
    case 'low': return '🟢';
    default: return '⚪';
  }
}

export function sortTasksByPriority(tasks: Task[]): Task[] {
  const priorityOrder = { high: 3, medium: 2, low: 1 };
  return tasks.sort((a, b) => {
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
}

export function filterTasksForToday(tasks: Task[]): Task[] {
  const today = new Date();
  return tasks.filter(task => 
    task.status !== 'completed' && (
      !task.dueDate || 
      task.dueDate <= endOfDay(today)
    )
  );
}

// Habit utilities
export function getHabitStreak(habitId: string, entries: { habitId: string; date: string; completed: boolean }[]): number {
  const sortedEntries = entries
    .filter(entry => entry.habitId === habitId && entry.completed)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  if (sortedEntries.length === 0) return 0;
  
  let streak = 0;
  const today = format(new Date(), 'yyyy-MM-dd');
  let currentDate = today;
  
  for (const entry of sortedEntries) {
    if (entry.date === currentDate) {
      streak++;
      const date = new Date(currentDate);
      date.setDate(date.getDate() - 1);
      currentDate = format(date, 'yyyy-MM-dd');
    } else {
      break;
    }
  }
  
  return streak;
}

export function getHabitCompletionRate(habitId: string, entries: { habitId: string; date: string; completed: boolean }[], days: number = 30): number {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const relevantEntries = entries.filter(entry => {
    const entryDate = new Date(entry.date);
    return entry.habitId === habitId && entryDate >= startDate && entryDate <= endDate;
  });
  
  const completedEntries = relevantEntries.filter(entry => entry.completed);
  
  return relevantEntries.length > 0 ? (completedEntries.length / relevantEntries.length) * 100 : 0;
}

// Challenge utilities
export function getChallengeProgress(challenge: Challenge): number {
  if (challenge.targetValue === 0) return 0;
  return Math.min((challenge.currentValue / challenge.targetValue) * 100, 100);
}

export function getChallengeStatus(challenge: Challenge): 'active' | 'completed' | 'overdue' | 'upcoming' {
  const now = new Date();
  
  if (challenge.status === 'completed') return 'completed';
  if (challenge.startDate > now) return 'upcoming';
  if (challenge.endDate < now) return 'overdue';
  if (challenge.currentValue >= challenge.targetValue) return 'completed';
  
  return 'active';
}

export function getDaysUntilChallenge(challenge: Challenge): number {
  const now = new Date();
  if (challenge.startDate > now) {
    return differenceInDays(challenge.startDate, now);
  }
  return differenceInDays(challenge.endDate, now);
}

// Color utilities
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

export function getContrastColor(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return '#000000';
  
  const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  return brightness > 128 ? '#000000' : '#FFFFFF';
}

// Search utilities
export function searchItems<T extends { title: string; description?: string; tags?: string[] }>(
  items: T[],
  query: string
): T[] {
  if (!query.trim()) return items;
  
  const searchTerm = query.toLowerCase();
  
  return items.filter(item => 
    item.title.toLowerCase().includes(searchTerm) ||
    item.description?.toLowerCase().includes(searchTerm) ||
    item.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
  );
}

// Validation utilities
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Notification utilities
export function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return Promise.resolve('denied');
  }
  
  if (Notification.permission === 'granted') {
    return Promise.resolve('granted');
  }
  
  if (Notification.permission === 'denied') {
    return Promise.resolve('denied');
  }
  
  return Notification.requestPermission();
}

export function showNotification(title: string, options: NotificationOptions = {}): Notification | null {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return null;
  }
  
  return new Notification(title, {
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    ...options
  });
}

// Local storage utilities
export function getStorageUsage(): { used: number; available: number; percentage: number } {
  let used = 0;
  
  try {
    for (const key in localStorage) {
      if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
        used += localStorage[key].length + key.length;
      }
    }
  } catch (error) {
    console.error('Error calculating storage usage:', error);
  }
  
  // Most browsers have ~5-10MB limit for localStorage
  const available = 10 * 1024 * 1024; // 10MB estimate
  const percentage = (used / available) * 100;
  
  return { used, available, percentage };
}

// Performance utilities
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Device detection utilities
export function isMobile(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

export function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

export function isTouchDevice(): boolean {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

// Error handling utilities
export function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unknown error occurred';
}

export function logError(error: unknown, context?: string): void {
  const message = formatError(error);
  console.error(`Error ${context ? `in ${context}` : ''}: ${message}`, error);
}

// Animation utilities
export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
}

export function animateValue(
  start: number,
  end: number,
  duration: number,
  callback: (value: number) => void
): void {
  const startTime = performance.now();
  
  function animate(currentTime: number) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easeInOutCubic(progress);
    
    const currentValue = start + (end - start) * easedProgress;
    callback(currentValue);
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  }
  
  requestAnimationFrame(animate);
}
