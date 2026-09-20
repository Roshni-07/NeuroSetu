import React from 'react';
import { User, Users, Stethoscope, X } from 'lucide-react';
import { ROLES } from '../../services/authService.js';
import { useI18n } from '../../i18n/I18nContext.jsx';
import LanguageSwitcher from '../LanguageSwitcher.jsx';

export default function RoleSelector({
  isOpen = true,
  onSelectRole,
  onClose = null,
  selectedRole = null
}) {
  const { t } = useI18n();

  if (!isOpen) return null;

  const roles = [
    {
      id: ROLES.PATIENT,
      title: t('rolePatient'),
      desc: t('rolePatientDesc'),
      icon: <User size={28} color="var(--color-bamboo)" />,
      badge: 'Voice-First'
    },
    {
      id: ROLES.CAREGIVER,
      title: t('roleCaregiver'),
      desc: t('roleCaregiverDesc'),
      icon: <Users size={28} color="var(--color-muga-dark)" />,
      badge: 'Family Portal'
    },
    {
      id: ROLES.ASHA_WORKER,
      title: t('roleAsha'),
      desc: t('roleAshaDesc'),
      icon: <Stethoscope size={28} color="var(--color-bamboo)" />,
      badge: 'ASHA Clinical'
    }
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="role-selector-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink-primary)' }}
    >
      <div 
        className="w-full max-w-lg rounded-card p-6 sm:p-8 shadow-flat border space-y-6"
        style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--border-hairline)' }}
      >
        {/* Header with Language Switcher */}
        <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: 'var(--border-hairline)' }}>
          <div>
            <h2 id="role-selector-title" className="text-2xl font-bold tracking-tight">
              {t('selectYourRole')}
            </h2>
            <p className="text-sm font-medium mt-0.5" style={{ color: 'var(--ink-secondary)' }}>
              {t('authPromptPatient')}
            </p>
          </div>
          <LanguageSwitcher variant="clinical" placement="header" />
        </div>

        {/* 3 Tappable Role Cards */}
        <div className="space-y-3" role="group" aria-label={t('selectYourRole')}>
          {roles.map((role) => {
            const isSelected = selectedRole === role.id;

            return (
              <button
                key={role.id}
                type="button"
                data-testid={`role-card-${role.id}`}
                aria-label={`${role.title} - ${role.desc}`}
                onClick={() => onSelectRole && onSelectRole(role.id)}
                className="w-full min-h-[64px] p-4 rounded-card border-2 text-left transition-transform active:scale-[0.98] flex items-center gap-4 cursor-pointer focus:outline-none focus:ring-4"
                style={{
                  minHeight: '80px',
                  backgroundColor: isSelected ? 'var(--color-bamboo-light)' : 'var(--surface-page)',
                  borderColor: isSelected ? 'var(--color-bamboo)' : 'var(--border-hairline)'
                }}
              >
                {/* Visual Icon Tile */}
                <div
                  className="w-14 h-14 rounded-btn flex items-center justify-center shrink-0 border"
                  style={{ 
                    backgroundColor: 'var(--surface-card)', 
                    borderColor: 'var(--border-hairline)',
                    minHeight: '48px',
                    minWidth: '48px'
                  }}
                >
                  {role.icon}
                </div>

                {/* Role Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold text-base md:text-lg tracking-tight" style={{ color: 'var(--ink-primary)' }}>
                      {role.title}
                    </h3>
                    <span
                      className="text-xs font-semibold px-2.5 py-0.5 rounded-pill border shrink-0"
                      style={{ 
                        backgroundColor: 'var(--surface-card)', 
                        borderColor: 'var(--border-hairline)',
                        color: 'var(--ink-secondary)'
                      }}
                    >
                      {role.badge}
                    </span>
                  </div>
                  <p className="text-xs mt-1 leading-snug line-clamp-2" style={{ color: 'var(--ink-secondary)' }}>
                    {role.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Cancel Button */}
        {onClose && (
          <div className="pt-2 border-t flex justify-end" style={{ borderColor: 'var(--border-hairline)' }}>
            <button
              type="button"
              onClick={onClose}
              className="min-h-[48px] px-6 py-3 rounded-btn text-sm font-bold border border-slate-300 shadow-flat transition-colors hover:bg-slate-50 cursor-pointer flex items-center gap-2"
              style={{
                minHeight: '48px',
                backgroundColor: 'var(--surface-card)',
                borderColor: 'var(--border-hairline)',
                color: 'var(--ink-secondary)'
              }}
            >
              <span>←</span>
              <span>{t('cancel')}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
