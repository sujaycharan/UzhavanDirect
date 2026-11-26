import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Globe, Menu, ShoppingCart, Sprout, X } from 'lucide-react';
import { useLanguage } from '@/src/context/LanguageContext';
import { useAppData } from '@/src/context/AppDataContext';
import { Button } from '@/src/components/ui/primitives';

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const { language, toggleLanguage, t } = useLanguage();
  const { currentUser, cartCount } = useAppData();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const dashboardPath = currentUser
    ? currentUser.role === 'farmer'
      ? '/farmer'
      : currentUser.role === 'admin'
      ? '/admin'
      : '/customer'
    : '/login';

  const navItems = [
    { to: '/', label: t('navHome'), end: true },
    { to: '/marketplace', label: t('navMarketplace'), end: false },
    { to: '/smart-agriculture', label: t('navSmartAgri'), end: false },
    { to: '/about', label: t('navAbout'), end: false },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAF5] text-[#1F2937]">
      {/* Strict 3-Zone Top Bar */}
      <header className="sticky top-0 z-40 border-b border-[#E2E8DF] bg-[#F8FAF5]/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
          {/* Zone 1: Single-line Brand Wordmark */}
          <Link
            to="/"
            className="flex items-center gap-2.5 text-[#166534] whitespace-nowrap shrink-0"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#166534] text-white">
              <Sprout className="h-4.5 w-4.5" />
            </span>
            <span className="font-display text-lg font-bold tracking-tight text-[#1F2937]">
              {t('brandName')}
            </span>
          </Link>

          {/* Zone 2: 4 Clean Single-Line Nav Links */}
          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-7 text-sm font-medium text-[#47554B]"
          >
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `whitespace-nowrap shrink-0 py-1 transition-colors border-b-2 ${
                    isActive
                      ? 'border-[#166534] text-[#166534] font-semibold'
                      : 'border-transparent hover:text-[#166534]'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Zone 3: Language, Cart & Auth Primary Action */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={toggleLanguage}
              title="Switch English / Tamil"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-[#374151] hover:bg-[#EAF1E6] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Globe className="h-3.5 w-3.5 text-[#166534]" />
              <span>{language === 'en' ? 'தமிழ்' : 'English'}</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/cart')}
              aria-label="Open shopping cart"
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#374151] hover:bg-[#EAF1E6] transition-colors cursor-pointer"
            >
              <ShoppingCart className="h-4.5 w-4.5" />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-[#166534] px-1 font-mono text-[10px] font-semibold text-white tabular-nums">
                  {cartCount}
                </span>
              )}
            </button>

            {currentUser ? (
              <Button size="sm" onClick={() => navigate(dashboardPath)}>
                {t('navDashboard')}
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-2 text-sm font-medium text-[#1F2937] hover:text-[#166534] whitespace-nowrap shrink-0"
                >
                  {t('navLogin')}
                </Link>
                <Button size="sm" onClick={() => navigate('/register')}>
                  {t('navRegister')}
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Controls */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={toggleLanguage}
              className="inline-flex h-9 items-center gap-1 rounded-lg px-2 text-xs font-medium text-[#374151] hover:bg-[#EAF1E6] cursor-pointer"
            >
              {language === 'en' ? 'தமிழ்' : 'EN'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/cart')}
              aria-label="Open cart"
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#374151]"
            >
              <ShoppingCart className="h-4.5 w-4.5" />
              {cartCount > 0 && (
                <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#166534] px-1 font-mono text-[10px] font-semibold text-white">
                  {cartCount}
                </span>
              )}
            </button>
            <button
              type="button"
              aria-label="Toggle menu"
              onClick={() => setMobileOpen((o) => !o)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-[#1F2937] hover:bg-[#EAF1E6] cursor-pointer"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileOpen && (
          <div className="border-t border-[#E2E8DF] bg-white px-4 py-4 md:hidden">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-2.5 text-sm font-medium ${
                      isActive ? 'bg-[#EEF4EB] text-[#166534] font-semibold' : 'text-[#374151]'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              <div className="mt-2 border-t border-[#E2E8DF] pt-3 flex flex-col gap-2">
                {currentUser ? (
                  <Button
                    onClick={() => {
                      setMobileOpen(false);
                      navigate(dashboardPath);
                    }}
                  >
                    {t('navDashboard')} ({currentUser.name})
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setMobileOpen(false);
                        navigate('/login');
                      }}
                    >
                      {t('navLogin')}
                    </Button>
                    <Button
                      onClick={() => {
                        setMobileOpen(false);
                        navigate('/register');
                      }}
                    >
                      {t('navRegister')}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      {/* Quiet Footer */}
      <footer className="border-t border-[#E2E8DF] bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#166534] text-white">
                  <Sprout className="h-4.5 w-4.5" />
                </span>
                <span className="font-display text-lg font-bold text-[#1F2937]">
                  {t('brandName')}
                </span>
              </div>
              <p className="mt-3 max-w-md text-sm text-[#526058] leading-relaxed">
                {t('tagline')}
              </p>
              <p className="mt-3 max-w-lg text-xs text-[#6B786F] leading-relaxed">
                {t('prototypeDisclaimer')}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-[#1F2937]">Platform</h3>
              <ul className="mt-3 space-y-2.5 text-sm text-[#526058]">
                <li>
                  <Link to="/marketplace" className="hover:text-[#166534] transition-colors">
                    {t('navMarketplace')}
                  </Link>
                </li>
                <li>
                  <Link to="/smart-agriculture" className="hover:text-[#166534] transition-colors">
                    {t('navSmartAgri')}
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="hover:text-[#166534] transition-colors">
                    {t('navAbout')}
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-[#166534] transition-colors">
                    Demo Accounts & Login
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-[#1F2937]">Contact & Info</h3>
              <ul className="mt-3 space-y-2.5 text-sm text-[#526058]">
                <li>Trichy AgriTech Hub, Tamil Nadu (Demo)</li>
                <li>support@uzhavandirect.demo</li>
                <li>
                  <Link to="/about#privacy" className="hover:text-[#166534] transition-colors">
                    Privacy & Prototype Terms
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 border-t border-[#E2E8DF] pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#6B786F]">
            <span>© 2026 Uzhavan Direct Prototype Demonstration. Inspired by Tamil Nadu Agriculture.</span>
            <span>LocalStorage Demo Mode · Simulated Market & Weather Data</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
