import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import {
  LayoutDashboard,
  FileText,
  FileEdit,
  MessageSquare,
  Folder,
  Tag,
  Image as ImageIcon,
  Settings,
  BarChart3,
  Menu,
  X,
  LogOut,
  Moon,
  Sun,
  Monitor,
  ChevronDown,
  Home,
} from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
}

interface NavItem {
  name: string;
  path: string;
  icon: any;
  badge?: number;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();

  const navSections: NavSection[] = [
    {
      title: 'Main',
      items: [
        { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
      ],
    },
    {
      title: 'Content',
      items: [
        { name: 'Posts', path: '/admin/posts', icon: FileText },
        { name: 'Pages', path: '/admin/pages', icon: FileEdit },
        { name: 'Comments', path: '/admin/comments', icon: MessageSquare },
      ],
    },
    {
      title: 'Organization',
      items: [
        { name: 'Categories', path: '/admin/categories', icon: Folder },
        { name: 'Labels', path: '/admin/labels', icon: Tag },
        { name: 'Media', path: '/admin/media', icon: ImageIcon },
      ],
    },
    {
      title: 'Configuration',
      items: [
        { name: 'Settings', path: '/admin/settings', icon: Settings },
        { name: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
      ],
    },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  const isActivePath = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ];

  const currentThemeOption = themeOptions.find(opt => opt.value === theme) || themeOptions[2];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 z-40 flex items-center justify-between px-4">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <Menu size={24} className="text-gray-900 dark:text-white" />
        </button>
        <div className="flex items-center gap-2">
          <img src="/mayobebroslogo copy copy.png" alt="Mayobe Bros" className="h-8" />
          <span className="font-bold text-gray-900 dark:text-white">Admin</span>
        </div>
        <div className="w-10" />
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-white dark:bg-black border-r border-gray-200 dark:border-gray-800 z-50
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <img src="/mayobebroslogo copy copy.png" alt="Mayobe Bros" className="h-8" />
              <span className="font-bold text-gray-900 dark:text-white">Admin</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X size={20} className="text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-3">
            {navSections.map((section, idx) => (
              <div key={idx} className="mb-6">
                <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  {section.title}
                </h3>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = isActivePath(item.path);
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setSidebarOpen(false)}
                        className={`
                          flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                          ${
                            isActive
                              ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                          }
                        `}
                      >
                        <Icon size={20} />
                        <span className="font-medium">{item.name}</span>
                        {item.badge && (
                          <span className="ml-auto bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* User Profile & Theme */}
          <div className="border-t border-gray-200 dark:border-gray-800 p-4 space-y-3">
            {/* Theme Selector */}
            <div className="relative">
              <button
                onClick={() => setThemeMenuOpen(!themeMenuOpen)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <currentThemeOption.icon size={18} className="text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {currentThemeOption.label}
                  </span>
                </div>
                <ChevronDown size={16} className="text-gray-600 dark:text-gray-400" />
              </button>

              {themeMenuOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                  {themeOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        onClick={() => {
                          setTheme(option.value as any);
                          setThemeMenuOpen(false);
                        }}
                        className={`
                          w-full flex items-center gap-2 px-3 py-2 transition-colors
                          ${
                            theme === option.value
                              ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                          }
                        `}
                      >
                        <Icon size={18} />
                        <span className="text-sm font-medium">{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* User Profile */}
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                {user?.email?.[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user?.email?.split('@')[0]}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  Administrator
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Link
                to="/"
                target="_blank"
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <Home size={16} />
                <span>Visit Site</span>
              </Link>
              <button
                onClick={handleSignOut}
                className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64 min-h-screen">
        <div className="lg:hidden h-16" />
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
