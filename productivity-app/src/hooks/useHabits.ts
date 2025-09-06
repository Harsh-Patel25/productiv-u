import { useState, useEffect, useCallback } from 'react';
import { storageManager } from '../utils/storage';
import { generateId, getHabitStreak, getHabitCompletionRate } from '../utils/helpers';
import { format } from 'date-fns';
import type { Habit, HabitEntry, HabitFormData } from '../types';

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitEntries, setHabitEntries] = useState<HabitEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Load habits and entries from storage on mount
  useEffect(() => {
    try {
      const storedHabits = storageManager.loadHabits();
      const storedEntries = storageManager.loadHabitEntries();
      setHabits(storedHabits);
      setHabitEntries(storedEntries);
    } catch (error) {
      console.error('Error loading habits:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save habits to storage
  const saveHabits = useCallback((updatedHabits: Habit[]) => {
    try {
      storageManager.saveHabits(updatedHabits);
      setHabits(updatedHabits);
    } catch (error) {
      console.error('Error saving habits:', error);
    }
  }, []);

  // Save habit entries to storage
  const saveHabitEntries = useCallback((updatedEntries: HabitEntry[]) => {
    try {
      storageManager.saveHabitEntries(updatedEntries);
      setHabitEntries(updatedEntries);
    } catch (error) {
      console.error('Error saving habit entries:', error);
    }
  }, []);

  // Create new habit
  const createHabit = useCallback((habitData: HabitFormData) => {
    const newHabit: Habit = {
      id: generateId(),
      title: habitData.title,
      description: habitData.description,
      frequency: habitData.frequency,
      targetCount: habitData.targetCount,
      isActive: true,
      color: habitData.color,
      reminderTime: habitData.reminderTime,
      tags: habitData.tags,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedHabits = [...habits, newHabit];
    saveHabits(updatedHabits);
    return newHabit;
  }, [habits, saveHabits]);

  // Update existing habit
  const updateHabit = useCallback((id: string, updates: Partial<Habit>) => {
    const updatedHabits = habits.map(habit =>
      habit.id === id
        ? { ...habit, ...updates, updatedAt: new Date() }
        : habit
    );
    saveHabits(updatedHabits);
  }, [habits, saveHabits]);

  // Delete habit and its entries
  const deleteHabit = useCallback((id: string) => {
    const updatedHabits = habits.filter(habit => habit.id !== id);
    const updatedEntries = habitEntries.filter(entry => entry.habitId !== id);
    saveHabits(updatedHabits);
    saveHabitEntries(updatedEntries);
  }, [habits, habitEntries, saveHabits, saveHabitEntries]);

  // Toggle habit for a specific date
  const toggleHabitCompletion = useCallback((habitId: string, date?: Date) => {
    const targetDate = date || new Date();
    const dateString = format(targetDate, 'yyyy-MM-dd');
    
    const existingEntry = habitEntries.find(
      entry => entry.habitId === habitId && entry.date === dateString
    );

    let updatedEntries: HabitEntry[];

    if (existingEntry) {
      // Toggle existing entry
      updatedEntries = habitEntries.map(entry =>
        entry.id === existingEntry.id
          ? { ...entry, completed: !entry.completed }
          : entry
      );
    } else {
      // Create new entry
      const newEntry: HabitEntry = {
        id: generateId(),
        habitId,
        date: dateString,
        completed: true,
        createdAt: new Date(),
      };
      updatedEntries = [...habitEntries, newEntry];
    }

    saveHabitEntries(updatedEntries);
  }, [habitEntries, saveHabitEntries]);

  // Get habit completion for a specific date
  const getHabitCompletion = useCallback((habitId: string, date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    const entry = habitEntries.find(
      entry => entry.habitId === habitId && entry.date === dateString
    );
    return entry?.completed || false;
  }, [habitEntries]);

  // Get habit streak
  const getHabitStreakCount = useCallback((habitId: string) => {
    return getHabitStreak(habitId, habitEntries);
  }, [habitEntries]);

  // Get habit completion rate
  const getHabitCompletionRateData = useCallback((habitId: string, days: number = 30) => {
    return getHabitCompletionRate(habitId, habitEntries, days);
  }, [habitEntries]);

  // Get today's habits with completion status
  const getTodaysHabits = useCallback(() => {
    const today = new Date();
    return habits
      .filter(habit => habit.isActive)
      .map(habit => ({
        ...habit,
        completed: getHabitCompletion(habit.id, today),
        streak: getHabitStreakCount(habit.id),
        completionRate: getHabitCompletionRateData(habit.id),
      }));
  }, [habits, getHabitCompletion, getHabitStreakCount, getHabitCompletionRateData]);

  // Get habit statistics
  const getHabitStats = useCallback(() => {
    const activeHabits = habits.filter(h => h.isActive);
    const todaysHabits = getTodaysHabits();
    const completedToday = todaysHabits.filter(h => h.completed).length;
    const totalStreaks = todaysHabits.reduce((sum, habit) => sum + habit.streak, 0);
    const longestStreak = Math.max(...todaysHabits.map(h => h.streak), 0);

    return {
      total: activeHabits.length,
      completedToday,
      pendingToday: activeHabits.length - completedToday,
      averageCompletionRate: activeHabits.length > 0 
        ? todaysHabits.reduce((sum, habit) => sum + habit.completionRate, 0) / activeHabits.length
        : 0,
      totalStreaks,
      longestStreak,
    };
  }, [habits, getTodaysHabits]);

  return {
    habits,
    habitEntries,
    loading,
    createHabit,
    updateHabit,
    deleteHabit,
    toggleHabitCompletion,
    getHabitCompletion,
    getHabitStreakCount,
    getHabitCompletionRateData,
    getTodaysHabits,
    getHabitStats,
  };
}
