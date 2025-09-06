import { useState, useEffect, useCallback } from 'react';
import { storageManager } from '../utils/storage';
import { generateId } from '../utils/helpers';
import type { Task, TaskFormData, Priority, TaskStatus } from '../types';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Load tasks from storage on mount
  useEffect(() => {
    try {
      const storedTasks = storageManager.loadTasks();
      setTasks(storedTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save tasks to storage whenever tasks change
  const saveTasks = useCallback((updatedTasks: Task[]) => {
    try {
      storageManager.saveTasks(updatedTasks);
      setTasks(updatedTasks);
    } catch (error) {
      console.error('Error saving tasks:', error);
    }
  }, []);

  // Create new task
  const createTask = useCallback((taskData: TaskFormData) => {
    const newTask: Task = {
      id: generateId(),
      title: taskData.title,
      description: taskData.description,
      category: taskData.category,
      priority: taskData.priority,
      status: 'pending',
      dueDate: taskData.dueDate ? new Date(taskData.dueDate) : undefined,
      reminder: taskData.reminder ? new Date(taskData.reminder) : undefined,
      tags: taskData.tags,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedTasks = [...tasks, newTask];
    saveTasks(updatedTasks);
    return newTask;
  }, [tasks, saveTasks]);

  // Update existing task
  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    const updatedTasks = tasks.map(task =>
      task.id === id
        ? { ...task, ...updates, updatedAt: new Date() }
        : task
    );
    saveTasks(updatedTasks);
  }, [tasks, saveTasks]);

  // Delete task
  const deleteTask = useCallback((id: string) => {
    const updatedTasks = tasks.filter(task => task.id !== id);
    saveTasks(updatedTasks);
  }, [tasks, saveTasks]);

  // Toggle task completion
  const toggleTaskCompletion = useCallback((id: string) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === id) {
        const newStatus: TaskStatus = task.status === 'completed' ? 'pending' : 'completed';
        return {
          ...task,
          status: newStatus,
          completedAt: newStatus === 'completed' ? new Date() : undefined,
          updatedAt: new Date(),
        };
      }
      return task;
    });
    saveTasks(updatedTasks);
  }, [tasks, saveTasks]);

  // Filter and sort functions
  const getTasksByStatus = useCallback((status: TaskStatus) => {
    return tasks.filter(task => task.status === status);
  }, [tasks]);

  const getTasksByCategory = useCallback((category: string) => {
    return tasks.filter(task => task.category === category);
  }, [tasks]);

  const getTasksByPriority = useCallback((priority: Priority) => {
    return tasks.filter(task => task.priority === priority);
  }, [tasks]);

  const getTodaysTasks = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return tasks.filter(task => {
      if (task.status === 'completed') return false;
      if (!task.dueDate) return false;
      
      const dueDate = new Date(task.dueDate);
      return dueDate >= today && dueDate < tomorrow;
    });
  }, [tasks]);

  const getOverdueTasks = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return tasks.filter(task => {
      if (task.status === 'completed') return false;
      if (!task.dueDate) return false;
      
      return new Date(task.dueDate) < today;
    });
  }, [tasks]);

  const getUpcomingTasks = useCallback((days: number = 7) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + days);

    return tasks.filter(task => {
      if (task.status === 'completed') return false;
      if (!task.dueDate) return false;
      
      const dueDate = new Date(task.dueDate);
      return dueDate >= today && dueDate <= futureDate;
    });
  }, [tasks]);

  // Statistics
  const getTaskStats = useCallback(() => {
    const total = tasks.length;
    const completed = getTasksByStatus('completed').length;
    const pending = getTasksByStatus('pending').length;
    const overdue = getOverdueTasks().length;
    const todaysTasks = getTodaysTasks().length;

    return {
      total,
      completed,
      pending,
      overdue,
      todaysTasks,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [tasks, getTasksByStatus, getOverdueTasks, getTodaysTasks]);

  return {
    tasks,
    loading,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    getTasksByStatus,
    getTasksByCategory,
    getTasksByPriority,
    getTodaysTasks,
    getOverdueTasks,
    getUpcomingTasks,
    getTaskStats,
  };
}
