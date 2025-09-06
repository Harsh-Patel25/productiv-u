import type { 
  Task, 
  Habit, 
  HabitEntry, 
  Challenge, 
  ChallengeEntry, 
  TaskCategory, 
  Notification, 
  UserPreferences, 
  StorageData 
} from '../types';

// Storage keys
const STORAGE_KEYS = {
  TASKS: 'productivity_tasks',
  HABITS: 'productivity_habits',
  HABIT_ENTRIES: 'productivity_habit_entries',
  CHALLENGES: 'productivity_challenges',
  CHALLENGE_ENTRIES: 'productivity_challenge_entries',
  TASK_CATEGORIES: 'productivity_task_categories',
  NOTIFICATIONS: 'productivity_notifications',
  PREFERENCES: 'productivity_preferences',
  VERSION: 'productivity_app_version',
  LAST_SYNC: 'productivity_last_sync'
} as const;

const CURRENT_VERSION = '1.0.0';

// Default data
const DEFAULT_TASK_CATEGORIES: TaskCategory[] = [
  { id: '1', name: 'Work', color: '#3B82F6', icon: 'briefcase', createdAt: new Date() },
  { id: '2', name: 'Study', color: '#8B5CF6', icon: 'book', createdAt: new Date() },
  { id: '3', name: 'Health', color: '#10B981', icon: 'heart', createdAt: new Date() },
  { id: '4', name: 'Personal', color: '#F59E0B', icon: 'user', createdAt: new Date() },
];

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'system',
  notificationsEnabled: true,
  defaultTaskCategory: '4', // Personal
  startOfWeek: 1, // Monday
  timeFormat: '12h',
  dateFormat: 'MM/dd/yyyy',
  language: 'en'
};

// Utility functions for date serialization/deserialization
const serializeDate = (date: Date | undefined): string | undefined => {
  return date ? date.toISOString() : undefined;
};

const deserializeDate = (dateString: string | undefined): Date | undefined => {
  return dateString ? new Date(dateString) : undefined;
};

// Generic storage interface - can be extended for different storage backends
interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
}

// localStorage adapter
class LocalStorageAdapter implements StorageAdapter {
  getItem(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  }

  setItem(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('Error writing to localStorage:', error);
      // Handle storage quota exceeded
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        this.cleanup();
        // Try again after cleanup
        try {
          localStorage.setItem(key, value);
        } catch (retryError) {
          console.error('Failed to save after cleanup:', retryError);
        }
      }
    }
  }

  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  }

  clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }

  private cleanup(): void {
    // Remove old notifications and completed tasks older than 30 days
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const tasks = this.loadTasks();
      const filteredTasks = tasks.filter(task => 
        task.status !== 'completed' || new Date(task.completedAt!) > thirtyDaysAgo
      );
      this.setItem(STORAGE_KEYS.TASKS, JSON.stringify(filteredTasks));

      const notifications = this.loadNotifications();
      const filteredNotifications = notifications.filter(notification =>
        !notification.sent || new Date(notification.scheduledFor) > thirtyDaysAgo
      );
      this.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(filteredNotifications));
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }

  private loadTasks(): Task[] {
    const data = this.getItem(STORAGE_KEYS.TASKS);
    if (!data) return [];
    
    try {
      const tasks = JSON.parse(data);
      return tasks.map((task: Record<string, unknown>) => ({
        ...task,
        dueDate: deserializeDate(task.dueDate as string),
        createdAt: new Date(task.createdAt as string),
        updatedAt: new Date(task.updatedAt as string),
        completedAt: deserializeDate(task.completedAt as string),
        reminder: deserializeDate(task.reminder as string),
      }));
    } catch {
      return [];
    }
  }

  private loadNotifications(): Notification[] {
    const data = this.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (!data) return [];
    
    try {
      const notifications = JSON.parse(data);
      return notifications.map((notification: Record<string, unknown>) => ({
        ...notification,
        scheduledFor: new Date(notification.scheduledFor as string),
        createdAt: new Date(notification.createdAt as string),
      }));
    } catch {
      return [];
    }
  }
}

// Storage manager class
class StorageManager {
  private adapter: StorageAdapter;

  constructor(adapter: StorageAdapter = new LocalStorageAdapter()) {
    this.adapter = adapter;
    this.initializeStorage();
  }

  private initializeStorage(): void {
    const version = this.adapter.getItem(STORAGE_KEYS.VERSION);
    if (version !== CURRENT_VERSION) {
      this.runMigrations(version);
      this.adapter.setItem(STORAGE_KEYS.VERSION, CURRENT_VERSION);
    }

    // Initialize default data if not exists
    if (!this.adapter.getItem(STORAGE_KEYS.TASK_CATEGORIES)) {
      this.saveTaskCategories(DEFAULT_TASK_CATEGORIES);
    }
    if (!this.adapter.getItem(STORAGE_KEYS.PREFERENCES)) {
      this.savePreferences(DEFAULT_PREFERENCES);
    }
  }

  private runMigrations(fromVersion: string | null): void {
    // Handle data migrations between versions
    console.log(`Migrating from version ${fromVersion || 'unknown'} to ${CURRENT_VERSION}`);
    
    // Example migration logic
    if (!fromVersion) {
      // First time setup - no migration needed
      return;
    }
    
    // Add future migration logic here
    // if (fromVersion === '0.9.0') {
    //   // Migrate from v0.9.0 to v1.0.0
    // }
  }

  // Tasks
  loadTasks(): Task[] {
    const data = this.adapter.getItem(STORAGE_KEYS.TASKS);
    if (!data) return [];
    
    try {
      const tasks = JSON.parse(data);
      return tasks.map((task: Record<string, unknown>) => ({
        ...task,
        dueDate: deserializeDate(task.dueDate as string),
        createdAt: new Date(task.createdAt as string),
        updatedAt: new Date(task.updatedAt as string),
        completedAt: deserializeDate(task.completedAt as string),
        reminder: deserializeDate(task.reminder as string),
      }));
    } catch {
      return [];
    }
  }

  saveTasks(tasks: Task[]): void {
    const serializedTasks = tasks.map(task => ({
      ...task,
      dueDate: serializeDate(task.dueDate),
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
      completedAt: serializeDate(task.completedAt),
      reminder: serializeDate(task.reminder),
    }));
    this.adapter.setItem(STORAGE_KEYS.TASKS, JSON.stringify(serializedTasks));
  }

  // Habits
  loadHabits(): Habit[] {
    const data = this.adapter.getItem(STORAGE_KEYS.HABITS);
    if (!data) return [];
    
    try {
      const habits = JSON.parse(data);
      return habits.map((habit: Record<string, unknown>) => ({
        ...habit,
        createdAt: new Date(habit.createdAt as string),
        updatedAt: new Date(habit.updatedAt as string),
      }));
    } catch {
      return [];
    }
  }

  saveHabits(habits: Habit[]): void {
    const serializedHabits = habits.map(habit => ({
      ...habit,
      createdAt: habit.createdAt.toISOString(),
      updatedAt: habit.updatedAt.toISOString(),
    }));
    this.adapter.setItem(STORAGE_KEYS.HABITS, JSON.stringify(serializedHabits));
  }

  // Habit Entries
  loadHabitEntries(): HabitEntry[] {
    const data = this.adapter.getItem(STORAGE_KEYS.HABIT_ENTRIES);
    if (!data) return [];
    
    try {
      const entries = JSON.parse(data);
      return entries.map((entry: Record<string, unknown>) => ({
        ...entry,
        createdAt: new Date(entry.createdAt as string),
      }));
    } catch {
      return [];
    }
  }

  saveHabitEntries(entries: HabitEntry[]): void {
    const serializedEntries = entries.map(entry => ({
      ...entry,
      createdAt: entry.createdAt.toISOString(),
    }));
    this.adapter.setItem(STORAGE_KEYS.HABIT_ENTRIES, JSON.stringify(serializedEntries));
  }

  // Challenges
  loadChallenges(): Challenge[] {
    const data = this.adapter.getItem(STORAGE_KEYS.CHALLENGES);
    if (!data) return [];
    
    try {
      const challenges = JSON.parse(data);
      return challenges.map((challenge: Record<string, unknown>) => ({
        ...challenge,
        startDate: new Date(challenge.startDate as string),
        endDate: new Date(challenge.endDate as string),
        createdAt: new Date(challenge.createdAt as string),
        updatedAt: new Date(challenge.updatedAt as string),
        completedAt: deserializeDate(challenge.completedAt as string),
      }));
    } catch {
      return [];
    }
  }

  saveChallenges(challenges: Challenge[]): void {
    const serializedChallenges = challenges.map(challenge => ({
      ...challenge,
      startDate: challenge.startDate.toISOString(),
      endDate: challenge.endDate.toISOString(),
      createdAt: challenge.createdAt.toISOString(),
      updatedAt: challenge.updatedAt.toISOString(),
      completedAt: serializeDate(challenge.completedAt),
    }));
    this.adapter.setItem(STORAGE_KEYS.CHALLENGES, JSON.stringify(serializedChallenges));
  }

  // Challenge Entries
  loadChallengeEntries(): ChallengeEntry[] {
    const data = this.adapter.getItem(STORAGE_KEYS.CHALLENGE_ENTRIES);
    if (!data) return [];
    
    try {
      const entries = JSON.parse(data);
      return entries.map((entry: Record<string, unknown>) => ({
        ...entry,
        createdAt: new Date(entry.createdAt as string),
      }));
    } catch {
      return [];
    }
  }

  saveChallengeEntries(entries: ChallengeEntry[]): void {
    const serializedEntries = entries.map(entry => ({
      ...entry,
      createdAt: entry.createdAt.toISOString(),
    }));
    this.adapter.setItem(STORAGE_KEYS.CHALLENGE_ENTRIES, JSON.stringify(serializedEntries));
  }

  // Task Categories
  loadTaskCategories(): TaskCategory[] {
    const data = this.adapter.getItem(STORAGE_KEYS.TASK_CATEGORIES);
    if (!data) return DEFAULT_TASK_CATEGORIES;
    
    try {
      const categories = JSON.parse(data);
      return categories.map((category: Record<string, unknown>) => ({
        ...category,
        createdAt: new Date(category.createdAt as string),
      }));
    } catch {
      return DEFAULT_TASK_CATEGORIES;
    }
  }

  saveTaskCategories(categories: TaskCategory[]): void {
    const serializedCategories = categories.map(category => ({
      ...category,
      createdAt: category.createdAt.toISOString(),
    }));
    this.adapter.setItem(STORAGE_KEYS.TASK_CATEGORIES, JSON.stringify(serializedCategories));
  }

  // Notifications
  loadNotifications(): Notification[] {
    const data = this.adapter.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (!data) return [];
    
    try {
      const notifications = JSON.parse(data);
      return notifications.map((notification: Record<string, unknown>) => ({
        ...notification,
        scheduledFor: new Date(notification.scheduledFor as string),
        createdAt: new Date(notification.createdAt as string),
      }));
    } catch {
      return [];
    }
  }

  saveNotifications(notifications: Notification[]): void {
    const serializedNotifications = notifications.map(notification => ({
      ...notification,
      scheduledFor: notification.scheduledFor.toISOString(),
      createdAt: notification.createdAt.toISOString(),
    }));
    this.adapter.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(serializedNotifications));
  }

  // Preferences
  loadPreferences(): UserPreferences {
    const data = this.adapter.getItem(STORAGE_KEYS.PREFERENCES);
    if (!data) return DEFAULT_PREFERENCES;
    
    try {
      return { ...DEFAULT_PREFERENCES, ...JSON.parse(data) };
    } catch {
      return DEFAULT_PREFERENCES;
    }
  }

  savePreferences(preferences: UserPreferences): void {
    this.adapter.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(preferences));
  }

  // Bulk operations
  exportData(): StorageData {
    return {
      tasks: this.loadTasks(),
      habits: this.loadHabits(),
      habitEntries: this.loadHabitEntries(),
      challenges: this.loadChallenges(),
      challengeEntries: this.loadChallengeEntries(),
      taskCategories: this.loadTaskCategories(),
      notifications: this.loadNotifications(),
      preferences: this.loadPreferences(),
      version: CURRENT_VERSION,
      lastSyncAt: new Date()
    };
  }

  importData(data: StorageData): void {
    try {
      if (data.tasks) this.saveTasks(data.tasks);
      if (data.habits) this.saveHabits(data.habits);
      if (data.habitEntries) this.saveHabitEntries(data.habitEntries);
      if (data.challenges) this.saveChallenges(data.challenges);
      if (data.challengeEntries) this.saveChallengeEntries(data.challengeEntries);
      if (data.taskCategories) this.saveTaskCategories(data.taskCategories);
      if (data.notifications) this.saveNotifications(data.notifications);
      if (data.preferences) this.savePreferences(data.preferences);
      
      this.adapter.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
    } catch (error) {
      console.error('Error importing data:', error);
      throw new Error('Failed to import data');
    }
  }

  clearAllData(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      this.adapter.removeItem(key);
    });
  }

  getStorageSize(): number {
    let total = 0;
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        const item = this.adapter.getItem(key);
        if (item) {
          total += item.length;
        }
      });
    } catch (error) {
      console.error('Error calculating storage size:', error);
    }
    return total;
  }
}

// Singleton instance
export const storageManager = new StorageManager();

// Export for testing or custom implementations
export { StorageManager, LocalStorageAdapter, STORAGE_KEYS };
