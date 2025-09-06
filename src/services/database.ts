import type { 
  Task, 
  Habit, 
  HabitEntry, 
  Challenge, 
  ChallengeEntry, 
  TaskCategory, 
  UserPreferences, 
  StorageData 
} from '@/types';

// Abstract database interface
export interface DatabaseAdapter {
  // Tasks
  getTasks(): Promise<Task[]>;
  createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task>;
  updateTask(id: string, updates: Partial<Task>): Promise<Task>;
  deleteTask(id: string): Promise<void>;

  // Habits
  getHabits(): Promise<Habit[]>;
  createHabit(habit: Omit<Habit, 'id' | 'createdAt' | 'updatedAt'>): Promise<Habit>;
  updateHabit(id: string, updates: Partial<Habit>): Promise<Habit>;
  deleteHabit(id: string): Promise<void>;

  // Habit Entries
  getHabitEntries(): Promise<HabitEntry[]>;
  createHabitEntry(entry: Omit<HabitEntry, 'id' | 'createdAt'>): Promise<HabitEntry>;
  updateHabitEntry(id: string, updates: Partial<HabitEntry>): Promise<HabitEntry>;
  deleteHabitEntry(id: string): Promise<void>;

  // Challenges
  getChallenges(): Promise<Challenge[]>;
  createChallenge(challenge: Omit<Challenge, 'id' | 'createdAt' | 'updatedAt'>): Promise<Challenge>;
  updateChallenge(id: string, updates: Partial<Challenge>): Promise<Challenge>;
  deleteChallenge(id: string): Promise<void>;

  // Challenge Entries
  getChallengeEntries(): Promise<ChallengeEntry[]>;
  createChallengeEntry(entry: Omit<ChallengeEntry, 'id' | 'createdAt'>): Promise<ChallengeEntry>;
  
  // Categories
  getTaskCategories(): Promise<TaskCategory[]>;
  createTaskCategory(category: Omit<TaskCategory, 'id' | 'createdAt'>): Promise<TaskCategory>;
  
  // Preferences
  getPreferences(): Promise<UserPreferences>;
  updatePreferences(preferences: Partial<UserPreferences>): Promise<UserPreferences>;

  // Bulk operations
  exportData(): Promise<StorageData>;
  importData(data: StorageData): Promise<void>;
  clearData(): Promise<void>;
}

// Local Storage Adapter (current implementation)
export class LocalStorageAdapter implements DatabaseAdapter {
  private storage: Storage;

  constructor() {
    this.storage = localStorage;
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Tasks implementation
  async getTasks(): Promise<Task[]> {
    const data = this.storage.getItem('productivity_tasks');
    if (!data) return [];
    
    try {
      const tasks = JSON.parse(data);
      return tasks.map((task: any) => ({
        ...task,
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt),
        completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
        reminder: task.reminder ? new Date(task.reminder) : undefined,
      }));
    } catch {
      return [];
    }
  }

  async createTask(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    const tasks = await this.getTasks();
    const newTask: Task = {
      ...taskData,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    tasks.push(newTask);
    await this.saveTasks(tasks);
    return newTask;
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    const tasks = await this.getTasks();
    const index = tasks.findIndex(task => task.id === id);
    
    if (index === -1) {
      throw new Error('Task not found');
    }
    
    tasks[index] = { ...tasks[index], ...updates, updatedAt: new Date() };
    await this.saveTasks(tasks);
    return tasks[index];
  }

  async deleteTask(id: string): Promise<void> {
    const tasks = await this.getTasks();
    const filteredTasks = tasks.filter(task => task.id !== id);
    await this.saveTasks(filteredTasks);
  }

  private async saveTasks(tasks: Task[]): Promise<void> {
    const serializedTasks = tasks.map(task => ({
      ...task,
      dueDate: task.dueDate?.toISOString(),
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
      completedAt: task.completedAt?.toISOString(),
      reminder: task.reminder?.toISOString(),
    }));
    
    this.storage.setItem('productivity_tasks', JSON.stringify(serializedTasks));
  }

  // Habits implementation
  async getHabits(): Promise<Habit[]> {
    const data = this.storage.getItem('productivity_habits');
    if (!data) return [];
    
    try {
      const habits = JSON.parse(data);
      return habits.map((habit: any) => ({
        ...habit,
        createdAt: new Date(habit.createdAt),
        updatedAt: new Date(habit.updatedAt),
      }));
    } catch {
      return [];
    }
  }

  async createHabit(habitData: Omit<Habit, 'id' | 'createdAt' | 'updatedAt'>): Promise<Habit> {
    const habits = await this.getHabits();
    const newHabit: Habit = {
      ...habitData,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    habits.push(newHabit);
    await this.saveHabits(habits);
    return newHabit;
  }

  async updateHabit(id: string, updates: Partial<Habit>): Promise<Habit> {
    const habits = await this.getHabits();
    const index = habits.findIndex(habit => habit.id === id);
    
    if (index === -1) {
      throw new Error('Habit not found');
    }
    
    habits[index] = { ...habits[index], ...updates, updatedAt: new Date() };
    await this.saveHabits(habits);
    return habits[index];
  }

  async deleteHabit(id: string): Promise<void> {
    const habits = await this.getHabits();
    const filteredHabits = habits.filter(habit => habit.id !== id);
    await this.saveHabits(filteredHabits);
  }

  private async saveHabits(habits: Habit[]): Promise<void> {
    const serializedHabits = habits.map(habit => ({
      ...habit,
      createdAt: habit.createdAt.toISOString(),
      updatedAt: habit.updatedAt.toISOString(),
    }));
    
    this.storage.setItem('productivity_habits', JSON.stringify(serializedHabits));
  }

  // Stub implementations for unused methods
  async getHabitEntries(): Promise<HabitEntry[]> { return []; }
  async createHabitEntry(_entry: Omit<HabitEntry, 'id' | 'createdAt'>): Promise<HabitEntry> { 
    throw new Error('Not implemented'); 
  }
  async updateHabitEntry(_id: string, _updates: Partial<HabitEntry>): Promise<HabitEntry> { 
    throw new Error('Not implemented'); 
  }
  async deleteHabitEntry(_id: string): Promise<void> {}

  async getChallenges(): Promise<Challenge[]> { return []; }
  async createChallenge(_challenge: Omit<Challenge, 'id' | 'createdAt' | 'updatedAt'>): Promise<Challenge> { 
    throw new Error('Not implemented'); 
  }
  async updateChallenge(_id: string, _updates: Partial<Challenge>): Promise<Challenge> { 
    throw new Error('Not implemented'); 
  }
  async deleteChallenge(_id: string): Promise<void> {}

  async getChallengeEntries(): Promise<ChallengeEntry[]> { return []; }
  async createChallengeEntry(_entry: Omit<ChallengeEntry, 'id' | 'createdAt'>): Promise<ChallengeEntry> { 
    throw new Error('Not implemented'); 
  }
  
  async getTaskCategories(): Promise<TaskCategory[]> { return []; }
  async createTaskCategory(_category: Omit<TaskCategory, 'id' | 'createdAt'>): Promise<TaskCategory> { 
    throw new Error('Not implemented'); 
  }
  
  async getPreferences(): Promise<UserPreferences> {
    const defaultPreferences: UserPreferences = {
      theme: 'system',
      notificationsEnabled: true,
      defaultTaskCategory: '4',
      startOfWeek: 1,
      timeFormat: '12h',
      dateFormat: 'MM/dd/yyyy',
      language: 'en'
    };
    
    const data = this.storage.getItem('productivity_preferences');
    if (!data) return defaultPreferences;
    
    try {
      return { ...defaultPreferences, ...JSON.parse(data) };
    } catch {
      return defaultPreferences;
    }
  }

  async updatePreferences(preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    const current = await this.getPreferences();
    const updated = { ...current, ...preferences };
    this.storage.setItem('productivity_preferences', JSON.stringify(updated));
    return updated;
  }

  async exportData(): Promise<StorageData> {
    throw new Error('Not implemented');
  }

  async importData(_data: StorageData): Promise<void> {
    throw new Error('Not implemented');
  }

  async clearData(): Promise<void> {
    const keys = Object.keys(this.storage).filter(key => key.startsWith('productivity_'));
    keys.forEach(key => this.storage.removeItem(key));
  }
}

// Database service singleton
class DatabaseService {
  private adapter: DatabaseAdapter;

  constructor(adapter: DatabaseAdapter) {
    this.adapter = adapter;
  }

  // Delegate all methods to the adapter
  getTasks = () => this.adapter.getTasks();
  createTask = (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => this.adapter.createTask(task);
  updateTask = (id: string, updates: Partial<Task>) => this.adapter.updateTask(id, updates);
  deleteTask = (id: string) => this.adapter.deleteTask(id);

  getHabits = () => this.adapter.getHabits();
  createHabit = (habit: Omit<Habit, 'id' | 'createdAt' | 'updatedAt'>) => this.adapter.createHabit(habit);
  updateHabit = (id: string, updates: Partial<Habit>) => this.adapter.updateHabit(id, updates);
  deleteHabit = (id: string) => this.adapter.deleteHabit(id);

  getPreferences = () => this.adapter.getPreferences();
  updatePreferences = (preferences: Partial<UserPreferences>) => this.adapter.updatePreferences(preferences);

  // Add method to switch adapters (for future database migration)
  setAdapter(adapter: DatabaseAdapter) {
    this.adapter = adapter;
  }
}

// Export singleton instance
export const databaseService = new DatabaseService(new LocalStorageAdapter());
