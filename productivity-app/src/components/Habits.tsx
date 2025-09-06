import { Plus, Flame, Check, Calendar, TrendingUp } from 'lucide-react';
import { useHabits } from '../hooks/useHabits';
import { cn } from '../utils/helpers';
import type { Habit } from '../types';

export function Habits() {
  const {
    loading,
    toggleHabitCompletion,
    getTodaysHabits,
    getHabitStats
  } = useHabits();

  const todaysHabits = getTodaysHabits();
  const stats = getHabitStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Habits</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {stats.completedToday}/{stats.total} completed today • Longest streak: {stats.longestStreak} days
          </p>
        </div>
        <button className="btn-primary flex items-center space-x-2 tap-target">
          <Plus className="w-4 h-4" />
          <span>Add Habit</span>
        </button>
      </div>

      {/* Stats Cards */}
      {stats.total > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <Check className="w-5 h-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">Completed Today</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">
                  {stats.completedToday}/{stats.total}
                </p>
              </div>
            </div>
          </div>
          
          <div className="card p-4">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <Flame className="w-5 h-5 text-orange-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">Longest Streak</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">
                  {stats.longestStreak} days
                </p>
              </div>
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg. Rate</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">
                  {Math.round(stats.averageCompletionRate)}%
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Today's Habits */}
      {todaysHabits.length > 0 ? (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Today's Habits</h2>
          {todaysHabits.map(habit => (
            <HabitItem
              key={habit.id}
              habit={habit}
              completed={habit.completed}
              streak={habit.streak}
              onToggleComplete={() => toggleHabitCompletion(habit.id)}
            />
          ))}
        </div>
      ) : (
        <div className="card p-6">
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No habits yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Start building better habits to improve your daily routine
            </p>
            <button className="btn-primary">Create Habit</button>
          </div>
        </div>
      )}
    </div>
  );
}

// Simple Habit Item Component
interface HabitItemProps {
  habit: Habit & { completed: boolean; streak: number };
  completed: boolean;
  streak: number;
  onToggleComplete: () => void;
}

function HabitItem({ habit, completed, streak, onToggleComplete }: HabitItemProps) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleComplete}
          className={cn(
            'w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors tap-target',
            completed
              ? 'bg-green-500 border-green-500 text-white'
              : 'border-gray-300 dark:border-gray-600 hover:border-green-400'
          )}
        >
          {completed && <Check className="w-4 h-4" />}
        </button>
        
        <div className="flex-1">
          <h3 className={cn(
            'font-medium',
            completed 
              ? 'text-gray-500 dark:text-gray-400 line-through' 
              : 'text-gray-900 dark:text-white'
          )}>
            {habit.title}
          </h3>
          {habit.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {habit.description}
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-1 text-orange-600">
            <Flame className="w-4 h-4" />
            <span>{streak}</span>
          </div>
          <span className={cn(
            'px-2 py-1 rounded text-xs font-medium',
            habit.frequency === 'daily' 
              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200'
              : 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-200'
          )}>
            {habit.frequency}
          </span>
        </div>
      </div>
    </div>
  );
}
