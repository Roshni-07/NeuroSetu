import React, { useState, useEffect, useMemo } from 'react';
import { NER_STATES, NER_OCCUPATIONS, NER_SEX_OPTIONS, formatOccupationDisplay, formatSexDisplay, resolveDementiaStage, formatDementiaStageDisplay } from '../../data/reminiscenceContent.js';
import { SUPPORTED_LANGUAGES } from '../../data/multilingualAudioHelp.js';
import { PRESET_PATIENTS } from '../../data/presetPatients.js';
import { DEFAULT_PROFILE, saveProfile } from '../../db/indexedDb.js';

// Canonical triage roster is sourced from PRESET_PATIENTS plus the preserved real default Bhaben Kalita profile.
const SAMPLE_ASHA_PATIENTS = [
  ...PRESET_PATIENTS.map((patient, index) => ({
    ...patient,
    age: Number(patient.age),
    sex: patient.sex || 'male',
    dementia_stage: resolveDementiaStage(patient),
    homeState: patient.homeState || 'Assam',
    villageTown: patient.villageTown || 'Unknown',
    village: `${patient.villageTown || 'Unknown'}, ${patient.homeState || 'Assam'}`,
    language: patient.language === 'en' ? 'English' : patient.language,
    languageCode: patient.language || 'en',
    formerOccupation: 'farmer',
    former_occupation: 'farmer',
    condition: patient.stage || 'Stable',
    activeAlerts: 0,
    avgLatencyMs: 4200 + index * 1000,
    sessionsCompleted: 0,
    lastActive: 'Today',
    status: index === 0 ? 'critical' : index === 1 ? 'attention' : 'stable',
    starting_difficulty_tier: patient.starting_difficulty_tier || 1,
    alertReason: '',
    isActive: patient.isActive !== false,
    familyMembers: []
  })),
  {
    ...DEFAULT_PROFILE,
    id: 'default_patient',
    name: 'Bhaben Kalita',
    age: DEFAULT_PROFILE.age,
    sex: DEFAULT_PROFILE.sex || 'male',
    dementia_stage: resolveDementiaStage(DEFAULT_PROFILE),
    homeState: DEFAULT_PROFILE.homeState,
    villageTown: DEFAULT_PROFILE.villageTown,
    village: `${DEFAULT_PROFILE.villageTown}, ${DEFAULT_PROFILE.homeState}`,
    language: DEFAULT_PROFILE.language === 'en' ? 'English' : DEFAULT_PROFILE.language,
    languageCode: DEFAULT_PROFILE.language || 'en',
    formerOccupation: DEFAULT_PROFILE.formerOccupation,
    former_occupation: DEFAULT_PROFILE.formerOccupation,
    condition: DEFAULT_PROFILE.stage || 'Mild / Early Stage',
    activeAlerts: 0,
    avgLatencyMs: 4200,
    sessionsCompleted: 0,
    lastActive: 'Today',
    status: 'stable',
    starting_difficulty_tier: DEFAULT_PROFILE.starting_difficulty_tier || 1,
    alertReason: '',
    isActive: true,
    familyMembers: DEFAULT_PROFILE.familyMembers || []
  }
];

const DEFAULT_FORM_DATA = {
  name: '',
  age: '',
  sex: '',
  home_state: '',
  village_town: '',
  language: '',
  former_occupation: '',
  other_occupation: '',
  familyMembers: [{ name: '', relationship: '' }]
};

export default function PatientTriageList({
  patients = SAMPLE_ASHA_PATIENTS,
  selectedPatientId = 'patient_001',
  onSelectPatient = null,
  isLoading = false
}) {
  const [filter, setFilter] = useState('all'); // 'all' | 'critical' | 'stable'
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default'); // 'default' | 'age_asc' | 'age_desc' | 'region_asc' | 'language_asc'
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'add' | 'edit' | 'archive_confirm'

  // Internal patient state backed by localStorage / initial props
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
      dementia_stage: p.dementia_stage || resolveDementiaStage(p),
      isActive: p.isActive !== false
    }));
  });

  // Sync when custom patients prop is provided from tests or external props
  useEffect(() => {
    if (patients && patients !== SAMPLE_ASHA_PATIENTS) {
      setPatientList(patients.map((p, index) => ({
        ...p,
        age: Number(p.age),
        sex: p.sex || 'male',
        dementia_stage: p.dementia_stage || resolveDementiaStage(p),
        homeState: p.homeState || 'Assam',
        villageTown: p.villageTown || 'Unknown',
        village: p.village || `${p.villageTown || 'Unknown'}, ${p.homeState || 'Assam'}`,
        language: p.language === 'en' ? 'English' : p.language,
        languageCode: p.languageCode || p.language || 'en',
        formerOccupation: p.formerOccupation || p.former_occupation || '',
        former_occupation: p.formerOccupation || p.former_occupation || '',
        condition: p.condition || p.stage || 'Stable',
        status: p.status || (index === 0 ? 'critical' : index === 1 ? 'attention' : 'stable'),
        starting_difficulty_tier: p.starting_difficulty_tier || 1,
        isActive: p.isActive !== false,
        familyMembers: p.familyMembers || []
      })));
    }
  }, [patients]);

  // Persist patient list updates to local storage
  useEffect(() => {
    try {
      localStorage.setItem('neurosetu_asha_triage_patients', JSON.stringify(patientList));
    } catch (e) {}
  }, [patientList]);

  // Form State
  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
  const [formErrors, setFormErrors] = useState({});
  const [editingPatientId, setEditingPatientId] = useState(null);

  // Archive State
  const [archivingPatient, setArchivingPatient] = useState(null);
  const [archiveReason, setArchiveReason] = useState('');
  const [archiveError, setArchiveError] = useState('');
  const [isArchivedSectionOpen, setIsArchivedSectionOpen] = useState(false);

  // Toast State
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3500);
  };

  // Active vs. Archived Segregation
  const activePatients = useMemo(() => {
    return patientList.filter(p => p.isActive !== false);
  }, [patientList]);

  const archivedPatients = useMemo(() => {
    return patientList.filter(p => p.isActive === false);
  }, [patientList]);

  // Active counters
  const criticalCount = useMemo(() => {
    return activePatients.filter(p => p.status === 'critical' || p.status === 'attention').length;
  }, [activePatients]);

  const stableCount = useMemo(() => {
    return activePatients.filter(p => p.status === 'stable').length;
  }, [activePatients]);

  // Filter, Search & Sort against active patients only
  const filteredPatients = useMemo(() => {
    const list = activePatients.filter((patient) => {
      const matchesFilter =
        filter === 'all' ||
        (filter === 'critical' && (patient.status === 'critical' || patient.status === 'attention')) ||
        (filter === 'stable' && patient.status === 'stable');

      const matchesSearch =
        !searchQuery.trim() ||
        patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (patient.village && patient.village.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (patient.villageTown && patient.villageTown.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (patient.homeState && patient.homeState.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesFilter && matchesSearch;
    });

    if (sortBy === 'default') {
      return list;
    }

    return [...list].sort((a, b) => {
      if (sortBy === 'age_asc') {
        return (Number(a.age) || 0) - (Number(b.age) || 0);
      }
      if (sortBy === 'age_desc') {
        return (Number(b.age) || 0) - (Number(a.age) || 0);
      }
      if (sortBy === 'region_asc') {
        const stateA = (a.homeState || a.home_state || a.village || '').trim().toLowerCase();
        const stateB = (b.homeState || b.home_state || b.village || '').trim().toLowerCase();
        return stateA.localeCompare(stateB);
      }
      if (sortBy === 'language_asc') {
        const langA = (a.language || a.languageCode || '').trim().toLowerCase();
        const langB = (b.language || b.languageCode || '').trim().toLowerCase();
        return langA.localeCompare(langB);
      }
      if (sortBy === 'sex') {
        const sexA = (a.sex || '').trim().toLowerCase();
        const sexB = (b.sex || '').trim().toLowerCase();
        return sexA.localeCompare(sexB);
      }
      if (sortBy === 'dementia_stage') {
        const weightMap = { mild: 1, moderate: 2, severe: 3 };
        const wA = weightMap[a.dementia_stage] || 0;
        const wB = weightMap[b.dementia_stage] || 0;
        return wA - wB;
      }
      return 0;
    });
  }, [activePatients, filter, searchQuery, sortBy]);

  // Form Handlers
  const handleOpenAdd = () => {
    setFormData(DEFAULT_FORM_DATA);
    setFormErrors({});
    setViewMode('add');
  };

  const handleOpenEdit = (patient) => {
    setEditingPatientId(patient.id);
    const occ = patient.formerOccupation || patient.former_occupation || '';
    const isStandardOcc = NER_OCCUPATIONS.some(o => o.id === occ && o.id !== 'other');
    const resolvedOcc = isStandardOcc ? occ : (occ ? 'other' : '');
    const resolvedOther = patient.otherOccupation || patient.other_occupation || (!isStandardOcc ? occ : '');

    setFormData({
      name: patient.name || '',
      age: patient.age ? String(patient.age) : '',
      sex: patient.sex || '',
      home_state: patient.homeState || patient.home_state || '',
      village_town: patient.villageTown || (patient.village ? patient.village.split(',')[0].trim() : ''),
      language: patient.languageCode || (SUPPORTED_LANGUAGES.find(l => l.nativeName === patient.language || l.label === patient.language)?.code) || '',
      former_occupation: resolvedOcc,
      other_occupation: resolvedOther,
      familyMembers: patient.familyMembers && patient.familyMembers.length > 0
        ? patient.familyMembers
        : [{ name: '', relationship: '' }]
    });
    setFormErrors({});
    setViewMode('edit');
  };

  const handleCancelForm = () => {
    setFormData(DEFAULT_FORM_DATA);
    setFormErrors({});
    setEditingPatientId(null);
    setViewMode('list');
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Please enter patient name';
    }
    if (!formData.age || isNaN(Number(formData.age)) || Number(formData.age) <= 0) {
      errors.age = 'Please enter a valid age';
    }
    if (!formData.sex) {
      errors.sex = 'Please select a sex';
    }
    if (!formData.home_state) {
      errors.home_state = 'Please select a state';
    }
    if (!formData.village_town.trim()) {
      errors.village_town = 'Please enter village or town';
    }
    if (!formData.language) {
      errors.language = 'Please select a language';
    }
    if (!formData.former_occupation) {
      errors.former_occupation = 'Please select former occupation';
    } else if (formData.former_occupation === 'other' && !formData.other_occupation.trim()) {
      errors.other_occupation = 'Please specify occupation';
    }
    return errors;
  };

  const handleSubmitAdd = (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const langObj = SUPPORTED_LANGUAGES.find(l => l.code === formData.language);
    const resolvedOcc = formData.former_occupation === 'other'
      ? (formData.other_occupation.trim() || 'other')
      : formData.former_occupation;

    const newPatient = {
      id: `patient_${Date.now()}`,
      name: formData.name.trim(),
      age: Number(formData.age),
      sex: formData.sex,
      homeState: formData.home_state,
      villageTown: formData.village_town.trim(),
      village: `${formData.village_town.trim()}, ${formData.home_state}`,
      language: langObj ? `${langObj.label} (${langObj.nativeName})` : formData.language,
      languageCode: formData.language,
      formerOccupation: resolvedOcc,
      former_occupation: resolvedOcc,
      otherOccupation: formData.former_occupation === 'other' ? formData.other_occupation.trim() : '',
      other_occupation: formData.former_occupation === 'other' ? formData.other_occupation.trim() : '',
      familyMembers: formData.familyMembers.filter(m => m.name.trim()),
      condition: 'Newly Registered',
      activeAlerts: 0,
      avgLatencyMs: 0,
      sessionsCompleted: 0,
      lastActive: 'Just registered',
      status: 'stable',
      starting_difficulty_tier: 1,
      dementia_stage: 'mild',
      isActive: true,
      alertReason: ''
    };

    setPatientList(prev => [newPatient, ...prev]);

    // Save profile locally in IndexedDB
    try {
      saveProfile({
        id: newPatient.id,
        name: newPatient.name,
        homeState: newPatient.homeState,
        villageTown: newPatient.villageTown,
        age: newPatient.age,
        sex: newPatient.sex,
        language: newPatient.languageCode,
        formerOccupation: newPatient.formerOccupation,
        otherOccupation: newPatient.otherOccupation,
        familyMembers: newPatient.familyMembers,
        starting_difficulty_tier: 1
      });
    } catch (err) {}

    showToast(`Patient ${newPatient.name} added successfully`);
    if (onSelectPatient) {
      onSelectPatient(newPatient.id);
    }
    handleCancelForm();
  };

  const handleSubmitEdit = (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const langObj = SUPPORTED_LANGUAGES.find(l => l.code === formData.language);
    const resolvedOcc = formData.former_occupation === 'other'
      ? (formData.other_occupation.trim() || 'other')
      : formData.former_occupation;

    const updatedFields = {
      name: formData.name.trim(),
      age: Number(formData.age),
      sex: formData.sex,
      homeState: formData.home_state,
      villageTown: formData.village_town.trim(),
      village: `${formData.village_town.trim()}, ${formData.home_state}`,
      language: langObj ? `${langObj.label} (${langObj.nativeName})` : formData.language,
      languageCode: formData.language,
      formerOccupation: resolvedOcc,
      former_occupation: resolvedOcc,
      otherOccupation: formData.former_occupation === 'other' ? formData.other_occupation.trim() : '',
      other_occupation: formData.former_occupation === 'other' ? formData.other_occupation.trim() : '',
      familyMembers: formData.familyMembers.filter(m => m.name.trim())
    };

    setPatientList(prev => prev.map(p => (p.id === editingPatientId ? { ...p, ...updatedFields } : p)));

    try {
      saveProfile({
        id: editingPatientId,
        ...updatedFields
      });
    } catch (err) {}

    showToast(`Patient ${updatedFields.name} updated successfully`);
    handleCancelForm();
  };

  // Archive Handlers
  const handleOpenArchive = (patient) => {
    setArchivingPatient(patient);
    setArchiveReason('');
    setArchiveError('');
    setViewMode('archive_confirm');
  };

  const handleCancelArchive = () => {
    setArchivingPatient(null);
    setArchiveReason('');
    setArchiveError('');
    setViewMode('list');
  };

  const handleConfirmArchive = () => {
    if (archiveReason.trim().length < 10) {
      setArchiveError('Reason must be at least 10 characters.');
      return;
    }

    const targetPatient = archivingPatient;
    setPatientList(prev =>
      prev.map(p =>
        p.id === targetPatient.id
          ? {
              ...p,
              isActive: false,
              archiveReason: archiveReason.trim(),
              archivedAt: new Date().toLocaleDateString()
            }
          : p
      )
    );

    showToast(`Patient ${targetPatient.name} archived successfully`);

    // If currently selected patient was archived, reselect the first active patient
    if (selectedPatientId === targetPatient.id) {
      const nextActive = activePatients.filter(p => p.id !== targetPatient.id);
      if (nextActive.length > 0 && onSelectPatient) {
        onSelectPatient(nextActive[0].id);
      }
    }

    handleCancelArchive();
  };

  const handleUnarchive = (patientId) => {
    const target = patientList.find(p => p.id === patientId);
    setPatientList(prev =>
      prev.map(p =>
        p.id === patientId
          ? {
              ...p,
              isActive: true
            }
          : p
      )
    );
    showToast(`Patient ${target ? target.name : ''} unarchived successfully`);
  };

  // Persistent Prototype Banner Component
  const renderPrototypeBanner = () => (
    <div
      data-testid="prototype-banner"
      className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs font-semibold text-amber-900 flex items-center gap-2 shadow-xs"
    >
      <span role="img" aria-label="Prototype Notice" className="text-base">⚠️</span>
      <span>Prototype — not yet connected to shared patient records. Pending backend review.</span>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft p-6 space-y-5">
      {/* Ephemeral Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          data-testid="crud-toast"
          className="fixed bottom-6 right-6 z-50 p-4 bg-slate-900 text-white rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-fade-in"
        >
          <span className="text-base text-teal-400">✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* SURFACE 1: ADD PATIENT FORM */}
      {viewMode === 'add' && (
        <div className="space-y-5 text-left animate-fade-in" data-testid="add-patient-surface">
          {renderPrototypeBanner()}

          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Add New Patient</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Register a new household resident into local ASHA clinical telemetry.
              </p>
            </div>
            {/* GrandmasShoppingList back-button pattern */}
            <button
              type="button"
              onClick={handleCancelForm}
              className="inline-flex items-center gap-2 px-4 py-2 min-h-[48px] bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 hover:text-slate-900 border border-slate-300 rounded-xl text-sm font-bold shadow-xs transition cursor-pointer"
              aria-label="Back to patient list"
            >
              <span className="text-lg leading-none">←</span>
              <span>Cancel</span>
            </button>
          </div>

          <form onSubmit={handleSubmitAdd} className="space-y-4">
            <div>
              <label htmlFor="patient-name" className="text-xs font-bold text-slate-800 block mb-1">
                Patient Name *
              </label>
              <input
                id="patient-name"
                type="text"
                value={formData.name}
                onChange={e => {
                  setFormData({ ...formData, name: e.target.value });
                  if (formErrors.name) setFormErrors(prev => ({ ...prev, name: '' }));
                }}
                placeholder="e.g. Bhaben Kalita"
                className={`w-full min-h-[44px] px-3.5 py-2 bg-slate-50 border rounded-xl text-xs font-semibold text-slate-900 focus-visible:outline-none transition ${
                  formErrors.name ? 'border-rose-400 bg-rose-50/40' : 'border-slate-200 focus:border-teal-600 focus:bg-white'
                }`}
              />
              {formErrors.name && (
                <p className="text-xs text-rose-600 font-semibold mt-1">⚠️ {formErrors.name}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="patient-age" className="text-xs font-bold text-slate-800 block mb-1">
                  Age (Years) *
                </label>
                <input
                  id="patient-age"
                  type="number"
                  min="1"
                  max="120"
                  value={formData.age}
                  onChange={e => {
                    setFormData({ ...formData, age: e.target.value });
                    if (formErrors.age) setFormErrors(prev => ({ ...prev, age: '' }));
                  }}
                  placeholder="e.g. 72"
                  className={`w-full min-h-[44px] px-3.5 py-2 bg-slate-50 border rounded-xl text-xs font-semibold text-slate-900 focus-visible:outline-none transition ${
                    formErrors.age ? 'border-rose-400 bg-rose-50/40' : 'border-slate-200 focus:border-teal-600 focus:bg-white'
                  }`}
                />
                {formErrors.age && (
                  <p className="text-xs text-rose-600 font-semibold mt-1">⚠️ {formErrors.age}</p>
                )}
              </div>

              <div>
                <label htmlFor="patient-home-state" className="text-xs font-bold text-slate-800 block mb-1">
                  NER State *
                </label>
                <select
                  id="patient-home-state"
                  value={formData.home_state}
                  onChange={e => {
                    setFormData({ ...formData, home_state: e.target.value });
                    if (formErrors.home_state) setFormErrors(prev => ({ ...prev, home_state: '' }));
                  }}
                  className={`w-full min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-900 focus-visible:outline-none cursor-pointer ${
                    formErrors.home_state ? 'border-rose-400 bg-rose-50/40 border' : 'bg-slate-50 border border-slate-200 focus:border-teal-600 focus:bg-white'
                  }`}
                >
                  <option value="">Select State...</option>
                  {Object.values(NER_STATES).map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
                {formErrors.home_state && (
                  <p className="text-xs text-rose-600 font-semibold mt-1">⚠️ {formErrors.home_state}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="patient-sex" className="text-xs font-bold text-slate-800 block mb-1">
                  Sex *
                </label>
                <select
                  id="patient-sex"
                  value={formData.sex}
                  onChange={e => {
                    setFormData({ ...formData, sex: e.target.value });
                    if (formErrors.sex) setFormErrors(prev => ({ ...prev, sex: '' }));
                  }}
                  className={`w-full min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-900 focus-visible:outline-none cursor-pointer ${
                    formErrors.sex ? 'border-rose-400 bg-rose-50/40 border' : 'bg-slate-50 border border-slate-200 focus:border-teal-600 focus:bg-white'
                  }`}
                >
                  <option value="">Select Sex...</option>
                  {NER_SEX_OPTIONS.map(sexOpt => (
                    <option key={sexOpt.id} value={sexOpt.id}>
                      {sexOpt.icon} {sexOpt.label}
                    </option>
                  ))}
                </select>
                {formErrors.sex && (
                  <p className="text-xs text-rose-600 font-semibold mt-1">⚠️ {formErrors.sex}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="patient-village-town" className="text-xs font-bold text-slate-800 block mb-1">
                  Village / Town *
                </label>
                <input
                  id="patient-village-town"
                  type="text"
                  value={formData.village_town}
                  onChange={e => {
                    setFormData({ ...formData, village_town: e.target.value });
                    if (formErrors.village_town) setFormErrors(prev => ({ ...prev, village_town: '' }));
                  }}
                  placeholder="e.g. Hajo / Reiek"
                  className={`w-full min-h-[44px] px-3.5 py-2 bg-slate-50 border rounded-xl text-xs font-semibold text-slate-900 focus-visible:outline-none transition ${
                    formErrors.village_town ? 'border-rose-400 bg-rose-50/40' : 'border-slate-200 focus:border-teal-600 focus:bg-white'
                  }`}
                />
                {formErrors.village_town && (
                  <p className="text-xs text-rose-600 font-semibold mt-1">⚠️ {formErrors.village_town}</p>
                )}
              </div>

              <div>
                <label htmlFor="patient-language" className="text-xs font-bold text-slate-800 block mb-1">
                  Language *
                </label>
                <select
                  id="patient-language"
                  value={formData.language}
                  onChange={e => {
                    setFormData({ ...formData, language: e.target.value });
                    if (formErrors.language) setFormErrors(prev => ({ ...prev, language: '' }));
                  }}
                  className={`w-full min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-900 focus-visible:outline-none cursor-pointer ${
                    formErrors.language ? 'border-rose-400 bg-rose-50/40 border' : 'bg-slate-50 border border-slate-200 focus:border-teal-600 focus:bg-white'
                  }`}
                >
                  <option value="">Select Language...</option>
                  {SUPPORTED_LANGUAGES.map(lang => (
                    <option key={lang.code} value={lang.code}>
                      {lang.icon} {lang.nativeName} ({lang.label})
                    </option>
                  ))}
                </select>
                {formErrors.language && (
                  <p className="text-xs text-rose-600 font-semibold mt-1">⚠️ {formErrors.language}</p>
                )}
              </div>
            </div>

            {/* Former Occupation & Conditional Other Input */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="patient-former-occupation" className="text-xs font-bold text-slate-800 block mb-1">
                  Former Occupation *
                </label>
                <select
                  id="patient-former-occupation"
                  value={formData.former_occupation}
                  onChange={e => {
                    setFormData({ ...formData, former_occupation: e.target.value });
                    if (formErrors.former_occupation) setFormErrors(prev => ({ ...prev, former_occupation: '' }));
                  }}
                  className={`w-full min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-900 focus-visible:outline-none cursor-pointer ${
                    formErrors.former_occupation ? 'border-rose-400 bg-rose-50/40 border' : 'bg-slate-50 border border-slate-200 focus:border-teal-600 focus:bg-white'
                  }`}
                >
                  <option value="">Select Occupation...</option>
                  {NER_OCCUPATIONS.map(occ => (
                    <option key={occ.id} value={occ.id}>
                      {occ.icon} {occ.label}
                    </option>
                  ))}
                </select>
                {formErrors.former_occupation && (
                  <p className="text-xs text-rose-600 font-semibold mt-1">⚠️ {formErrors.former_occupation}</p>
                )}
              </div>

              {formData.former_occupation === 'other' ? (
                <div>
                  <label htmlFor="patient-other-occupation" className="text-xs font-bold text-slate-800 block mb-1">
                    Specify Occupation *
                  </label>
                  {/* NOTE: Stored locally in profile (formerOccupation + otherOccupation). Will map to future other_occupation column when backend migration lands. */}
                  <input
                    id="patient-other-occupation"
                    data-testid="patient-other-occupation-input"
                    type="text"
                    value={formData.other_occupation}
                    onChange={e => {
                      setFormData({ ...formData, other_occupation: e.target.value });
                      if (formErrors.other_occupation) setFormErrors(prev => ({ ...prev, other_occupation: '' }));
                    }}
                    placeholder="e.g. Traditional herbalist, carpenter..."
                    className={`w-full min-h-[44px] px-3.5 py-2 bg-slate-50 border rounded-xl text-xs font-semibold text-slate-900 focus-visible:outline-none transition ${
                      formErrors.other_occupation ? 'border-rose-400 bg-rose-50/40' : 'border-slate-200 focus:border-teal-600 focus:bg-white'
                    }`}
                  />
                  {formErrors.other_occupation && (
                    <p className="text-xs text-rose-600 font-semibold mt-1">⚠️ {formErrors.other_occupation}</p>
                  )}
                </div>
              ) : (
                <div />
              )}
            </div>

            {/* Repeatable Family Members */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-800">
                  Family Members & Caregivers
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      familyMembers: [...prev.familyMembers, { name: '', relationship: '' }]
                    }));
                  }}
                  className="text-xs font-bold text-teal-700 hover:text-teal-800 transition flex items-center gap-1 cursor-pointer"
                >
                  <span>＋</span>
                  <span>Add Family Member</span>
                </button>
              </div>

              <div className="space-y-2">
                {formData.familyMembers.map((member, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Family member name (e.g. Rumi)"
                      value={member.name}
                      onChange={e => {
                        const updated = [...formData.familyMembers];
                        updated[idx] = { ...updated[idx], name: e.target.value };
                        setFormData({ ...formData, familyMembers: updated });
                      }}
                      className="flex-1 min-h-[44px] px-3.5 py-2 bg-slate-50 border border-slate-200 focus:border-teal-600 focus:bg-white rounded-xl text-xs font-semibold text-slate-900 focus-visible:outline-none"
                    />
                    <select
                      value={member.relationship}
                      onChange={e => {
                        const updated = [...formData.familyMembers];
                        updated[idx] = { ...updated[idx], relationship: e.target.value };
                        setFormData({ ...formData, familyMembers: updated });
                      }}
                      className="w-36 min-h-[44px] px-2.5 py-2 bg-slate-50 border border-slate-200 focus:border-teal-600 focus:bg-white rounded-xl text-xs font-semibold text-slate-900 focus-visible:outline-none cursor-pointer"
                    >
                      <option value="">Select Relationship...</option>
                      <option value="daughter">Daughter</option>
                      <option value="son">Son</option>
                      <option value="spouse">Spouse</option>
                      <option value="grandchild">Grandchild</option>
                      <option value="sibling">Sibling</option>
                      <option value="other">Other</option>
                    </select>
                    {formData.familyMembers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            familyMembers: prev.familyMembers.filter((_, i) => i !== idx)
                          }));
                        }}
                        className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 flex items-center justify-center text-sm font-bold transition cursor-pointer"
                        aria-label={`Remove family member ${idx + 1}`}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Form Submit & Cancel Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleCancelForm}
                className="inline-flex items-center gap-2 px-4 py-2 min-h-[48px] bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 hover:text-slate-900 border border-slate-300 rounded-xl text-sm font-bold shadow-xs transition cursor-pointer"
                aria-label="Cancel adding patient"
              >
                <span className="text-lg leading-none">←</span>
                <span>Cancel</span>
              </button>

              <button
                type="submit"
                className="min-h-[48px] px-6 py-2.5 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold rounded-xl text-xs shadow-soft transition active:scale-95 cursor-pointer"
              >
                ✓ Add Patient
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SURFACE 2: EDIT PATIENT FORM */}
      {viewMode === 'edit' && (
        <div className="space-y-5 text-left animate-fade-in" data-testid="edit-patient-surface">
          {renderPrototypeBanner()}

          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Edit Patient Profile</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Update household resident details stored on this local device.
              </p>
            </div>
            {/* GrandmasShoppingList back-button pattern */}
            <button
              type="button"
              onClick={handleCancelForm}
              className="inline-flex items-center gap-2 px-4 py-2 min-h-[48px] bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 hover:text-slate-900 border border-slate-300 rounded-xl text-sm font-bold shadow-xs transition cursor-pointer"
              aria-label="Back to patient list"
            >
              <span className="text-lg leading-none">←</span>
              <span>Cancel</span>
            </button>
          </div>

          <form onSubmit={handleSubmitEdit} className="space-y-4">
            <div>
              <label htmlFor="edit-patient-name" className="text-xs font-bold text-slate-800 block mb-1">
                Patient Name *
              </label>
              <input
                id="edit-patient-name"
                type="text"
                value={formData.name}
                onChange={e => {
                  setFormData({ ...formData, name: e.target.value });
                  if (formErrors.name) setFormErrors(prev => ({ ...prev, name: '' }));
                }}
                placeholder="e.g. Bhaben Kalita"
                className={`w-full min-h-[44px] px-3.5 py-2 bg-slate-50 border rounded-xl text-xs font-semibold text-slate-900 focus-visible:outline-none transition ${
                  formErrors.name ? 'border-rose-400 bg-rose-50/40' : 'border-slate-200 focus:border-teal-600 focus:bg-white'
                }`}
              />
              {formErrors.name && (
                <p className="text-xs text-rose-600 font-semibold mt-1">⚠️ {formErrors.name}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="edit-patient-age" className="text-xs font-bold text-slate-800 block mb-1">
                  Age (Years) *
                </label>
                <input
                  id="edit-patient-age"
                  type="number"
                  min="1"
                  max="120"
                  value={formData.age}
                  onChange={e => {
                    setFormData({ ...formData, age: e.target.value });
                    if (formErrors.age) setFormErrors(prev => ({ ...prev, age: '' }));
                  }}
                  placeholder="e.g. 72"
                  className={`w-full min-h-[44px] px-3.5 py-2 bg-slate-50 border rounded-xl text-xs font-semibold text-slate-900 focus-visible:outline-none transition ${
                    formErrors.age ? 'border-rose-400 bg-rose-50/40' : 'border-slate-200 focus:border-teal-600 focus:bg-white'
                  }`}
                />
                {formErrors.age && (
                  <p className="text-xs text-rose-600 font-semibold mt-1">⚠️ {formErrors.age}</p>
                )}
              </div>

              <div>
                <label htmlFor="edit-patient-home-state" className="text-xs font-bold text-slate-800 block mb-1">
                  NER State *
                </label>
                <select
                  id="edit-patient-home-state"
                  value={formData.home_state}
                  onChange={e => {
                    setFormData({ ...formData, home_state: e.target.value });
                    if (formErrors.home_state) setFormErrors(prev => ({ ...prev, home_state: '' }));
                  }}
                  className={`w-full min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-900 focus-visible:outline-none cursor-pointer ${
                    formErrors.home_state ? 'border-rose-400 bg-rose-50/40 border' : 'bg-slate-50 border border-slate-200 focus:border-teal-600 focus:bg-white'
                  }`}
                >
                  <option value="">Select State...</option>
                  {Object.values(NER_STATES).map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
                {formErrors.home_state && (
                  <p className="text-xs text-rose-600 font-semibold mt-1">⚠️ {formErrors.home_state}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="edit-patient-sex" className="text-xs font-bold text-slate-800 block mb-1">
                  Sex *
                </label>
                <select
                  id="edit-patient-sex"
                  value={formData.sex}
                  onChange={e => {
                    setFormData({ ...formData, sex: e.target.value });
                    if (formErrors.sex) setFormErrors(prev => ({ ...prev, sex: '' }));
                  }}
                  className={`w-full min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-900 focus-visible:outline-none cursor-pointer ${
                    formErrors.sex ? 'border-rose-400 bg-rose-50/40 border' : 'bg-slate-50 border border-slate-200 focus:border-teal-600 focus:bg-white'
                  }`}
                >
                  <option value="">Select Sex...</option>
                  {NER_SEX_OPTIONS.map(sexOpt => (
                    <option key={sexOpt.id} value={sexOpt.id}>
                      {sexOpt.icon} {sexOpt.label}
                    </option>
                  ))}
                </select>
                {formErrors.sex && (
                  <p className="text-xs text-rose-600 font-semibold mt-1">⚠️ {formErrors.sex}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="edit-patient-village-town" className="text-xs font-bold text-slate-800 block mb-1">
                  Village / Town *
                </label>
                <input
                  id="edit-patient-village-town"
                  type="text"
                  value={formData.village_town}
                  onChange={e => {
                    setFormData({ ...formData, village_town: e.target.value });
                    if (formErrors.village_town) setFormErrors(prev => ({ ...prev, village_town: '' }));
                  }}
                  placeholder="e.g. Hajo / Reiek"
                  className={`w-full min-h-[44px] px-3.5 py-2 bg-slate-50 border rounded-xl text-xs font-semibold text-slate-900 focus-visible:outline-none transition ${
                    formErrors.village_town ? 'border-rose-400 bg-rose-50/40' : 'border-slate-200 focus:border-teal-600 focus:bg-white'
                  }`}
                />
                {formErrors.village_town && (
                  <p className="text-xs text-rose-600 font-semibold mt-1">⚠️ {formErrors.village_town}</p>
                )}
              </div>

              <div>
                <label htmlFor="edit-patient-language" className="text-xs font-bold text-slate-800 block mb-1">
                  Language *
                </label>
                <select
                  id="edit-patient-language"
                  value={formData.language}
                  onChange={e => {
                    setFormData({ ...formData, language: e.target.value });
                    if (formErrors.language) setFormErrors(prev => ({ ...prev, language: '' }));
                  }}
                  className={`w-full min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-900 focus-visible:outline-none cursor-pointer ${
                    formErrors.language ? 'border-rose-400 bg-rose-50/40 border' : 'bg-slate-50 border border-slate-200 focus:border-teal-600 focus:bg-white'
                  }`}
                >
                  <option value="">Select Language...</option>
                  {SUPPORTED_LANGUAGES.map(lang => (
                    <option key={lang.code} value={lang.code}>
                      {lang.icon} {lang.nativeName} ({lang.label})
                    </option>
                  ))}
                </select>
                {formErrors.language && (
                  <p className="text-xs text-rose-600 font-semibold mt-1">⚠️ {formErrors.language}</p>
                )}
              </div>
            </div>

            {/* Former Occupation & Conditional Other Input */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="edit-patient-former-occupation" className="text-xs font-bold text-slate-800 block mb-1">
                  Former Occupation *
                </label>
                <select
                  id="edit-patient-former-occupation"
                  value={formData.former_occupation}
                  onChange={e => {
                    setFormData({ ...formData, former_occupation: e.target.value });
                    if (formErrors.former_occupation) setFormErrors(prev => ({ ...prev, former_occupation: '' }));
                  }}
                  className={`w-full min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-900 focus-visible:outline-none cursor-pointer ${
                    formErrors.former_occupation ? 'border-rose-400 bg-rose-50/40 border' : 'bg-slate-50 border border-slate-200 focus:border-teal-600 focus:bg-white'
                  }`}
                >
                  <option value="">Select Occupation...</option>
                  {NER_OCCUPATIONS.map(occ => (
                    <option key={occ.id} value={occ.id}>
                      {occ.icon} {occ.label}
                    </option>
                  ))}
                </select>
                {formErrors.former_occupation && (
                  <p className="text-xs text-rose-600 font-semibold mt-1">⚠️ {formErrors.former_occupation}</p>
                )}
              </div>

              {formData.former_occupation === 'other' ? (
                <div>
                  <label htmlFor="edit-patient-other-occupation" className="text-xs font-bold text-slate-800 block mb-1">
                    Specify Occupation *
                  </label>
                  {/* NOTE: Stored locally in profile (formerOccupation + otherOccupation). Will map to future other_occupation column when backend migration lands. */}
                  <input
                    id="edit-patient-other-occupation"
                    data-testid="edit-patient-other-occupation-input"
                    type="text"
                    value={formData.other_occupation}
                    onChange={e => {
                      setFormData({ ...formData, other_occupation: e.target.value });
                      if (formErrors.other_occupation) setFormErrors(prev => ({ ...prev, other_occupation: '' }));
                    }}
                    placeholder="e.g. Traditional herbalist, carpenter..."
                    className={`w-full min-h-[44px] px-3.5 py-2 bg-slate-50 border rounded-xl text-xs font-semibold text-slate-900 focus-visible:outline-none transition ${
                      formErrors.other_occupation ? 'border-rose-400 bg-rose-50/40' : 'border-slate-200 focus:border-teal-600 focus:bg-white'
                    }`}
                  />
                  {formErrors.other_occupation && (
                    <p className="text-xs text-rose-600 font-semibold mt-1">⚠️ {formErrors.other_occupation}</p>
                  )}
                </div>
              ) : (
                <div />
              )}
            </div>

            {/* Repeatable Family Members */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-800">
                  Family Members & Caregivers
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      familyMembers: [...prev.familyMembers, { name: '', relationship: '' }]
                    }));
                  }}
                  className="text-xs font-bold text-teal-700 hover:text-teal-800 transition flex items-center gap-1 cursor-pointer"
                >
                  <span>＋</span>
                  <span>Add Family Member</span>
                </button>
              </div>

              <div className="space-y-2">
                {formData.familyMembers.map((member, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Family member name (e.g. Rumi)"
                      value={member.name}
                      onChange={e => {
                        const updated = [...formData.familyMembers];
                        updated[idx] = { ...updated[idx], name: e.target.value };
                        setFormData({ ...formData, familyMembers: updated });
                      }}
                      className="flex-1 min-h-[44px] px-3.5 py-2 bg-slate-50 border border-slate-200 focus:border-teal-600 focus:bg-white rounded-xl text-xs font-semibold text-slate-900 focus-visible:outline-none"
                    />
                    <select
                      value={member.relationship}
                      onChange={e => {
                        const updated = [...formData.familyMembers];
                        updated[idx] = { ...updated[idx], relationship: e.target.value };
                        setFormData({ ...formData, familyMembers: updated });
                      }}
                      className="w-36 min-h-[44px] px-2.5 py-2 bg-slate-50 border border-slate-200 focus:border-teal-600 focus:bg-white rounded-xl text-xs font-semibold text-slate-900 focus-visible:outline-none cursor-pointer"
                    >
                      <option value="">Select Relationship...</option>
                      <option value="daughter">Daughter</option>
                      <option value="son">Son</option>
                      <option value="spouse">Spouse</option>
                      <option value="grandchild">Grandchild</option>
                      <option value="sibling">Sibling</option>
                      <option value="other">Other</option>
                    </select>
                    {formData.familyMembers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            familyMembers: prev.familyMembers.filter((_, i) => i !== idx)
                          }));
                        }}
                        className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 flex items-center justify-center text-sm font-bold transition cursor-pointer"
                        aria-label={`Remove family member ${idx + 1}`}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Form Submit & Cancel Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleCancelForm}
                className="inline-flex items-center gap-2 px-4 py-2 min-h-[48px] bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 hover:text-slate-900 border border-slate-300 rounded-xl text-sm font-bold shadow-xs transition cursor-pointer"
                aria-label="Cancel editing patient"
              >
                <span className="text-lg leading-none">←</span>
                <span>Cancel</span>
              </button>

              <button
                type="submit"
                className="min-h-[48px] px-6 py-2.5 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold rounded-xl text-xs shadow-soft transition active:scale-95 cursor-pointer"
              >
                ✓ Update Patient
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SURFACE 3: ARCHIVE PATIENT CONFIRMATION STEP */}
      {viewMode === 'archive_confirm' && archivingPatient && (
        <div className="space-y-5 text-left animate-fade-in" data-testid="archive-patient-surface">
          {renderPrototypeBanner()}

          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-lg font-bold text-slate-900">
              Archive Patient: {archivingPatient.name}
            </h2>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Archiving will remove this patient from the active community triage list and monitoring counts.
              Archived patients remain safely stored on this device and can be recovered at any time.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <div className="text-xs font-bold text-slate-900">{archivingPatient.name} ({archivingPatient.age} yrs)</div>
            <div className="text-xs text-slate-500">📍 {archivingPatient.village}</div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="archive-reason" className="text-xs font-bold text-slate-800 block">
              Reason for Archiving (minimum 10 characters) *
            </label>
            <textarea
              id="archive-reason"
              rows={3}
              value={archiveReason}
              onChange={e => {
                setArchiveReason(e.target.value);
                if (archiveError) setArchiveError('');
              }}
              placeholder="e.g. Patient relocated with family to Guwahati (min 10 characters)..."
              className={`w-full p-3 bg-slate-50 border rounded-xl text-xs font-semibold text-slate-900 focus-visible:outline-none transition ${
                archiveError ? 'border-rose-400 bg-rose-50/40' : 'border-slate-200 focus:border-teal-600 focus:bg-white'
              }`}
            />
            <div className="flex items-center justify-between text-[11px]">
              <span className={archiveError ? 'text-rose-600 font-semibold' : 'text-slate-400'}>
                {archiveError || 'Detailed clinical or household rationale required.'}
              </span>
              <span className={`font-mono ${archiveReason.trim().length >= 10 ? 'text-teal-700 font-bold' : 'text-slate-400'}`}>
                {archiveReason.trim().length}/10 min
              </span>
            </div>
          </div>

          {/* Actions: Cancel vs Confirm Archive */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleCancelArchive}
              className="inline-flex items-center gap-2 px-4 py-2 min-h-[48px] bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 hover:text-slate-900 border border-slate-300 rounded-xl text-sm font-bold shadow-xs transition cursor-pointer"
              aria-label="Cancel archiving"
            >
              <span className="text-lg leading-none">←</span>
              <span>Cancel</span>
            </button>

            <button
              type="button"
              onClick={handleConfirmArchive}
              disabled={archiveReason.trim().length < 10}
              className="min-h-[48px] px-6 py-2.5 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl text-xs shadow-soft transition active:scale-95 cursor-pointer"
            >
              📦 Confirm Archive
            </button>
          </div>
        </div>
      )}

      {/* MAIN VIEW: ACTIVE TRIAGE LIST */}
      {viewMode === 'list' && (
        <div className="space-y-5">
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

            {/* "Add Patient" CTA Button */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleOpenAdd}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-soft transition active:scale-95 cursor-pointer"
                aria-label="Add patient"
              >
                <span>＋</span>
                <span>Add Patient</span>
              </button>
            </div>
          </div>

          {/* Filter Pills & Sort Controls — compose together */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Filter Pills — strictly reflect active patients count */}
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl text-xs font-medium border border-slate-200/60">
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  filter === 'all'
                    ? 'bg-white text-slate-900 shadow-soft font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Patients ({activePatients.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter('critical')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  filter === 'critical'
                    ? 'bg-white text-teal-800 shadow-soft font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Alerts / Decline ({criticalCount})
              </button>
              <button
                type="button"
                onClick={() => setFilter('stable')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  filter === 'stable'
                    ? 'bg-white text-emerald-800 shadow-soft font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Stable ({stableCount})
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <label htmlFor="triage-sort-select" className="text-xs font-semibold text-slate-500 whitespace-nowrap">
                Sort by:
              </label>
              <div className="relative">
                <select
                  id="triage-sort-select"
                  data-testid="triage-sort-select"
                  aria-label="Sort patients"
                  value={sortBy}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSortBy(val);
                  }}
                  className="min-h-[38px] pl-3 pr-8 py-1.5 bg-slate-50 hover:bg-white border border-slate-200 focus:border-teal-600 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 shadow-xs cursor-pointer appearance-none transition"
                >
                  <option value="default">Default</option>
                  <option value="age_asc">Age (youngest first)</option>
                  <option value="age_desc">Age (oldest first)</option>
                  <option value="region_asc">Region / home_state (alphabetical)</option>
                  <option value="language_asc">Language (alphabetical)</option>
                  <option value="sex">
                    Sex (alphabetical)
                  </option>
                  <option value="dementia_stage">
                    Dementia stage (severity)
                  </option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400 text-xs">
                  ▼
                </div>
              </div>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative">
            <svg aria-hidden="true" className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

          {/* Active Patients Card List */}
          <div className="space-y-3">
            {isLoading ? (
              <div data-testid="triage-loading" className="space-y-3 animate-pulse">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 rounded-xl border border-slate-200 bg-slate-50 h-24" />
                ))}
              </div>
            ) : filteredPatients.length === 0 ? (
              <div data-testid="triage-empty" className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-500 space-y-1.5">
                <span className="text-2xl block">👥</span>
                <p className="text-xs font-semibold text-slate-700">No patients found</p>
                <p className="text-[11px] text-slate-400">Try adjusting your search query or triage filter.</p>
              </div>
            ) : (
              filteredPatients.map((patient) => {
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
                          {patient.sex && (
                            <span className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium border border-slate-200/60">
                              {formatSexDisplay(patient)}
                            </span>
                          )}
                          <span className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium border border-slate-200/60">
                            {patient.language}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 flex-wrap">
                          <span>📍</span> {patient.village} • <span className="font-medium text-slate-700">{patient.condition}</span>
                          {(patient.formerOccupation || patient.former_occupation) && (
                            <span> • 💼 <span className="font-medium text-slate-700">{formatOccupationDisplay(patient)}</span></span>
                          )}
                          {patient.dementia_stage && (
                            <span> • 🧠 <span className="font-medium text-slate-700">{formatDementiaStageDisplay(patient)}</span></span>
                          )}
                        </p>
                      </div>

                      {/* Soft Status Triage Badge & Assigned Tier */}
                      <div className="flex items-center gap-1.5 flex-wrap justify-end">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-teal-100 text-teal-900 border border-teal-200">
                          Tier {patient.starting_difficulty_tier || (patient.status === 'critical' ? 1 : patient.status === 'attention' ? 2 : 3)}
                        </span>
                        {patient.status === 'critical' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200/80">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
                            Urgent Home Visit
                          </span>
                        ) : patient.status === 'attention' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200/80">
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-600"></span>
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
                        <span className={`font-semibold text-xs ${patient.activeAlerts > 0 ? 'text-teal-700 font-bold' : 'text-slate-800'}`}>
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

                    {/* Card Actions: Edit & Archive */}
                    <div className="flex items-center justify-end gap-2 mt-3 pt-2.5 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEdit(patient);
                        }}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-teal-700 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-teal-300 hover:bg-teal-50 transition cursor-pointer"
                        aria-label={`Edit ${patient.name}`}
                      >
                        <span>✏️</span>
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenArchive(patient);
                        }}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 hover:text-amber-800 px-3 py-1.5 rounded-lg border border-amber-200 hover:bg-amber-50 transition cursor-pointer"
                        aria-label={`Archive ${patient.name}`}
                      >
                        <span>📦</span>
                        <span>Archive</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Collapsible Archived Patients Section */}
          <div className="pt-4 border-t border-slate-200/80">
            <button
              type="button"
              onClick={() => setIsArchivedSectionOpen(!isArchivedSectionOpen)}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 transition cursor-pointer"
              aria-expanded={isArchivedSectionOpen}
              aria-label="Toggle archived patients"
            >
              <span className="flex items-center gap-2">
                <span>📦</span>
                <span>Archived Patients ({archivedPatients.length})</span>
              </span>
              <span className="text-slate-400 text-xs font-medium">
                {isArchivedSectionOpen ? '▲ Collapse' : '▼ Expand'}
              </span>
            </button>

            {isArchivedSectionOpen && (
              <div className="mt-3 space-y-3">
                {archivedPatients.length === 0 ? (
                  <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-500 border border-slate-100">
                    No archived patients.
                  </div>
                ) : (
                  archivedPatients.map((patient) => (
                    <div
                      key={patient.id}
                      data-testid={`archived-patient-${patient.id}`}
                      className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/70 text-left space-y-2"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-700 text-sm">{patient.name}</h4>
                            <span className="text-xs text-slate-400">({patient.age} yrs)</span>
                            <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded font-semibold uppercase">
                              Archived
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            📍 {patient.village}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleUnarchive(patient.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 active:bg-teal-200 text-teal-800 border border-teal-300 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                          aria-label={`Unarchive ${patient.name}`}
                        >
                          <span>↺</span>
                          <span>Unarchive Patient</span>
                        </button>
                      </div>
                      {patient.archiveReason && (
                        <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs text-slate-600">
                          <span className="font-bold text-slate-800">Archive Reason:</span> {patient.archiveReason}
                          {patient.archivedAt && (
                            <span className="text-slate-400 text-[11px] block mt-0.5">
                              Archived on: {patient.archivedAt}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
