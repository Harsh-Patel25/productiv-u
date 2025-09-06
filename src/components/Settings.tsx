import { useTheme } from '../hooks/useTheme';
import { storageManager } from '../utils/storage';
import { formatError } from '../utils/helpers';
import { useState } from 'react';
import { Download, Upload, Trash2 } from 'lucide-react';

export function Settings() {
  const { theme, setTheme } = useTheme();
  const [isExporting, setIsExporting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleExportData = async () => {
    try {
      setIsExporting(true);
      const data = storageManager.exportData();
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `productivU-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setMessage({ text: 'Data exported successfully!', type: 'success' });
    } catch (error) {
      setMessage({ text: formatError(error), type: 'error' });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        storageManager.importData(data);
        setMessage({ text: 'Data imported successfully! Please refresh the page.', type: 'success' });
        setTimeout(() => window.location.reload(), 2000);
      } catch (error) {
        setMessage({ text: formatError(error), type: 'error' });
      }
    };
    input.click();
  };

  const handleClearAllData = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      try {
        storageManager.clearAllData();
        setMessage({ text: 'All data cleared successfully! Please refresh the page.', type: 'success' });
        setTimeout(() => window.location.reload(), 2000);
      } catch (error) {
        setMessage({ text: formatError(error), type: 'error' });
      }
    }
  };

  // Clear message after 5 seconds
  if (message) {
    setTimeout(() => setMessage(null), 5000);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Customize your app preferences and manage your data
        </p>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-success-50 text-success-800 border border-success-200 dark:bg-success-900/20 dark:text-success-200' 
            : 'bg-danger-50 text-danger-800 border border-danger-200 dark:bg-danger-900/20 dark:text-danger-200'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Appearance
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Theme
              </label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'system')}
                className="input-field mt-1"
              >
                <option value="system">System</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Notifications
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Push Notifications
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Get notified about task deadlines and habit reminders
                </p>
              </div>
              <input
                type="checkbox"
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Data Management
          </h2>
          <div className="space-y-4">
            <button 
              onClick={handleExportData}
              disabled={isExporting}
              className="btn-secondary w-full flex items-center justify-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Exporting...' : 'Export Data'}</span>
            </button>
            <button 
              onClick={handleImportData}
              className="btn-secondary w-full flex items-center justify-center space-x-2"
            >
              <Upload className="w-4 h-4" />
              <span>Import Data</span>
            </button>
            <button 
              onClick={handleClearAllData}
              className="btn-danger w-full flex items-center justify-center space-x-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear All Data</span>
            </button>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            About
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Version</p>
              <p className="font-medium text-gray-900 dark:text-white">1.0.0</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Built with</p>
              <p className="font-medium text-gray-900 dark:text-white">React + TypeScript + Tailwind CSS</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
