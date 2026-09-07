import React from 'react';
import { ROLES } from '../../services/authService.js';

export const ROLE_DEFINITIONS = [
  {
    id: ROLES.PATIENT,
    titleEn: 'Patient',
    titleAs: 'ৰোগী (Patient)',
    icon: '🧓',
    descriptionEn: 'Culturally grounded cognitive games, reminiscence therapy & daily routine assistance.',
    descriptionAs: 'সাংস্কৃতিক স্মৃতি খেল আৰু দৈনন্দিন সহায়।',
    badge: 'WCAG 2.1 AA • Voice-First',
    colorScheme: {
      border: 'border-teal-200',
      activeBorder: 'border-teal-600',
      activeBg: 'bg-teal-50/70',
      iconBg: 'bg-teal-50 text-teal-700 border-teal-100',
      badgeBg: 'bg-teal-50 text-teal-700 border-teal-200'
    }
  },
  {
    id: ROLES.CAREGIVER,
    titleEn: 'Family Caregiver',
    titleAs: 'শুশ্ৰূষাকাৰী (Family Caregiver)',
    icon: '🏡',
    descriptionEn: 'Passive cognitive decline monitoring, trend charts & caregiver alert notifications.',
    descriptionAs: 'জ্ঞানীয় প্ৰগতিৰ খতিয়ান আৰু সতৰ্কবাণী নিৰীক্ষণ।',
    badge: 'Monitoring & Alerts',
    colorScheme: {
      border: 'border-indigo-200',
      activeBorder: 'border-indigo-600',
      activeBg: 'bg-indigo-50/70',
      iconBg: 'bg-indigo-50 text-indigo-700 border-indigo-100',
      badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200'
    }
  },
  {
    id: ROLES.ASHA_WORKER,
    titleEn: 'ASHA Worker',
    titleAs: 'আশা কৰ্মী (ASHA Worker)',
    icon: '🩺',
    descriptionEn: 'Community triage list, home-visit telemetry sync & clinical intervention routing.',
    descriptionAs: 'সামূহিক ৰোগী তালিকা আৰু অফলাইন তথ্য ছিংক।',
    badge: 'Triage & Sync',
    colorScheme: {
      border: 'border-emerald-200',
      activeBorder: 'border-emerald-600',
      activeBg: 'bg-emerald-50/70',
      iconBg: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    }
  }
];

export default function RoleSelector({
  isOpen = true,
  onSelectRole,
  onClose = null,
  selectedRole = null,
  language = 'en'
}) {
  if (!isOpen) return null;

  const isEn = language === 'en';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="role-selector-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in"
    >
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-soft-xl border border-slate-200/80 text-center animate-slide-up space-y-5">
        {/* Header */}
        <div>
          <div className="w-12 h-12 bg-teal-50 text-teal-700 rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl font-bold border border-teal-100/80 shadow-xs">
            👥
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-100">
            {isEn ? 'Portal Authentication' : 'প্ৰৱেশ দ্বাৰ (Portal Access)'}
          </span>
          <h2 id="role-selector-title" className="text-xl font-bold tracking-tight text-slate-900 mt-2">
            {isEn ? 'Select Your Role' : 'আপোনাৰ ভূমিকা বাছক (Select Role)'}
          </h2>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            {isEn
              ? 'Choose your profile role to unlock with your role-specific PIN.'
              : 'সুৰক্ষিত পিন ব্যৱহাৰৰ বাবে আপোনাৰ ভূমিকা নিৰ্বাচন কৰক।'}
          </p>
        </div>

        {/* 3 Tappable Role Cards (each >=44px touch target) */}
        <div className="space-y-3" role="group" aria-label="Available Roles">
          {ROLE_DEFINITIONS.map((role) => {
            const isSelected = selectedRole === role.id;
            const title = isEn ? role.titleEn : role.titleAs;
            const desc = isEn ? role.descriptionEn : role.descriptionAs;

            return (
              <button
                key={role.id}
                type="button"
                data-testid={`role-card-${role.id}`}
                aria-label={`${title} - ${desc}`}
                onClick={() => onSelectRole && onSelectRole(role.id)}
                className={`w-full min-h-[64px] min-h-touch p-4 rounded-2xl border-2 text-left transition-all active:scale-[0.98] flex items-center gap-3.5 focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none cursor-pointer ${
                  isSelected
                    ? `${role.colorScheme.activeBorder} ${role.colorScheme.activeBg} shadow-soft`
                    : 'border-slate-200/80 hover:border-teal-300 hover:bg-slate-50/70 bg-white shadow-soft'
                }`}
              >
                {/* Visual Icon Tile */}
                <div
                  className={`w-12 h-12 min-w-touch min-h-touch rounded-2xl border flex items-center justify-center text-2xl shrink-0 shadow-xs ${role.colorScheme.iconBg}`}
                >
                  <span role="img" aria-hidden="true">{role.icon}</span>
                </div>

                {/* Role Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold text-slate-900 text-sm tracking-tight">
                      {title}
                    </h3>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${role.colorScheme.badgeBg}`}
                    >
                      {role.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 leading-snug line-clamp-2 font-normal">
                    {desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Optional Cancel/Dismiss button */}
        {onClose && (
          <div className="pt-3 border-t border-slate-100 flex justify-center">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-2 px-4 py-2 min-h-[48px] bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 hover:text-slate-900 border border-slate-300 rounded-xl text-sm font-bold shadow-xs transition cursor-pointer"
              aria-label={isEn ? 'Cancel' : 'বাতিল কৰক (Cancel)'}
            >
              <span className="text-lg leading-none">←</span>
              <span>{isEn ? 'Cancel' : 'বাতিল কৰক (Cancel)'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
