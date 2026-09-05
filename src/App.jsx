import React, { useState, useEffect } from 'react';
import PinAuthModal from './components/auth/PinAuthModal.jsx';
import ProfileCheckModal from './components/auth/ProfileCheckModal.jsx';
import PatientLayout from './layouts/PatientLayout.jsx';
import SosEmergencyButton from './components/sos/SosEmergencyButton.jsx';
import PatientOnboardingModal from './components/onboarding/PatientOnboardingModal.jsx';
import MemoryRecallGame from './components/games/MemoryRecallGame.jsx';
import PatternMatchingGame from './components/games/PatternMatchingGame.jsx';
import SequencingGame from './components/games/SequencingGame.jsx';
import PatientTriageList, { SAMPLE_ASHA_PATIENTS } from './components/dashboard/PatientTriageList.jsx';
import CognitiveTrendChart from './components/dashboard/CognitiveTrendChart.jsx';
import SyncStatusPanel from './components/dashboard/SyncStatusPanel.jsx';
import RemindersHub from './components/reminders/RemindersHub.jsx';
import HomePage from './pages/HomePage.jsx';
import { useAppRoute } from './router/AppRouter.jsx';
import { getActiveSession, logout, hasConfiguredPin } from './services/authService.js';
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
  const [isCheckModalOpen, setIsCheckModalOpen] = useState(false);
  const [isSosOpen, setIsSosOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isOnboardingInitialSignup, setIsOnboardingInitialSignup] = useState(false);

  // Active Game & Patient Section State
  const [activeGame, setActiveGame] = useState(null); // 'memory' | 'pattern' | 'sequencing' | null
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
    navigateTo('patient');
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
        <div className="bg-slate-950 text-slate-300 py-1.5 px-4 text-xs flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-white tracking-tight">NeuroSetu [DEV]</span>
            <span className="text-slate-500">| Surface:</span>
            <button
              onClick={() => { navigateTo('home'); setActiveGame(null); }}
              className={`px-2.5 py-0.5 rounded-lg font-semibold transition ${currentRoute === 'home' ? 'bg-teal-700 text-white shadow-xs' : 'hover:bg-slate-800 text-slate-300'}`}
            >
              Home
            </button>
            <button
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
              onClick={() => navigateTo('dashboard')}
              className={`px-2.5 py-0.5 rounded-lg font-semibold transition ${currentRoute === 'dashboard' ? 'bg-indigo-700 text-white shadow-xs' : 'hover:bg-slate-800 text-slate-300'}`}
            >
              ASHA / Caregiver Dashboard ({pendingSyncCount})
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                setIsOnboardingInitialSignup(!hasConfiguredPin());
                setIsOnboardingOpen(true);
              }}
              className="text-amber-300 hover:text-amber-200 font-semibold transition"
            >
              👤 Setup / Edit Profile
            </button>
            {session ? (
              <button
                onClick={handleLogout}
                className="text-slate-400 hover:text-white underline transition"
              >
                Lock / Logout ({session.profileName})
              </button>
            ) : (
              <button
                onClick={() => setIsPinModalOpen(true)}
                className="text-teal-300 hover:text-teal-200 underline font-semibold transition"
              >
                🔑 Enter Profile PIN
              </button>
            )}
          </div>
        </div>
      )}

      {/* Offline / Network Status Banner */}
      <div
        role="status"
        aria-live="polite"
        data-testid="network-status"
        className={`w-full py-1.5 px-4 text-center font-semibold text-xs transition-colors shadow-xs ${
          isOnline
            ? 'bg-emerald-700 text-white'
            : 'bg-amber-700 text-white'
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

            {/* Active Game View */}
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
                    onClick={() => {
                      setIsOnboardingInitialSignup(false);
                      setIsOnboardingOpen(true);
                    }}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold shrink-0 transition"
                  >
                    ⚙️ {isEn ? 'Edit Profile' : 'ব্যক্তিগত পৰিচয় (Edit Profile)'}
                  </button>
                </div>

                {/* 3 Large Dementia-Accessible Game Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Game 1: Memory Recall */}
                  <div className="bg-white rounded-3xl p-5 border border-slate-200/80 hover:border-teal-300 shadow-soft hover:shadow-soft-md flex flex-col justify-between transition-all">
                    <div>
                      <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center text-2xl mb-3 border border-teal-100 shadow-xs">
                        🥁
                      </div>
                      <h3 className="text-base font-bold text-slate-900">
                        {isEn ? 'Cultural Memory Recall' : 'বিহু স্মৃতি খেল (Memory Recall)'}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed font-normal">
                        {patientProfile.homeState} instruments & personal autobiographical cues with DDA.
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveGame('memory')}
                      className="min-h-[48px] w-full mt-4 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl transition-all shadow-soft active:scale-95 text-xs flex items-center justify-center gap-1"
                    >
                      {isEn ? 'Play →' : 'খেলক (Play) →'}
                    </button>
                  </div>

                  {/* Game 2: Pattern Recognition */}
                  <div className="bg-white rounded-3xl p-5 border border-slate-200/80 hover:border-amber-300 shadow-soft hover:shadow-soft-md flex flex-col justify-between transition-all">
                    <div>
                      <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center text-2xl mb-3 border border-amber-100 shadow-xs">
                        🧵
                      </div>
                      <h3 className="text-base font-bold text-slate-900">
                        {isEn ? 'Traditional Patterns' : 'বস্ত্ৰ চানেকি'}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed font-normal">
                        Traditional handloom patterns ({patientProfile.homeState} & NER weaves).
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveGame('pattern')}
                      className="min-h-[48px] w-full mt-4 px-4 py-2.5 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-2xl transition-all shadow-soft active:scale-95 text-xs flex items-center justify-center gap-1"
                    >
                      {isEn ? 'Play →' : 'চানেকি (Play) →'}
                    </button>
                  </div>

                  {/* Game 3: Daily Routine Sequencing */}
                  <div className="bg-white rounded-3xl p-5 border border-slate-200/80 hover:border-slate-400 shadow-soft hover:shadow-soft-md flex flex-col justify-between transition-all">
                    <div>
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center text-2xl mb-3 border border-slate-200 shadow-xs">
                        ☕
                      </div>
                      <h3 className="text-base font-bold text-slate-900">
                        {isEn ? 'Daily Routine Sequencing' : 'দৈনন্দিন কৰ্ম ক্ৰম'}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed font-normal">
                        Sequencing mapped to former background: {patientProfile.formerOccupation}.
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveGame('sequencing')}
                      className="min-h-[48px] w-full mt-4 px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-2xl transition-all shadow-soft active:scale-95 text-xs flex items-center justify-center gap-1"
                    >
                      {isEn ? 'Play →' : 'ক্ৰম (Play) →'}
                    </button>
                  </div>
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
                onClick={() => setIsPinModalOpen(true)}
                className="w-full min-h-[48px] py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl text-xs shadow-soft transition active:scale-95 flex items-center justify-center gap-1.5"
              >
                🔑 {isEn ? 'Enter Profile PIN' : 'পিন প্ৰৱেশ কৰক'}
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
        <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6 animate-fade-in">
          {/* In-Page Navigation Header */}
          <div className="flex items-center justify-between">
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
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">
                Primary Health Centre (PHC) & ASHA Portal
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 tracking-tight">
                North East Dementia Triage & Telemetry Portal
              </h1>
              <p className="text-xs text-slate-500 mt-0.5 font-normal">
                Silent passive monitoring: response latency spikes, voice prosody flattening, and DDA downward interventions.
              </p>
            </div>

            <div className="flex items-center space-x-2">
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
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-slate-900 text-xs">
                    Local Device Telemetry Buffer (IndexedDB: <code className="text-xs bg-slate-100 px-1 py-0.5 rounded text-slate-700">telemetry_logs</code>)
                  </h3>
                  <button
                    onClick={refreshTelemetry}
                    className="text-xs bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-xl font-semibold text-slate-700 transition"
                  >
                    🔄 Refresh Table
                  </button>
                </div>

                {telemetryLogs.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">
                    No records on this local device yet.
                  </p>
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
                                <span className="bg-amber-50 text-amber-900 border border-amber-200/70 px-2 py-0.5 rounded-full text-[11px] font-semibold">ALERT</span>
                              ) : (
                                <span className="text-slate-400">Normal</span>
                              )}
                            </td>
                            <td className="py-2.5">
                              {log.isSynced ? (
                                <span className="text-emerald-700 font-semibold">Synced ✓</span>
                              ) : (
                                <span className="text-amber-800 bg-amber-50/70 border border-amber-200/60 px-2 py-0.5 rounded-full text-[11px] font-medium">Pending Sync</span>
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
      )}

      {/* Profile Check Modal (Device-based check via IndexedDB) */}
      <ProfileCheckModal
        isOpen={isCheckModalOpen}
        onClose={() => setIsCheckModalOpen(false)}
        onRouteToPin={() => {
          setIsCheckModalOpen(false);
          setIsPinModalOpen(true);
        }}
        onRouteToSignup={() => {
          setIsCheckModalOpen(false);
          setIsOnboardingInitialSignup(true);
          setIsOnboardingOpen(true);
        }}
      />

      {/* Accessible PIN Authentication Modal */}
      <PinAuthModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onSuccess={handleAuthSuccess}
        profileName={patientProfile?.name || 'Elderly Patient'}
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
