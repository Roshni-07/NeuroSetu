import React, { useState, useEffect } from 'react';
import { synthesizeSpeech } from '../../services/bhashiniService.js';
import VoiceInputHandler from '../voice/VoiceInputHandler.jsx';

const DEFAULT_REMINDERS = {
  medicines: [
    { id: 'med_1', nameAs: 'ৰাতিপুৱাৰ ৰক্তচাপৰ দৰব (BP Medicine)', nameEn: 'Morning BP Medication', nameHi: 'सुबह की बीपी की दवाई (BP Medicine)', time: '08:00 AM', taken: false, icon: '💊' },
    { id: 'med_2', nameAs: 'দুপৰীয়াৰ ভিটামিন (Vitamins & Memory Pill)', nameEn: 'Afternoon Memory Support Tablet', nameHi: 'दोपहर की याददाश्त व विटामिन गोली', time: '01:30 PM', taken: false, icon: '💊' },
    { id: 'med_3', nameAs: 'সন্ধিয়াৰ ঔষধ (Evening Dose)', nameEn: 'Evening General Medication', nameHi: 'शाम की सामान्य दवाई (Evening Dose)', time: '08:00 PM', taken: false, icon: '💊' }
  ],
  hydration: {
    targetGlasses: 6,
    consumedGlasses: 2,
    lastTime: '10:30 AM'
  },
  activities: [
    { id: 'act_1', titleAs: 'ৰাতিপুৱা ফুলনিৰ খোজকঢ়া', titleEn: 'Morning Garden Walk & Fresh Air', titleHi: 'सुबह बगीचे में टहलना व ताज़ी हवा', time: '07:30 AM', completed: true, icon: '🌿' },
    { id: 'act_2', titleAs: 'পৰিয়ালৰ লগত বিয়লিৰ চাহ', titleEn: 'Afternoon Tea & Reminiscence Chat', titleHi: 'परिवार के साथ दोपहर की चाय व बातचीत', time: '04:30 PM', completed: false, icon: '☕' },
    { id: 'act_3', titleAs: 'সংগীত আৰু জ্ঞানীয় খেল (NeuroSetu)', titleEn: 'Bihu Folk Music & Cognitive Game Session', titleHi: 'लोक संगीत व न्यूरोसेतु खेल सत्र', time: '06:00 PM', completed: false, icon: '🎶' }
  ],
  appointments: [
    { id: 'apt_1', doctorAs: 'ডাঃ বৰুৱা (PHC স্বাস্থ্য কেন্দ্ৰ)', doctorEn: 'Dr. Baruah (Community Health Centre)', doctorHi: 'डॉ. बरुआ (प्राथमिक स्वास्थ्य केंद्र)', date: 'Thursday, 10:00 AM', purposeAs: 'সাধাৰণ স্মৃতি আৰু স্বাস্থ্য পৰীক্ষা', purposeEn: 'Routine Cognitive & BP Follow-up', purposeHi: 'सामान्य याददाश्त व स्वास्थ्य जांच', icon: '🏥' },
    { id: 'apt_2', doctorAs: 'আশা কৰ্মী ৰূপালী বাইদেউৰ আগমন', doctorEn: 'ASHA Worker Rupali Home Visit', doctorHi: 'आशा कार्यकर्ता रूपाली का गृह दौरा', date: 'Saturday, 11:30 AM', purposeAs: 'ঘৰুৱা স্বাস্থ্য বুজ লোৱা', purposeEn: 'Home Vital Signs & Telemetry Sync', purposeHi: 'घरेलू स्वास्थ्य स्थिति व जांच', icon: '🩺' }
  ]
};

export default function RemindersHub({
  patientProfile = null,
  onExit = null
}) {
  const language = patientProfile?.language || 'as';
  const isEn = language === 'en';
  const isHi = language === 'hi';

  const [activeTab, setActiveTab] = useState('medicines'); // 'medicines' | 'hydration' | 'activities' | 'appointments'
  const [reminders, setReminders] = useState(() => {
    try {
      const saved = localStorage.getItem('neurosetu_patient_reminders');
      return saved ? JSON.parse(saved) : DEFAULT_REMINDERS;
    } catch (e) {
      return DEFAULT_REMINDERS;
    }
  });

  const [voiceFeedback, setVoiceFeedback] = useState('');

  // Persist reminders to localStorage / offline cache
  useEffect(() => {
    try {
      localStorage.setItem('neurosetu_patient_reminders', JSON.stringify(reminders));
    } catch (e) {}
  }, [reminders]);

  const handleToggleMed = (id) => {
    setReminders(prev => ({
      ...prev,
      medicines: prev.medicines.map(m => {
        if (m.id === id) {
          const nextTaken = !m.taken;
          if (nextTaken) {
            let msg = '';
            if (isHi) msg = `${m.nameHi || m.nameEn} ले ली गई है।`;
            else if (isEn) msg = `Marked ${m.nameEn} as taken.`;
            else msg = `${m.nameAs} খোৱা বুলি চিহ্নিত কৰা হ’ল।`;
            synthesizeSpeech(msg, language);
            setVoiceFeedback(msg);
          }
          return { ...m, taken: nextTaken };
        }
        return m;
      })
    }));
  };

  const handleAddWater = () => {
    setReminders(prev => {
      const nextCount = Math.min(prev.hydration.targetGlasses + 2, prev.hydration.consumedGlasses + 1);
      let msg = '';
      if (isHi) msg = `शाबाश! आपने एक गिलास पानी पिया। आज कुल ${nextCount} गिलास हुए।`;
      else if (isEn) msg = `Great job! You drank a glass of water. Total: ${nextCount} glasses today.`;
      else msg = `বৰ ভাল কাম! আপুনি এক গিলাচ পানী খালে। আজি মুঠ ${nextCount} গিলাচ হ’ল।`;
      synthesizeSpeech(msg, language);
      setVoiceFeedback(msg);
      return {
        ...prev,
        hydration: {
          ...prev.hydration,
          consumedGlasses: nextCount,
          lastTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      };
    });
  };

  const handleToggleActivity = (id) => {
    setReminders(prev => ({
      ...prev,
      activities: prev.activities.map(a => {
        if (a.id === id) {
          const nextComp = !a.completed;
          if (nextComp) {
            let msg = '';
            if (isHi) msg = `${a.titleHi || a.titleEn} पूरा हुआ।`;
            else if (isEn) msg = `Completed ${a.titleEn}.`;
            else msg = `${a.titleAs} সম্পন্ন হ’ল।`;
            synthesizeSpeech(msg, language);
            setVoiceFeedback(msg);
          }
          return { ...a, completed: nextComp };
        }
        return a;
      })
    }));
  };

  const handleSpeakAllReminders = () => {
    let textToSpeak = '';
    const pendingMeds = reminders.medicines.filter(m => !m.taken);
    const nextApt = reminders.appointments[0]?.date || '';
    const glasses = reminders.hydration.consumedGlasses;
    const target = reminders.hydration.targetGlasses;

    switch (language) {
      case 'hi': {
        const medNames = pendingMeds.map(m => m.nameHi || m.nameEn).join(', ');
        textToSpeak = `नमस्ते ${patientProfile?.name || ''}। आज आपने ${glasses} गिलास पानी पिया है। ${medNames ? `बाकी दवाइयां: ${medNames}।` : 'सभी दवाइयां ले ली गई हैं!'} आपकी अगली जांच: ${nextApt}।`;
        break;
      }
      case 'bn': {
        const medNames = pendingMeds.map(m => m.nameEn).join(', ');
        textToSpeak = `নমস্কার ${patientProfile?.name || ''}। আপনি আজ ${glasses} গ্লাস জল খেয়েছেন। ${medNames ? `বাকি ওষুধ: ${medNames}।` : 'সব ওষুধ খাওয়া হয়ে গেছে!'} আপনার পরবর্তী ডাক্তারের অ্যাপয়েন্টমেন্ট: ${nextApt}।`;
        break;
      }
      case 'mni': {
        const medNames = pendingMeds.map(m => m.nameEn).join(', ');
        textToSpeak = `Khurumjari ${patientProfile?.name || ''}. Ngasi eshing glass ${glasses} thakhre. ${medNames ? `Hidak watliba: ${medNames}.` : 'Hidak pumnamak loukhatkhre!'} Doctor unanaba: ${nextApt}.`;
        break;
      }
      case 'lus': {
        const medNames = pendingMeds.map(m => m.nameEn).join(', ');
        textToSpeak = `Chibai ${patientProfile?.name || ''}. Vawiinah tui no ${glasses} i in tawh e. ${medNames ? `Damdawi la eilo: ${medNames}.` : 'Damdawi zawng zawng i ei tawh e!'} Inentir leh hun tur chu: ${nextApt}.`;
        break;
      }
      case 'kha': {
        const medNames = pendingMeds.map(m => m.nameEn).join(', ');
        textToSpeak = `Khublei ${patientProfile?.name || ''}. Mynta ka sngi phi la dih ${glasses} khuri ka um. ${medNames ? `Ki dawai ba sah: ${medNames}.` : 'La dep dih lut ki dawai baroh!'} Ka sngi leit sha doctor: ${nextApt}.`;
        break;
      }
      case 'grt': {
        const medNames = pendingMeds.map(m => m.nameEn).join(', ');
        textToSpeak = `Salam ${patientProfile?.name || ''}. Da·al salo na·a chi glass ${glasses} ring·aha. ${medNames ? `Samrang: ${medNames}.` : 'Sam pillakko cha·man·aha!'} Doctor-ko grongani: ${nextApt}.`;
        break;
      }
      case 'brx': {
        const medNames = pendingMeds.map(m => m.nameEn).join(', ');
        textToSpeak = `Khuluma ${patientProfile?.name || ''}. Dinwi nongthanga doy glass ${glasses} longbay. ${medNames ? `Muli dong: ${medNames}.` : 'Gasaaybo muli longkhangbay!'} Doctor logor humno: ${nextApt}.`;
        break;
      }
      case 'en': {
        const medNames = pendingMeds.map(m => m.nameEn).join(', ');
        textToSpeak = `Hello ${patientProfile?.name || 'there'}. Today you have drank ${glasses} of ${target} glasses of water. ${medNames ? `Remaining medicines: ${medNames}.` : 'All medicines are taken!'} Next appointment is on ${nextApt}.`;
        break;
      }
      case 'as':
      default: {
        const medNames = pendingMeds.map(m => m.nameAs || m.nameEn).join(', ');
        textToSpeak = `নমস্কাৰ ${patientProfile?.name || ''}। আপুনি আজি ${glasses} গিলাচ পানী খাইছে। ${medNames ? `বাকী থকা ঔষধসমূহ: ${medNames}।` : 'সকলো ঔষধ খোৱা সম্পূৰ্ণ হ’ল!'} আপোনাৰ পৰৱৰ্তী স্বাস্থ্য পৰীক্ষা: ${nextApt}।`;
        break;
      }
    }

    synthesizeSpeech(textToSpeak, language);
    setVoiceFeedback(textToSpeak);
  };

  const handleVoiceCommand = (res) => {
    if (!res?.transcript) return;
    const clean = res.transcript.toLowerCase();

    if (clean.includes('water') || clean.includes('pani') || clean.includes('পানী') || clean.includes('জল')) {
      handleAddWater();
    } else if (clean.includes('medicine') || clean.includes('দৰব') || clean.includes('ঔষধ') || clean.includes('dawaii')) {
      const firstUntaken = reminders.medicines.find(m => !m.taken);
      if (firstUntaken) handleToggleMed(firstUntaken.id);
    } else {
      handleSpeakAllReminders();
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-soft max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-5 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-600"></span>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Daily Care Routine
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            {isHi ? 'दैनिक स्वास्थ्य व याददाश्त (Reminders)' : (isEn ? 'Daily Health & Reminders' : 'দৈনন্দিন সোঁৱৰণী আৰু স্বাস্থ্য')}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isHi
              ? 'दवाइयां, पानी, दैनिक दिनचर्या और डॉक्टर की जांच की सुलभ आवाज़-सक्षम सूची।'
              : (isEn
                ? 'Voice-assisted schedules for medicines, hydration, routine & doctor visits.'
                : 'দৰব, পানী খোৱা, কামৰ তালিকা আৰু স্বাস্থ্য পৰীক্ষাৰ সহজ মাত-চালিত সোঁৱৰণী।')}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Read Aloud Button */}
          <button
            type="button"
            onClick={handleSpeakAllReminders}
            className="min-h-touch px-3.5 py-2 bg-teal-50 hover:bg-teal-100 active:bg-teal-200 text-teal-800 border border-teal-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-soft active:scale-95"
          >
            <span className="text-base">🔊</span>
            <span>{isHi ? 'सभी सुनें (Read All)' : (isEn ? 'Read All Aloud' : 'সকলো শুনক')}</span>
          </button>

          {onExit && (
            <button
              type="button"
              onClick={onExit}
              className="text-xs font-medium text-slate-500 hover:text-slate-800 px-2.5 py-1.5 rounded-lg hover:bg-slate-50 transition"
            >
              {isHi ? 'वापस' : (isEn ? 'Back' : 'উভতি যাওক')}
            </button>
          )}
        </div>
      </div>

      {/* 4 Accessible Segment Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <button
          type="button"
          onClick={() => setActiveTab('medicines')}
          className={`min-h-touch p-3 rounded-2xl border font-semibold text-xs flex flex-col items-center justify-center gap-1 transition-all ${
            activeTab === 'medicines'
              ? 'bg-teal-50/60 border-teal-600 text-teal-900 shadow-soft ring-1 ring-teal-600/30'
              : 'border-slate-200/80 hover:border-slate-300 bg-white text-slate-700'
          }`}
        >
          <span className="text-xl">💊</span>
          <span>{isHi ? 'दवाइयां' : (isEn ? 'Medicines' : 'ঔষধ/দৰব')}</span>
          <span className="text-[10px] text-teal-800 font-bold">
            {reminders.medicines.filter(m => m.taken).length}/{reminders.medicines.length} {isHi ? 'ली गईं' : (isEn ? 'Taken' : 'খোৱা হ’ল')}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('hydration')}
          className={`min-h-touch p-3 rounded-2xl border font-semibold text-xs flex flex-col items-center justify-center gap-1 transition-all ${
            activeTab === 'hydration'
              ? 'bg-blue-50/60 border-blue-600 text-blue-900 shadow-soft ring-1 ring-blue-600/30'
              : 'border-slate-200/80 hover:border-slate-300 bg-white text-slate-700'
          }`}
        >
          <span className="text-xl">💧</span>
          <span>{isHi ? 'पानी पीना' : (isEn ? 'Hydration' : 'পানী খোৱা')}</span>
          <span className="text-[10px] text-blue-800 font-bold">
            {reminders.hydration.consumedGlasses}/{reminders.hydration.targetGlasses} {isHi ? 'गिलास' : (isEn ? 'Glasses' : 'গিলাচ')}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('activities')}
          className={`min-h-touch p-3 rounded-2xl border font-semibold text-xs flex flex-col items-center justify-center gap-1 transition-all ${
            activeTab === 'activities'
              ? 'bg-amber-50/60 border-amber-600 text-amber-900 shadow-soft ring-1 ring-amber-600/30'
              : 'border-slate-200/80 hover:border-slate-300 bg-white text-slate-700'
          }`}
        >
          <span className="text-xl">🌿</span>
          <span>{isHi ? 'दिनचर्या' : (isEn ? 'Daily Routine' : 'দৈনন্দিন কাম')}</span>
          <span className="text-[10px] text-amber-800 font-bold">
            {reminders.activities.filter(a => a.completed).length}/{reminders.activities.length} {isHi ? 'पूर्ण' : (isEn ? 'Done' : 'সম্পূৰ্ণ')}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('appointments')}
          className={`min-h-touch p-3 rounded-2xl border font-semibold text-xs flex flex-col items-center justify-center gap-1 transition-all ${
            activeTab === 'appointments'
              ? 'bg-purple-50/60 border-purple-600 text-purple-900 shadow-soft ring-1 ring-purple-600/30'
              : 'border-slate-200/80 hover:border-slate-300 bg-white text-slate-700'
          }`}
        >
          <span className="text-xl">🏥</span>
          <span>{isHi ? 'डॉक्टर जांच' : (isEn ? 'Appointments' : 'স্বাস্থ্য পৰীক্ষা')}</span>
          <span className="text-[10px] text-purple-800 font-bold">
            {reminders.appointments.length} {isHi ? 'तय' : (isEn ? 'Scheduled' : 'নিৰ্ধাৰিত')}
          </span>
        </button>
      </div>

      {/* Voice Assistant / Feedback Toast */}
      {voiceFeedback && (
        <div className="p-3.5 bg-teal-50/80 border border-teal-200/70 rounded-2xl flex items-center justify-between text-xs text-teal-900 animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="text-base animate-pulse">🔊</span>
            <p className="font-medium leading-relaxed">{voiceFeedback}</p>
          </div>
          <button
            onClick={() => setVoiceFeedback('')}
            className="text-teal-700 hover:text-teal-900 font-bold ml-2 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Tab 1: Medicines */}
      {activeTab === 'medicines' && (
        <div className="space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800">
              {isHi ? 'दवाइयों की सूची (Medicines Schedule)' : (isEn ? 'Prescribed Medicines Schedule' : 'দৈনিক ঔষধৰ তালিকা')}
            </h2>
            <span className="text-xs text-slate-500">
              {isHi ? 'दवाई लेने के बाद छुएं' : (isEn ? 'Tap card when taken' : 'দৰব খোৱাৰ পিছত স্পৰ্শ কৰক')}
            </span>
          </div>

          <div className="space-y-2.5">
            {reminders.medicines.map((med) => {
              const medName = isHi ? (med.nameHi || med.nameEn) : (isEn ? med.nameEn : med.nameAs);
              return (
                <button
                  key={med.id}
                  type="button"
                  onClick={() => handleToggleMed(med.id)}
                  className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition active:scale-[0.99] ${
                    med.taken
                      ? 'bg-emerald-50/60 border-emerald-300 text-emerald-950'
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800 shadow-soft'
                  }`}
                >
                  <div className="flex items-center space-x-3.5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-xs ${
                      med.taken ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {med.taken ? '✓' : med.icon}
                    </div>
                    <div>
                      <p className={`text-sm font-bold leading-tight ${med.taken ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                        {medName}
                      </p>
                      <p className="text-xs font-semibold text-slate-500 mt-0.5">
                        ⏰ {med.time}
                      </p>
                    </div>
                  </div>

                  <span className={`text-xs font-bold px-3 py-1.5 rounded-xl border ${
                    med.taken
                      ? 'bg-emerald-600 text-white border-emerald-700'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}>
                    {med.taken
                      ? (isHi ? '✓ ली गई' : (isEn ? '✓ Taken' : '✓ খোৱা হ’ল'))
                      : (isHi ? 'लेना बाकी' : (isEn ? 'Mark Taken' : 'খোৱা নাই'))}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Hydration */}
      {activeTab === 'hydration' && (
        <div className="space-y-4 animate-fade-in">
          <div className="p-6 bg-blue-50/60 border border-blue-200 rounded-3xl text-center space-y-4">
            <div>
              <span className="text-3xl block mb-1">💧</span>
              <h2 className="text-lg font-bold text-blue-950">
                {isHi ? 'दैनिक पानी पीने का लक्ष्य' : (isEn ? 'Daily Hydration Target' : 'দৈনিক পানী খোৱাৰ লক্ষ্য')}
              </h2>
              <p className="text-xs text-blue-800 mt-1">
                {isHi
                  ? `आज का लक्ष्य: ${reminders.hydration.targetGlasses} गिलास | पिछला समय: ${reminders.hydration.lastTime}`
                  : (isEn
                    ? `Target: ${reminders.hydration.targetGlasses} glasses daily | Last log: ${reminders.hydration.lastTime}`
                    : `লক্ষ্য: দৈনিক ${reminders.hydration.targetGlasses} গিলাচ | শেষবাৰ: ${reminders.hydration.lastTime}`)}
              </p>
            </div>

            {/* Glasses Visual Counter */}
            <div className="flex items-center justify-center gap-2 flex-wrap max-w-sm mx-auto">
              {Array.from({ length: reminders.hydration.targetGlasses }).map((_, idx) => {
                const isFilled = idx < reminders.hydration.consumedGlasses;
                return (
                  <div
                    key={idx}
                    className={`w-11 h-13 rounded-xl flex items-center justify-center text-xl transition-all border ${
                      isFilled
                        ? 'bg-blue-600 text-white border-blue-700 shadow-soft scale-105'
                        : 'bg-white/80 text-slate-300 border-blue-200'
                    }`}
                  >
                    {isFilled ? '🥤' : '🥛'}
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleAddWater}
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-2xl text-xs shadow-soft transition active:scale-95 inline-flex items-center justify-center gap-2"
            >
              <span className="text-base">＋</span>
              <span>
                {isHi ? 'एक गिलास पानी पिया' : (isEn ? 'I Drank 1 Glass of Water' : '১ গিলাচ পানী খালোঁ')}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: Daily Activities */}
      {activeTab === 'activities' && (
        <div className="space-y-3 animate-fade-in">
          <h2 className="text-sm font-bold text-slate-800">
            {isHi ? 'दैनिक दिनचर्या (Daily Routine)' : (isEn ? 'Daily Activities & Cognitive Exercises' : 'দৈনন্দিন কাম আৰু স্মৃতিৰ অনুশীলন')}
          </h2>

          <div className="space-y-2.5">
            {reminders.activities.map((act) => {
              const actTitle = isHi ? (act.titleHi || act.titleEn) : (isEn ? act.titleEn : act.titleAs);
              return (
                <button
                  key={act.id}
                  type="button"
                  onClick={() => handleToggleActivity(act.id)}
                  className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition active:scale-[0.99] ${
                    act.completed
                      ? 'bg-amber-50/60 border-amber-300 text-amber-950'
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800 shadow-soft'
                  }`}
                >
                  <div className="flex items-center space-x-3.5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-xs ${
                      act.completed ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {act.completed ? '✓' : act.icon}
                    </div>
                    <div>
                      <p className={`text-sm font-bold leading-tight ${act.completed ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                        {actTitle}
                      </p>
                      <p className="text-xs font-semibold text-slate-500 mt-0.5">
                        ⏰ {act.time}
                      </p>
                    </div>
                  </div>

                  <span className={`text-xs font-bold px-3 py-1.5 rounded-xl border ${
                    act.completed
                      ? 'bg-amber-700 text-white border-amber-800'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}>
                    {act.completed
                      ? (isHi ? '✓ पूर्ण' : (isEn ? '✓ Completed' : '✓ সম্পূৰ্ণ'))
                      : (isHi ? 'पूरा करें' : (isEn ? 'Mark Done' : 'কৰা নাই'))}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 4: Doctor Appointments */}
      {activeTab === 'appointments' && (
        <div className="space-y-3 animate-fade-in">
          <h2 className="text-sm font-bold text-slate-800">
            {isHi ? 'डॉक्टर व आशा कार्यकर्ता की जांच' : (isEn ? 'Doctor & ASHA Worker Visits' : 'চিকিৎসক আৰু আশা কৰ্মীৰ সাক্ষাৎ')}
          </h2>

          <div className="space-y-2.5">
            {reminders.appointments.map((apt) => {
              const docName = isHi ? (apt.doctorHi || apt.doctorEn) : (isEn ? apt.doctorEn : apt.doctorAs);
              const purpose = isHi ? (apt.purposeHi || apt.purposeEn) : (isEn ? apt.purposeEn : apt.purposeAs);
              return (
                <div
                  key={apt.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-white shadow-soft flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3.5">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 border border-purple-100 flex items-center justify-center text-xl shadow-xs">
                      {apt.icon}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 leading-tight">
                        {docName}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {purpose}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-purple-900 block">
                      {apt.date}
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60 inline-block mt-1">
                      {isHi ? 'पुष्टि की गई' : (isEn ? 'Confirmed' : 'নিশ্চিত')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Voice Mic Command Help */}
      <div className="p-4 bg-slate-50 border border-slate-200/70 rounded-2xl flex items-center justify-between gap-3">
        <div>
          <span className="text-xs font-bold text-slate-700 block">
            🎙️ {isHi ? 'बोलकर जवाब दें' : (isEn ? 'Voice Command Input' : 'মাত মাতি কওক')}
          </span>
          <p className="text-[11px] text-slate-500">
            {isHi
              ? 'माइक दबाकर कहें: "दवाई", "पानी", या "सभी बताओ"।'
              : (isEn
                ? 'Speak: "water", "medicine", or "read all" to update.'
                : 'কওক: "পানী", "দৰব", নাইবা "সকলো কওক"।')}
          </p>
        </div>
        <VoiceInputHandler
          language={language}
          onResult={handleVoiceCommand}
        />
      </div>
    </div>
  );
}
