import React, { useState, useEffect, useMemo } from 'react';
import { getRecentBiomarkers, getBiomarkerSummary } from '../../services/telemetryService.js';
import { getGameSessions, getActiveProfile, DEFAULT_PROFILE } from '../../db/indexedDb.js';
import { PRESET_PATIENTS } from '../../data/presetPatients.js';
import { getActiveSession } from '../../services/authService.js';
import CognitiveTrendChart from '../../components/dashboard/CognitiveTrendChart.jsx';

/**
 * Resolve linked patient profile following NeuroSetu standards:
 * 1. Explicit props (patientProfile or patientId)
 * 2. Active session's patientId (if logged in as or linked to a patient)
 * 3. LocalStorage active patient ('neurosetu_active_patient')
 * 4. Fallback to PRESET_PATIENTS[0] (Ramesh Patel) or DEFAULT_PROFILE (Bhaben Kalita)
 */
function resolveInitialPatient(patientProfile, patientId) {
  if (patientProfile && patientProfile.id) return patientProfile;
  if (patientId) {
    const found = PRESET_PATIENTS.find(p => p.id === patientId || p.name === patientId);
    if (found) return found;
    if (patientId === 'default_patient') return DEFAULT_PROFILE;
  }
  const session = getActiveSession();
  if (session?.patientId) {
    const found = PRESET_PATIENTS.find(p => p.id === session.patientId || p.name === session.patientId);
    if (found) return found;
    if (session.patientId === 'default_patient') return DEFAULT_PROFILE;
  }
  try {
    const raw = localStorage.getItem('neurosetu_active_patient');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.id) return parsed;
    }
  } catch (e) {}

  return PRESET_PATIENTS[0] || DEFAULT_PROFILE;
}

/**
 * Calculate consecutive days streak and last 7 days activity status
 */
function calculateStreakAndWeeklyActivity(timestamps = []) {
  if (!timestamps || timestamps.length === 0) {
    return { currentStreak: 0, weeklyActivity: [] };
  }

  const uniqueDates = new Set(
    timestamps
      .map(ts => {
        try {
          return new Date(ts).toISOString().split('T')[0];
        } catch (e) {
          return null;
        }
      })
      .filter(Boolean)
  );

  // Generate last 7 days ending today
  const today = new Date();
  const weeklyActivity = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'narrow' });
    const fullDayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    weeklyActivity.push({
      dateStr,
      dayLabel,
      fullDayName,
      hasActivity: uniqueDates.has(dateStr),
      isToday: i === 0
    });
  }

  // Calculate streak ending today or yesterday
  let streak = 0;
  let checkDate = new Date(today);
  const todayStr = checkDate.toISOString().split('T')[0];

  // If not active today, check starting from yesterday
  if (!uniqueDates.has(todayStr)) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (true) {
    const dateStr = checkDate.toISOString().split('T')[0];
    if (uniqueDates.has(dateStr)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return { currentStreak: streak, weeklyActivity };
}

export default function WardProgressTracker({
  patientId = null,
  patientProfile = null
}) {
  const [selectedPatient, setSelectedPatient] = useState(() =>
    resolveInitialPatient(patientProfile, patientId)
  );

  const [biomarkers, setBiomarkers] = useState([]);
  const [summary, setSummary] = useState(null);
  const [gameSessions, setGameSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Update selected patient if prop changes
  useEffect(() => {
    if (patientProfile && patientProfile.id) {
      setSelectedPatient(patientProfile);
    } else if (patientId) {
      const found = PRESET_PATIENTS.find(p => p.id === patientId) || DEFAULT_PROFILE;
      setSelectedPatient(found);
    }
  }, [patientId, patientProfile]);

  // Load telemetry, summaries, and sessions for the selected patient
  useEffect(() => {
    let isMounted = true;
    async function loadWardData() {
      setIsLoading(true);
      try {
        const targetId = selectedPatient.id || 'default_patient';
        const targetName = selectedPatient.name || targetId;

        // Fetch primary biomarkers
        let recentLogs = await getRecentBiomarkers(targetId, 10);
        // Fallback search by patient name if logs keyed by name
        if (recentLogs.length === 0 && targetName !== targetId) {
          const nameLogs = await getRecentBiomarkers(targetName, 10);
          if (nameLogs.length > 0) recentLogs = nameLogs;
        }

        // Fetch summary
        let biomarkerSummary = await getBiomarkerSummary(targetId);
        if ((!biomarkerSummary || biomarkerSummary.totalEvents === 0) && targetName !== targetId) {
          const nameSummary = await getBiomarkerSummary(targetName);
          if (nameSummary && nameSummary.totalEvents > 0) biomarkerSummary = nameSummary;
        }

        // Fetch game sessions
        const sessions = await getGameSessions(targetId);

        if (isMounted) {
          setBiomarkers(recentLogs || []);
          setSummary(biomarkerSummary || null);
          setGameSessions(sessions || []);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('[WardProgressTracker] Error loading telemetry:', err);
        if (isMounted) setIsLoading(false);
      }
    }

    loadWardData();
  }, [selectedPatient]);

  // Aggregate all recorded timestamps to compute streak
  const activityTimestamps = useMemo(() => {
    const list = [];
    biomarkers.forEach(b => {
      if (b.timestamp) list.push(b.timestamp);
    });
    gameSessions.forEach(s => {
      if (s.completedAt) list.push(s.completedAt);
    });

    // Also check localStorage completed games for this patient
    if (selectedPatient?.id) {
      const todayStr = new Date().toISOString().split('T')[0];
      const todayKey = `neurosetu_completed_games_${selectedPatient.id}_${todayStr}`;
      try {
        const todayGames = localStorage.getItem(todayKey);
        if (todayGames && JSON.parse(todayGames).length > 0) {
          list.push(new Date().toISOString());
        }
      } catch (e) {}
    }

    return list;
  }, [biomarkers, gameSessions, selectedPatient]);

  const { currentStreak, weeklyActivity } = useMemo(
    () => calculateStreakAndWeeklyActivity(activityTimestamps),
    [activityTimestamps]
  );

  // Transform recent biomarkers into CognitiveTrendChart data format
  const trendChartData = useMemo(() => {
    if (!biomarkers || biomarkers.length === 0) {
      return [];
    }

    // Chronological order (oldest first)
    const chronological = [...biomarkers].reverse();

    return chronological.map((log, index) => {
      const d = new Date(log.timestamp);
      const weekday = isNaN(d.getTime()) ? `S${index + 1}` : d.toLocaleDateString('en-US', { weekday: 'short' });
      const latencySec = Math.round(((log.latencyMs || 0) / 1000) * 10) / 10;
      return {
        session: `S${index + 1} (${weekday})`,
        latencySec: Math.min(latencySec, 20),
        tier: log.tier || (log.ddaAdjustment === 'decreased' ? 1 : 2),
        errors: log.errorCount || 0,
        alert: Boolean(log.alertFlag) || latencySec >= 15
      };
    });
  }, [biomarkers]);

  // Active alerts extracted from biomarker records
  const activeAlertLogs = useMemo(() => {
    return biomarkers.filter(b => b.alertFlag || (b.latencyMs && b.latencyMs >= 15000));
  }, [biomarkers]);

  return (
    <div className="space-y-8" data-testid="ward-progress-tracker">
      {/* Header: Linked Ward Profile Card & Ward Switcher */}
      <div className="bg-gradient-to-r from-teal-50/80 via-white to-slate-50 border border-teal-200/80 rounded-3xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-700 text-white flex items-center justify-center font-black text-2xl shadow-sm shrink-0">
              👤
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wider bg-teal-100/70 px-2.5 py-0.5 rounded-md">
                  Linked Family Ward
                </span>
                <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <span>🔒</span> Read-Only Caregiver Monitor
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight" data-testid="ward-name">
                {selectedPatient.name}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
                {selectedPatient.stage || 'Mild / Early Stage'} • Age {selectedPatient.age || 68} • {selectedPatient.villageTown || 'Guwahati'}, {selectedPatient.homeState || 'Assam'}
              </p>
            </div>
          </div>

          {/* Quick Ward Roster Selector */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center gap-2 shrink-0">
            <label htmlFor="ward-select" className="text-xs font-bold text-slate-600 whitespace-nowrap">
              Switch Ward:
            </label>
            <select
              id="ward-select"
              data-testid="ward-roster-selector"
              value={selectedPatient.id}
              onChange={(e) => {
                const targetId = e.target.value;
                const match = PRESET_PATIENTS.find(p => p.id === targetId) ||
                  (targetId === 'default_patient' ? DEFAULT_PROFILE : null);
                if (match) setSelectedPatient(match);
              }}
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {PRESET_PATIENTS.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.stage.split('/')[0].trim()})
                </option>
              ))}
              <option value="default_patient">Bhaben Kalita (Default Assam)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Primary Telemetry Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Days Active Streak */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-soft space-y-3" data-testid="metric-streak">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Days-Active Streak
            </span>
            <span className="text-xl">🔥</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-600" data-testid="streak-count">
              {currentStreak}
            </span>
            <span className="text-xs font-bold text-slate-600">
              {currentStreak === 1 ? 'Day' : 'Days'} in a row
            </span>
          </div>
          {/* 7-Day Mini Sparkline */}
          <div className="pt-1">
            <span className="text-[10px] text-slate-400 font-semibold block mb-1.5">Last 7 Days Activity:</span>
            <div className="flex items-center justify-between gap-1">
              {weeklyActivity.map((day) => (
                <div key={day.dateStr} className="flex flex-col items-center gap-1">
                  <div
                    title={`${day.fullDayName}: ${day.hasActivity ? 'Active Session' : 'No Activity'}`}
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold transition-all ${
                      day.hasActivity
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-400 border border-slate-200'
                    } ${day.isToday ? 'ring-2 ring-teal-500 ring-offset-1' : ''}`}
                  >
                    {day.hasActivity ? '✓' : '•'}
                  </div>
                  <span className="text-[9px] font-semibold text-slate-500">{day.dayLabel}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Metric 2: Trend Status */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-soft space-y-3" data-testid="metric-trend">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Cognitive Stability
            </span>
            <span className="text-xl">🧠</span>
          </div>
          <div>
            <div className="text-lg font-black text-slate-800">
              {summary?.trendStatus === 'stable' && (
                <span className="text-teal-700 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-600 inline-block animate-pulse" />
                  Stable Baseline
                </span>
              )}
              {summary?.trendStatus === 'needs_attention' && (
                <span className="text-rose-600 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block animate-ping" />
                  Attention Suggested
                </span>
              )}
              {(!summary || summary.trendStatus === 'insufficient_data') && (
                <span className="text-slate-600 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block" />
                  Calibrating Data
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {summary?.trendStatus === 'stable'
                ? 'Response patterns match healthy expected baseline for this stage.'
                : summary?.trendStatus === 'needs_attention'
                ? 'Recent latency spikes suggest reviewing fatigue or hydration.'
                : 'Complete 3+ game exercises to establish baseline curve.'}
            </p>
          </div>
        </div>

        {/* Metric 3: Average Latency */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-soft space-y-3" data-testid="metric-latency">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Avg Response Time
            </span>
            <span className="text-xl">⏱️</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">
              {summary && summary.averageLatencyMs > 0
                ? `${(summary.averageLatencyMs / 1000).toFixed(1)}s`
                : '4.8s'}
            </span>
            <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">
              Target &lt; 12.0s
            </span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Passive touch latency recorded silently during memory & routine games.
          </p>
        </div>

        {/* Metric 4: Active Alerts */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-soft space-y-3" data-testid="metric-alerts">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Active Alerts
            </span>
            <span className="text-xl">🔔</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-3xl font-black ${
                activeAlertLogs.length > 0 ? 'text-rose-600' : 'text-teal-700'
              }`}
              data-testid="active-alerts-count"
            >
              {activeAlertLogs.length}
            </span>
            <span className="text-xs font-bold text-slate-600">
              {activeAlertLogs.length === 1 ? 'Alert Flagged' : 'Alerts Flagged'}
            </span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            {activeAlertLogs.length === 0
              ? 'Zero delays over 15 seconds in recent sessions.'
              : 'Flags automatically shared with assigned ASHA worker.'}
          </p>
        </div>
      </div>

      {/* Cognitive Biomarker Trend Chart Section */}
      <section aria-label="Cognitive Biomarker Trend Section" className="space-y-3">
        <CognitiveTrendChart
          patientName={selectedPatient.name}
          data={trendChartData.length > 0 ? trendChartData : undefined}
          isLoading={isLoading}
        />
      </section>

      {/* Active Clinical Alerts & Observations */}
      <section aria-label="Clinical Alerts" className="space-y-4">
        <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
          <span>⚠️</span> Clinical Alerts & Caregiver Observations
        </h3>

        {activeAlertLogs.length === 0 ? (
          <div className="bg-teal-50/70 border border-teal-200 rounded-2xl p-5 flex items-start gap-3.5" data-testid="zero-alerts-banner">
            <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
              ✓
            </div>
            <div>
              <h4 className="text-sm font-bold text-teal-900">
                All Telemetry Readings Within Expected Parameters
              </h4>
              <p className="text-xs text-teal-800 mt-1 leading-relaxed">
                No delayed response spikes (&gt;15s) or consecutive failure loops were detected for{' '}
                <strong>{selectedPatient.name}</strong>. The dynamic difficulty system continues to adjust smoothly to protect against cognitive fatigue.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3" data-testid="active-alerts-list">
            {activeAlertLogs.map((alert, idx) => {
              const dateStr = alert.timestamp ? new Date(alert.timestamp).toLocaleString() : 'Recent';
              const latencySec = alert.latencyMs ? (alert.latencyMs / 1000).toFixed(1) : '15+';
              return (
                <div
                  key={alert.id || idx}
                  className="bg-rose-50/70 border border-rose-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl shrink-0">🚨</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                          Cognitive Latency Spike
                        </span>
                        <span className="text-xs text-slate-500 font-medium">{dateStr}</span>
                      </div>
                      <p className="text-sm font-bold text-slate-800 mt-1">
                        Task: <span className="text-rose-900 font-mono text-xs">{alert.taskType}</span> • Latency: {latencySec}s
                      </p>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Response took longer than 15s threshold. DDA engine intervened to safeguard confidence.
                      </p>
                    </div>
                  </div>
                  <div className="sm:self-center">
                    <span className="text-xs font-semibold text-rose-800 bg-white border border-rose-200 px-3 py-1.5 rounded-xl shadow-2xs inline-block">
                      Notified ASHA
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Caregiver Gentle Guidance Box */}
            <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl text-xs space-y-1 text-amber-900">
              <span className="font-bold flex items-center gap-1.5 text-amber-950">
                <span>💡</span> Caregiver Tip for Latency Spikes:
              </span>
              <p className="leading-relaxed">
                Temporary reaction time delays are frequently related to environmental distractions, fatigue, or evening sundowning. If spikes recur, schedule cognitive play earlier in the day and ensure hydration.
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Read-Only Recent Sessions & Telemetry Table */}
      <section aria-label="Recent Session History" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-slate-900">Recent Cognitive Activity Records</h3>
            <p className="text-xs text-slate-500">
              Read-only passive session telemetry saved in local offline IndexedDB.
            </p>
          </div>
          <span className="text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200 px-3 py-1 rounded-xl">
            {biomarkers.length} Sessions Buffered
          </span>
        </div>

        {biomarkers.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-2">
            <span className="text-3xl block">📋</span>
            <h4 className="text-sm font-bold text-slate-800">No session records found for {selectedPatient.name}</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Once {selectedPatient.name} plays cognitive exercises from their dashboard, task logs and timing records will appear here.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-bold">
                  <tr>
                    <th className="px-4 py-3">Timestamp</th>
                    <th className="px-4 py-3">Exercise / Task</th>
                    <th className="px-4 py-3">Accuracy</th>
                    <th className="px-4 py-3">Response Latency</th>
                    <th className="px-4 py-3">Errors</th>
                    <th className="px-4 py-3">Level / DDA</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {biomarkers.map((log, idx) => {
                    const time = log.timestamp ? new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';
                    const date = log.timestamp ? new Date(log.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' }) : '—';
                    const rawLatency = log.responseTimeMs ?? log.latencyMs;
                    const latencySec = rawLatency ? (rawLatency / 1000).toFixed(1) + 's' : '0.0s';
                    const isAlert = Boolean(log.alertFlag) || (rawLatency && rawLatency >= 15000) || (log.errorCount >= 2);

                    return (
                      <tr key={log.id || idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="font-semibold text-slate-900">{date}</span>{' '}
                          <span className="text-slate-400">{time}</span>
                        </td>
                        <td className="px-4 py-3 font-mono font-medium text-teal-800">
                          {log.gameId || log.taskType || 'general_recall'}
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-700">
                          {log.accuracy !== undefined ? `${Math.round(log.accuracy)}%` : '—'}
                        </td>
                        <td className="px-4 py-3 font-semibold">
                          <span className={isAlert ? 'text-rose-600 font-bold' : 'text-slate-800'}>
                            {latencySec}
                          </span>
                        </td>
                        <td className="px-4 py-3">{log.errorCount || 0}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            log.ddaAdjustment === 'decreased'
                              ? 'bg-amber-100 text-amber-800'
                              : log.ddaAdjustment === 'increased'
                              ? 'bg-teal-100 text-teal-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {log.sessionLevel ? `L${log.sessionLevel} (${log.ddaAdjustment || 'maintained'})` : (log.ddaAdjustment || 'maintained')}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {isAlert ? (
                            <span className="text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded text-[11px] border border-rose-200">
                              Alert Flag
                            </span>
                          ) : (
                            <span className="text-teal-700 font-medium bg-teal-50 px-2 py-0.5 rounded text-[11px]">
                              Normal ✓
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
