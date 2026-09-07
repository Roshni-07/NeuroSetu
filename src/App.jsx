import React, { useState, useEffect } from 'react';
import PinAuthModal from './components/auth/PinAuthModal.jsx';
import RoleSelector from './components/auth/RoleSelector.jsx';
import ProfileCheckModal from './components/auth/ProfileCheckModal.jsx';
import PatientLayout from './layouts/PatientLayout.jsx';
import SosEmergencyButton from './components/sos/SosEmergencyButton.jsx';
import PatientOnboardingModal from './components/onboarding/PatientOnboardingModal.jsx';
import PatientTriageList, { SAMPLE_ASHA_PATIENTS } from './components/dashboard/PatientTriageList.jsx';
import CognitiveTrendChart from './components/dashboard/CognitiveTrendChart.jsx';
import SyncStatusPanel from './components/dashboard/SyncStatusPanel.jsx';
import RemindersHub from './components/reminders/RemindersHub.jsx';
import HomePage from './pages/HomePage.jsx';
import Hub from './components2/Hub.jsx';
import GameWrapper from './components2/GameWrapper.jsx';
import MemoryRecallGame from './components/games/MemoryRecallGame.jsx';
import PatternMatchingGame from './components/games/PatternMatchingGame.jsx';
import SequencingGame from './components/games/SequencingGame.jsx';
import SpeakButton from './components2/SpeakButton.jsx';
import { GAMES_CONFIG } from './data/gamesConfig.js';
import { getLocalizedGame, getGameVoiceExplanation, getUIString } from './data/gamesLocalization.js';
import { useAppRoute } from './router/AppRouter.jsx';
import { getActiveSession, logout, hasConfiguredPin, ROLES } from './services/authService.js';
import {
  getRecentBiomarkers,
  getBiomarkerSummary
} from './services/telemetryService.js';
import { getPendingSyncEvents, getActiveProfile, DEFAULT_PROFILE } from './db/indexedDb.js';
import {
  onSyncStatusChange,
  initBackgroundSync
} from './services/syncManager.js';

export default function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { currentRoute, navigateTo } = useAppRoute();
  const [session, setSession] = useState(getActiveSession());
  const [patientProfile, setPatientProfile] = useState(DEFAULT_PROFILE);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isRoleSelectorOpen, setIsRoleSelectorOpen] = useState(false);
  const [authRole, setAuthRole] = useState(ROLES.PATIENT);
  const [isCheckModalOpen, setIsCheckModalOpen] = useState(false);
  const [isSosOpen, setIsSosOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isOnboardingInitialSignup, setIsOnboardingInitialSignup] = useState(false);
  const [isDevNavOpen, setIsDevNavOpen] = useState(false);

  // Active Game & Patient Section State
  const [activeGame, setActiveGame] = useState(null); // 'memory' | 'pattern' | 'sequencing' | null
  const [activeSuiteGame, setActiveSuiteGame] = useState(null); // Game config object for 15-game suite
  const [patientSection, setPatientSection] = useState('games'); // 'games' | 'reminders'

  // Dashboard State
  const [selectedPatientId, setSelectedPatientId] = useState('patient_001');

  // Local Telemetry & Sync State
  const [telemetryLogs, setTelemetryLogs] = useState([]);
  const [summary, setSummary] = useState(null);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);

  const refreshTelemetry = async () => {
    try {
      const recent = await getRecentBiomarkers(session?.profileName || 'default_patient', 8);
      const summ = await getBiomarkerSummary(session?.profileName || 'default_patient');
      const pending = await getPendingSyncEvents();
      setTelemetryLogs(recent);
      setSummary(summ);
      setPendingSyncCount(pending.length);
    } catch (e) {
      console.error('Error refreshing telemetry:', e);
    }
  };

  useEffect(() => {
    async function loadProfile() {
      const prof = await getActiveProfile(session?.profileName || 'default_patient');
      if (prof) setPatientProfile(prof);
    }
    loadProfile();
  }, [session]);

  useEffect(() => {
    initBackgroundSync();

    const handleOnline = () => {
      setIsOnline(true);
      refreshTelemetry();
    };
    const handleOffline = () => {
      setIsOnline(false);
      refreshTelemetry();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const unsubscribeSync = onSyncStatusChange((update) => {
      if (update.status === 'success') {
        refreshTelemetry();
      }
    });

    refreshTelemetry();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribeSync();
    };
  }, [session]);

  const handleAuthSuccess = (newSession) => {
    setSession(newSession);
    setIsPinModalOpen(false);
    setIsCheckModalOpen(false);
    setIsRoleSelectorOpen(false);

    if (newSession?.role === ROLES.CAREGIVER || newSession?.role === ROLES.ASHA_WORKER) {
      navigateTo('dashboard');
    } else {
      navigateTo('patient');
    }
  };

  const handleSelectRole = (role) => {
    setAuthRole(role);
    setIsRoleSelectorOpen(false);
    setIsPinModalOpen(true);
  };

  const handleLogout = () => {
    logout();
    setSession(null);
    navigateTo('home');
  };

  const handleExitGame = () => {
    setActiveGame(null);
    refreshTelemetry();
  };

  const selectedPatient = SAMPLE_ASHA_PATIENTS.find(p => p.id === selectedPatientId) || SAMPLE_ASHA_PATIENTS[0];

  const isEn = (patientProfile?.language || 'en') === 'en';

  const patientDisplayTitle = `${patientProfile.name} (${patientProfile.villageTown ? `${patientProfile.villageTown}, ` : ''}${patientProfile.homeState || 'Assam'})`;

  // Dev toolbar visibility: enabled in dev / test mode or with ?debug=true
  const isDevMode = Boolean(
    (typeof import.meta !== 'undefined' && import.meta.env?.DEV) ||
    (typeof process !== 'undefined' && (process.env?.NODE_ENV === 'development' || process.env?.NODE_ENV === 'test')) ||
    (typeof window !== 'undefined' && window.location.search.includes('debug=true'))
  );

  const handleLaunchPatient = () => {
    if (session) {
      navigateTo('patient');
      setActiveGame(null);
    } else {
      setIsCheckModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 font-sans antialiased text-slate-800 selection:bg-teal-600 selection:text-white">
      {/* Top Prototype / Dev Navigation Bar (Hidden in production for real users) */}
      {isDevMode && (
        <div className="bg-slate-950 text-slate-300 border-b border-slate-800 text-xs">
          {/* Top Bar Header Row */}
          <div className="py-1.5 px-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white tracking-tight">NeuroSetu [DEV]</span>
              <span className="text-slate-500 hidden sm:inline">| Surface:</span>
              {/* Desktop Route Links */}
              <div className="hidden sm:flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => { navigateTo('home'); setActiveGame(null); }}
                  className={`px-2.5 py-0.5 rounded-lg font-semibold transition ${currentRoute === 'home' ? 'bg-teal-700 text-white shadow-xs' : 'hover:bg-slate-800 text-slate-300'}`}
                >
                  Home
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (session) {
                      navigateTo('patient');
                      setActiveGame(null);
                    } else {
                      setIsPinModalOpen(true);
                    }
                  }}
                  className={`px-2.5 py-0.5 rounded-lg font-semibold transition ${currentRoute === 'patient' ? 'bg-teal-700 text-white shadow-xs' : 'hover:bg-slate-800 text-slate-300'}`}
                >
                  Patient UI (Games)
                </button>
                <button
                  type="button"
                  onClick={() => navigateTo('dashboard')}
                  className={`px-2.5 py-0.5 rounded-lg font-semibold transition ${currentRoute === 'dashboard' ? 'bg-indigo-700 text-white shadow-xs' : 'hover:bg-slate-800 text-slate-300'}`}
                >
                  ASHA / Caregiver Dashboard ({pendingSyncCount})
                </button>
              </div>
            </div>

            {/* Desktop Right Actions */}
            <div className="hidden sm:flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsOnboardingInitialSignup(!hasConfiguredPin());
                  setIsOnboardingOpen(true);
                }}
                className="text-teal-300 hover:text-teal-200 font-semibold transition"
              >
                👤 Setup / Edit Profile
              </button>
              {session ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-slate-400 hover:text-white underline transition"
                >
                  Lock / Logout ({session.profileName} - {session.role || 'patient'})
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsRoleSelectorOpen(true)}
                    className="text-teal-300 hover:text-teal-200 font-semibold transition cursor-pointer"
                  >
                    👥 Select Role
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthRole(ROLES.PATIENT);
                      setIsPinModalOpen(true);
                    }}
                    className="text-teal-300 hover:text-teal-200 underline font-semibold transition cursor-pointer"
                  >
                    🔑 Enter Profile PIN
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Toggle (< sm) */}
            <button
              type="button"
              onClick={() => setIsDevNavOpen(!isDevNavOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={isDevNavOpen}
              className="sm:hidden min-h-touch min-w-touch px-3 py-1 text-slate-300 hover:text-white bg-slate-900 border border-slate-800 rounded-lg flex items-center gap-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <span className="text-base leading-none" aria-hidden="true">{isDevNavOpen ? '✕' : '☰'}</span>
              <span>{isDevNavOpen ? 'Close' : 'Menu'}</span>
            </button>
          </div>

          {/* Mobile Collapsed Dropdown Menu (< sm) */}
          {isDevNavOpen && (
            <div className="sm:hidden border-t border-slate-800/80 bg-slate-950 px-4 py-3 space-y-2 animate-fadeIn">
              <div className="grid grid-cols-1 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    navigateTo('home');
                    setActiveGame(null);
                    setIsDevNavOpen(false);
                  }}
                  className={`min-h-touch w-full text-left px-3 py-2 rounded-xl font-semibold transition ${currentRoute === 'home' ? 'bg-teal-700 text-white' : 'hover:bg-slate-900 text-slate-300'}`}
                >
                  🏠 Home
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsDevNavOpen(false);
                    if (session) {
                      navigateTo('patient');
                      setActiveGame(null);
                    } else {
                      setIsPinModalOpen(true);
                    }
                  }}
                  className={`min-h-touch w-full text-left px-3 py-2 rounded-xl font-semibold transition ${currentRoute === 'patient' ? 'bg-teal-700 text-white' : 'hover:bg-slate-900 text-slate-300'}`}
                >
                  🎮 Patient UI (Games)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigateTo('dashboard');
                    setIsDevNavOpen(false);
                  }}
                  className={`min-h-touch w-full text-left px-3 py-2 rounded-xl font-semibold transition ${currentRoute === 'dashboard' ? 'bg-indigo-700 text-white' : 'hover:bg-slate-900 text-slate-300'}`}
                >
                  📊 ASHA / Caregiver Dashboard ({pendingSyncCount})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsDevNavOpen(false);
                    setIsOnboardingInitialSignup(!hasConfiguredPin());
                    setIsOnboardingOpen(true);
                  }}
                  className="min-h-touch w-full text-left px-3 py-2 rounded-xl text-teal-300 hover:bg-slate-900 font-semibold transition"
                >
                  👤 Setup / Edit Profile
                </button>
                {session ? (
                  <button
                    type="button"
                    onClick={() => {
                      setIsDevNavOpen(false);
                      handleLogout();
                    }}
                    className="min-h-touch w-full text-left px-3 py-2 rounded-xl text-rose-300 hover:bg-slate-900 font-semibold transition"
                  >
                    🚪 Lock / Logout ({session.profileName} - {session.role || 'patient'})
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setIsDevNavOpen(false);
                        setIsRoleSelectorOpen(true);
                      }}
                      className="min-h-touch w-full text-left px-3 py-2 rounded-xl text-teal-300 hover:bg-slate-900 font-semibold transition"
                    >
                      👥 Select Role
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsDevNavOpen(false);
                        setAuthRole(ROLES.PATIENT);
                        setIsPinModalOpen(true);
                      }}
                      className="min-h-touch w-full text-left px-3 py-2 rounded-xl text-teal-300 hover:bg-slate-900 font-semibold transition"
                    >
                      🔑 Enter Profile PIN
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Offline / Network Status Banner */}
      <div
        role="status"
        aria-live="polite"
        data-testid="network-status"
        className={`w-full py-1.5 px-4 text-center font-semibold text-xs transition-colors shadow-xs ${isOnline
          ? 'bg-emerald-700 text-white'
          : 'bg-teal-700 text-white'
          }`}
      >
        {isOnline
          ? (isEn ? '● Online — Cloud Sync Ready' : '● অনলাইন — ক্লাউড ছিংক সাজু (Online — Cloud Sync Ready)')
          : (isEn ? '● Offline Mode Active — Service Worker Serving Shell' : '● অফলাইন ম’ড সক্ৰিয় — (Offline Mode Active — Service Worker Serving Shell)')}
      </div>

      {/* Surface 0: Home Surface (Default Entry View on "/" and refresh) */}
      {currentRoute === 'home' && (
        <HomePage
          onLaunchPatient={handleLaunchPatient}
          onLaunchDashboard={() => navigateTo('dashboard')}
          onLaunchHub={() => navigateTo('hub')}
          onOpenRoleSelector={() => setIsRoleSelectorOpen(true)}
          onOpenSetup={() => {
            setIsOnboardingInitialSignup(!hasConfiguredPin());
            setIsOnboardingOpen(true);
          }}
          initialLanguage={patientProfile?.language || 'en'}
          onLanguageChange={(lang) => {
            setPatientProfile(prev => ({ ...prev, language: lang }));
          }}
        />
      )}

      {/* Surface: Cognitive Training Game Suite Hub */}
      {currentRoute === 'hub' && (
        session ? (
          activeSuiteGame ? (
            <GameWrapper
              gameConfig={activeSuiteGame}
              onBack={() => setActiveSuiteGame(null)}
              onExit={() => {
                setActiveSuiteGame(null);
                navigateTo('hub');
              }}
              language={patientProfile?.language || 'en'}
            >
              {activeSuiteGame.component ? (
                React.createElement(activeSuiteGame.component, {
                  language: patientProfile?.language || 'en',
                  patientProfile,
                  onExit: () => {
                    setActiveSuiteGame(null);
                    navigateTo('hub');
                  }
                })
              ) : (
                <div className="p-8 text-center text-xl text-slate-700 bg-teal-50 rounded-2xl border-2 border-teal-200">
                  This game is planned for Phase 2!
                </div>
              )}
            </GameWrapper>
          ) : (
            <div>
              <div className="bg-stone-900 text-slate-200 px-4 py-2.5 text-xs flex flex-wrap justify-between items-center gap-2 border-b border-stone-800">
                <button
                  type="button"
                  onClick={() => navigateTo('home')}
                  className="text-teal-300 hover:text-white font-bold flex items-center gap-1.5 cursor-pointer text-sm"
                >
                  <span>←</span>
                  <span>Return to NeuroSetu Portal</span>
                </button>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 font-semibold">
                  <button
                    type="button"
                    onClick={() => navigateTo('patient')}
                    className="hover:text-teal-300 cursor-pointer"
                  >
                    Patient Care Hub
                  </button>
                  <button
                    type="button"
                    onClick={() => navigateTo('dashboard')}
                    className="hover:text-teal-300 cursor-pointer"
                  >
                    ASHA Telemetry Dashboard
                  </button>
                </div>
              </div>
              <Hub
                games={GAMES_CONFIG}
                patientProfile={patientProfile}
                onSelectGame={(game) => setActiveSuiteGame(game)}
                language={patientProfile?.language || 'en'}
                onLanguageChange={(lang) => {
                  setPatientProfile(prev => ({ ...prev, language: lang }));
                }}
              />
            </div>
          )
        ) : (
          <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-200/80 shadow-soft-xl text-center space-y-5 animate-slide-up">
            <span className="text-3xl block">🔒</span>
            <h2 className="text-lg font-bold text-slate-900">
              {isEn ? 'Authentication Required' : 'প্ৰৱেশ পিন প্ৰয়োজন'}
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              {isEn
                ? 'Please enter your 4-digit PIN or register your profile to access cognitive games.'
                : 'ৰোগীৰ খেলসমূহ উপভোগ কৰিবলৈ অনুগ্ৰহ কৰি আপোনাৰ ৪-সংখ্যাৰ পিন দিয়ক।'}
            </p>
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setAuthRole(ROLES.PATIENT);
                  setIsPinModalOpen(true);
                }}
                className="w-full min-h-[48px] py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl text-xs shadow-soft transition active:scale-95 flex items-center justify-center gap-1.5"
              >
                🔑 {isEn ? 'Enter Profile PIN' : 'পিন প্ৰৱেশ কৰক'}
              </button>
              <button
                type="button"
                onClick={() => setIsRoleSelectorOpen(true)}
                className="w-full py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 font-semibold rounded-xl text-xs transition flex items-center justify-center gap-1.5"
              >
                👥 {isEn ? 'Switch / Select Role' : 'ভূমিকা সলনি কৰক (Switch Role)'}
              </button>
              <button
                type="button"
                onClick={() => navigateTo('home')}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded-xl text-xs transition"
              >
                ← {isEn ? 'Return to Home' : 'মুখ্য পৃষ্ঠালৈ উভতি যাওক'}
              </button>
            </div>
          </div>
        )
      )}

      {/* Surface 1: Patient Experience Shell (WCAG 2.1 AA) */}
      {currentRoute === 'patient' && (
        session ? (
          <PatientLayout
            profileName={patientDisplayTitle}
            language={patientProfile?.language || 'en'}
            onLanguageChange={(lang) => {
              setPatientProfile(prev => ({ ...prev, language: lang }));
            }}
            activeSection={patientSection}
            isOnline={isOnline}
            onOpenSos={() => setIsSosOpen(true)}
            onNavigate={(sec) => {
              if (sec === 'home') navigateTo('home');
              if (sec === 'games') {
                setPatientSection('games');
                setActiveGame(null);
              }
              if (sec === 'reminders') {
                setPatientSection('reminders');
                setActiveGame(null);
              }
              if (sec === 'progress') navigateTo('dashboard');
              if (sec === 'help') setIsSosOpen(true);
            }}
          >
            {/* Reminders & Routine Hub */}
            {patientSection === 'reminders' && (
              <RemindersHub
                patientProfile={patientProfile}
                onExit={() => setPatientSection('games')}
              />
            )}

            {/* Active Cognitive Games */}
            {patientSection === 'games' && activeGame === 'memory' && (
              <MemoryRecallGame
                profileId={session?.profileName || 'default_patient'}
                patientProfile={patientProfile}
                onExit={handleExitGame}
              />
            )}

            {patientSection === 'games' && activeGame === 'pattern' && (
              <PatternMatchingGame
                profileId={session?.profileName || 'default_patient'}
                patientProfile={patientProfile}
                onExit={handleExitGame}
              />
            )}

            {patientSection === 'games' && activeGame === 'sequencing' && (
              <SequencingGame
                profileId={session?.profileName || 'default_patient'}
                patientProfile={patientProfile}
                onExit={handleExitGame}
              />
            )}

            {/* Game Selection Hub */}
            {patientSection === 'games' && !activeGame && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-soft text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                        {isEn ? 'Welcome to NeuroSetu' : 'নমস্কাৰ! (Welcome to NeuroSetu)'}
                      </h1>
                      <span className="text-xs px-2.5 py-0.5 bg-teal-50 text-teal-700 font-semibold rounded-full border border-teal-100">
                        {patientProfile.name} • {patientProfile.homeState} ({patientProfile.villageTown})
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal">
                      {isEn
                        ? `Select a culturally grounded game personalized for ${patientProfile.homeState}:`
                        : `আপোনাৰ অঞ্চলৰ সাংস্কৃতিক খেলসমূহৰ পৰা এটা বাচি লওক (Personalized for ${patientProfile.homeState}):`}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsOnboardingInitialSignup(false);
                      setIsOnboardingOpen(true);
                    }}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold shrink-0 transition"
                  >
                    ⚙️ {isEn ? 'Edit Profile' : 'ব্যক্তিগত পৰিচয় (Edit Profile)'}
                  </button>
                </div>

                {/* 15-Game Suite Banner */}
                <div className="bg-gradient-to-r from-white via-teal-50 to-slate-100 rounded-3xl p-6 text-slate-900 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 border-2 border-teal-200">
                  <div>
                    <div className="text-xs uppercase tracking-widest font-bold text-teal-700">
                      🌾 North-East India Cultural Suite
                    </div>
                    <h2 className="text-xl sm:text-2xl font-extrabold mt-1">
                      15 Cognitive Training Games
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1">
                      Explore Memory, Attention, Reasoning, Visual & Emotional Cognition exercises.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigateTo('hub')}
                    className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-bold text-sm shadow-md transition cursor-pointer shrink-0"
                  >
                    Open 15-Game Hub ➔
                  </button>
                </div>

                {/* 3 Large Dementia-Accessible Quick Play Game Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Game 1: Memory Recall */}
                  {(() => {
                    const game1Loc = getLocalizedGame({ id: 'memory-recall-game', name: 'Cultural Memory Recall' }, patientProfile?.language || 'en');
                    const voice1 = getGameVoiceExplanation('memory-recall-game', patientProfile?.language || 'en');
                    return (
                      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 hover:border-teal-300 shadow-soft hover:shadow-soft-md flex flex-col justify-between transition-all">
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center text-2xl border border-teal-100 shadow-xs">
                              🥁
                            </div>
                            <SpeakButton
                              text={voice1}
                              language={patientProfile?.language || 'en'}
                              label={`${getUIString('voiceGuide', patientProfile?.language || 'en')}: ${game1Loc.name}`}
                              className="bg-teal-50 border-teal-200 text-teal-800 text-xs px-2 py-1 h-8 rounded-xl shadow-xs"
                            />
                          </div>
                          <h3 className="text-base font-bold text-slate-900">
                            {game1Loc.name}
                          </h3>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed font-normal">
                            {game1Loc.subtitle}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveGame('memory')}
                          className="min-h-[48px] w-full mt-4 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl transition-all shadow-soft active:scale-95 text-xs flex items-center justify-center gap-1"
                        >
                          {isEn ? 'Play →' : `${game1Loc.name.split(' ')[0]} (Play) →`}
                        </button>
                      </div>
                    );
                  })()}

                  {/* Game 2: Pattern Recognition */}
                  {(() => {
                    const game2Loc = getLocalizedGame({ id: 'pattern-matching-game', name: 'Traditional Patterns' }, patientProfile?.language || 'en');
                    const voice2 = getGameVoiceExplanation('pattern-matching-game', patientProfile?.language || 'en');
                    return (
                      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 hover:border-amber-300 shadow-soft hover:shadow-soft-md flex flex-col justify-between transition-all">
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center text-2xl border border-amber-100 shadow-xs">
                              🧵
                            </div>
                            <SpeakButton
                              text={voice2}
                              language={patientProfile?.language || 'en'}
                              label={`${getUIString('voiceGuide', patientProfile?.language || 'en')}: ${game2Loc.name}`}
                              className="bg-amber-50 border-amber-200 text-amber-800 text-xs px-2 py-1 h-8 rounded-xl shadow-xs"
                            />
                          </div>
                          <h3 className="text-base font-bold text-slate-900">
                            {game2Loc.name}
                          </h3>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed font-normal">
                            {game2Loc.subtitle}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveGame('pattern')}
                          className="min-h-[48px] w-full mt-4 px-4 py-2.5 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-2xl transition-all shadow-soft active:scale-95 text-xs flex items-center justify-center gap-1"
                        >
                          {isEn ? 'Play →' : `${game2Loc.name.split(' ')[0]} (Play) →`}
                        </button>
                      </div>
                    );
                  })()}

                  {/* Game 3: Daily Routine Sequencing */}
                  {(() => {
                    const game3Loc = getLocalizedGame({ id: 'sequencing-game', name: 'Daily Routine Sequencing' }, patientProfile?.language || 'en');
                    const voice3 = getGameVoiceExplanation('sequencing-game', patientProfile?.language || 'en');
                    return (
                      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 hover:border-slate-400 shadow-soft hover:shadow-soft-md flex flex-col justify-between transition-all">
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center text-2xl border border-slate-200 shadow-xs">
                              ☕
                            </div>
                            <SpeakButton
                              text={voice3}
                              language={patientProfile?.language || 'en'}
                              label={`${getUIString('voiceGuide', patientProfile?.language || 'en')}: ${game3Loc.name}`}
                              className="bg-slate-100 border-slate-300 text-slate-800 text-xs px-2 py-1 h-8 rounded-xl shadow-xs"
                            />
                          </div>
                          <h3 className="text-base font-bold text-slate-900">
                            {game3Loc.name}
                          </h3>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed font-normal">
                            {game3Loc.subtitle}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveGame('sequencing')}
                          className="min-h-[48px] w-full mt-4 px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-2xl transition-all shadow-soft active:scale-95 text-xs flex items-center justify-center gap-1"
                        >
                          {isEn ? 'Play →' : `${game3Loc.name.split(' ')[0]} (Play) →`}
                        </button>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
          </PatientLayout>
        ) : (
          <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-200/80 shadow-soft-xl text-center space-y-5 animate-slide-up">
            <span className="text-3xl block">🔒</span>
            <h2 className="text-lg font-bold text-slate-900">
              {isEn ? 'Authentication Required' : 'প্ৰৱেশ পিন প্ৰয়োজন'}
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              {isEn
                ? 'Please enter your 4-digit PIN or register your profile to access cognitive games.'
                : 'ৰোগীৰ খেলসমূহ উপভোগ কৰিবলৈ অনুগ্ৰহ কৰি আপোনাৰ ৪-সংখ্যাৰ পিন দিয়ক।'}
            </p>
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setAuthRole(ROLES.PATIENT);
                  setIsPinModalOpen(true);
                }}
                className="w-full min-h-[48px] py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl text-xs shadow-soft transition active:scale-95 flex items-center justify-center gap-1.5"
              >
                🔑 {isEn ? 'Enter Profile PIN' : 'পিন প্ৰৱেশ কৰক'}
              </button>
              <button
                type="button"
                onClick={() => setIsRoleSelectorOpen(true)}
                className="w-full py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 font-semibold rounded-xl text-xs transition flex items-center justify-center gap-1.5"
              >
                👥 {isEn ? 'Switch / Select Role' : 'ভূমিকা সলনি কৰক (Switch Role)'}
              </button>
              <button
                type="button"
                onClick={() => navigateTo('home')}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded-xl text-xs transition"
              >
                ← {isEn ? 'Return to Home' : 'মুখ্য পৃষ্ঠালৈ উভতি যাওক'}
              </button>
            </div>
          </div>
        )
      )}

      {/* Surface 2: ASHA Worker & Caregiver Clinical Dashboard */}
      {currentRoute === 'dashboard' && (
        session ? (
          <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6 animate-fade-in">
          {/* In-Page Navigation Header */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => navigateTo('home')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 rounded-xl text-xs font-semibold transition shadow-soft"
            >
              ← Return to Home
            </button>
            <button
              type="button"
              onClick={handleLaunchPatient}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-soft transition active:scale-95"
            >
              🎮 Launch Patient App →
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft">
            <div className="min-w-0 max-w-full">
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">
                Primary Health Centre (PHC) & ASHA Portal
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 tracking-tight break-words">
                North East Dementia Triage & Telemetry Portal
              </h1>
              <p className="text-xs text-slate-500 mt-0.5 font-normal">
                Silent passive monitoring: response latency spikes, voice prosody flattening, and DDA downward interventions.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs px-3 py-1 bg-slate-50 text-slate-700 border border-slate-200 font-semibold rounded-xl">
                Jurisdiction: Kamrup & Bishnupur
              </span>
            </div>
          </div>

          {/* Sync Status Panel */}
          <SyncStatusPanel
            pendingCount={pendingSyncCount}
            isOnline={isOnline}
            onSyncComplete={refreshTelemetry}
          />

          {/* 2-Column Grid: Patient Triage List + Selected Patient Trend Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-5">
              <PatientTriageList
                selectedPatientId={selectedPatientId}
                onSelectPatient={(id) => setSelectedPatientId(id)}
              />
            </div>

            <div className="lg:col-span-7 space-y-6">
              <CognitiveTrendChart
                patientName={selectedPatient.name}
              />

              {/* Local Physical DB Records Table */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-soft">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <h3 className="font-bold text-slate-900 text-xs break-words">
                    Local Device Telemetry Buffer (IndexedDB: <code className="text-xs bg-slate-100 px-1 py-0.5 rounded text-slate-700">telemetry_logs</code>)
                  </h3>
                  <button
                    type="button"
                    onClick={refreshTelemetry}
                    className="text-xs bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-xl font-semibold text-slate-700 transition"
                  >
                    🔄 Refresh Table
                  </button>
                </div>

                {telemetryLogs.length === 0 ? (
                  <div className="py-8 text-center bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
                    <span className="text-2xl block">📋</span>
                    <p className="text-xs font-semibold text-slate-700">No sessions recorded yet</p>
                    <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                      Local telemetry records (response latency, errors, DDA interventions) will populate here after sessions are completed.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200/80 text-slate-400 uppercase text-[10px] tracking-wider">
                          <th className="py-2">Task</th>
                          <th className="py-2">Latency</th>
                          <th className="py-2">Errors</th>
                          <th className="py-2">DDA Action</th>
                          <th className="py-2">Alert</th>
                          <th className="py-2">Sync Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {telemetryLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-2.5 font-medium text-slate-900">{log.taskType}</td>
                            <td className="py-2.5 text-slate-600">{log.latencyMs} ms</td>
                            <td className="py-2.5 text-slate-600">{log.errorCount}</td>
                            <td className="py-2.5 font-semibold text-teal-700">{log.ddaAdjustment}</td>
                            <td className="py-2.5">
                              {log.alertFlag ? (
                                <span className="bg-teal-50 text-teal-900 border border-teal-200/70 px-2 py-0.5 rounded-full text-[11px] font-semibold">ALERT</span>
                              ) : (
                                <span className="text-slate-400">Normal</span>
                              )}
                            </td>
                            <td className="py-2.5">
                              {log.isSynced ? (
                                <span className="text-emerald-700 font-semibold">Synced ✓</span>
                              ) : (
                                <span className="text-teal-800 bg-teal-50/70 border border-teal-200/60 px-2 py-0.5 rounded-full text-[11px] font-medium">Pending Sync</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-200/80 shadow-soft-xl text-center space-y-5 animate-slide-up">
            <span className="text-3xl block">🔒</span>
            <h2 className="text-lg font-bold text-slate-900">
              {isEn ? 'Authentication Required' : 'প্ৰৱেশ পিন প্ৰয়োজন'}
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              {isEn
                ? 'Please enter your 4-digit PIN or select your role to access the clinical dashboard.'
                : 'ক্লিনিকেল ডেচবৰ্ডত প্ৰৱেশ কৰিবলৈ অনুগ্ৰহ কৰি আপোনাৰ ৪-সংখ্যাৰ পিন দিয়ক।'}
            </p>
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setAuthRole(ROLES.CAREGIVER);
                  setIsPinModalOpen(true);
                }}
                className="w-full min-h-[48px] py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl text-xs shadow-soft transition active:scale-95 flex items-center justify-center gap-1.5"
              >
                🔑 {isEn ? 'Enter Profile PIN' : 'পিন প্ৰৱেশ কৰক'}
              </button>
              <button
                type="button"
                onClick={() => setIsRoleSelectorOpen(true)}
                className="w-full py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 font-semibold rounded-xl text-xs transition flex items-center justify-center gap-1.5"
              >
                👥 {isEn ? 'Switch / Select Role' : 'ভূমিকা সলনি কৰক (Switch Role)'}
              </button>
              <button
                type="button"
                onClick={() => navigateTo('home')}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded-xl text-xs transition"
              >
                ← {isEn ? 'Return to Home' : 'মুখ্য পৃষ্ঠালৈ উভতি যাওক'}
              </button>
            </div>
          </div>
        )
      )}

      {/* Surface: 404 Unknown Route Fallback */}
      {!['home', 'hub', 'patient', 'dashboard'].includes(currentRoute) && (
        <div data-testid="not-found-view" className="min-h-[70vh] flex items-center justify-center p-6 animate-fade-in">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-soft-xl text-center space-y-5">
            <div className="w-16 h-16 bg-teal-50 text-teal-700 rounded-3xl flex items-center justify-center mx-auto text-3xl font-bold border border-teal-200/80 shadow-soft">
              🧭
            </div>
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200/60">
                404 Error
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {isEn ? 'Page Not Found' : 'পৃষ্ঠাটো পোৱা নগ’ল (404 Not Found)'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal">
                {isEn
                  ? 'The page or route you are looking for does not exist or has been moved.'
                  : 'আপুনি বিচৰা পৃষ্ঠাটো বা লিংকটো উপলব্ধ নহয় অথবা স্থানান্তৰ কৰা হৈছে।'}
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => navigateTo('home')}
                className="min-h-[48px] w-full py-3 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white rounded-2xl text-xs font-bold shadow-soft transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                🏠 {isEn ? 'Return to Home Portal' : 'মুখ্য পৃষ্ঠালৈ উভতি যাওক'}
              </button>
              <button
                type="button"
                onClick={handleLaunchPatient}
                className="min-h-[44px] w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                🎮 {isEn ? 'Launch Patient Games' : 'ৰোগীৰ খেলসমূহ আৰম্ভ কৰক'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Check Modal (Device-based check via IndexedDB) */}
      <ProfileCheckModal
        isOpen={isCheckModalOpen}
        onClose={() => setIsCheckModalOpen(false)}
        onRouteToPin={() => {
          setIsCheckModalOpen(false);
          setAuthRole(ROLES.PATIENT);
          setIsPinModalOpen(true);
        }}
        onRouteToSignup={() => {
          setIsCheckModalOpen(false);
          setIsOnboardingInitialSignup(true);
          setIsOnboardingOpen(true);
        }}
      />

      {/* Accessible Role Selector Modal (Shown before PIN entry) */}
      <RoleSelector
        isOpen={isRoleSelectorOpen}
        selectedRole={authRole}
        onSelectRole={handleSelectRole}
        onClose={() => setIsRoleSelectorOpen(false)}
        language={patientProfile?.language || 'en'}
      />

      {/* Accessible PIN Authentication Modal */}
      <PinAuthModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onSuccess={handleAuthSuccess}
        profileName={
          authRole === ROLES.CAREGIVER
            ? 'Caregiver'
            : authRole === ROLES.ASHA_WORKER
            ? 'ASHA Worker'
            : (patientProfile?.name || 'Elderly Patient')
        }
        role={authRole}
        onChangeRole={() => {
          setIsPinModalOpen(false);
          setIsRoleSelectorOpen(true);
        }}
      />

      {/* One-Touch Voice SOS Emergency Assistance Modal */}
      <SosEmergencyButton
        isOpen={isSosOpen}
        onClose={() => {
          setIsSosOpen(false);
          refreshTelemetry();
        }}
        profileId={session?.profileName || 'default_patient'}
      />

      {/* Personalized Onboarding Intake Modal */}
      <PatientOnboardingModal
        isOpen={isOnboardingOpen}
        isInitialSignup={isOnboardingInitialSignup}
        initialProfile={patientProfile}
        onClose={() => setIsOnboardingOpen(false)}
        onSave={(updatedProfile) => {
          setPatientProfile(updatedProfile);
          setIsOnboardingOpen(false);
          if (isOnboardingInitialSignup) {
            setSession(getActiveSession());
            navigateTo('patient');
          }
        }}
      />
    </div>
  );
}
