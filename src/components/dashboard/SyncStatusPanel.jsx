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
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3">
        <div>
          <h3 className="font-bold text-gray-900 text-lg">ASHA Household Visit Sync Status</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Offline-first background synchronization between rural household devices and PHC Supabase cloud.
          </p>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-bold ${
            isOnline
              ? 'bg-green-100 text-green-800 border border-green-300'
              : 'bg-orange-100 text-orange-800 border border-orange-300'
          }`}
        >
          {isOnline ? '● Online (Cloud Reachable)' : '● Offline (IndexedDB Active)'}
        </span>
      </div>

      {/* Sync Queue Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200">
          <span className="text-xs text-gray-500 font-medium">Pending Sync Queue</span>
          <p className="text-2xl font-black text-gray-900 mt-0.5">{pendingCount}</p>
          <span className="text-[11px] text-gray-500">Unsynced telemetry deltas</span>
        </div>

        <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200">
          <span className="text-xs text-gray-500 font-medium">Storage Engine</span>
          <p className="text-base font-bold text-teal-800 mt-1">IndexedDB (`idb`)</p>
          <span className="text-[11px] text-gray-500">Zero network dependency</span>
        </div>

        <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200">
          <span className="text-xs text-gray-500 font-medium">Cloud Target</span>
          <p className="text-base font-bold text-gray-800 mt-1">
            {isSupabaseConfigured() ? 'Supabase Postgres' : 'Local Offline Mode'}
          </p>
          <span className="text-[11px] text-gray-500">Free-tier managed backend</span>
        </div>
      </div>

      {/* ASHA Instructions Callout */}
      <div className="p-3.5 bg-teal-50/70 border border-teal-200 rounded-xl text-xs text-teal-950 space-y-1">
        <p className="font-bold">📋 Field Visit Note for ASHA Workers:</p>
        <p className="text-teal-900">
          Patients can complete cognitive sessions with zero internet connectivity. Data is stored safely in local IndexedDB and automatically pushes to the dashboard once your device reconnects to mobile data or PHC Wi-Fi.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2.5 pt-1">
        <button
          type="button"
          onClick={handleTriggerSync}
          disabled={isSyncing}
          className="min-h-touch px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl shadow-sm transition disabled:opacity-50 flex items-center gap-2"
        >
          {isSyncing ? '⏳ Synchronizing...' : '☁ Push Delta to Supabase'}
        </button>

        <button
          type="button"
          onClick={handleSimulateHouseholdVisit}
          className="min-h-touch px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold rounded-xl border border-gray-300 transition"
        >
          + Simulate Household Visit Session
        </button>
      </div>

      {/* Sync Feedback Message */}
      {syncFeedback && (
        <div className="p-2.5 bg-gray-100 border border-gray-200 rounded-xl text-xs text-gray-800 font-medium">
          {syncFeedback}
        </div>
      )}
    </div>
  );
}
