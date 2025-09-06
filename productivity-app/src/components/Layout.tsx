import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  Home, 
  CheckSquare, 
  Repeat, 
  Target, 
  Settings, 
  Menu, 
  X, 
  Sun, 
  Moon, 
  Monitor 
} from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { cn } from '../utils/helpers';

interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  mobileOrder?: number;
}

const navigationItems: NavigationItem[] = [
  { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: Home, mobileOrder: 1 },
  { id: 'tasks', label: 'Tasks', path: '/tasks', icon: CheckSquare, mobileOrder: 2 },
  { id: 'habits', label: 'Habits', path: '/habits', icon: Repeat, mobileOrder: 3 },
  { id: 'challenges', label: 'Challenges', path: '/challenges', icon: Target, mobileOrder: 4 },
  { id: 'settings', label: 'Settings', path: '/settings', icon: Settings, mobileOrder: 5 },
];

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const getThemeIcon = () => {
    switch (theme) {
      case 'light': return Sun;
      case 'dark': return Moon;
      case 'system': return Monitor;
      default: return Sun;
    }
  };

  const ThemeIcon = getThemeIcon();

  const isActiveRoute = (path: string) => location.pathname === path;

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Mobile Header */}
      <header className="lg:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 h-16">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 tap-target"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              ProductivU
            </h1>
          </div>
          
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 tap-target"
            aria-label="Toggle theme"
          >
            <ThemeIcon className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50" 
            onClick={closeMobileMenu}
          />
          
          {/* Sidebar */}
          <div className="relative flex flex-col w-80 max-w-xs bg-white dark:bg-gray-800 shadow-xl">
            <div className="flex items-center justify-between px-4 h-16 border-b border-gray-200 dark:border-gray-700">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                ProductivU
              </h1>
              <button
                onClick={closeMobileMenu}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Close menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <nav className="flex-1 px-4 py-4 space-y-1">
              {navigationItems
                .sort((a, b) => (a.mobileOrder || 0) - (b.mobileOrder || 0))
                .map((item) => {
                  const Icon = item.icon;
                  const isActive = isActiveRoute(item.path);
                  
                  return (
                    <Link
                      key={item.id}
                      to={item.path}
                      onClick={closeMobileMenu}
                      className={cn(
                        'flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors tap-target',
                        isActive
                          ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      )}
                    >
                      <Icon className={cn('w-5 h-5', isActive && 'text-primary-600 dark:text-primary-400')} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
            </nav>
            
            <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={toggleTheme}
                className="flex items-center space-x-3 w-full px-3 py-3 text-left rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 tap-target"
              >
                <ThemeIcon className="w-5 h-5" />
                <span>Theme: {theme}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="lg:flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
          <div className="flex items-center px-6 h-16 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              ProductivU
            </h1>
          </div>
          
          <nav className="flex-1 px-4 py-4 space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActiveRoute(item.path);
              
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={cn(
                    'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  )}
                >
                  <Icon className={cn('w-5 h-5', isActive && 'text-primary-600 dark:text-primary-400')} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
          
          <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={toggleTheme}
              className="flex items-center space-x-3 w-full px-3 py-2 text-left rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              <ThemeIcon className="w-5 h-5" />
              <span>Theme: {theme}</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="lg:ml-64 flex-1 min-h-screen">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 safe-area-pb">
          <div className="grid grid-cols-4 gap-1 px-2 py-1">
            {navigationItems
              .filter(item => item.id !== 'settings') // Settings goes in mobile menu
              .sort((a, b) => (a.mobileOrder || 0) - (b.mobileOrder || 0))
              .slice(0, 4) // Only show first 4 items
              .map((item) => {
                const Icon = item.icon;
                const isActive = isActiveRoute(item.path);
                
                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    className={cn(
                      'flex flex-col items-center py-2 px-1 text-xs font-medium transition-colors tap-target',
                      isActive
                        ? 'text-primary-600 dark:text-primary-400'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    )}
                  >
                    <Icon className={cn('w-6 h-6 mb-1', isActive && 'text-primary-600 dark:text-primary-400')} />
                    <span className="truncate w-full text-center">{item.label}</span>
                  </Link>
                );
              })}
          </div>
        </nav>
      </div>

      {/* Mobile safe area spacer */}
      <div className="lg:hidden h-16" />
    </div>
  );
}

export default Layout;
