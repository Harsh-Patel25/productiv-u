import { Plus, Target, Trophy, TrendingUp } from 'lucide-react';
import { useChallenges } from '../hooks/useChallenges';
import { formatDate } from '../utils/helpers';
import type { Challenge } from '../types';

export function Challenges() {
  const {
    loading,
    getChallengesWithProgress,
    getChallengeStats
  } = useChallenges();

  const challengesWithProgress = getChallengesWithProgress();
  const stats = getChallengeStats();

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Challenges</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {stats.active} active • {stats.completed} completed • {stats.completionRate}% completion rate
          </p>
        </div>
        <button className="btn-primary flex items-center space-x-2 tap-target">
          <Plus className="w-4 h-4" />
          <span>Add Challenge</span>
        </button>
      </div>

      {/* Stats Cards */}
      {stats.total > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">{stats.active}</p>
              </div>
            </div>
          </div>
          
          <div className="card p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <Trophy className="w-5 h-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">{stats.completed}</p>
              </div>
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Progress</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">{stats.averageProgress}%</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Challenges List */}
      {challengesWithProgress.length > 0 ? (
        <div className="space-y-4">
          {challengesWithProgress.map(challenge => (
            <ChallengeItem key={challenge.id} challenge={challenge} />
          ))}
        </div>
      ) : (
        <div className="card p-6">
          <div className="text-center py-12">
            <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No challenges yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Create your first challenge to motivate yourself and track progress
            </p>
            <button className="btn-primary">Create Challenge</button>
          </div>
        </div>
      )}
    </div>
  );
}

// Simple Challenge Item Component
interface ChallengeItemProps {
  challenge: Challenge & { progress: number; actualStatus: string };
}

function ChallengeItem({ challenge }: ChallengeItemProps) {
  const isCompleted = challenge.actualStatus === 'completed';
  const isOverdue = challenge.actualStatus === 'overdue';
  
  return (
    <div className="card p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {challenge.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {challenge.description}
          </p>
          
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span>{challenge.currentValue} / {challenge.targetValue} {challenge.unit}</span>
              <span>{Math.round(challenge.progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-primary-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${Math.min(challenge.progress, 100)}%` }}
              />
            </div>
          </div>
          
          {/* Dates and Status */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
            <span>Started: {formatDate(challenge.startDate)}</span>
            <span>Ends: {formatDate(challenge.endDate)}</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              isCompleted 
                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200'
                : isOverdue
                ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200'
                : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200'
            }`}>
              {challenge.actualStatus}
            </span>
          </div>
        </div>
        
        {isCompleted && (
          <Trophy className="w-8 h-8 text-yellow-500 flex-shrink-0" />
        )}
      </div>
      
      {/* Rewards */}
      {challenge.rewards.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Rewards:</h4>
          <div className="flex flex-wrap gap-2">
            {challenge.rewards.map((reward, index) => (
              <span 
                key={index}
                className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200 rounded"
              >
                {reward}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
