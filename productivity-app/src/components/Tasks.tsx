import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { useTasks } from '../hooks/useTasks';
import { TaskForm } from './TaskForm';
import { TaskItem } from './TaskItem';
import { searchItems, cn } from '../utils/helpers';
import type { Task, Priority, TaskFormData } from '../types';

type FilterType = 'all' | 'pending' | 'completed' | 'overdue' | 'today';

export function Tasks() {
  const {
    tasks,
    loading,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    getTodaysTasks,
    getOverdueTasks,
    getTaskStats
  } = useTasks();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');

  const stats = getTaskStats();

  const handleCreateTask = (taskData: TaskFormData) => {
    createTask(taskData);
  };

  const handleUpdateTask = (taskData: TaskFormData) => {
    if (editingTask) {
      updateTask(editingTask.id, {
        title: taskData.title,
        description: taskData.description,
        category: taskData.category,
        priority: taskData.priority,
        dueDate: taskData.dueDate ? new Date(taskData.dueDate) : undefined,
        reminder: taskData.reminder ? new Date(taskData.reminder) : undefined,
        tags: taskData.tags,
      });
      setEditingTask(undefined);
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTask(undefined);
  };

  // Filter tasks based on active filters
  const getFilteredTasks = () => {
    let filteredTasks = tasks;

    // Apply status filter
    switch (activeFilter) {
      case 'pending':
        filteredTasks = filteredTasks.filter(task => task.status === 'pending');
        break;
      case 'completed':
        filteredTasks = filteredTasks.filter(task => task.status === 'completed');
        break;
      case 'overdue':
        filteredTasks = getOverdueTasks();
        break;
      case 'today':
        filteredTasks = getTodaysTasks();
        break;
    }

    // Apply priority filter
    if (priorityFilter !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.priority === priorityFilter);
    }

    // Apply search filter
    if (searchQuery) {
      filteredTasks = searchItems(filteredTasks, searchQuery);
    }

    // Sort by priority and due date
    return filteredTasks.sort((a, b) => {
      // Completed tasks go to bottom
      if (a.status === 'completed' && b.status !== 'completed') return 1;
      if (b.status === 'completed' && a.status !== 'completed') return -1;

      // Then by priority
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;

      // Finally by due date
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      return 0;
    });
  };

  const filteredTasks = getFilteredTasks();

  const filterOptions = [
    { value: 'all', label: 'All Tasks', count: tasks.length },
    { value: 'pending', label: 'Pending', count: stats.pending },
    { value: 'today', label: 'Today', count: stats.todaysTasks },
    { value: 'overdue', label: 'Overdue', count: stats.overdue },
    { value: 'completed', label: 'Completed', count: stats.completed },
  ] as const;

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tasks</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {stats.completionRate}% completion rate • {stats.total} total tasks
          </p>
        </div>
        <button 
          onClick={() => setIsFormOpen(true)}
          className="btn-primary flex items-center space-x-2 tap-target"
        >
          <Plus className="w-4 h-4" />
          <span>Add Task</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as Priority | 'all')}
            className="input-field w-full sm:w-auto"
          >
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mt-4">
          {filterOptions.map(option => (
            <button
              key={option.value}
              onClick={() => setActiveFilter(option.value)}
              className={cn(
                'px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                activeFilter === option.value
                  ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-200'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
              )}
            >
              {option.label}
              {option.count > 0 && (
                <span className="ml-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full text-xs">
                  {option.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tasks List */}
      {filteredTasks.length > 0 ? (
        <div className="space-y-3">
          {filteredTasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onToggleComplete={toggleTaskCompletion}
              onEdit={handleEditTask}
              onDelete={deleteTask}
            />
          ))}
        </div>
      ) : (
        <div className="card p-6">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {tasks.length === 0 ? 'No tasks yet' : 'No tasks match your filters'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {tasks.length === 0 
                ? 'Create your first task to get started with your productivity journey'
                : 'Try adjusting your search or filter criteria'
              }
            </p>
            {tasks.length === 0 && (
              <button 
                onClick={() => setIsFormOpen(true)}
                className="btn-primary"
              >
                Create Task
              </button>
            )}
          </div>
        </div>
      )}

      {/* Task Form Modal */}
      <TaskForm
        task={editingTask}
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
      />
    </div>
  );
}
