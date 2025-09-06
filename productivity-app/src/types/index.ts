// Core data types for the productivity app

export type Priority = 'high' | 'medium' | 'low';
export type TaskStatus = 'pending' | 'completed' | 'overdue';
export type HabitFrequency = 'daily' | 'weekly';
export type ChallengeStatus = 'active' | 'completed' | 'paused';

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: string;
  priority: Priority;
  status: TaskStatus;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  reminder?: Date;
  tags: string[];
}

export interface TaskCategory {
  id: string;
  name: string;
  color: string;
  icon?: string;
  createdAt: Date;
}

export interface Habit {
  id: string;
  title: string;
  description?: string;
  frequency: HabitFrequency;
  targetCount: number; // For weekly habits, how many times per week
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  color: string;
  icon?: string;
  reminderTime?: string; // HH:MM format
  tags: string[];
}

export interface HabitEntry {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD format
  completed: boolean;
  notes?: string;
  createdAt: Date;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  status: ChallengeStatus;
  startDate: Date;
  endDate: Date;
  targetValue: number;
  currentValue: number;
  unit: string; // e.g., 'days', 'times', 'hours'
  category: string;
  color: string;
  icon?: string;
  rewards: string[];
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface ChallengeEntry {
  id: string;
  challengeId: string;
  date: string; // YYYY-MM-DD format
  value: number;
  notes?: string;
  createdAt: Date;
}

// Dashboard related types
export interface DashboardStats {
  today: {
    tasksCompleted: number;
    totalTasks: number;
    habitsCompleted: number;
    totalHabits: number;
    challengesActive: number;
  };
  week: {
    tasksCompleted: number;
    habitsCompleted: number;
    challengeProgress: number;
  };
  streaks: {
    currentStreak: number;
    longestStreak: number;
  };
}

// Notification types
export interface Notification {
  id: string;
  type: 'task' | 'habit' | 'challenge';
  title: string;
  message: string;
  targetId: string; // ID of the task, habit, or challenge
  scheduledFor: Date;
  sent: boolean;
  createdAt: Date;
}

// Search and filter types
export interface SearchFilters {
  query?: string;
  category?: string;
  priority?: Priority;
  status?: TaskStatus | ChallengeStatus;
  dateRange?: {
    start: Date;
    end: Date;
  };
  tags?: string[];
}

// Theme and preferences
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notificationsEnabled: boolean;
  defaultTaskCategory: string;
  startOfWeek: number; // 0 = Sunday, 1 = Monday
  timeFormat: '12h' | '24h';
  dateFormat: string;
  language: string;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Storage related types
export interface StorageData {
  tasks: Task[];
  habits: Habit[];
  habitEntries: HabitEntry[];
  challenges: Challenge[];
  challengeEntries: ChallengeEntry[];
  taskCategories: TaskCategory[];
  notifications: Notification[];
  preferences: UserPreferences;
  version: string;
  lastSyncAt?: Date;
}

// Component prop types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// Form related types
export interface TaskFormData {
  title: string;
  description: string;
  category: string;
  priority: Priority;
  dueDate: string;
  reminder: string;
  tags: string[];
}

export interface HabitFormData {
  title: string;
  description: string;
  frequency: HabitFrequency;
  targetCount: number;
  color: string;
  reminderTime: string;
  tags: string[];
}

export interface ChallengeFormData {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  targetValue: number;
  unit: string;
  category: string;
  color: string;
  rewards: string[];
}

// Chart data types for dashboard
export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface ProgressData {
  current: number;
  target: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
}

// Mobile navigation types
export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  badge?: number;
}
