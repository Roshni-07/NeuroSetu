import React, { useState, useEffect } from 'react';
import { Play, Activity, Users, Phone, Heart, Menu, X, CheckCircle2, Volume2, WifiOff, Compass, BarChart3 } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext.jsx';
import LanguageSwitcher from '../components/LanguageSwitcher.jsx';

const LANDING_COPY = {
  en: {
    badge: 'Culturally Grounded Cognitive Healthcare for North East India',
    headline: 'Cognitive Games That Speak Your Language.',
    lead: 'Memory care in your own language. Culturally rooted reminiscence therapy and passive digital biomarker care for North East India. Evidence-based cognitive stimulation designed with dementia-gentle feedback.',
    launchPatient: 'Launch Patient Experience',
    selectRole: 'Select Role & Log In',
    viewDashboard: 'View ASHA Triage Dashboard',
    enterPin: '🔑 Enter Profile PIN',
    gameSuite: '🌾 Game Suite (15 Games)',
    profileSetup: 'Profile Setup',
    ashaClinical: 'ASHA Clinical (ASHA / Caregiver Dashboard)',
    patientUi: 'Patient UI',
    home: 'NeuroSetu Home'
  },
  as: {
    badge: 'উত্তৰ-পূৰ্বাঞ্চলৰ বাবে সাংস্কৃতিকভাৱে আধাৰিত ডিমেনচিয়া স্বাস্থ্য সেৱা',
    headline: 'ঘৰুৱা চিনাকি পৰিৱেশত স্মৃতিৰ সেঁতু।',
    lead: 'অসম আৰু উত্তৰ-পূৰ্বাঞ্চলৰ লোকসকলৰ বাবে স্মৃতি উদ্দীপনা আৰু নিষ্ক্ৰিয় বায়’মাৰ্কাৰ যত্ন। ঘৰুৱা সাংস্কৃতিক পৰিৱেশত নিৰ্ভয়ে খেলক।',
    launchPatient: 'ৰোগীৰ খেল আৰম্ভ কৰক',
    selectRole: 'ভূমিকা বাছক আৰু প্ৰৱেশ কৰক',
    viewDashboard: 'আশা ক্লিনিকেন্স ডেচবৰ্ড চাওক',
    enterPin: '🔑 প্ৰফাইল পিন দিয়ক',
    gameSuite: '🌾 খেলৰ সম্ভাৰ (১৫টা খেল)',
    profileSetup: 'প্ৰফাইল ছেটিংছ',
    ashaClinical: 'আশা ক্লিনিকেন্স (ASHA / Caregiver Dashboard)',
    patientUi: 'ৰোগীৰ খেল (Patient UI)',
    home: 'নিওৰোসেতু ঘৰ'
  },
  bn: {
    badge: 'উত্তর-পূর্ব ভারতের জন্য ঐতিহ্য ও সংস্কৃতি নির্ভর ডিমেনশিয়া যত্ন',
    headline: 'আপনার পরিচিত পরিবেশে স্মৃতির সেতুবন্ধন।',
    lead: 'উত্তর-পূর্ব ভারতের জন্য নিজস্ব ভাষায় স্মৃতি উদ্দীপনা ও ডিজিটাল বায়োমার্কার যত্ন। পরিচিত পারিবারিক পরিবেশে নির্ভয়ে খেলুন।',
    launchPatient: 'রোগীর খেলা শুরু করুন',
    selectRole: 'ভূমিকা বেছে নিয়ে লগ ইন করুন',
    viewDashboard: 'আশা ক্লিনিকাল ড্যাশবোর্ড দেখুন',
    enterPin: '🔑 প্রোফাইল পিন দিন',
    gameSuite: '🌾 গেম স্যুট (১৫টি গেম)',
    profileSetup: 'প্রোফাইল সেটআপ',
    ashaClinical: 'আশা ক্লিনিকাল (ASHA / Caregiver Dashboard)',
    patientUi: 'রোগীর অভিজ্ঞতা (Patient UI)',
    home: 'নিউরোসেতু হোম'
  },
  hi: {
    badge: 'पूर्वोत्तर भारत के लिए सांस्कृतिक रूप से समर्थित डिमेंशिया देखभाल',
    headline: 'अपनी जानी-पहचानी भाषा और माहौल में स्मृति की देखभाल।',
    lead: 'पूर्वोत्तर भारत के लिए अपनी भाषा में स्मृति उत्तेजना और बायोमार्कर देखभाल। घरेलू सांस्कृतिक माहौल में सहजता से खेलें।',
    launchPatient: 'मरीज का खेल शुरू करें',
    selectRole: 'भूमिका चुनें और लॉग इन करें',
    viewDashboard: 'आशा क्लिनिकल डैशबोर्ड देखें',
    enterPin: '🔑 प्रोफाइल पिन दर्ज करें',
    gameSuite: '🌾 गेम सुइट (15 गेम्स)',
    profileSetup: 'प्रोफाइल सेटअप',
    ashaClinical: 'आशा क्लिनिकल (ASHA / Caregiver Dashboard)',
    patientUi: 'मरीज इंटरफेस (Patient UI)',
    home: 'न्यूरोसेतु होम'
  },
  mni: {
    badge: 'অৱাং-নোংপোক ভারতকী নাৎকা মরী লৈনবা ডিমেনসিয়া লায়েং',
    headline: 'নহাক্কী মশাগী লোলদা নিংশিং য়েংশিনবা।',
    lead: 'অৱাং-নোংপোক ভারতকী লোলদা নিংশিং থৌওং অমসুং য়েংশিনবা।',
    launchPatient: 'অনাবগী শান্নবা হৌবা',
    selectRole: 'থৌদাং খনবা অমসুং চঙবা',
    viewDashboard: 'আশা ক্লিনিক্যাল দেশবোর্ড য়েংবা',
    enterPin: '🔑 প্রোফাইল পিন চঙহনবা',
    gameSuite: '🌾 শান্নবা মখল (১৫)',
    profileSetup: 'প্রোফাইল শেম্বা',
    ashaClinical: 'আশা ক্লিনিক্যাল (ASHA / Caregiver Dashboard)',
    patientUi: 'অনাবগী শান্নবা (Patient UI)',
    home: 'নিউরোসেতু য়ুম'
  },
  lus: {
    badge: 'North East India tana hnam zia nena inmil Dementia Enkawlna',
    headline: 'Mahni ṭawng ngeia hriatrengna enkawlna.',
    lead: 'North East India tana mahni ṭawng ngeia hriatrengna tihhmasawnna leh enkawlna.',
    launchPatient: 'Damlotu Game Ṭan Rawh',
    selectRole: 'Role Thlang la Lut Rawh',
    viewDashboard: 'ASHA Dashboard En Rawh',
    enterPin: '🔑 Profile PIN Chhu Lut Rawh',
    gameSuite: '🌾 Game Suite (15 Games)',
    profileSetup: 'Profile Setup',
    ashaClinical: 'ASHA Clinical (ASHA / Caregiver Dashboard)',
    patientUi: 'Damlotu UI (Patient UI)',
    home: 'NeuroSetu Inpui'
  },
  kha: {
    badge: 'Ka jingsumar Dementia kaba iahap bad ka tynrai na ka bynta ka North East',
    headline: 'Ka jingriewspah kaba kren ha ka ktien jong phi.',
    lead: 'Ka jinghikai ban kynmaw ha ka ktien jong phi na ka bynta ka North East.',
    launchPatient: 'Sdang ia ka Ktien Kynmaw',
    selectRole: 'Jied ia ka Bynta & Log In',
    viewDashboard: 'Peit ia ka ASHA Dashboard',
    enterPin: '🔑 Thep ia ka PIN',
    gameSuite: '🌾 Game Suite (15 Games)',
    profileSetup: 'Profile Setup',
    ashaClinical: 'ASHA Clinical (ASHA / Caregiver Dashboard)',
    patientUi: 'Patient UI',
    home: 'NeuroSetu Home'
  },
  grt: {
    badge: 'North East-na dingtangmancha tari·gimin Dementia Sanani',
    headline: 'An·tangni ku·siko gisik ra·aniko sandiani.',
    lead: 'North East-na an·tang ku·siko gisik ra·aniko bilakatani aro sanna.',
    launchPatient: 'Sagipani Kal·aniko A·bachenggibo',
    selectRole: 'Kamko Seoke Log In Ka·bo',
    viewDashboard: 'ASHA Dashboard-ko Nibos',
    enterPin: '🔑 Profile PIN-ko On·bo',
    gameSuite: '🌾 Kal·ani Suite (15 Games)',
    profileSetup: 'Profile Setup',
    ashaClinical: 'ASHA Clinical (ASHA / Caregiver Dashboard)',
    patientUi: 'Sagipani UI',
    home: 'NeuroSetu Nok'
  },
  brx: {
    badge: 'सानजा-सा भारतनि थाखाय हारिमुआरि डिमेनशिया नायदिंथि',
    headline: 'गावनि रावजों गोसोखांथि नायदिंथि।',
    lead: 'सानजा-सा भारतनि थाखाय गावनि रावजों गोसोखांथि नायदिंथि आरो हेफाफा।',
    launchPatient: 'गोगोयैनि गेलेनाय जागाय',
    selectRole: 'बिबान सायख\' आरो हाब',
    viewDashboard: 'आशा डेशबोर्ड नाय',
    enterPin: '🔑 प्र\'फाइल पिन थिसन',
    gameSuite: '🌾 गेलेनाय खन्थाइ (15)',
    profileSetup: 'प्र\'फाइल सेटअप',
    ashaClinical: 'आशा क्लिनिकेल (ASHA / Caregiver Dashboard)',
    patientUi: 'गोगोयै UI',
    home: 'निउर\'सेतु न\''
  }
};

export default function HomePage({
  initialLanguage = 'en',
  onLaunchPatient = null,
  onLaunchDashboard = null,
  onLaunchHub = null,
  onLaunchFamilyGames = null,
  onOpenSetup = null,
  onOpenRoleSelector = null,
  onEnterPin = null,
  onLanguageChange = null
}) {
  const { t, language, setLanguage } = useI18n();
  const [overrideLang, setOverrideLang] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const currentYear = new Date().getFullYear().toString();

  const activeLang = overrideLang || language || initialLanguage || 'en';
  const copy = LANDING_COPY[activeLang] || LANDING_COPY['en'];

  const handleLanguageToggle = (code) => {
    setOverrideLang(code);
    if (setLanguage) {
      try {
        setLanguage(code);
      } catch (e) {}
    }
    if (onLanguageChange) onLanguageChange(code);
  };

  const handleReturnHome = () => {
    window.location.hash = '#/home';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col font-sans" style={{ backgroundColor: 'var(--surface-page)', color: 'var(--ink-primary)' }}>
      {/* 1. Header (Minimal, flat with Logo, Nav links, Hamburger, and LanguageSwitcher) */}
      <header
        className="px-6 py-4 flex items-center justify-between border-b shadow-flat relative z-20"
        style={{ borderColor: 'var(--border-hairline)', backgroundColor: 'var(--surface-card)' }}
      >
        <div className="flex items-center space-x-3.5">
          <button
            type="button"
            onClick={handleReturnHome}
            aria-label="NeuroSetu Home"
            className="flex items-center space-x-3 text-left cursor-pointer bg-transparent border-none p-0 focus:outline-hidden"
          >
            <div
              className="w-11 h-11 flex items-center justify-center font-bold text-2xl rounded-btn shadow-flat"
              style={{ backgroundColor: 'var(--color-muga)', color: 'var(--ink-primary)' }}
            >
              ন
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight" style={{ color: 'var(--ink-primary)' }}>
                  NeuroSetu
                </span>
                <span
                  className="text-[11px] font-bold px-2 py-0.5 rounded-full border"
                  style={{ backgroundColor: 'var(--surface-sunken)', borderColor: 'var(--border-hairline)', color: 'var(--color-bamboo)' }}
                >
                  নিওৰোসেতু
                </span>
              </div>
              <p className="text-xs font-medium" style={{ color: 'var(--ink-secondary)' }}>
                North East Dementia Healthcare
              </p>
            </div>
          </button>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-3">
          <button
            type="button"
            onClick={onLaunchHub}
            className="px-3.5 py-2 rounded-btn text-xs font-bold border transition shadow-flat hover:bg-slate-50 cursor-pointer"
            style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--border-hairline)', color: 'var(--ink-primary)', minHeight: '44px' }}
          >
            {copy.gameSuite}
          </button>

          {onOpenSetup && (
            <button
              type="button"
              onClick={onOpenSetup}
              className="px-3.5 py-2 rounded-btn text-xs font-bold border transition shadow-flat hover:bg-slate-50 cursor-pointer"
              style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--border-hairline)', color: 'var(--ink-secondary)', minHeight: '44px' }}
            >
              {copy.profileSetup}
            </button>
          )}

          {onLaunchDashboard && (
            <button
              type="button"
              onClick={onLaunchDashboard}
              className="px-3.5 py-2 rounded-btn text-xs font-bold border transition shadow-flat hover:bg-slate-50 cursor-pointer"
              style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--border-hairline)', color: 'var(--color-bamboo)', minHeight: '44px' }}
            >
              {copy.ashaClinical}
            </button>
          )}

          <div className="flex items-center gap-1 border rounded-btn p-1" style={{ backgroundColor: 'var(--surface-sunken)', borderColor: 'var(--border-hairline)' }}>
            <button
              type="button"
              onClick={() => handleLanguageToggle('en')}
              className="px-2.5 py-1 rounded-btn text-xs font-bold transition cursor-pointer"
              style={{
                backgroundColor: activeLang === 'en' ? 'var(--surface-card)' : 'transparent',
                color: 'var(--ink-primary)',
                minHeight: '36px'
              }}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => handleLanguageToggle('as')}
              className="px-2.5 py-1 rounded-btn text-xs font-bold transition cursor-pointer"
              style={{
                backgroundColor: activeLang === 'as' ? 'var(--surface-card)' : 'transparent',
                color: 'var(--ink-primary)',
                minHeight: '36px'
              }}
            >
              অসমীয়া
            </button>
          </div>

          <LanguageSwitcher variant="clinical" placement="header" onSelect={(code) => handleLanguageToggle(code)} />
        </div>

        {/* Mobile Nav Toggle Button */}
        <div className="flex md:hidden items-center gap-2">
          <LanguageSwitcher variant="clinical" placement="header" onSelect={(code) => handleLanguageToggle(code)} />
          <button
            type="button"
            aria-label="Toggle navigation menu"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen(prev => !prev)}
            className="p-2.5 rounded-btn border shadow-flat cursor-pointer flex items-center justify-center transition"
            style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--border-hairline)', minWidth: '44px', minHeight: '44px', color: 'var(--ink-primary)' }}
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {isMenuOpen && (
        <div
          className="md:hidden border-b px-6 py-4 space-y-3 relative z-20 shadow-soft"
          style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--border-hairline)' }}
        >
          <button
            type="button"
            onClick={() => {
              setIsMenuOpen(false);
              handleReturnHome();
            }}
            className="w-full text-left py-2.5 px-3 rounded-btn text-sm font-bold transition hover:bg-slate-100"
            style={{ minHeight: '44px', color: 'var(--ink-primary)' }}
          >
            {copy.home}
          </button>

          <button
            type="button"
            onClick={() => {
              setIsMenuOpen(false);
              if (onLaunchPatient) onLaunchPatient();
              else if (onOpenRoleSelector) onOpenRoleSelector();
            }}
            className="w-full text-left py-2.5 px-3 rounded-btn text-sm font-bold transition hover:bg-slate-100"
            style={{ minHeight: '44px', color: 'var(--ink-primary)' }}
          >
            {copy.patientUi}
          </button>

          <button
            type="button"
            onClick={() => {
              setIsMenuOpen(false);
              if (onLaunchHub) onLaunchHub();
            }}
            className="w-full text-left py-2.5 px-3 rounded-btn text-sm font-bold transition hover:bg-slate-100"
            style={{ minHeight: '44px', color: 'var(--ink-primary)' }}
          >
            {copy.gameSuite}
          </button>

          {onOpenSetup && (
            <button
              type="button"
              onClick={() => {
                setIsMenuOpen(false);
                onOpenSetup();
              }}
              className="w-full text-left py-2.5 px-3 rounded-btn text-sm font-bold transition hover:bg-slate-100"
              style={{ minHeight: '44px', color: 'var(--ink-secondary)' }}
            >
              {copy.profileSetup}
            </button>
          )}

          {onLaunchDashboard && (
            <button
              type="button"
              onClick={() => {
                setIsMenuOpen(false);
                onLaunchDashboard();
              }}
              className="w-full text-left py-2.5 px-3 rounded-btn text-sm font-bold transition hover:bg-slate-100"
              style={{ minHeight: '44px', color: 'var(--color-bamboo)' }}
            >
              {copy.ashaClinical}
            </button>
          )}
        </div>
      )}

      {/* 2. Header Kingkhap Rule (6-8px Motif Strip) */}
      <div
        className="w-full h-2"
        style={{
          backgroundImage: 'url(/assets/motifs/kingkhap.svg)',
          backgroundRepeat: 'repeat-x',
          backgroundSize: 'contain'
        }}
      />

      {/* 3. Hero Section: Single-Column, Full-Width with Subtle Vertical Depth & Atmospheric Background */}
      <section
        className="relative w-full overflow-hidden flex-1 flex flex-col justify-center"
        style={{
          background: 'linear-gradient(180deg, var(--surface-page) 0%, var(--surface-page) 75%, var(--surface-sunken) 100%)'
        }}
      >
        {/* Texture Layer 1: Watermark repeating motif at 9% opacity, 200px tile size */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'url(/assets/motifs/kingkhap.svg)',
            backgroundRepeat: 'repeat',
            backgroundSize: '200px 200px',
            opacity: 0.09
          }}
          aria-hidden="true"
        />

        {/* Atmosphere: Radial --muga-wash vignette glow in top-right (550px radius, 18% opacity, blur-3xl) */}
        <div
          className="absolute -top-24 -right-24 w-[550px] h-[550px] pointer-events-none rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, var(--muga-wash) 0%, transparent 70%)',
            opacity: 0.18
          }}
          aria-hidden="true"
        />

        {/* Texture Layer 2: Single focal accent motif (Kopou Phool) bleeding off bottom corner (500px, 14% opacity) */}
        <img
          src="/assets/motifs/kopou.svg"
          alt=""
          className="absolute -bottom-16 -right-16 w-[500px] h-[500px] pointer-events-none select-none"
          style={{ opacity: 0.14 }}
          aria-hidden="true"
        />

        {/* Hero Content Column (Single Column, Left-Aligned, Full Width max-6xl) */}
        <div className="relative z-10 max-w-6xl w-full mx-auto px-6 py-12 md:py-16 space-y-8 text-left">
          {/* Cultural Eyebrow Badge */}
          <div>
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold border shadow-xs"
              style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--border-hairline)', color: 'var(--color-bamboo)' }}
            >
              <span>🌾</span>
              <span>{copy.badge}</span>
            </div>
          </div>

          {/* Primary H1 Headline */}
          <h1
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight max-w-4xl"
            style={{ color: 'var(--ink-primary)' }}
          >
            {copy.headline}
          </h1>

          {/* Lead Paragraph */}
          <p
            className="text-base sm:text-lg md:text-xl font-normal leading-relaxed max-w-3xl"
            style={{ color: 'var(--ink-secondary)' }}
          >
            {copy.lead}
          </p>

          {/* Consolidated 3 Primary Hero CTAs */}
          <div className="flex flex-wrap items-center gap-3.5 pt-2">
            <button
              type="button"
              onClick={onLaunchPatient || onOpenRoleSelector}
              className="flex items-center justify-center gap-3 px-8 py-4 rounded-btn font-bold text-lg transition-transform active:scale-95 shadow-flat cursor-pointer border-2"
              style={{
                backgroundColor: 'var(--color-muga)',
                color: 'var(--ink-primary)',
                borderColor: 'var(--color-muga-dark)',
                minHeight: '56px'
              }}
            >
              <Play size={22} className="fill-current" />
              <span>{copy.launchPatient}</span>
            </button>

            {onOpenRoleSelector && (
              <button
                type="button"
                onClick={onOpenRoleSelector}
                className="flex items-center justify-center gap-2.5 px-6 py-4 rounded-btn font-bold text-base border shadow-flat transition hover:bg-slate-50 cursor-pointer"
                style={{
                  backgroundColor: 'var(--surface-card)',
                  borderColor: 'var(--border-hairline)',
                  color: 'var(--ink-primary)',
                  minHeight: '56px'
                }}
              >
                <Users size={20} color="var(--color-muga-dark)" />
                <span>{copy.selectRole}</span>
              </button>
            )}

            {onLaunchDashboard && (
              <button
                type="button"
                onClick={onLaunchDashboard}
                className="flex items-center justify-center gap-2.5 px-6 py-4 rounded-btn font-bold text-base border shadow-flat transition hover:bg-slate-50 cursor-pointer"
                style={{
                  backgroundColor: 'var(--surface-card)',
                  borderColor: 'var(--border-hairline)',
                  color: 'var(--ink-secondary)',
                  minHeight: '56px'
                }}
              >
                <Activity size={20} color="var(--color-bamboo)" />
                <span>{copy.viewDashboard}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onEnterPin || onOpenRoleSelector}
              className="flex items-center justify-center gap-2 px-5 py-4 rounded-btn font-bold text-sm border shadow-flat transition hover:bg-slate-50 cursor-pointer"
              style={{
                backgroundColor: 'var(--surface-card)',
                borderColor: 'var(--border-hairline)',
                color: 'var(--ink-secondary)',
                minHeight: '56px'
              }}
            >
              {copy.enterPin}
            </button>
          </div>

          {/* Trust-Markers Row */}
          <div className="pt-2 flex flex-wrap items-center gap-2.5 sm:gap-3 text-xs font-semibold">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill border"
              style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--border-hairline)', color: 'var(--ink-primary)' }}
            >
              <CheckCircle2 size={15} color="var(--color-bamboo)" />
              WCAG 2.1 AA Gerontology-Tuned
            </span>

            <span
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill border"
              style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--border-hairline)', color: 'var(--ink-primary)' }}
            >
              <CheckCircle2 size={15} color="var(--color-bamboo)" />
              Zero-Punitive Errorless Learning
            </span>

            <span
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill border"
              style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--border-hairline)', color: 'var(--ink-primary)' }}
            >
              <Phone size={14} color="var(--color-gamosa-red)" />
              <span>Elderline</span>
              <span>14567</span>
            </span>

            <span
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill border"
              style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--border-hairline)', color: 'var(--ink-primary)' }}
            >
              <CheckCircle2 size={15} color="var(--color-bamboo)" />
              100% Offline Service Worker PWA
            </span>
          </div>

          {/* 4-Column Feature Strip Below CTAs / Trust Markers */}
          <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              className="p-5 rounded-card border shadow-flat space-y-2"
              style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--border-hairline)' }}
            >
              <div className="flex items-center gap-2">
                <Volume2 size={20} color="var(--color-bamboo)" />
                <h3 className="text-sm font-bold" style={{ color: 'var(--ink-primary)' }}>
                  Voice-First Multilingual AI
                </h3>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--ink-secondary)' }}>
                Multilingual Voice Guidance with localized audio hints and speech pacing across 9 regional dialects.
              </p>
            </div>

            <div
              className="p-5 rounded-card border shadow-flat space-y-2"
              style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--border-hairline)' }}
            >
              <div className="flex items-center gap-2">
                <WifiOff size={20} color="var(--color-bamboo)" />
                <h3 className="text-sm font-bold" style={{ color: 'var(--ink-primary)' }}>
                  Zero-Connectivity PWA
                </h3>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--ink-secondary)' }}>
                Reliable edge architecture caching games, audio, and patient states offline in rural primary centres.
              </p>
            </div>

            <div
              className="p-5 rounded-card border shadow-flat space-y-2"
              style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--border-hairline)' }}
            >
              <div className="flex items-center gap-2">
                <Compass size={20} color="var(--color-muga-dark)" />
                <h3 className="text-sm font-bold" style={{ color: 'var(--ink-primary)' }}>
                  North East Memory Tapestry
                </h3>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--ink-secondary)' }}>
                8 NER State traditions, Golden Muga weaves, seasonal festivals, and indigenous domestic artifacts.
              </p>
            </div>

            <div
              className="p-5 rounded-card border shadow-flat space-y-2"
              style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--border-hairline)' }}
            >
              <div className="flex items-center gap-2">
                <BarChart3 size={20} color="var(--color-bamboo)" />
                <h3 className="text-sm font-bold" style={{ color: 'var(--ink-primary)' }}>
                  Passive Biomarkers
                </h3>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--ink-secondary)' }}>
                Subtle response latency analysis, motor tapping tremor, and automated DDA difficulty adjustment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Cultural Anchors Section */}
      <section
        className="w-full py-12 border-t border-b relative z-10"
        style={{ backgroundColor: 'var(--surface-sunken)', borderColor: 'var(--border-hairline)' }}
      >
        <div className="max-w-6xl mx-auto px-6 space-y-8 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight" style={{ color: 'var(--ink-primary)' }}>
                Cultural Anchors
              </h2>
              <p className="text-sm font-medium mt-0.5" style={{ color: 'var(--ink-secondary)' }}>
                Cognitive reminiscence exercises grounded in North Eastern instruments, textiles, and river traditions
              </p>
            </div>

            <div
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-pill border"
              style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--border-hairline)', color: 'var(--color-bamboo)' }}
            >
              <CheckCircle2 size={16} />
              <span>Zero-Connectivity PWA</span>
            </div>
          </div>

          {/* 4 Cultural Anchor Tiles */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col items-center p-4 rounded-card border shadow-flat" style={{ borderColor: 'var(--border-hairline)', backgroundColor: 'var(--surface-card)' }}>
              <img src="/assets/motifs/dhol.svg" alt="Dhol" className="w-16 h-16 mb-2 pointer-events-none" />
              <span className="text-base font-bold" style={{ color: 'var(--ink-primary)' }}>Dhol</span>
              <span className="text-xs font-medium" style={{ color: 'var(--ink-secondary)' }}>Bihu Rhythm Recall</span>
            </div>

            <div className="flex flex-col items-center p-4 rounded-card border shadow-flat" style={{ borderColor: 'var(--border-hairline)', backgroundColor: 'var(--surface-card)' }}>
              <img src="/assets/motifs/pepa.svg" alt="Pepa" className="w-16 h-16 mb-2 pointer-events-none" />
              <span className="text-base font-bold" style={{ color: 'var(--ink-primary)' }}>Pepa</span>
              <span className="text-xs font-medium" style={{ color: 'var(--ink-secondary)' }}>Horn Pitch & Memory</span>
            </div>

            <div className="flex flex-col items-center p-4 rounded-card border shadow-flat" style={{ borderColor: 'var(--border-hairline)', backgroundColor: 'var(--surface-card)' }}>
              <img src="/assets/motifs/kopou.svg" alt="Kopou Phool" className="w-16 h-16 mb-2 pointer-events-none" />
              <span className="text-base font-bold" style={{ color: 'var(--ink-primary)' }}>Kopou Phool</span>
              <span className="text-xs font-medium" style={{ color: 'var(--ink-secondary)' }}>Seasonal Flora Match</span>
            </div>

            <div className="flex flex-col items-center p-4 rounded-card border shadow-flat" style={{ borderColor: 'var(--border-hairline)', backgroundColor: 'var(--surface-card)' }}>
              <img src="/assets/motifs/majuli-ferry.svg" alt="Majuli Riverway" className="w-16 h-16 mb-2 pointer-events-none" />
              <span className="text-base font-bold" style={{ color: 'var(--ink-primary)' }}>Majuli Riverway</span>
              <span className="text-xs font-medium" style={{ color: 'var(--ink-secondary)' }}>River Journey Sequence</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Footer & Helpline (Minimal, High Contrast) */}
      <footer className="w-full px-6 py-8 border-t" style={{ borderColor: 'var(--border-hairline)', backgroundColor: 'var(--surface-card)' }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 font-medium text-xs" style={{ color: 'var(--ink-secondary)' }}>
          <div className="flex items-center gap-2">
            <Heart size={16} color="var(--color-gamosa-red)" />
            <span>© {currentYear} NeuroSetu. All rights reserved.</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span>24/7 National Senior Citizen Helpline:</span>
            <a
              href="tel:14567"
              className="flex items-center gap-2 px-4 py-2.5 rounded-btn font-bold transition-transform active:scale-95 text-white"
              style={{
                backgroundColor: 'var(--color-gamosa-red)',
                minHeight: '48px'
              }}
            >
              <Phone size={16} />
              <span>Elderline</span> <span>14567</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
