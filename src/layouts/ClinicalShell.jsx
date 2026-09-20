import React from 'react';
import { Home, Users, Activity, Settings, Wifi, WifiOff, LogOut } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext.jsx';
import LanguageSwitcher from '../components/LanguageSwitcher.jsx';

export default function ClinicalShell({
  children,
  profileName,
  role,
  isOnline,
  onNavigate,
  currentRoute,
  onLogout
}) {
  const { t } = useI18n();

  return (
    <div className="min-h-screen flex flex-col font-sans" style={{ backgroundColor: 'var(--surface-page)', color: 'var(--ink-secondary)' }}>
      {/* Top Clinical Nav */}
      <header className="px-4 py-3 flex items-center justify-between border-b shadow-flat" style={{ borderColor: 'var(--border-hairline)', backgroundColor: 'var(--surface-card)' }}>
        
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-btn flex items-center justify-center font-bold text-white shadow-flat" style={{ backgroundColor: 'var(--color-bamboo)' }}>
            ন
          </div>
          <div>
            <h1 className="text-lg font-bold" style={{ color: 'var(--ink-primary)' }}>
              {t('appName')} Clinical
            </h1>
            <p className="text-xs">
              {profileName} • {role === 'ASHA Worker' ? t('roleAsha') : t('roleCaregiver')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Reusable Clinical Language Switcher */}
          <LanguageSwitcher variant="clinical" placement="header" />

          {/* Inline Status Chip (Replaces Green Online Banner) */}
          <div 
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-pill text-xs font-semibold border"
            style={{ 
              backgroundColor: isOnline ? 'var(--color-bamboo-light)' : 'var(--surface-sunken)',
              color: isOnline ? 'var(--color-bamboo)' : 'var(--ink-secondary)',
              borderColor: isOnline ? 'var(--color-bamboo)' : 'var(--border-hairline)',
              minHeight: '48px'
            }}
          >
            {isOnline ? <Wifi size={16} /> : <WifiOff size={16} />}
            <span>{isOnline ? t('cloudSyncReady') : t('offline')}</span>
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-btn font-semibold transition-colors hover:bg-slate-100"
              style={{ minHeight: '48px', minWidth: '48px', color: 'var(--ink-primary)', border: '1px solid var(--border-hairline)' }}
              aria-label={t('logout')}
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">{t('logout')}</span>
            </button>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Nav */}
        <aside className="w-64 border-r hidden md:flex flex-col gap-2 p-4" style={{ borderColor: 'var(--border-hairline)', backgroundColor: 'var(--surface-card)' }}>
          <NavButton 
            icon={<Home size={20} />} 
            label="Home" 
            isActive={currentRoute === 'home'} 
            onClick={() => onNavigate('home')} 
          />
          <NavButton 
            icon={<Activity size={20} />} 
            label={t('tabTriage')} 
            isActive={currentRoute === 'dashboard'} 
            onClick={() => onNavigate('dashboard')} 
          />
          <NavButton 
            icon={<Users size={20} />} 
            label={t('familyPortal')} 
            isActive={currentRoute === 'family'} 
            onClick={() => onNavigate('family')} 
          />
          <NavButton 
            icon={<Activity size={20} />} 
            label={t('patientCareHub')} 
            isActive={currentRoute === 'patient'} 
            onClick={() => onNavigate('patient')} 
          />
          <div className="mt-auto">
            <NavButton 
              icon={<Settings size={20} />} 
              label={t('settings')} 
              isActive={currentRoute === 'settings'} 
              onClick={() => onNavigate('settings')} 
            />
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8" style={{ backgroundColor: 'var(--surface-page)' }}>
          {children}
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden flex items-center justify-around p-2 border-t" style={{ borderColor: 'var(--border-hairline)', backgroundColor: 'var(--surface-card)' }}>
        <MobileNavButton icon={<Home size={24} />} isActive={currentRoute === 'dashboard'} onClick={() => onNavigate('dashboard')} ariaLabel={t('tabTriage')} />
        <MobileNavButton icon={<Users size={24} />} isActive={currentRoute === 'family'} onClick={() => onNavigate('family')} ariaLabel={t('familyPortal')} />
        <MobileNavButton icon={<Activity size={24} />} isActive={currentRoute === 'patient'} onClick={() => onNavigate('patient')} ariaLabel={t('patientCareHub')} />
        <MobileNavButton icon={<Settings size={24} />} isActive={currentRoute === 'settings'} onClick={() => onNavigate('settings')} ariaLabel={t('settings')} />
      </div>
    </div>
  );
}

function NavButton({ icon, label, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-3 rounded-btn font-semibold text-left transition-colors cursor-pointer"
      style={{ 
        minHeight: '48px',
        backgroundColor: isActive ? 'var(--color-bamboo-light)' : 'transparent',
        color: isActive ? 'var(--color-bamboo)' : 'var(--ink-secondary)',
      }}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function MobileNavButton({ icon, isActive, onClick, ariaLabel }) {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className="p-3 rounded-btn flex items-center justify-center transition-colors cursor-pointer"
      style={{ 
        minHeight: '48px', minWidth: '48px',
        color: isActive ? 'var(--color-bamboo)' : 'var(--ink-secondary)',
        backgroundColor: isActive ? 'var(--color-bamboo-light)' : 'transparent'
      }}
    >
      {icon}
    </button>
  );
}
