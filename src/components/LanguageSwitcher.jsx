import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext.jsx';

/**
 * Reusable LanguageSwitcher Component
 * 
 * @param {Object} props
 * @param {'clinical' | 'patient'} [props.variant='clinical']
 * @param {'header' | 'inline'} [props.placement='header']
 * @param {string} [props.className='']
 * @param {Function} [props.onSelect] Optional callback when language is selected
 */
export default function LanguageSwitcher({
  variant = 'clinical',
  placement = 'header',
  className = '',
  onSelect
}) {
  const { language, setLanguage, supportedLanguages, currentLanguageObj, t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelectLanguage = (code) => {
    setLanguage(code);
    setIsOpen(false);
    if (onSelect) onSelect(code);
  };

  // PATIENT VARIANT: 80px large tappable cards in native script, never a select element
  if (variant === 'patient') {
    return (
      <div className={`space-y-4 ${className}`} data-testid="patient-language-picker">
        <label className="block text-xl font-bold" style={{ color: 'var(--ink-primary)' }}>
          {t('selectLanguage')}
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {supportedLanguages.map((lang) => {
            const isSelected = language === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleSelectLanguage(lang.code)}
                aria-pressed={isSelected}
                className="flex items-center justify-between p-4 rounded-card border-2 transition-transform active:scale-95 text-left cursor-pointer focus:outline-none focus:ring-4"
                style={{
                  minHeight: '80px',
                  backgroundColor: isSelected ? 'var(--color-bamboo-light)' : 'var(--surface-card)',
                  borderColor: isSelected ? 'var(--color-bamboo)' : 'var(--border-hairline)',
                  color: 'var(--ink-primary)'
                }}
              >
                <div>
                  <div className="text-2xl font-bold leading-tight">
                    {lang.nativeName}
                  </div>
                  <div className="text-sm font-medium mt-0.5" style={{ color: 'var(--ink-secondary)' }}>
                    {lang.label}
                  </div>
                </div>
                {isSelected && (
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: 'var(--color-bamboo)' }}>
                    <Check size={20} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // CLINICAL VARIANT: Standard 48px dropdown, globe icon, native script first
  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef} data-testid="clinical-language-switcher">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`${t('changeLanguage')}: ${currentLanguageObj.nativeName}`}
        className="flex items-center gap-2.5 px-3.5 py-2 rounded-btn font-semibold text-sm border shadow-flat transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2"
        style={{
          minHeight: '48px',
          minWidth: '140px',
          backgroundColor: 'var(--surface-card)',
          borderColor: 'var(--border-hairline)',
          color: 'var(--ink-primary)'
        }}
      >
        <Globe size={18} color="var(--color-bamboo)" className="shrink-0" />
        <span className="font-bold truncate text-base">
          {currentLanguageObj.nativeName}
        </span>
        <ChevronDown size={16} className={`ml-auto transition-transform ${isOpen ? 'rotate-180' : ''}`} style={{ color: 'var(--ink-secondary)' }} />
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label={t('selectLanguage')}
          className="absolute right-0 mt-1.5 w-64 rounded-card border shadow-flat z-50 p-1.5 max-h-80 overflow-y-auto"
          style={{
            backgroundColor: 'var(--surface-card)',
            borderColor: 'var(--border-hairline)'
          }}
        >
          <div className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider border-b mb-1" style={{ color: 'var(--ink-secondary)', borderColor: 'var(--border-hairline)' }}>
            {t('selectLanguage')}
          </div>
          {supportedLanguages.map((lang) => {
            const isSelected = language === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelectLanguage(lang.code)}
                className="w-full text-left px-3 py-2.5 rounded-btn flex items-center justify-between transition-colors focus:outline-none cursor-pointer"
                style={{
                  minHeight: '48px',
                  backgroundColor: isSelected ? 'var(--color-bamboo-light)' : 'transparent',
                  color: 'var(--ink-primary)'
                }}
              >
                <div>
                  <div className="text-base font-bold leading-tight">
                    {lang.nativeName}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--ink-secondary)' }}>
                    {lang.label}
                  </div>
                </div>
                {isSelected && (
                  <Check size={18} color="var(--color-bamboo)" className="shrink-0 font-bold" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
