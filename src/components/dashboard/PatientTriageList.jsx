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
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
      {/* Header & Triage Summary */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">ASHA Household Patient Triage</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Prioritized clinical telemetry list based on response latency spikes & DDA downward adjustments.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex space-x-1.5 bg-gray-100 p-1 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition ${
              filter === 'all' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All Patients ({patients.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('critical')}
            className={`px-3 py-1.5 rounded-lg transition ${
              filter === 'critical' ? 'bg-orange-500 text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Alerts / Decline ({patients.filter(p => p.status !== 'stable').length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('stable')}
            className={`px-3 py-1.5 rounded-lg transition ${
              filter === 'stable' ? 'bg-green-600 text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Stable ({patients.filter(p => p.status === 'stable').length})
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div>
        <input
          type="text"
          placeholder="Search by patient name or rural village..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
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
              className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                isSelected
                  ? 'border-teal-600 bg-teal-50/40 shadow-xs'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-gray-900 text-base">{patient.name}</h3>
                    <span className="text-xs text-gray-500">({patient.age} yrs)</span>
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-medium">
                      {patient.language}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-0.5">
                    📍 {patient.village} • <span className="font-medium text-gray-800">{patient.condition}</span>
                  </p>
                </div>

                {/* Status Triage Badge */}
                <div>
                  {patient.status === 'critical' ? (
                    <span className="bg-red-100 text-red-800 px-2.5 py-1 rounded-lg text-xs font-black flex items-center gap-1">
                      ⚠️ Urgent Home Visit
                    </span>
                  ) : patient.status === 'attention' ? (
                    <span className="bg-amber-100 text-amber-800 px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                      ℹ Needs Follow-up
                    </span>
                  ) : (
                    <span className="bg-green-100 text-green-800 px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1">
                      ✓ Stable
                    </span>
                  )}
                </div>
              </div>

              {/* Triage Biomarker Metrics Bar */}
              <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-gray-100 text-xs">
                <div>
                  <span className="text-gray-500 block">Avg Response Time</span>
                  <span className={`font-bold ${patient.avgLatencyMs > 15000 ? 'text-red-700' : 'text-gray-800'}`}>
                    {(patient.avgLatencyMs / 1000).toFixed(1)}s
                  </span>
                </div>

                <div>
                  <span className="text-gray-500 block">Active Alerts</span>
                  <span className={`font-bold ${patient.activeAlerts > 0 ? 'text-orange-700' : 'text-gray-800'}`}>
                    {patient.activeAlerts} flag{patient.activeAlerts !== 1 ? 's' : ''}
                  </span>
                </div>

                <div>
                  <span className="text-gray-500 block">Sessions Completed</span>
                  <span className="font-bold text-gray-800">{patient.sessionsCompleted}</span>
                </div>
              </div>

              {/* Clinical Alert Reason Callout */}
              {patient.alertReason && patient.status !== 'stable' && (
                <div className="mt-2.5 p-2 bg-orange-50/70 border border-orange-200 rounded-lg text-xs text-orange-900 font-medium">
                  <strong>Clinical Flag:</strong> {patient.alertReason}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
