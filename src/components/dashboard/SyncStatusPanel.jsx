import React, { useState } from 'react';
import { syncPendingTelemetry } from '../../services/syncManager.js';
import { recordBiomarkerEvent } from '../../services/telemetryService.js';
import { isSupabaseConfigured } from '../../services/supabaseClient.js';

export default function SyncStatusPanel({
  pendingCount = 0,
  isOnline = true,
  onSyncComplete = null
}) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState('');

  const handleTriggerSync = async () => {
    setIsSyncing(true);
    setSyncFeedback('Initiating delta sync with Supabase...');

    try {
      const result = await syncPendingTelemetry();
      if (result.success) {
        setSyncFeedback(`Successfully uploaded ${result.count} telemetry records to Supabase.`);
      } else if (result.reason === 'offline') {
        setSyncFeedback('Device is currently offline. Telemetry preserved safely in IndexedDB.');
      } else if (result.reason === 'unconfigured') {
        setSyncFeedback('Supabase credentials not configured in .env; logs preserved safely in local IndexedDB.');
      } else {
        setSyncFeedback(`Sync failed: ${result.error || 'Server error'}. Events kept in queue for retry.`);
      }
    } catch (e) {
      setSyncFeedback('Unexpected error during synchronization.');
    } finally {
      setIsSyncing(false);
      if (onSyncComplete) onSyncComplete();
    }
  };

  const handleSimulateHouseholdVisit = async () => {
    // Simulate an ASHA rural household visit recording
    await recordBiomarkerEvent({
      profileId: 'patient_ner_rural_visit',
      taskType: 'asha_home_visit_bihu',
      latencyMs: 15800, // Latency spike
      errorCount: 2,
      ddaAdjustment: 'decreased'
    });

    setSyncFeedback('Simulated new household visit session added to local IndexedDB queue.');
    if (onSyncComplete) onSyncComplete();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft p-6 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-600"></span>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Data Synchronization
            </span>
          </div>
          <h3 className="font-bold text-slate-900 text-lg mt-1">
            ASHA Household Visit Sync Status
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 max-w-lg leading-relaxed">
            Offline-first background synchronization between rural household devices and PHC Supabase cloud.
          </p>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
            isOnline
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80'
              : 'bg-amber-50 text-amber-800 border border-amber-200/80'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-600' : 'bg-amber-600'}`}></span>
          {isOnline ? '● Online (Cloud Reachable)' : '● Offline (IndexedDB Active)'}
        </span>
      </div>

      {/* Sync Queue Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/60">
          <span className="text-xs text-slate-400 font-medium block">Pending Sync Queue</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">{pendingCount}</p>
          <span className="text-[11px] text-slate-500">Unsynced telemetry deltas</span>
        </div>

        <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/60">
          <span className="text-xs text-slate-400 font-medium block">Storage Engine</span>
          <p className="text-sm font-bold text-teal-800 mt-1">IndexedDB (`idb`)</p>
          <span className="text-[11px] text-slate-500">Zero network dependency</span>
        </div>

        <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/60">
          <span className="text-xs text-slate-400 font-medium block">Cloud Target</span>
          <p className="text-sm font-bold text-slate-800 mt-1">
            {isSupabaseConfigured() ? 'Supabase Postgres' : 'Local Offline Mode'}
          </p>
          <span className="text-[11px] text-slate-500">Free-tier managed backend</span>
        </div>
      </div>

      {/* ASHA Instructions Callout */}
      <div className="p-4 bg-teal-50/40 border border-teal-200/60 rounded-xl text-xs text-teal-950 space-y-1">
        <p className="font-semibold text-teal-900">📋 Field Visit Note for ASHA Workers:</p>
        <p className="text-teal-800/90 leading-relaxed">
          Patients can complete cognitive sessions with zero internet connectivity. Data is stored safely in local IndexedDB and automatically pushes to the dashboard once your device reconnects to mobile data or PHC Wi-Fi.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 pt-1">
        <button
          type="button"
          onClick={handleTriggerSync}
          disabled={isSyncing}
          className="min-h-touch px-5 py-2.5 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-xs font-semibold rounded-xl shadow-soft transition disabled:opacity-50 flex items-center gap-2"
        >
          {isSyncing ? '⏳ Synchronizing...' : '☁ Push Delta to Supabase'}
        </button>

        <button
          type="button"
          onClick={handleSimulateHouseholdVisit}
          className="min-h-touch px-4 py-2.5 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 shadow-soft transition"
        >
          + Simulate Household Visit Session
        </button>
      </div>

      {/* Sync Feedback Message */}
      {syncFeedback && (
        <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-700 font-medium">
          {syncFeedback}
        </div>
      )}
    </div>
  );
}
