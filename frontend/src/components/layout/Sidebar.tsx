import { useAuth } from '@/hooks/useAuth';
import { useI18n } from '@/i18n/locale';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/utils/cn';
import { ChevronLeft, ChevronRight, LayoutDashboard, LogOut, User, Users, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const { user, isAdmin } = useAuth();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    onMobileClose();
  }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  const navItems = [
    {
      to: '/dashboard',
      label: t('navDashboard'),
      icon: LayoutDashboard,
      adminOnly: false,
    },
    { to: '/users', label: t('navUsers'), icon: Users, adminOnly: true },
    { to: '/profile', label: t('navProfile'), icon: User, adminOnly: false },
  ];

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const sidebarContent = (
    <>
      {/* Logo */}
      <button
        onClick={() => navigate('/dashboard')}
        className="h-[72px] px-4 flex items-center gap-3 border-b border-brand-gray-800 hover:bg-white/5 transition-colors"
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
        {/* Collapse toggle — desktop only */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex items-center justify-center w-full py-3 text-brand-gray-500 hover:text-white hover:bg-white/5 transition-colors"
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
                <p className="text-xs text-brand-gray-500">
                  {isAdmin ? t('roleAdmin') : t('roleUser')}
                </p>
              </div>
            )}
            {!collapsed && (
              <button
                onClick={handleLogout}
                className="text-brand-gray-500 hover:text-white transition-colors flex-shrink-0"
                title={t('logout')}
              >
                <LogOut size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'bg-brand-black text-white flex-col min-h-screen sticky top-0 transition-all duration-300 hidden lg:flex',
          collapsed ? 'w-[72px]' : 'w-64',
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile overlay + drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={onMobileClose} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-brand-black text-white flex flex-col z-50">
            {/* Close button */}
            <button
              onClick={onMobileClose}
              className="absolute top-5 right-3 text-brand-gray-400 hover:text-white transition-colors z-10"
            >
              <X size={20} />
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
