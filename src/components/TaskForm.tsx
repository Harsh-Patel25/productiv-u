import { useState, useEffect } from 'react';
import { X, Calendar, Clock, Tag, AlertCircle } from 'lucide-react';
import { storageManager } from '../utils/storage';
import { cn } from '../utils/helpers';
import type { Task, TaskFormData, Priority } from '../types';

interface TaskFormProps {
  task?: Task;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TaskFormData) => void;
}

const priorityOptions: { value: Priority; label: string; color: string }[] = [
  { value: 'high', label: 'High', color: 'text-red-600 bg-red-50 border-red-200' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
  { value: 'low', label: 'Low', color: 'text-green-600 bg-green-50 border-green-200' },
];

export function TaskForm({ task, isOpen, onClose, onSubmit }: TaskFormProps) {
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    category: '',
    priority: 'medium',
    dueDate: '',
    reminder: '',
    tags: [],
  });
  
  const [categories, setCategories] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [errors, setErrors] = useState<Partial<TaskFormData>>({});

  // Load categories and populate form
  useEffect(() => {
    if (isOpen) {
      const taskCategories = storageManager.loadTaskCategories();
      setCategories(taskCategories.map(cat => cat.name));

      if (task) {
        setFormData({
          title: task.title,
          description: task.description || '',
          category: task.category,
          priority: task.priority,
          dueDate: task.dueDate ? task.dueDate.toISOString().split('T')[0] : '',
          reminder: task.reminder ? task.reminder.toISOString().slice(0, 16) : '',
          tags: task.tags,
        });
      } else {
        const preferences = storageManager.loadPreferences();
        setFormData(prev => ({
          ...prev,
          category: preferences.defaultTaskCategory,
        }));
      }
    }
  }, [isOpen, task]);

  const validateForm = (): boolean => {
    const newErrors: Partial<TaskFormData> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (formData.dueDate && formData.reminder) {
      const dueDate = new Date(formData.dueDate);
      const reminderDate = new Date(formData.reminder);
      if (reminderDate > dueDate) {
        newErrors.reminder = 'Reminder cannot be after due date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    onSubmit(formData);
    onClose();
    
    // Reset form
    setFormData({
      title: '',
      description: '',
      category: '',
      priority: 'medium',
      dueDate: '',
      reminder: '',
      tags: [],
    });
    setErrors({});
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTag.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(newTag.trim())) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, newTag.trim()]
        }));
      }
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {task ? 'Edit Task' : 'Create Task'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className={cn(
                'input-field',
                errors.title && 'border-red-300 focus:border-red-300 focus:ring-red-200'
              )}
              placeholder="Enter task title"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.title}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="input-field resize-none"
              rows={3}
              placeholder="Enter task description"
            />
          </div>

          {/* Category & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category *
              </label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className={cn(
                  'input-field',
                  errors.category && 'border-red-300 focus:border-red-300 focus:ring-red-200'
                )}
              >
                <option value="">Select category</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category}</p>
              )}
            </div>

            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Priority
              </label>
              <select
                id="priority"
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as Priority }))}
                className="input-field"
              >
                {priorityOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Due Date & Reminder */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Due Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  id="dueDate"
                  value={formData.dueDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="input-field"
                />
                <Calendar className="absolute right-3 top-2.5 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label htmlFor="reminder" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Reminder
              </label>
              <div className="relative">
                <input
                  type="datetime-local"
                  id="reminder"
                  value={formData.reminder}
                  onChange={(e) => setFormData(prev => ({ ...prev, reminder: e.target.value }))}
                  className="input-field"
                />
                <Clock className="absolute right-3 top-2.5 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
              {errors.reminder && (
                <p className="mt-1 text-sm text-red-600">{errors.reminder}</p>
              )}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tags
            </label>
            <div className="space-y-2">
              <div className="relative">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={handleAddTag}
                  className="input-field"
                  placeholder="Type tag and press Enter"
                />
                <Tag className="absolute right-3 top-2.5 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
              
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-1 text-sm bg-primary-100 dark:bg-primary-900/20 text-primary-800 dark:text-primary-200 rounded-md"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:bg-primary-200 dark:hover:bg-primary-800 rounded p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex-1"
            >
              {task ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
