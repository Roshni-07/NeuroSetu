import React, { useState } from 'react';

// Sample patient profiles across NER rural districts for ASHA triage demonstration
export const SAMPLE_ASHA_PATIENTS = [
  {
    id: 'patient_001',
    name: 'Bhaben Kalita',
    age: 72,
    village: 'Hajo, Kamrup (Assam)',
    language: 'Assamese (অসমীয়া)',
    condition: 'Early MCI',
    activeAlerts: 3,
    avgLatencyMs: 16200,
    sessionsCompleted: 14,
    lastActive: 'Today, 10:15 AM',
    status: 'critical', // 'critical' | 'attention' | 'stable'
    alertReason: '3 response latency alerts (>15s) and 2 consecutive errors in Bihu recall'
  },
  {
    id: 'patient_002',
    name: 'Malsawmi Ralte',
    age: 69,
    village: 'Reiek, Mamit (Mizoram)',
    language: 'Mizo (Lushai)',
    condition: 'Mild Dementia',
    activeAlerts: 1,
    avgLatencyMs: 11400,
    sessionsCompleted: 19,
    lastActive: 'Yesterday',
    status: 'attention',
    alertReason: 'DDA tier reduced from Tier 2 to Tier 1 during textile pattern matching'
  },
  {
    id: 'patient_003',
    name: 'Tombi Devi',
    age: 66,
    village: 'Nambol, Bishnupur (Manipur)',
    language: 'Manipuri (মৈতৈলোন্)',
    condition: 'Early Stage MCI',
    activeAlerts: 0,
    avgLatencyMs: 4800,
    sessionsCompleted: 26,
    lastActive: 'Today, 8:45 AM',
    status: 'stable',
    alertReason: 'Stable task performance; response times consistent under 5s'
  }
];

export default function PatientTriageList({
  patients = SAMPLE_ASHA_PATIENTS,
  selectedPatientId = 'patient_001',
  onSelectPatient = null
}) {
  const [filter, setFilter] = useState('all'); // 'all' | 'critical' | 'stable'
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPatients = patients.filter((patient) => {
    const matchesFilter =
      filter === 'all' ||
      (filter === 'critical' && (patient.status === 'critical' || patient.status === 'attention')) ||
      (filter === 'stable' && patient.status === 'stable');

    const matchesSearch =
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.village.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft p-6 space-y-5">
      {/* Header & Triage Summary */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-600"></span>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Community Caseload
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-1">
            ASHA Household Patient Triage
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 max-w-md leading-relaxed">
            Prioritized clinical telemetry based on response latency trends and downward DDA adjustments.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex bg-slate-100/80 p-1 rounded-xl text-xs font-medium border border-slate-200/60">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filter === 'all'
                ? 'bg-white text-slate-900 shadow-soft font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Patients ({patients.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('critical')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filter === 'critical'
                ? 'bg-white text-amber-800 shadow-soft font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Alerts / Decline ({patients.filter(p => p.status !== 'stable').length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('stable')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filter === 'stable'
                ? 'bg-white text-emerald-800 shadow-soft font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Stable ({patients.filter(p => p.status === 'stable').length})
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search by patient name or rural village..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-slate-800 placeholder:text-slate-400 transition"
        />
      </div>

      {/* Patients Card List */}
      <div className="space-y-3">
        {filteredPatients.map((patient) => {
          const isSelected = selectedPatientId === patient.id;
          return (
            <div
              key={patient.id}
              onClick={() => onSelectPatient && onSelectPatient(patient.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'border-teal-600 bg-teal-50/30 shadow-soft ring-1 ring-teal-600/30'
                  : 'border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/50 bg-white'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-sm">{patient.name}</h3>
                    <span className="text-xs text-slate-400">({patient.age} yrs)</span>
                    <span className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium border border-slate-200/60">
                      {patient.language}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <span>📍</span> {patient.village} • <span className="font-medium text-slate-700">{patient.condition}</span>
                  </p>
                </div>

                {/* Soft Status Triage Badge */}
                <div>
                  {patient.status === 'critical' ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200/80">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
                      Urgent Home Visit
                    </span>
                  ) : patient.status === 'attention' ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200/80">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                      Needs Follow-up
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                      Stable
                    </span>
                  )}
                </div>
              </div>

              {/* Triage Biomarker Metrics Bar */}
              <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 text-[11px] block font-medium">Avg Response</span>
                  <span className={`font-semibold text-xs ${patient.avgLatencyMs > 15000 ? 'text-rose-700 font-bold' : 'text-slate-800'}`}>
                    {(patient.avgLatencyMs / 1000).toFixed(1)}s
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 text-[11px] block font-medium">Active Alerts</span>
                  <span className={`font-semibold text-xs ${patient.activeAlerts > 0 ? 'text-amber-700 font-bold' : 'text-slate-800'}`}>
                    {patient.activeAlerts} flag{patient.activeAlerts !== 1 ? 's' : ''}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 text-[11px] block font-medium">Sessions</span>
                  <span className="font-semibold text-xs text-slate-800">{patient.sessionsCompleted}</span>
                </div>
              </div>

              {/* Clinical Alert Reason Callout */}
              {patient.alertReason && patient.status !== 'stable' && (
                <div className="mt-3 p-2.5 bg-slate-50 border border-slate-200/60 rounded-lg text-xs text-slate-700 font-normal leading-relaxed">
                  <span className="font-semibold text-slate-900">Clinical Note:</span> {patient.alertReason}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
