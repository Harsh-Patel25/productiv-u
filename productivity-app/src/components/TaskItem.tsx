import { useState } from 'react';
import { 
  Check, 
  Clock, 
  Calendar, 
  Edit, 
  Trash2, 
  AlertCircle,
  MoreHorizontal 
} from 'lucide-react';
import { formatRelativeDate, getPriorityColor, cn } from '../utils/helpers';
import type { Task } from '../types';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  compact?: boolean;
}

export function TaskItem({ 
  task, 
  onToggleComplete, 
  onEdit, 
  onDelete, 
  compact = false 
}: TaskItemProps) {
  const [showActions, setShowActions] = useState(false);

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';
  const isCompleted = task.status === 'completed';

  const handleToggleComplete = () => {
    onToggleComplete(task.id);
  };

  const handleEdit = () => {
    onEdit(task);
    setShowActions(false);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      onDelete(task.id);
    }
    setShowActions(false);
  };

  return (
    <div className={cn(
      'group border rounded-lg p-4 transition-all duration-200 hover:shadow-md',
      isCompleted 
        ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700' 
        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700',
      isOverdue && !isCompleted && 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10',
      compact && 'p-3'
    )}>
      <div className="flex items-start gap-3">
        {/* Completion Checkbox */}
        <button
          onClick={handleToggleComplete}
          className={cn(
            'flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors tap-target',
            isCompleted
              ? 'bg-green-500 border-green-500 text-white'
              : 'border-gray-300 dark:border-gray-600 hover:border-green-400 dark:hover:border-green-500'
          )}
        >
          {isCompleted && <Check className="w-3 h-3" />}
        </button>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className={cn(
                'font-medium text-gray-900 dark:text-white',
                isCompleted && 'line-through text-gray-500 dark:text-gray-400',
                compact ? 'text-sm' : 'text-base'
              )}>
                {task.title}
              </h3>
              
              {task.description && !compact && (
                <p className={cn(
                  'text-sm text-gray-600 dark:text-gray-400 mt-1',
                  isCompleted && 'line-through'
                )}>
                  {task.description}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 opacity-0 group-hover:opacity-100 transition-opacity tap-target"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {showActions && (
                <div className="absolute right-0 top-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 min-w-[120px]">
                  <button
                    onClick={handleEdit}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-t-lg"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-b-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Task Metadata */}
          <div className="flex items-center gap-4 mt-2">
            {/* Priority */}
            <span className={cn(
              'inline-flex items-center px-2 py-1 text-xs font-medium rounded border',
              getPriorityColor(task.priority)
            )}>
              {task.priority}
            </span>

            {/* Due Date */}
            {task.dueDate && (
              <div className={cn(
                'flex items-center gap-1 text-xs',
                isOverdue && !isCompleted 
                  ? 'text-red-600 dark:text-red-400' 
                  : 'text-gray-500 dark:text-gray-400'
              )}>
                {isOverdue && !isCompleted && <AlertCircle className="w-3 h-3" />}
                <Calendar className="w-3 h-3" />
                <span>{formatRelativeDate(task.dueDate)}</span>
              </div>
            )}

            {/* Reminder */}
            {task.reminder && !isCompleted && (
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <Clock className="w-3 h-3" />
                <span>Reminder set</span>
              </div>
            )}
          </div>

          {/* Tags */}
          {task.tags.length > 0 && !compact && (
            <div className="flex flex-wrap gap-1 mt-2">
              {task.tags.slice(0, 3).map(tag => (
                <span
                  key={tag}
                  className="inline-block px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded"
                >
                  {tag}
                </span>
              ))}
              {task.tags.length > 3 && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  +{task.tags.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close actions */}
      {showActions && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowActions(false)}
        />
      )}
    </div>
  );
}
