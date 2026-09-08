import React, { useState, useEffect } from 'react';
import AuthModal from './components/auth/AuthModal.jsx';
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
import RoadmapView from './components/roadmap/RoadmapView.jsx';
import Navbar from './components/layout/Navbar.jsx';
import GridMemoryGame from './components/games/GridMemoryGame.jsx';
import VisualMatchingGame from './components/games/VisualMatchingGame.jsx';
import SequenceOrderGame from './components/games/SequenceOrderGame.jsx';
import SpeakButton from './components2/SpeakButton.jsx';
import { GAMES_CONFIG } from './data/gamesConfig.js';
import { getLocalizedGame, getGameVoiceExplanation, getUIString } from './data/gamesLocalization.js';
import { formatOccupationDisplay } from './data/reminiscenceContent.js';
import { useAppRoute } from './router/AppRouter.jsx';
import { getActiveSession, logout, hasConfiguredPin, ROLES } from './services/authService.js';
import {
  getRecentBiomarkers,
  getBiomarkerSummary
} from './services/telemetryService.js';
import { getPendingSyncEvents, getActiveProfile, seedPresetProfiles, DEFAULT_PROFILE, DEFAULT_DAILY_ROUTINE } from './db/indexedDb.js';
import { PRESET_PATIENTS } from './data/presetPatients.js';
import { saveGameScore } from './utils/storage.js';
import {
  onSyncStatusChange,
  initBackgroundSync
} from './services/syncManager.js';

const resolvePatientProfile = (patientId) => {
  if (!patientId) return null;
  const preset = PRESET_PATIENTS.find(p => p.id === patientId || p.name === patientId);
  if (preset) return { ...preset, gameMasteryScores: {}, dailyRoutine: DEFAULT_DAILY_ROUTINE };
  if (patientId === 'default_patient') return DEFAULT_PROFILE;
  try {
    const saved = localStorage.getItem('neurosetu_active_patient');
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return { ...DEFAULT_PROFILE, id: patientId };
};

export default function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { currentRoute, navigateTo } = useAppRoute();
  const [session, setSession] = useState(() => getActiveSession());
  const [patientProfile, setPatientProfile] = useState(() => {
    const initialSession = getActiveSession();
    if (initialSession && initialSession.role === ROLES.PATIENT && initialSession.patientId) {
      return resolvePatientProfile(initialSession.patientId);
    }
    return null;
  });
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isRoleSelectorOpen, setIsRoleSelectorOpen] = useState(false);
  const [authRole, setAuthRole] = useState(ROLES.PATIENT);
  const [pinOpenedFromRoleSelector, setPinOpenedFromRoleSelector] = useState(false);
  const [isCheckModalOpen, setIsCheckModalOpen] = useState(false);
  const [isSosOpen, setIsSosOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isOnboardingInitialSignup, setIsOnboardingInitialSignup] = useState(false);
  const [isDevNavOpen, setIsDevNavOpen] = useState(false);

  // Active Game & Patient Section State
  const [activeGame, setActiveGame] = useState(null); // 'memory' | 'pattern' | 'sequencing' | null
  const [activeSuiteGame, setActiveSuiteGame] = useState(null); // Game config object for 15-game suite
  const [patientSection, setPatientSection] = useState('games'); // 'games' | 'reminders'

  // Daily Completed Games Key scoped to active patient ID
  const getTodayCompletedKey = (patientId) => {
    const today = new Date().toISOString().slice(0, 10);
    return patientId ? `neurosetu_completed_games_${patientId}_${today}` : null;
  };

  // Primary Roadmap Game Launcher State
  const [activeRoadmapGame, setActiveRoadmapGame] = useState(null);
  const [completedGameIds, setCompletedGameIds] = useState(() => {
    try {
      const initial = getActiveSession();
      if (initial && initial.role === ROLES.PATIENT && initial.patientId) {
        const key = getTodayCompletedKey(initial.patientId);
        const stored = key ? localStorage.getItem(key) : null;
        return stored ? JSON.parse(stored) : [];
      }
      return [];
    } catch (e) {
      return [];
    }
  });
  const [gameScores, setGameScores] = useState({});

  // Sync completedGameIds whenever active patient changes
  useEffect(() => {
    if (session && session.role === ROLES.PATIENT && session.patientId) {
      const key = getTodayCompletedKey(session.patientId);
      try {
        const stored = key ? localStorage.getItem(key) : null;
        setCompletedGameIds(stored ? JSON.parse(stored) : []);
      } catch (e) {
        setCompletedGameIds([]);
      }
    } else {
      setCompletedGameIds([]);
    }
  }, [session?.patientId, session?.role]);

  // Persist completedGameIds scoped to patient
  useEffect(() => {
    if (session && session.role === ROLES.PATIENT && session.patientId) {
      const key = getTodayCompletedKey(session.patientId);
      if (key) {
        try {
          localStorage.setItem(key, JSON.stringify(completedGameIds));
        } catch (e) {}
      }
    }
  }, [completedGameIds, session?.patientId, session?.role]);

  // Session migration on app mount
  useEffect(() => {
    const current = getActiveSession();
    if (current && current.role === ROLES.PATIENT && !current.patientId) {
      logout();
      setSession(null);
    }
  }, []);

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
      if (session && session.role === ROLES.PATIENT && session.patientId) {
        const prof = await getActiveProfile(session.patientId);
        if (prof) setPatientProfile(prof);
      } else {
        setPatientProfile(null);
      }
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
    if (newSession && newSession.role === ROLES.PATIENT && newSession.patientId) {
      const resolved = resolvePatientProfile(newSession.patientId);
      if (resolved) setPatientProfile(resolved);
    }
    setIsPinModalOpen(false);
    setPinOpenedFromRoleSelector(false);
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
    setPinOpenedFromRoleSelector(true);
    setIsPinModalOpen(true);
  };

  const handleBackToRoleSelector = () => {
    setIsPinModalOpen(false);
    setPinOpenedFromRoleSelector(false);
    setIsRoleSelectorOpen(true);
  };

  const handleOnboardingBack = () => {
    setIsOnboardingOpen(false);
    if (isOnboardingInitialSignup) {
      setIsCheckModalOpen(true);
    }
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

  const activePatientProfile = patientProfile || (session?.patientId ? resolvePatientProfile(session.patientId) : null);

  const isEn = (activePatientProfile?.language || 'en') === 'en';

  const patientDisplayTitle = activePatientProfile
    ? `${activePatientProfile.name}${formatOccupationDisplay(activePatientProfile) ? ` • ${formatOccupationDisplay(activePatientProfile)}` : ''} (${activePatientProfile.villageTown ? `${activePatientProfile.villageTown}, ` : ''}${activePatientProfile.homeState || 'Assam'})`
    : 'Patient';

  // Dev toolbar visibility: enabled in dev / test mode or with ?debug=true
  const isDevMode = Boolean(
    (typeof import.meta !== 'undefined' && import.meta.env?.DEV) ||
    (typeof process !== 'undefined' && (process.env?.NODE_ENV === 'development' || process.env?.NODE_ENV === 'test')) ||
    (typeof window !== 'undefined' && window.location.search.includes('debug=true'))
  );

  const handleLaunchPatient = () => {
    if (session && session.role === ROLES.PATIENT && session.patientId) {
      navigateTo('patient');
      setActiveGame(null);
    } else {
      setIsCheckModalOpen(true);
    }
  };

  const handleClosePinModal = () => {
    setIsPinModalOpen(false);
    setPinOpenedFromRoleSelector(false);
    // Graceful cancellation: if user cancels re-auth on dashboard, safely return to home without trap states
    if (currentRoute === 'dashboard' && (!session || (session.role !== ROLES.ASHA_WORKER && session.role !== ROLES.CAREGIVER))) {
      navigateTo('home');
    }
  };

  const patientLevel = activePatientProfile?.masteryScore
    ? Math.min(10, Math.max(1, Math.ceil(activePatientProfile.masteryScore / 10)))
    : activePatientProfile?.starting_difficulty_tier === 3
    ? 8
    : activePatientProfile?.starting_difficulty_tier === 2
    ? 5
    : 2;

  const handleLaunchRoadmapGame = (gameId, nodeLevel, params) => {
    const gameConfig = GAMES_CONFIG.find(
      (g) => g.id === gameId || g.id === gameId.replace('care-for-companion', 'care-for-your-companion')
    );
    if (gameConfig) {
      setActiveRoadmapGame({
        gameConfig,
        gameId,
        level: nodeLevel,
        difficultyParams: params
      });
    }
  };

  const handleCompleteRoadmapGame = (result) => {
    if (activeRoadmapGame) {
      const { gameId } = activeRoadmapGame;
      const patientId = session?.patientId;
      setCompletedGameIds(prev => prev.includes(gameId) ? prev : [...prev, gameId]);
      if (result) {
        setGameScores(prev => ({
          ...prev,
          [gameId]: {
            stars: result.stars || 3,
            accuracy: result.accuracy || 100,
            score: result.score || 0
          }
        }));
        if (patientId) {
          saveGameScore(gameId, result.score || 100, {
            stars: result.stars || 3,
            accuracy: result.accuracy || 100,
            level: activeRoadmapGame.level
          }, patientId);
        }
      }
    }
    setActiveRoadmapGame(null);
    refreshTelemetry();
  };

  const handleExitRoadmapGame = () => {
    setActiveRoadmapGame(null);
    refreshTelemetry();
  };

  return (
    <div className="min-h-screen bg-slate-50/60 font-sans antialiased text-slate-800 selection:bg-teal-600 selection:text-white">
      {/* Session-Aware Navigation Bar & Strict Route Guard (Hidden for authenticated patients for clutter-free cognitive space) */}
      {!(currentRoute === 'patient' && session?.role === ROLES.PATIENT) && (
        <Navbar
          currentRoute={currentRoute}
          onNavigate={(route) => {
            navigateTo(route);
            setActiveGame(null);
            setActiveRoadmapGame(null);
          }}
          session={session}
          pendingSyncCount={pendingSyncCount}
          onOpenRoleSelector={() => setIsRoleSelectorOpen(true)}
          onOpenPinAuth={(reqRole) => {
            setAuthRole(reqRole || ROLES.PATIENT);
            setIsPinModalOpen(true);
          }}
          onOpenSetup={() => {
            setIsOnboardingInitialSignup(!hasConfiguredPin());
            setIsOnboardingOpen(true);
          }}
          onLogout={handleLogout}
        />
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
        (session && session.role === ROLES.PATIENT && session.patientId && patientProfile) ? (
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
                ? 'Please enter your 6-digit PIN or register your profile to access cognitive games.'
                : 'ৰোগীৰ খেলসমূহ উপভোগ কৰিবলৈ অনুগ্ৰহ কৰি আপোনাৰ ৬-সংখ্যাৰ পিন দিয়ক।'}
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
        (session && session.role === ROLES.PATIENT && session.patientId && activePatientProfile) ? (
          <PatientLayout
            profileName={patientDisplayTitle}
            language={activePatientProfile?.language || 'en'}
            onLanguageChange={(lang) => {
              setPatientProfile(prev => ({ ...(prev || activePatientProfile), language: lang }));
            }}
            activeSection={patientSection}
            isOnline={isOnline}
            onOpenSos={() => setIsSosOpen(true)}
            onLogout={handleLogout}
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
                patientProfile={activePatientProfile}
                onExit={() => setPatientSection('games')}
              />
            )}

            {/* Active Roadmap Cognitive Game */}
            {patientSection === 'games' && activeRoadmapGame && (
              <GameWrapper
                gameConfig={activeRoadmapGame.gameConfig}
                onBack={handleExitRoadmapGame}
                onExit={handleExitRoadmapGame}
                language={activePatientProfile?.language || 'en'}
              >
                {activeRoadmapGame.gameConfig.component ? (
                  React.createElement(activeRoadmapGame.gameConfig.component, {
                    language: activePatientProfile?.language || 'en',
                    patientProfile: activePatientProfile,
                    level: activeRoadmapGame.level,
                    difficultyParams: activeRoadmapGame.difficultyParams,
                    onComplete: handleCompleteRoadmapGame,
                    onExit: handleExitRoadmapGame
                  })
                ) : (
                  <div className="p-8 text-center text-xl text-slate-700 bg-teal-50 rounded-2xl border-2 border-teal-200">
                    Game coming soon!
                  </div>
                )}
              </GameWrapper>
            )}

            {/* Direct Game Fallbacks */}
            {patientSection === 'games' && !activeRoadmapGame && activeGame === 'memory' && (
              <GridMemoryGame
                profileId={session?.profileName || 'default_patient'}
                patientProfile={activePatientProfile}
                onExit={handleExitGame}
              />
            )}

            {patientSection === 'games' && !activeRoadmapGame && activeGame === 'pattern' && (
              <VisualMatchingGame
                profileId={session?.profileName || 'default_patient'}
                patientProfile={activePatientProfile}
                onExit={handleExitGame}
              />
            )}

            {patientSection === 'games' && !activeRoadmapGame && activeGame === 'sequencing' && (
              <SequenceOrderGame
                profileId={session?.profileName || 'default_patient'}
                patientProfile={activePatientProfile}
                onExit={handleExitGame}
              />
            )}

            {/* Primary Roadmap Journey View (Clean, distraction-free patient experience) */}
            {patientSection === 'games' && !activeRoadmapGame && !activeGame && (
              <RoadmapView
                patientProfile={activePatientProfile}
                level={patientLevel}
                completedGameIds={completedGameIds}
                gameScores={gameScores}
                onSelectGame={handleLaunchRoadmapGame}
                onExit={() => navigateTo('home')}
              />
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
                ? 'Please enter your 6-digit PIN or register your profile to access cognitive games.'
                : 'ৰোগীৰ খেলসমূহ উপভোগ কৰিবলৈ অনুগ্ৰহ কৰি আপোনাৰ ৬-সংখ্যাৰ পিন দিয়ক।'}
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
        (session && (session.role === ROLES.ASHA_WORKER || session.role === ROLES.CAREGIVER)) ? (
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
                ? 'Please enter your staff credentials or PIN to access the clinical dashboard.'
                : 'ক্লিনিকেল ডেচবৰ্ডত প্ৰৱেশ কৰিবলৈ অনুগ্ৰহ কৰি কৰ্মী প্ৰমাণীকৰণ দিয়ক।'}
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
        onClose={handleClosePinModal}
        onSuccess={handleAuthSuccess}
        profileName={
          authRole === ROLES.CAREGIVER
            ? 'Caregiver'
            : authRole === ROLES.ASHA_WORKER
            ? 'ASHA Worker'
            : (patientProfile?.name || 'Elderly Patient')
        }
        role={authRole}
        openedFromRoleSelector={pinOpenedFromRoleSelector}
        onBackToRoleSelector={handleBackToRoleSelector}
        onChangeRole={handleBackToRoleSelector}
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
        onBack={handleOnboardingBack}
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
