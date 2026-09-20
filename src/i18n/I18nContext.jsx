import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { TRANSLATIONS, SUPPORTED_LANGUAGES } from './translations.js';
import { getSetting, setSetting } from '../db/indexedDb.js';

const SETTINGS_KEY = 'neurosetu.settings.language';

// Helper to get initial language synchronously from localStorage
function getInitialLanguage() {
  if (typeof window === 'undefined') return 'en';
  try {
    const cached = localStorage.getItem(SETTINGS_KEY);
    if (cached && SUPPORTED_LANGUAGES.some(l => l.code === cached)) {
      return cached;
    }
  } catch (e) {
    console.error('Error reading language from localStorage:', e);
  }
  return 'en';
}

// Map language code to script type for font stack assignment
export function getScriptForLanguage(langCode) {
  const found = SUPPORTED_LANGUAGES.find(l => l.code === langCode);
  return found?.script || 'latin';
}

// Global accessor for non-React services (e.g. speech / audio services)
let globalCurrentLanguage = getInitialLanguage();

export function getCurrentLanguage() {
  return globalCurrentLanguage;
}

// Apply document attributes and script font classes immediately
export function applyDocumentLanguage(langCode) {
  if (typeof document === 'undefined') return;
  globalCurrentLanguage = langCode;
  
  const root = document.documentElement;
  const body = document.body;
  const script = getScriptForLanguage(langCode);

  root.lang = langCode;
  root.dir = 'ltr';

  // Update font family classes
  root.classList.remove('script-bengali', 'script-devanagari', 'script-latin');
  root.classList.add(`script-${script}`);

  // Set CSS font variables dynamically on :root
  if (script === 'bengali') {
    root.style.setProperty('--font-current', 'var(--font-indic-bengali)');
    if (body) body.style.fontFamily = 'var(--font-indic-bengali), var(--font-sans)';
  } else if (script === 'devanagari') {
    root.style.setProperty('--font-current', 'var(--font-indic-devanagari)');
    if (body) body.style.fontFamily = 'var(--font-indic-devanagari), var(--font-sans)';
  } else {
    root.style.setProperty('--font-current', 'var(--font-sans)');
    if (body) body.style.fontFamily = 'var(--font-sans)';
  }
}

// Run once immediately on file evaluation to prevent any flash of wrong font/language
applyDocumentLanguage(getInitialLanguage());

export const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [language, setLanguageState] = useState(getInitialLanguage);
  const [isReady, setIsReady] = useState(false);

  // Hydrate from IndexedDB on initial mount
  useEffect(() => {
    let mounted = true;
    async function hydrateLanguage() {
      try {
        const idbLang = await getSetting(SETTINGS_KEY);
        if (mounted && idbLang && SUPPORTED_LANGUAGES.some(l => l.code === idbLang)) {
          if (idbLang !== language) {
            setLanguageState(idbLang);
            applyDocumentLanguage(idbLang);
            try {
              localStorage.setItem(SETTINGS_KEY, idbLang);
            } catch (e) {}
          }
        }
      } catch (e) {
        console.error('Error hydrating language from IndexedDB:', e);
      } finally {
        if (mounted) setIsReady(true);
      }
    }
    hydrateLanguage();
    return () => { mounted = false; };
  }, []);

  // Update language across state, localStorage, IndexedDB, and document attributes
  const setLanguage = useCallback((newLang) => {
    if (!newLang || !SUPPORTED_LANGUAGES.some(l => l.code === newLang)) {
      console.warn(`[i18n] Unsupported language code: "${newLang}"`);
      return;
    }

    setLanguageState(newLang);
    applyDocumentLanguage(newLang);

    // Synchronous local cache
    try {
      localStorage.setItem(SETTINGS_KEY, newLang);
    } catch (e) {}

    // Persistent IndexedDB write
    setSetting(SETTINGS_KEY, newLang).catch(err => {
      console.error('Failed to persist language in IndexedDB:', err);
    });

    // Notify window event listeners (audio services, telemetry, etc.)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('neurosetu:language-changed', { detail: { language: newLang } }));
    }
  }, []);

  // Translation function with dev warning & fallback
  const t = useCallback((key, params = {}) => {
    if (!key) return '';

    const langDict = TRANSLATIONS[language] || {};
    const enDict = TRANSLATIONS['en'] || {};

    let translation = langDict[key];

    if (translation === undefined) {
      translation = enDict[key];
      if (translation === undefined) {
        if (import.meta.env && import.meta.env.DEV) {
          console.warn(`[i18n] Missing translation for key: "${key}" in language: "${language}"`);
        }
        return key;
      }
    }

    // Interpolate params: e.g. {year} -> 2026
    if (typeof translation === 'string' && Object.keys(params).length > 0) {
      return Object.entries(params).reduce((str, [paramKey, paramVal]) => {
        return str.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramVal));
      }, translation);
    }

    return translation;
  }, [language]);

  // Locale-aware formatting helpers
  const getLocaleString = useCallback(() => {
    const found = SUPPORTED_LANGUAGES.find(l => l.code === language);
    return found?.speechLocale || 'en-IN';
  }, [language]);

  const formatDate = useCallback((date, options = {}) => {
    try {
      const d = date instanceof Date ? date : new Date(date);
      return new Intl.DateTimeFormat(getLocaleString(), {
        dateStyle: options.dateStyle || 'medium',
        ...options
      }).format(d);
    } catch (e) {
      return String(date);
    }
  }, [getLocaleString]);

  const formatTime = useCallback((date, options = {}) => {
    try {
      const d = date instanceof Date ? date : new Date(date);
      return new Intl.DateTimeFormat(getLocaleString(), {
        timeStyle: options.timeStyle || 'short',
        ...options
      }).format(d);
    } catch (e) {
      return String(date);
    }
  }, [getLocaleString]);

  const formatNumber = useCallback((num, options = {}) => {
    try {
      return new Intl.NumberFormat(getLocaleString(), options).format(num);
    } catch (e) {
      return String(num);
    }
  }, [getLocaleString]);

  const currentLanguageObj = SUPPORTED_LANGUAGES.find(l => l.code === language) || SUPPORTED_LANGUAGES[0];

  const value = {
    language,
    setLanguage,
    t,
    currentLanguageObj,
    supportedLanguages: SUPPORTED_LANGUAGES,
    isReady,
    formatDate,
    formatTime,
    formatNumber
  };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    // Graceful fallback for standalone component testing without full provider tree
    const defaultLang = getCurrentLanguage() || 'en';
    const fallbackT = (key, fallbackText) => {
      const dict = TRANSLATIONS[defaultLang] || TRANSLATIONS['en'];
      return dict[key] || TRANSLATIONS['en']?.[key] || fallbackText || key;
    };
    return {
      language: defaultLang,
      setLanguage: () => {},
      t: fallbackT,
      currentLanguageObj: SUPPORTED_LANGUAGES.find(l => l.code === defaultLang) || SUPPORTED_LANGUAGES[0],
      supportedLanguages: SUPPORTED_LANGUAGES,
      isReady: true,
      formatDate: (date, options = {}) => {
        try {
          const d = date instanceof Date ? date : new Date(date);
          const speechLocale = SUPPORTED_LANGUAGES.find(l => l.code === defaultLang)?.speechLocale || 'en-IN';
          return new Intl.DateTimeFormat(speechLocale, { dateStyle: options.dateStyle || 'medium', ...options }).format(d);
        } catch (e) {
          return String(date);
        }
      },
      formatTime: (date, options = {}) => {
        try {
          const d = date instanceof Date ? date : new Date(date);
          const speechLocale = SUPPORTED_LANGUAGES.find(l => l.code === defaultLang)?.speechLocale || 'en-IN';
          return new Intl.DateTimeFormat(speechLocale, { timeStyle: options.timeStyle || 'short', ...options }).format(d);
        } catch (e) {
          return String(date);
        }
      },
      formatNumber: (num) => String(num)
    };
  }
  return context;
}

