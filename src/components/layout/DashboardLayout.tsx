import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  Globe,
  LogOut,
  Menu,
  ShoppingCart,
  Sprout,
  X,
} from 'lucide-react';
import { useAppData } from '@/src/context/AppDataContext';
import { useLanguage } from '@/src/context/LanguageContext';
import { formatDateTime } from '@/src/lib/utils';

export interface SidebarNavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  end?: boolean;
  badge?: number;
}

export function DashboardLayout({
  roleTitle,
  pageTitle,
  navItems,
  children,
}: {
  roleTitle: string;
  pageTitle: string;
  navItems: SidebarNavItem[];
  children: React.ReactNode;
}) {
  const {
    currentUser,
    logout,
    userNotifications,
    unreadNotificationCount,
    markNotificationRead,
    markAllNotificationsRead,
    cartCount,
  } = useAppData();
  const { language, toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const renderSidebarLinks = (onClickItem?: () => void) => (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between border-b border-[#E2E8DF] px-5">
        <Link to="/" className="flex items-center gap-2.5 text-[#166534] whitespace-nowrap">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#166534] text-white">
            <Sprout className="h-4.5 w-4.5" />
          </span>
          <span className="font-display text-base font-bold tracking-tight text-[#1F2937]">
            {t('brandName')}
          </span>
        </Link>
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden rounded-lg p-1.5 text-[#526058] hover:bg-[#EEF4EB] cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="px-4 py-3 border-b border-[#EEF2EB]">
        <p className="text-xs font-medium text-[#526058]">{roleTitle}</p>
        <p className="mt-0.5 text-sm font-semibold text-[#1F2937] truncate">
          {currentUser?.name}
        </p>
        <p className="text-xs text-[#6B786F] truncate">
          {currentUser?.district} · {currentUser?.isDemoAccount ? 'Demo Account' : 'Registered User'}
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onClickItem}
            className={({ isActive }) =>
              `flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-[#166534] text-white'
                  : 'text-[#374151] hover:bg-[#EEF4EB] hover:text-[#166534]'
              }`
            }
          >
            <span className="flex items-center gap-2.5 min-w-0">
              <span className="shrink-0">{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </span>
            {item.badge !== undefined && item.badge > 0 && (
              <span className="font-mono text-xs font-semibold tabular-nums opacity-90">
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-[#E2E8DF] p-3">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-[#B91C1C] hover:bg-[#FEF2F2] transition-colors cursor-pointer"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span>{t('navLogout')}</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAF5] text-[#1F2937] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 border-r border-[#E2E8DF] bg-white sticky top-0 h-screen">
        {renderSidebarLinks()}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-[#111A14]/45"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative z-10 w-68 max-w-[82vw] bg-white h-full shadow-xl">
            {renderSidebarLinks(() => setSidebarOpen(false))}
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Contextual Workspace Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-[#E2E8DF] bg-white/95 backdrop-blur-sm px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              aria-label="Open sidebar"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg text-[#1F2937] hover:bg-[#EEF4EB] cursor-pointer"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <p className="text-xs text-[#6B786F] truncate">
                {roleTitle} / <span className="text-[#1F2937] font-medium">{pageTitle}</span>
              </p>
              <h1 className="font-display text-lg font-semibold text-[#1F2937] truncate">
                {pageTitle}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={toggleLanguage}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#E2E8DF] bg-[#F8FAF5] px-3 text-xs font-medium text-[#374151] hover:bg-[#EEF4EB] transition-colors whitespace-nowrap cursor-pointer"
            >
              <Globe className="h-3.5 w-3.5 text-[#166534]" />
              <span>{language === 'en' ? 'தமிழ்' : 'English'}</span>
            </button>

            {currentUser?.role === 'customer' && (
              <button
                type="button"
                onClick={() => navigate('/customer/cart')}
                aria-label="My cart"
                className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#E2E8DF] bg-white text-[#374151] hover:bg-[#EEF4EB] cursor-pointer"
              >
                <ShoppingCart className="h-4 w-4" />
                {cartCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-[#166534] px-1 font-mono text-[10px] font-semibold text-white tabular-nums">
                    {cartCount}
                  </span>
                )}
              </button>
            )}

            {/* Notification Bell Dropdown */}
            <div className="relative">
              <button
                type="button"
                aria-label="Open notifications"
                onClick={() => setNotifOpen((o) => !o)}
                className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#E2E8DF] bg-white text-[#374151] hover:bg-[#EEF4EB] cursor-pointer"
              >
                <Bell className="h-4 w-4" />
                {unreadNotificationCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-[#DC2626] px-1 font-mono text-[10px] font-semibold text-white tabular-nums">
                    {unreadNotificationCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setNotifOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 z-50 w-80 sm:w-96 rounded-xl border border-[#E2E8DF] bg-white shadow-lg overflow-hidden">
                    <div className="flex items-center justify-between border-b border-[#E2E8DF] px-4 py-3">
                      <span className="text-sm font-semibold text-[#1F2937]">
                        {t('notifications')} ({unreadNotificationCount})
                      </span>
                      {unreadNotificationCount > 0 && (
                        <button
                          type="button"
                          onClick={markAllNotificationsRead}
                          className="inline-flex items-center gap-1 text-xs font-medium text-[#166534] hover:underline cursor-pointer"
                        >
                          <CheckCheck className="h-3.5 w-3.5" />
                          {t('markAllRead')}
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto divide-y divide-[#EEF2EB]">
                      {userNotifications.length === 0 ? (
                        <div className="px-4 py-8 text-center text-sm text-[#6B786F]">
                          {t('noNotifications')}
                        </div>
                      ) : (
                        userNotifications.map((n) => (
                          <button
                            key={n.id}
                            type="button"
                            onClick={() => {
                              markNotificationRead(n.id);
                              setNotifOpen(false);
                              if (n.link) navigate(n.link);
                            }}
                            className={`w-full text-left px-4 py-3 transition-colors hover:bg-[#F8FAF5] cursor-pointer ${
                              n.read ? 'bg-white' : 'bg-[#F3F8F1]'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-xs font-semibold text-[#1F2937]">
                                {n.title}
                              </span>
                              {!n.read && (
                                <span className="text-[11px] font-semibold text-[#166534]">
                                  New
                                </span>
                              )}
                            </div>
                            <p className="mt-1 text-xs text-[#526058] leading-relaxed">
                              {n.message}
                            </p>
                            <p className="mt-1 font-mono text-[11px] text-[#7A877D]">
                              {formatDateTime(n.createdAt)}
                            </p>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
