import React, { useState, useEffect } from 'react';
import PinAuthModal from './components/auth/PinAuthModal.jsx';
import { getActiveSession, logout } from './services/authService.js';
import {
  recordBiomarkerEvent,
  getRecentBiomarkers,
  getBiomarkerSummary
} from './services/telemetryService.js';
import { getPendingSyncEvents } from './db/indexedDb.js';
import {
  syncPendingTelemetry,
  onSyncStatusChange,
  initBackgroundSync
} from './services/syncManager.js';
import { isSupabaseConfigured } from './services/supabaseClient.js';

export default function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [activeTab, setActiveTab] = useState('patient');
  const [session, setSession] = useState(getActiveSession());
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);

  // Local Telemetry & Sync State
  const [telemetryLogs, setTelemetryLogs] = useState([]);
  const [summary, setSummary] = useState(null);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [syncStatusMsg, setSyncStatusMsg] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  const refreshTelemetry = async () => {
    try {
      const recent = await getRecentBiomarkers(session?.profileName || 'default_patient', 5);
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
      setSyncStatusMsg(update.message);
      setIsSyncing(update.status === 'syncing');
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

  const handleSimulateGameEvent = async (isSlow = false, hasErrors = false) => {
    await recordBiomarkerEvent({
      profileId: session?.profileName || 'default_patient',
      taskType: 'bihu_instrument_recall',
      latencyMs: isSlow ? 16500 : 3800,
      errorCount: hasErrors ? 2 : 0,
      prosodyScore: 0.85,
      ddaAdjustment: isSlow || hasErrors ? 'decreased' : 'maintained'
    });
    await refreshTelemetry();
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    const res = await syncPendingTelemetry();
    setIsSyncing(false);
    if (!res.success && res.reason === 'unconfigured') {
      setSyncStatusMsg('Supabase credentials not configured in .env; logs remain safe in local IndexedDB.');
    }
    await refreshTelemetry();
  };

  return (
    <div className="min-h-screen bg-patient-canvas">
      {/* Network Status Banner */}
      <div
        data-testid="network-status"
        className={`w-full py-2 px-4 text-center font-medium text-sm transition-colors ${
          isOnline
            ? 'bg-patient-success text-white'
            : 'bg-patient-terracotta text-white'
        }`}
      >
        {isOnline ? '● Online — Cloud Sync Ready' : '● Offline Mode Active — Service Worker Serving Shell'}
      </div>

      {/* Surface Selector & Auth Bar */}
      <header className="border-b border-gray-200 bg-white px-4 py-3 shadow-sm">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <span className="text-2xl font-bold text-patient-accent tracking-tight">NeuroSetu</span>
            <span className="text-xs bg-teal-100 text-teal-800 font-semibold px-2 py-0.5 rounded">
              Phase: Setup, Auth, Data & Sync (Tasks 1-14)
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {session ? (
              <div className="flex items-center space-x-2 bg-green-50 border border-green-200 px-3 py-1.5 rounded-xl">
                <span className="text-xs font-semibold text-patient-success">
                  👤 {session.profileName}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-xs bg-white text-gray-700 px-2 py-1 rounded border border-gray-200 hover:bg-gray-100 font-medium"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsPinModalOpen(true)}
                className="min-h-touch px-4 py-2 bg-patient-accent text-white rounded-xl font-semibold text-sm hover:bg-patient-accent-hover transition shadow-sm"
              >
                🔑 Enter PIN
              </button>
            )}

            <button
              onClick={() => setActiveTab('patient')}
              className={`min-h-touch px-3 py-2 rounded-lg font-medium text-sm transition ${
                activeTab === 'patient'
                  ? 'bg-patient-accent text-white shadow-sm'
                  : 'bg-gray-100 text-patient-primary hover:bg-gray-200'
              }`}
            >
              Patient UI
            </button>

            <button
              onClick={() => setActiveTab('data')}
              className={`min-h-touch px-3 py-2 rounded-lg font-medium text-sm transition ${
                activeTab === 'data'
                  ? 'bg-patient-terracotta text-white shadow-sm'
                  : 'bg-gray-100 text-patient-primary hover:bg-gray-200'
              }`}
            >
              IndexedDB & Sync ({pendingSyncCount})
            </button>

            <button
              onClick={() => setActiveTab('marketing')}
              className={`min-h-touch px-3 py-2 rounded-lg font-medium text-sm transition ${
                activeTab === 'marketing'
                  ? 'bg-marketing-canvas text-marketing-primary shadow-sm'
                  : 'bg-gray-100 text-patient-primary hover:bg-gray-200'
              }`}
            >
              Marketing Surface
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto p-4 sm:p-6">
        {activeTab === 'patient' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 border border-patient-border shadow-sm">
              <h1 className="text-patient-hero text-patient-primary mb-2">
                Patient Interface — High Contrast Design
              </h1>
              <p className="text-patient-body text-patient-secondary">
                Culturally localized cognitive stimulation platform with silent digital biomarker telemetry.
              </p>
            </div>

            {/* Quick Simulation Bar for Data Layer Testing */}
            <div className="bg-white rounded-xl p-5 border border-patient-border shadow-sm">
              <h3 className="font-bold text-patient-primary text-base mb-2">
                Simulate Cognitive Biomarker Events (IndexedDB + Telemetry):
              </h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleSimulateGameEvent(false, false)}
                  className="min-h-touch px-4 py-2 bg-patient-accent text-white rounded-xl font-medium text-sm hover:bg-patient-accent-hover shadow-sm"
                >
                  + Normal Response (3.8s, 0 Errors)
                </button>
                <button
                  onClick={() => handleSimulateGameEvent(true, false)}
                  className="min-h-touch px-4 py-2 bg-patient-terracotta text-white rounded-xl font-medium text-sm hover:bg-patient-terracotta-hover shadow-sm"
                >
                  + Delayed Response (&gt;15s Latency Alert)
                </button>
                <button
                  onClick={() => handleSimulateGameEvent(false, true)}
                  className="min-h-touch px-4 py-2 bg-gray-800 text-white rounded-xl font-medium text-sm hover:bg-gray-900 shadow-sm"
                >
                  + Consecutive Mistakes (DDA Drop Alert)
                </button>
              </div>
            </div>

            {/* Design Tokens & Contrast Verification Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 bg-patient-canvas border border-patient-border rounded-xl">
                <span className="text-xs font-bold uppercase tracking-wider text-patient-hint">Token: Canvas & Text</span>
                <p className="text-patient-prompt text-patient-primary mt-2">
                  High Contrast Text (15:1+)
                </p>
                <p className="text-sm text-patient-secondary mt-1">
                  Background: <code className="bg-white px-1.5 py-0.5 rounded border border-gray-200">#FAF8F4</code> | Text: <code className="bg-white px-1.5 py-0.5 rounded border border-gray-200">#1A1A1A</code>
                </p>
              </div>

              <div className="p-5 bg-white border border-patient-border rounded-xl">
                <span className="text-xs font-bold uppercase tracking-wider text-patient-hint">Token: Primary Accent (NER Teal)</span>
                <div className="mt-3">
                  <button className="min-h-touch min-w-touch w-full px-6 py-3 bg-patient-accent text-white font-semibold rounded-lg hover:bg-patient-accent-hover transition shadow-sm text-lg">
                    Primary Action Button (#0B6E6E)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'data' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 border border-patient-border shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-bold text-patient-primary">
                    Local IndexedDB & Supabase Sync Engine
                  </h1>
                  <p className="text-sm text-patient-secondary mt-1">
                    Silently recorded digital biomarkers stored in IndexedDB and delta-synced to Supabase upon reconnection.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={refreshTelemetry}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-semibold text-gray-700"
                  >
                    🔄 Refresh
                  </button>
                  <button
                    onClick={handleManualSync}
                    disabled={isSyncing}
                    className="min-h-touch px-4 py-2 bg-patient-accent hover:bg-patient-accent-hover text-white rounded-xl text-xs font-bold shadow-sm transition disabled:opacity-50"
                  >
                    {isSyncing ? '⏳ Syncing...' : '☁ Push Delta to Supabase'}
                  </button>
                </div>
              </div>

              {/* Sync Status Banner */}
              <div className="mt-3 p-3 rounded-lg bg-gray-50 border border-gray-200 text-xs flex items-center justify-between">
                <span>
                  <strong>Sync Engine Status:</strong> {syncStatusMsg || (isOnline ? 'Online — Ready to push queue' : 'Offline — Queuing locally in IndexedDB')}
                </span>
                <span className={`px-2 py-0.5 rounded font-bold ${isSupabaseConfigured() ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                  {isSupabaseConfigured() ? 'Supabase Connected' : 'Local Offline Mode (Unconfigured)'}
                </span>
              </div>

              {/* Summary Stats */}
              {summary && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-gray-100">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <span className="text-xs text-patient-hint font-medium">Total Events</span>
                    <p className="text-xl font-bold text-patient-primary mt-0.5">{summary.totalEvents}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <span className="text-xs text-patient-hint font-medium">Avg Latency</span>
                    <p className="text-xl font-bold text-patient-primary mt-0.5">{summary.averageLatencyMs} ms</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <span className="text-xs text-patient-hint font-medium">DDA Drops</span>
                    <p className="text-xl font-bold text-patient-terracotta mt-0.5">{summary.ddaDecreasedCount}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <span className="text-xs text-patient-hint font-medium">Pending Sync</span>
                    <p className="text-xl font-bold text-amber-600 mt-0.5">{pendingSyncCount}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Recent Telemetry Logs Table */}
            <div className="bg-white rounded-xl p-5 border border-patient-border shadow-sm">
              <h3 className="font-bold text-patient-primary text-base mb-3">
                Recent Biomarker Records (IndexedDB: <code className="text-xs bg-gray-100 px-1 rounded">telemetry_logs</code>)
              </h3>
              {telemetryLogs.length === 0 ? (
                <p className="text-sm text-patient-secondary italic">
                  No telemetry records yet. Click "Simulate Cognitive Biomarker Events" on the Patient UI tab.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-gray-200 text-patient-hint uppercase">
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
                          <td className="py-2 font-medium text-patient-accent">{log.ddaAdjustment}</td>
                          <td className="py-2">
                            {log.alertFlag ? (
                              <span className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded font-bold">ALERT</span>
                            ) : (
                              <span className="text-gray-400">Normal</span>
                            )}
                          </td>
                          <td className="py-2">
                            {log.isSynced ? (
                              <span className="text-patient-success font-semibold">Synced ✓</span>
                            ) : (
                              <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-medium">Pending Sync</span>
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
        )}

        {activeTab === 'marketing' && (
          <div className="space-y-6 bg-marketing-canvas p-6 rounded-2xl text-marketing-primary border border-marketing-card-border">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-marketing-accent">
                Marketing / Public Surface
              </span>
              <h1 className="text-3xl font-extrabold mt-1 text-white">
                Cognitive Games That Speak Your Language.
              </h1>
              <p className="text-marketing-secondary mt-2 text-base">
                Voice-first, culturally localized cognitive stimulation platform for North East India.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-marketing-card border border-marketing-card-border rounded-xl">
                <div className="text-marketing-accent font-bold text-sm">01 — Voice-First</div>
                <div className="text-white font-medium mt-1">Bhashini ASR in Assamese & Manipuri</div>
                <div className="text-marketing-secondary text-xs mt-1">No typing required; speak naturally.</div>
              </div>

              <div className="p-4 bg-marketing-card border border-marketing-card-border rounded-xl">
                <div className="text-marketing-accent font-bold text-sm">02 — Offline Native</div>
                <div className="text-white font-medium mt-1">Service Worker Caching</div>
                <div className="text-marketing-secondary text-xs mt-1">100% playable without network.</div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Accessible PIN Authentication Modal */}
      <PinAuthModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onSuccess={handleAuthSuccess}
        profileName="Elderly Patient"
      />
    </div>
  );
}
