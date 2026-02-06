import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import { LayoutDashboard, Users, User, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/utils/cn';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, adminOnly: false },
  { to: '/users', label: 'Users', icon: Users, adminOnly: true },
  { to: '/profile', label: 'Profile', icon: User, adminOnly: false },
];

export default function Sidebar() {
  const { user, isAdmin } = useAuth();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <aside
      className={cn(
        'bg-brand-black text-white flex flex-col min-h-screen sticky top-0 transition-all duration-300',
        collapsed ? 'w-[72px]' : 'w-64',
      )}
    >
      {/* Logo - clickable to dashboard */}
      <button
        onClick={() => navigate('/dashboard')}
        className="p-4 flex items-center gap-3 border-b border-brand-gray-800 hover:bg-white/5 transition-colors"
      >
        <img src="/agency45.png" alt="Agency45" className="w-10 h-10 rounded-full flex-shrink-0" />
        {!collapsed && (
          <span className="font-heading font-bold text-lg tracking-tight">Agency45</span>
        )}
      </button>

      {/* Navigation */}
      <nav className="flex-1 py-4">
        {navItems
          .filter((item) => !item.adminOnly || isAdmin)
          .map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-4 py-3 mx-2 rounded-lg text-sm font-body transition-colors',
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-brand-gray-400 hover:text-white hover:bg-white/5',
                )
              }
            >
              <item.icon size={20} className="flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-brand-gray-800">
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center w-full py-3 text-brand-gray-500 hover:text-white hover:bg-white/5 transition-colors"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>

        {/* User info */}
        <div className="border-t border-brand-gray-800 p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-gray-700 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-heading font-bold">
                {user?.username?.charAt(0).toUpperCase() || '?'}
              </span>
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.username}</p>
                <p className="text-xs text-brand-gray-500">{isAdmin ? 'Admin' : 'User'}</p>
              </div>
            )}
            {!collapsed && (
              <button
                onClick={handleLogout}
                className="text-brand-gray-500 hover:text-white transition-colors flex-shrink-0"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
