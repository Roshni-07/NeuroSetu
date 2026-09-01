import React, { useState, useEffect } from 'react';
import PinAuthModal from './components/auth/PinAuthModal.jsx';
import PatientLayout from './layouts/PatientLayout.jsx';
import SosEmergencyButton from './components/sos/SosEmergencyButton.jsx';
import PatientOnboardingModal from './components/onboarding/PatientOnboardingModal.jsx';
import MemoryRecallGame from './components/games/MemoryRecallGame.jsx';
import PatternMatchingGame from './components/games/PatternMatchingGame.jsx';
import SequencingGame from './components/games/SequencingGame.jsx';
import PatientTriageList, { SAMPLE_ASHA_PATIENTS } from './components/dashboard/PatientTriageList.jsx';
import CognitiveTrendChart from './components/dashboard/CognitiveTrendChart.jsx';
import SyncStatusPanel from './components/dashboard/SyncStatusPanel.jsx';
import MarketingLanding from './pages/MarketingLanding.jsx';
import WelcomeLanding from './pages/WelcomeLanding.jsx';
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
  const [isSosOpen, setIsSosOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isOnboardingInitialSignup, setIsOnboardingInitialSignup] = useState(false);

  // Active Game State
  const [activeGame, setActiveGame] = useState(null); // 'memory' | 'pattern' | 'sequencing' | null

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
  };

  const handleLogout = () => {
    logout();
    setSession(null);
  };

  const handleExitGame = () => {
    setActiveGame(null);
    refreshTelemetry();
  };

  const selectedPatient = SAMPLE_ASHA_PATIENTS.find(p => p.id === selectedPatientId) || SAMPLE_ASHA_PATIENTS[0];

  const patientDisplayTitle = `${patientProfile.name} (${patientProfile.villageTown ? `${patientProfile.villageTown}, ` : ''}${patientProfile.homeState || 'Assam'})`;

  return (
    <div className="min-h-screen bg-patient-canvas">
      {/* Top Prototype Navigation Bar */}
      <div className="bg-gray-950 text-gray-300 py-1.5 px-4 text-xs flex items-center justify-between border-b border-gray-800">
        <div className="flex items-center space-x-2">
          <span className="font-extrabold text-white">NeuroSetu</span>
          <span className="text-gray-500">| Surface:</span>
          <button
            onClick={() => { navigateTo('landing'); setActiveGame(null); }}
            className={`px-2.5 py-0.5 rounded font-semibold transition ${currentRoute === 'landing' ? 'bg-teal-700 text-white shadow-xs' : 'hover:bg-gray-800'}`}
          >
            Welcome Landing
          </button>
          <button
            onClick={() => { navigateTo('patient'); setActiveGame(null); }}
            className={`px-2.5 py-0.5 rounded font-semibold transition ${currentRoute === 'patient' ? 'bg-teal-700 text-white shadow-xs' : 'hover:bg-gray-800'}`}
          >
            Patient UI (Games)
          </button>
          <button
            onClick={() => navigateTo('dashboard')}
            className={`px-2.5 py-0.5 rounded font-semibold transition ${currentRoute === 'dashboard' ? 'bg-blue-800 text-white shadow-xs' : 'hover:bg-gray-800'}`}
          >
            ASHA / Caregiver Dashboard ({pendingSyncCount})
          </button>
          <button
            onClick={() => navigateTo('marketing')}
            className={`px-2.5 py-0.5 rounded font-semibold transition ${currentRoute === 'marketing' ? 'bg-purple-900 text-white shadow-xs' : 'hover:bg-gray-800'}`}
          >
            Marketing Surface
          </button>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              setIsOnboardingInitialSignup(!hasConfiguredPin());
              setIsOnboardingOpen(true);
            }}
            className="text-amber-300 hover:text-amber-200 font-semibold"
          >
            👤 Setup / Edit Profile
          </button>
          {session ? (
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-white underline"
            >
              Lock / Logout ({session.profileName})
            </button>
          ) : (
            <button
              onClick={() => setIsPinModalOpen(true)}
              className="text-teal-300 hover:text-teal-200 underline font-semibold"
            >
              🔑 Enter Profile PIN
            </button>
          )}
        </div>
      </div>

      {/* Surface 1: Patient Experience Shell (WCAG 2.1 AA) */}
      {currentRoute === 'patient' && (
        <PatientLayout
          profileName={patientDisplayTitle}
          activeSection="games"
          isOnline={isOnline}
          onOpenSos={() => setIsSosOpen(true)}
          onNavigate={(sec) => {
            if (sec === 'games') setActiveGame(null);
            if (sec === 'progress') navigateTo('dashboard');
            if (sec === 'help') setIsSosOpen(true);
          }}
        >
          {/* Active Game View */}
          {activeGame === 'memory' && (
            <MemoryRecallGame
              profileId={session?.profileName || 'default_patient'}
              patientProfile={patientProfile}
              onExit={handleExitGame}
            />
          )}

          {activeGame === 'pattern' && (
            <PatternMatchingGame
              profileId={session?.profileName || 'default_patient'}
              patientProfile={patientProfile}
              onExit={handleExitGame}
            />
          )}

          {activeGame === 'sequencing' && (
            <SequencingGame
              profileId={session?.profileName || 'default_patient'}
              patientProfile={patientProfile}
              onExit={handleExitGame}
            />
          )}

          {/* Game Selection Hub */}
          {!activeGame && (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-6 border-2 border-patient-border shadow-sm text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-patient-hero text-patient-primary">
                      নমস্কাৰ! (Welcome to NeuroSetu)
                    </h1>
                    <span className="text-xs px-2.5 py-0.5 bg-teal-100 text-patient-accent font-bold rounded-full">
                      {patientProfile.name} • {patientProfile.homeState} ({patientProfile.villageTown})
                    </span>
                  </div>
                  <p className="text-patient-body text-patient-secondary mt-1">
                    আপোনাৰ অঞ্চলৰ সাংস্কৃতিক খেলসমূহৰ পৰা এটা বাচি লওক (Personalized for {patientProfile.homeState}):
                  </p>
                </div>
                <button
                  onClick={() => setIsOnboardingOpen(true)}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-patient-primary rounded-xl text-xs font-bold shrink-0"
                >
                  ⚙️ ব্যক্তিগত পৰিচয় (Edit Profile)
                </button>
              </div>

              {/* 3 Large Dementia-Accessible Game Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Game 1: Memory Recall */}
                <div className="bg-white rounded-3xl p-5 border-2 border-patient-border hover:border-patient-accent shadow-sm flex flex-col justify-between transition-all">
                  <div>
                    <div className="w-14 h-14 rounded-2xl bg-teal-50 text-patient-accent flex items-center justify-center text-3xl mb-3 border border-teal-200">
                      🥁
                    </div>
                    <h3 className="text-patient-prompt text-patient-primary font-bold">
                      বিহু স্মৃতি খেল (Memory Recall)
                    </h3>
                    <p className="text-xs text-patient-secondary mt-1">
                      {patientProfile.homeState} instruments & personal autobiographical cues with DDA.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveGame('memory')}
                    className="min-h-touch w-full mt-4 px-4 py-2.5 bg-patient-accent hover:bg-patient-accent-hover text-white font-bold rounded-2xl transition shadow-sm text-sm"
                  >
                    খেলক (Play) →
                  </button>
                </div>

                {/* Game 2: Pattern Recognition */}
                <div className="bg-white rounded-3xl p-5 border-2 border-patient-border hover:border-patient-terracotta shadow-sm flex flex-col justify-between transition-all">
                  <div>
                    <div className="w-14 h-14 rounded-2xl bg-amber-50 text-patient-terracotta flex items-center justify-center text-3xl mb-3 border border-amber-200">
                      🧵
                    </div>
                    <h3 className="text-patient-prompt text-patient-primary font-bold">
                      বস্ত্ৰ চানেকি
                    </h3>
                    <p className="text-xs text-patient-secondary mt-1">
                      Traditional handloom patterns ({patientProfile.homeState} & NER weaves).
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveGame('pattern')}
                    className="min-h-touch w-full mt-4 px-4 py-2.5 bg-patient-terracotta hover:bg-patient-terracotta-hover text-white font-bold rounded-2xl transition shadow-sm text-sm"
                  >
                    চানেকি (Play) →
                  </button>
                </div>

                {/* Game 3: Daily Routine Sequencing */}
                <div className="bg-white rounded-3xl p-5 border-2 border-patient-border hover:border-gray-800 shadow-sm flex flex-col justify-between transition-all">
                  <div>
                    <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-800 flex items-center justify-center text-3xl mb-3 border border-orange-200">
                      ☕
                    </div>
                    <h3 className="text-patient-prompt text-patient-primary font-bold">
                      দৈনন্দিন কৰ্ম ক্ৰম
                    </h3>
                    <p className="text-xs text-patient-secondary mt-1">
                      Sequencing mapped to former background: {patientProfile.formerOccupation}.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveGame('sequencing')}
                    className="min-h-touch w-full mt-4 px-4 py-2.5 bg-gray-800 hover:bg-gray-900 text-white font-bold rounded-2xl transition shadow-sm text-sm"
                  >
                    ক্ৰম (Play) →
                  </button>
                </div>
              </div>
            </div>
          )}
        </PatientLayout>
      )}

      {/* Surface 2: ASHA Worker & Caregiver Clinical Dashboard */}
      {currentRoute === 'dashboard' && (
        <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
                Primary Health Centre (PHC) & ASHA Portal
              </span>
              <h1 className="text-2xl font-extrabold text-gray-900 mt-0.5">
                North East Dementia Triage & Telemetry Portal
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Silent passive monitoring: response latency spikes, voice prosody flattening, and DDA downward interventions.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs px-3 py-1 bg-blue-50 text-blue-800 border border-blue-200 font-semibold rounded-lg">
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
              <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-900 text-sm">
                    Local Device Telemetry Buffer (IndexedDB: <code className="text-xs bg-gray-100 px-1 rounded">telemetry_logs</code>)
                  </h3>
                  <button
                    onClick={refreshTelemetry}
                    className="text-xs bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded font-semibold text-gray-700"
                  >
                    🔄 Refresh Table
                  </button>
                </div>

                {telemetryLogs.length === 0 ? (
                  <p className="text-xs text-gray-500 italic py-2">
                    No records on this local device yet.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-gray-200 text-gray-500 uppercase">
                          <th className="py-2">Task</th>
                          <th className="py-2">Latency</th>
                          <th className="py-2">Errors</th>
                          <th className="py-2">DDA Action</th>
                          <th className="py-2">Alert</th>
                          <th className="py-2">Sync Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {telemetryLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-gray-50">
                            <td className="py-2 font-medium">{log.taskType}</td>
                            <td className="py-2">{log.latencyMs} ms</td>
                            <td className="py-2">{log.errorCount}</td>
                            <td className="py-2 font-medium text-teal-700">{log.ddaAdjustment}</td>
                            <td className="py-2">
                              {log.alertFlag ? (
                                <span className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded font-bold">ALERT</span>
                              ) : (
                                <span className="text-gray-400">Normal</span>
                              )}
                            </td>
                            <td className="py-2">
                              {log.isSynced ? (
                                <span className="text-green-700 font-semibold">Synced ✓</span>
                              ) : (
                                <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded font-medium">Pending Sync</span>
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

      {/* Surface 0: Welcome Landing Surface */}
      {currentRoute === 'landing' && (
        <WelcomeLanding
          onGetStarted={() => {
            setIsOnboardingInitialSignup(true);
            setIsOnboardingOpen(true);
          }}
          onEnterPin={() => setIsPinModalOpen(true)}
          onOpenDashboard={() => navigateTo('dashboard')}
        />
      )}

      {/* Surface 3: Marketing Landing Surface */}
      {currentRoute === 'marketing' && (
        <MarketingLanding
          onLaunchPatient={() => navigateTo('patient')}
          onLaunchDashboard={() => navigateTo('dashboard')}
        />
      )}

      {/* Accessible PIN Authentication Modal */}
      <PinAuthModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onSuccess={handleAuthSuccess}
        profileName="Elderly Patient"
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
