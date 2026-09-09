import React, { useState, useEffect } from 'react';
import { SAMPLE_ASHA_PATIENTS } from './PatientTriageList.jsx';
import { COGNITIVE_DOMAINS } from '../../engine/dailyAssignmentEngine.js';
import { saveProfile } from '../../db/indexedDb.js';

/**
 * Supported North East Regional Content Packs (V1 Catalog)
 * In V1, this is selection only across existing localized language/cultural packs.
 */
export const REGION_PACKS = [
  { code: 'as', label: '🌿 Assam (Assamese / অসমীয়া)', homeState: 'Assam', language: 'Assamese (অসমীয়া)' },
  { code: 'brx', label: '🌾 Bodoland (Bodo / बर’)', homeState: 'Assam', language: 'Bodo (बर’)' },
  { code: 'bn', label: '🌸 Barak & Tripura (Bengali / বাংলা)', homeState: 'Tripura', language: 'Bengali (বাংলা)' },
  { code: 'mni', label: '🌺 Manipur (Meitei / মৈতৈলোন্)', homeState: 'Manipur', language: 'Manipuri (মৈতৈলোন্)' },
  { code: 'lus', label: '🌄 Mizoram (Mizo / Lushai)', homeState: 'Mizoram', language: 'Mizo (Lushai)' },
  { code: 'kha', label: '🌧️ Meghalaya (Khasi)', homeState: 'Meghalaya', language: 'Khasi' },
  { code: 'grt', label: '🥁 Meghalaya (Garo / A·chik)', homeState: 'Meghalaya', language: 'Garo' },
  { code: 'hi', label: '🇮🇳 North India (Hindi / हिन्दी)', homeState: 'Assam', language: 'Hindi (हिन्दी)' },
  { code: 'en', label: '🇬🇧 National (English)', homeState: 'Assam', language: 'English' }
];

const DOMAIN_METADATA = [
  { id: 'Memory', label: 'Memory', icon: '🧠', desc: 'Folklore & Bihu Recall' },
  { id: 'Attention', label: 'Attention', icon: '👁️', desc: 'Visual Focus & Search' },
  { id: 'Reasoning/Executive Function', label: 'Reasoning', icon: '💡', desc: 'Chai Sequencing & Daily Routines' },
  { id: 'Visual Reasoning', label: 'Visual', icon: '🎨', desc: 'Handloom & Textile Motifs' },
  { id: 'Emotional Cognition', label: 'Emotional', icon: '❤️', desc: 'Facial Expressions & Care' }
];

export default function PatientContentManager({
  patients = null,
  onUpdatePatient = null
}) {
  // Load patients from localStorage or fall back to SAMPLE_ASHA_PATIENTS
  const [patientList, setPatientList] = useState(() => {
    try {
      const saved = localStorage.getItem('neurosetu_asha_triage_patients');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return (patients || SAMPLE_ASHA_PATIENTS).map(p => ({
      ...p,
      activeCognitiveDomains: p.activeCognitiveDomains || [...COGNITIVE_DOMAINS]
    }));
  });

  const [savedStatus, setSavedStatus] = useState({}); // { [patientId]: boolean }
  const [errorMessage, setErrorMessage] = useState({}); // { [patientId]: string }

  // Sync if custom patients prop changes
  useEffect(() => {
    if (patients && Array.isArray(patients)) {
      setPatientList(patients.map(p => ({
        ...p,
        activeCognitiveDomains: p.activeCognitiveDomains || [...COGNITIVE_DOMAINS]
      })));
    }
  }, [patients]);

  /**
   * Immediate Write Handler:
   * Each change directly writes to localStorage ('neurosetu_asha_triage_patients')
   * and IndexedDB (if active profile matches), giving immediate local persistence.
   *
   * TODO (Sharvesh Schema Integration):
   * Once backend Supabase migration lands, sync this change to the cloud:
   * supabase.from('patient_profiles').update({
   *   region_pack: packCode,
   *   active_cognitive_domains: domains
   * }).eq('id', patientId);
   */
  const persistPatientChange = (updatedPatient) => {
    const updatedList = patientList.map(p => (p.id === updatedPatient.id ? updatedPatient : p));
    setPatientList(updatedList);

    // 1. Immediate write to ASHA triage cache
    try {
      localStorage.setItem('neurosetu_asha_triage_patients', JSON.stringify(updatedList));
    } catch (e) {}

    // 2. If this is the active patient in session, sync to active profile key
    try {
      const activeRaw = localStorage.getItem('neurosetu_active_patient');
      if (activeRaw) {
        const active = JSON.parse(activeRaw);
        if (active && active.id === updatedPatient.id) {
          localStorage.setItem('neurosetu_active_patient', JSON.stringify({
            ...active,
            ...updatedPatient
          }));
        }
      }
    } catch (e) {}

    // 3. Persist to IndexedDB
    try {
      saveProfile({
        ...updatedPatient,
        updatedAt: new Date().toISOString()
      }).catch(() => {});
    } catch (e) {}

    // 4. Notify parent if callback provided
    if (onUpdatePatient) {
      onUpdatePatient(updatedPatient);
    }

    // 5. Transient "Saved ✓" indicator (2.5 seconds)
    setSavedStatus(prev => ({ ...prev, [updatedPatient.id]: true }));
    setTimeout(() => {
      setSavedStatus(prev => ({ ...prev, [updatedPatient.id]: false }));
    }, 2500);
  };

  const handleRegionPackChange = (patientId, newPackCode) => {
    const pack = REGION_PACKS.find(r => r.code === newPackCode) || REGION_PACKS[0];
    const patient = patientList.find(p => p.id === patientId);
    if (!patient) return;

    const updated = {
      ...patient,
      languageCode: pack.code,
      language: pack.language,
      homeState: pack.homeState || patient.homeState
    };

    persistPatientChange(updated);
  };

  const handleDomainToggle = (patientId, domainId) => {
    const patient = patientList.find(p => p.id === patientId);
    if (!patient) return;

    const currentDomains = patient.activeCognitiveDomains || [...COGNITIVE_DOMAINS];
    const isCurrentlyActive = currentDomains.includes(domainId);

    // Validation Guard: Prevent deselecting all 5 domains
    if (isCurrentlyActive && currentDomains.length === 1) {
      setErrorMessage(prev => ({
        ...prev,
        [patientId]: 'At least one cognitive domain must remain active.'
      }));
      setTimeout(() => {
        setErrorMessage(prev => ({ ...prev, [patientId]: '' }));
      }, 3000);
      return;
    }

    setErrorMessage(prev => ({ ...prev, [patientId]: '' }));

    const newDomains = isCurrentlyActive
      ? currentDomains.filter(d => d !== domainId)
      : [...currentDomains, domainId];

    const updated = {
      ...patient,
      activeCognitiveDomains: newDomains
    };

    persistPatientChange(updated);
  };

  return (
    <div className="space-y-6 animate-fade-in" data-testid="patient-content-manager">
      {/* Shell Header & Clinical Context */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-100">
            ASHA Clinical Content Allocation • V1 Shell
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-1 tracking-tight">
            Patient Content & Cognitive Domain Management
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Assign regional folklore/language packs and toggle active cognitive training domains tailored to each patient.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/60 shrink-0">
          <span>⚡ Immediate Local Persistence</span>
        </div>
      </div>

      {/* Patient Cards List */}
      <div className="space-y-4">
        {patientList.map((patient) => {
          const currentPackCode = patient.languageCode || 'as';
          const activeDomains = patient.activeCognitiveDomains || COGNITIVE_DOMAINS;
          const isSaved = savedStatus[patient.id];
          const error = errorMessage[patient.id];

          return (
            <div
              key={patient.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-soft hover:shadow-soft-md transition-all space-y-4"
              data-testid={`content-card-${patient.id}`}
            >
              {/* Top Row: Patient Info + Region Pack Dropdown */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 border border-teal-200/80 flex items-center justify-center font-bold text-base shadow-inner">
                    {patient.name?.charAt(0) || '👤'}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-tight">
                      {patient.name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Age {patient.age || '—'} • {patient.villageTown || patient.village || 'North East Region'}
                    </p>
                  </div>
                </div>

                {/* Region Pack Selector */}
                <div className="flex items-center gap-2">
                  <label htmlFor={`region-pack-${patient.id}`} className="text-xs font-semibold text-slate-600 shrink-0">
                    Region Pack:
                  </label>
                  <select
                    id={`region-pack-${patient.id}`}
                    aria-label={`Region Pack for ${patient.name}`}
                    value={currentPackCode}
                    onChange={(e) => handleRegionPackChange(patient.id, e.target.value)}
                    className="bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer shadow-xs transition"
                  >
                    {REGION_PACKS.map((pack) => (
                      <option key={pack.code} value={pack.code}>
                        {pack.label}
                      </option>
                    ))}
                  </select>

                  {/* Immediate Save Status Badge */}
                  {isSaved && (
                    <span className="inline-flex items-center text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md animate-fade-in">
                      Saved ✓
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom Section: 5 Cognitive Domain Toggles */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Active Cognitive Training Domains:
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {activeDomains.length} of 5 active
                  </span>
                </div>

                {/* Error Banner if user tries to uncheck last domain */}
                {error && (
                  <div className="text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl animate-shake">
                    ⚠️ {error}
                  </div>
                )}

                {/* Domain Pill Checkboxes */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                  {DOMAIN_METADATA.map((domain) => {
                    const isActive = activeDomains.includes(domain.id);

                    return (
                      <button
                        key={domain.id}
                        type="button"
                        onClick={() => handleDomainToggle(patient.id, domain.id)}
                        aria-pressed={isActive}
                        aria-label={`Toggle ${domain.label} for ${patient.name}`}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[64px] ${
                          isActive
                            ? 'bg-teal-50/80 border-teal-300/80 text-teal-950 shadow-xs'
                            : 'bg-slate-50/60 border-slate-200 text-slate-400 hover:bg-slate-100 opacity-60'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-base">{domain.icon}</span>
                          <span
                            className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold border transition ${
                              isActive
                                ? 'bg-teal-600 border-teal-600 text-white'
                                : 'bg-white border-slate-300 text-transparent'
                            }`}
                          >
                            ✓
                          </span>
                        </div>
                        <div>
                          <p className="text-xs font-bold leading-tight">{domain.label}</p>
                          <p className="text-[10px] opacity-75 truncate">{domain.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
