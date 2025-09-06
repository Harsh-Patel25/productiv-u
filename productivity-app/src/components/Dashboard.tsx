import { CheckCircle, Clock, Target, Flame } from 'lucide-react';
import { useTasks } from '../hooks/useTasks';
import { useHabits } from '../hooks/useHabits';
import { useChallenges } from '../hooks/useChallenges';
import { TaskItem } from './TaskItem';
import { Link } from 'react-router-dom';

// Dashboard helper components
interface StatCardProps {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  value: string;
  total?: string;
  color: string;
  bgColor: string;
}

function StatCard({ icon: Icon, label, value, total, color, bgColor }: StatCardProps) {
  return (
    <div className="card p-4">
      <div className="flex items-center">
        <div className={`p-2 ${bgColor} rounded-lg`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <div className="ml-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
          <p className="text-xl font-semibold text-gray-900 dark:text-white">
            {value}
          </p>
          {total && (
            <p className="text-xs text-gray-500 dark:text-gray-400">{total}</p>
          )}
        </div>
      </div>
    </div>
  );
}

interface QuickActionButtonProps {
  title: string;
  description: string;
  onClick: () => void;
}

function QuickActionButton({ title, description, onClick }: QuickActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className="text-left p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors w-full"
    >
      <h3 className="font-medium text-gray-900 dark:text-white">{title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{description}</p>
    </button>
  );
}

export function Dashboard() {
  const {
    getTodaysTasks,
    getTaskStats,
    toggleTaskCompletion,
    deleteTask
  } = useTasks();
  
  const {
    getTodaysHabits,
    getHabitStats,
    toggleHabitCompletion
  } = useHabits();
  
  const {
    getChallengeStats
  } = useChallenges();

  const todaysTasks = getTodaysTasks();
  const taskStats = getTaskStats();
  const todaysHabits = getTodaysHabits();
  const habitStats = getHabitStats();
  const challengeStats = getChallengeStats();

  const handleEditTask = () => {
    // Handle edit task - would open task form
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Welcome back! Here's your productivity overview for today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={CheckCircle}
          label="Tasks Completed"
          value={taskStats.completed.toString()}
          total={taskStats.total.toString()}
          color="text-green-600"
          bgColor="bg-green-50 dark:bg-green-900/20"
        />
        <StatCard
          icon={Clock}
          label="Tasks Pending"
          value={taskStats.pending.toString()}
          total={taskStats.overdue > 0 ? `${taskStats.overdue} overdue` : ""}
          color="text-yellow-600"
          bgColor="bg-yellow-50 dark:bg-yellow-900/20"
        />
        <StatCard
          icon={Flame}
          label="Habits Today"
          value={habitStats.completedToday.toString()}
          total={`${habitStats.total} total`}
          color="text-orange-600"
          bgColor="bg-orange-50 dark:bg-orange-900/20"
        />
        <StatCard
          icon={Target}
          label="Active Challenges"
          value={challengeStats.active.toString()}
          total={`${challengeStats.completed} done`}
          color="text-blue-600"
          bgColor="bg-blue-50 dark:bg-blue-900/20"
        />
      </div>

      {/* Quick Actions */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link to="/tasks">
            <QuickActionButton
              title="Add Task"
              description="Create a new task"
              onClick={() => {}}
            />
          </Link>
          <Link to="/habits">
            <QuickActionButton
              title="Track Habits"
              description="Mark habits as complete"
              onClick={() => {}}
            />
          </Link>
          <Link to="/challenges">
            <QuickActionButton
              title="View Challenges"
              description="Check your progress"
              onClick={() => {}}
            />
          </Link>
        </div>
      </div>

      {/* Today's Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Today's Tasks
            </h2>
            <Link to="/tasks" className="text-sm text-primary-600 hover:text-primary-700">
              View all
            </Link>
          </div>
          {todaysTasks.length > 0 ? (
            <div className="space-y-3">
              {todaysTasks.slice(0, 3).map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggleComplete={toggleTaskCompletion}
                  onEdit={handleEditTask}
                  onDelete={deleteTask}
                  compact
                />
              ))}
              {todaysTasks.length > 3 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center pt-2">
                  +{todaysTasks.length - 3} more tasks
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No tasks for today. Great job staying on top of things!
            </div>
          )}
        </div>
        
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Today's Habits
            </h2>
            <Link to="/habits" className="text-sm text-primary-600 hover:text-primary-700">
              View all
            </Link>
          </div>
          {todaysHabits.length > 0 ? (
            <div className="space-y-3">
              {todaysHabits.slice(0, 4).map(habit => (
                <div key={habit.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <button
                    onClick={() => toggleHabitCompletion(habit.id)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      habit.completed
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-gray-300 dark:border-gray-600 hover:border-green-400'
                    }`}
                  >
                    {habit.completed && <CheckCircle className="w-3 h-3" />}
                  </button>
                  <div className="flex-1">
                    <p className={`font-medium ${
                      habit.completed 
                        ? 'text-gray-500 dark:text-gray-400 line-through'
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {habit.title}
                    </p>
                  </div>
                  <div className="text-sm text-orange-600 flex items-center gap-1">
                    <Flame className="w-4 h-4" />
                    <span>{habit.streak}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p className="mb-2">No habits configured yet.</p>
              <Link to="/habits" className="text-primary-600 hover:text-primary-700 text-sm">
                Start building good habits!
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
