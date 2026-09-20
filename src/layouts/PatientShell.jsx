import React, { useState, useEffect, useRef } from 'react';
import { Home, Phone, Volume2 } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext.jsx';

// A simple hook for text size preferences
const useTextSizePreference = () => {
  const [textSizeMultiplier, setTextSizeMultiplier] = useState(() => {
    try {
      const saved = localStorage.getItem('neurosetu_text_size');
      return saved ? parseFloat(saved) : 1;
    } catch (e) {
      return 1;
    }
  });

  const setSize = (size) => {
    setTextSizeMultiplier(size);
    try {
      localStorage.setItem('neurosetu_text_size', String(size));
    } catch (e) {}
  };
  
  return [textSizeMultiplier, setSize];
};

export default function PatientShell({
  children,
  profileName,
  onLogout,
  onOpenSos,
  onNavigateHome,
  onAudioHelp
}) {
  const { t } = useI18n();
  const [textSizeMultiplier, setTextSizePreference] = useTextSizePreference();
  const [isPressingHome, setIsPressingHome] = useState(false);
  const pressTimer = useRef(null);

  const handleHomePressStart = () => {
    setIsPressingHome(true);
    pressTimer.current = setTimeout(() => {
      setIsPressingHome(false);
      if (onLogout) onLogout(); // Triggers the PIN exit
    }, 3000); // 3s long press
  };

  const handleHomePressEnd = () => {
    if (pressTimer.current) clearTimeout(pressTimer.current);
    if (isPressingHome) {
      setIsPressingHome(false);
      if (onNavigateHome) onNavigateHome();
    }
  };

  // Base font size calculations
  const baseFontSize = 26 * textSizeMultiplier;
  
  return (
    <div className="min-h-screen flex flex-col font-sans" style={{ backgroundColor: 'var(--surface-page)', color: 'var(--ink-primary)' }}>
      {/* 
        NO standard nav bar. Only persistent Home, Text size, Audio help, and SOS
      */}
      <header className="px-6 py-4 flex items-center justify-between border-b shadow-flat" style={{ borderColor: 'var(--border-hairline)', backgroundColor: 'var(--surface-card)' }}>
        
        {/* Kiosk Exit / Home Button */}
        <button
          onMouseDown={handleHomePressStart}
          onMouseUp={handleHomePressEnd}
          onMouseLeave={handleHomePressEnd}
          onTouchStart={handleHomePressStart}
          onTouchEnd={handleHomePressEnd}
          className="flex items-center gap-4 px-6 py-4 rounded-btn transition-colors relative cursor-pointer"
          style={{ 
            minHeight: '80px', 
            minWidth: '80px',
            backgroundColor: isPressingHome ? 'var(--color-bamboo-light)' : 'var(--surface-sunken)',
            color: 'var(--ink-primary)',
            border: '2px solid var(--border-hairline)'
          }}
          aria-label={`${t('home')} (${t('cancel')})`}
        >
          <Home size={36} color="var(--color-bamboo)" />
          <span style={{ fontSize: `${20 * textSizeMultiplier}px`, fontWeight: 700 }}>
            {t('home')}
          </span>
        </button>

        <div className="flex items-center gap-4">
          {/* Text Size Control */}
          <button
            type="button"
            onClick={() => setTextSizePreference(textSizeMultiplier >= 1.5 ? 1 : textSizeMultiplier + 0.25)}
            className="flex items-center justify-center rounded-btn cursor-pointer shadow-flat"
            style={{ 
              minHeight: '80px', 
              minWidth: '80px',
              backgroundColor: 'var(--surface-sunken)',
              border: '2px solid var(--border-hairline)',
              fontSize: '24px',
              fontWeight: 700,
              color: 'var(--ink-primary)'
            }}
            aria-label={t('textSize')}
          >
            Aa
          </button>

          {/* Audio Help */}
          {onAudioHelp && (
            <button
              type="button"
              onClick={onAudioHelp}
              className="flex items-center gap-3 px-6 py-4 rounded-btn cursor-pointer shadow-flat"
              style={{ 
                minHeight: '80px',
                backgroundColor: 'var(--color-muga)',
                color: 'var(--ink-primary)',
                fontWeight: 700,
                fontSize: `${20 * textSizeMultiplier}px`
              }}
              aria-label={t('audioHelp')}
            >
              <Volume2 size={32} />
              <span>{t('help')}</span>
            </button>
          )}

          {/* Emergency SOS */}
          {onOpenSos && (
            <button
              type="button"
              onClick={onOpenSos}
              className="flex items-center gap-3 px-6 py-4 rounded-btn cursor-pointer shadow-flat"
              style={{ 
                minHeight: '80px',
                backgroundColor: 'var(--color-gamosa-red)',
                color: 'white',
                fontWeight: 700,
                fontSize: `${20 * textSizeMultiplier}px`
              }}
              aria-label="Emergency Assistance SOS"
            >
              <Phone size={32} />
              <span>{t('sos')}</span>
            </button>
          )}
        </div>
      </header>
      
      {/* Kingkhap Motif Strip (6-8px) */}
      <div 
        className="w-full h-2" 
        style={{ 
          backgroundImage: 'url(/assets/motifs/kingkhap.svg)', 
          backgroundRepeat: 'repeat-x',
          backgroundSize: 'contain'
        }} 
      />

      {/* Main Content Area */}
      <main 
        className="flex-1 w-full max-w-4xl mx-auto p-6 sm:p-8"
        style={{ fontSize: `${baseFontSize}px` }}
      >
        {children}
      </main>
    </div>
  );
}
