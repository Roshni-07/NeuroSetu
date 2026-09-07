import React, { useState, useEffect, useMemo } from 'react';
import TapSelectGrid from '../shared/TapSelectGrid.jsx';
import { sounds } from '../utils/soundEffects.js';
import { resolvePatientStartingTier } from '../engine/dailyAssignmentEngine.js';

const ALL_MARKET_ITEMS = [
  { id: 'tea', label: 'Assam CTC Tea', subtext: 'চাহ পাত (Freshly plucked)', icon: '☕' },
  { id: 'joha_rice', label: 'Joha Fragrant Rice', subtext: 'জহা চাউল (Aromatic grain)', icon: '🌾' },
  { id: 'bamboo_shoot', label: 'Tender Bamboo Shoot', subtext: 'বাঁহ গাজ (Forest fresh)', icon: '🎍' },
  { id: 'turmeric', label: 'Raw Wild Turmeric', subtext: 'কেঁচা হালধি (Healing spice)', icon: '🫚' },
  { id: 'bay_leaves', label: 'Tezpatta Bay Leaves', subtext: 'তেজপাত (Garden leaves)', icon: '🍃' },
  { id: 'bhut_jolokia', label: 'Bhut Jolokia Pepper', subtext: 'ভূত জলকীয়া (King chilli)', icon: '🌶️' },
  { id: 'mustard_oil', label: 'Pure Mustard Oil', subtext: 'সৰিয়হ তেল (Cold pressed)', icon: '🫒' },
  { id: 'river_fish', label: 'Fresh River Rohu', subtext: 'ব্ৰহ্মপুত্ৰৰ মাছ (River catch)', icon: '🐟' },
  { id: 'tamul_paan', label: 'Betel Nut & Paan', subtext: 'তামোল-পাণ (Traditional hospitality)', icon: '🌱' },
  { id: 'pitha', label: 'Rice Flour Pitha', subtext: 'তিল পিঠা (Festival sweet)', icon: '🥟' }
];

export default function GrandmasShoppingList({
  onComplete,
  onExit,
  language = 'en',
  tier = null,
  startingTier = null,
  initialTier = null,
  patientProfile = null
}) {
  const effectiveTier = (tier || startingTier || initialTier)
    ? Number(tier || startingTier || initialTier)
    : patientProfile
    ? resolvePatientStartingTier(patientProfile)
    : 2;

  const targetCount = effectiveTier === 1 ? 2 : effectiveTier === 3 ? 6 : 4;
  const initialCountdown = effectiveTier === 1 ? 10 : effectiveTier === 3 ? 5 : 6;

  const [phase, setPhase] = useState('preview'); // 'preview' | 'selection'
  const [targetList] = useState(() => {
    const shuffled = [...ALL_MARKET_ITEMS].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, targetCount);
  });
  const [selectedIds, setSelectedIds] = useState([]);
  const [countdown, setCountdown] = useState(initialCountdown);

  const selectionPool = useMemo(() => {
    if (effectiveTier !== 1) return ALL_MARKET_ITEMS;
    const targetIds = targetList.map((t) => t.id);
    const nonTargets = ALL_MARKET_ITEMS.filter((item) => !targetIds.includes(item.id));
    return [...targetList, ...nonTargets.slice(0, 2)].sort((a, b) => a.label.localeCompare(b.label));
  }, [effectiveTier, targetList]);

  // Countdown timer for preview
  useEffect(() => {
    if (phase !== 'preview') return;
    if (countdown <= 0) {
      setPhase('selection');
      return;
    }
    const timer = setTimeout(() => {
      setCountdown((c) => c - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [phase, countdown]);

  const handleToggle = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleConfirm = () => {
    const targetIds = targetList.map((item) => item.id);
    const correctCount = selectedIds.filter((id) => targetIds.includes(id)).length;
    const extraCount = selectedIds.filter((id) => !targetIds.includes(id)).length;

    // Accuracy computation
    const totalExpected = targetIds.length;
    const accuracy = Math.max(0, Math.round(((correctCount - extraCount * 0.3) / totalExpected) * 100));
    const score = Math.max(20, Math.round((accuracy / 100) * 100));

    let message = 'Great memory! You remembered Grandma’s bazaar essentials.';
    if (accuracy >= 80) {
      message = 'Wonderful! You remembered all items on Grandma’s village list!';
    } else if (accuracy >= 50) {
      message = 'Good effort! You picked most of Grandma’s favorite items.';
    }

    onComplete({
      score,
      maxScore: 100,
      accuracy,
      message,
      subtext: `Target: ${targetIds.length} items. You matched ${correctCount} correctly.`
    });
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {onExit && (
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={onExit}
            className="inline-flex items-center gap-2 px-4 py-2 min-h-[48px] bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 hover:text-slate-900 border border-slate-300 rounded-xl text-sm font-bold shadow-xs transition cursor-pointer"
            aria-label="Exit to hub"
          >
            <span className="text-lg leading-none">←</span>
            <span>Exit to Hub</span>
          </button>
        </div>
      )}
      {phase === 'preview' ? (
        /* Preview Phase */
        <div className="bg-teal-50/90 border-4 border-teal-300 rounded-3xl p-6 sm:p-8 shadow-xl text-center space-y-6">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-teal-200 text-teal-950 text-sm font-bold uppercase tracking-wider">
            <span>👵</span>
            <span>Grandma's Bazaar List</span>
          </div>

          <div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Remember these {targetList.length} items:
            </h3>
            <p className="text-lg text-slate-600 mt-1">
              Grandma asked for these from the weekly village haat!
            </p>
          </div>

          {/* List display */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {targetList.map((item) => (
              <div
                key={item.id}
                className="flex items-center space-x-4 p-4 rounded-2xl bg-white border-2 border-teal-200 shadow-sm"
              >
                <span className="text-4xl p-2 bg-teal-50 rounded-xl">{item.icon}</span>
                <div className="text-left">
                  <div className="text-xl font-bold text-slate-900 leading-tight">
                    {item.label}
                  </div>
                  <div className="text-sm font-medium text-slate-500">{item.subtext}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Countdown & Ready Button */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-teal-200">
            <div className="text-lg font-bold text-teal-900 flex items-center space-x-2">
              <span className="text-2xl animate-pulse">⏳</span>
              <span>Memorizing... {countdown}s remaining</span>
            </div>

            <button
              type="button"
              onClick={() => {
                sounds.playGentleTap();
                setPhase('selection');
              }}
              className="px-6 py-3 bg-teal-700 hover:bg-teal-800 text-white rounded-2xl font-bold text-lg shadow-md cursor-pointer transition-all"
            >
              I am Ready! ➔
            </button>
          </div>
        </div>
      ) : (
        /* Selection Phase */
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-teal-50 border-2 border-teal-300 flex items-center justify-between">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                Tap the items on Grandma's list:
              </h3>
              <p className="text-base text-slate-600 font-medium">
                {selectedIds.length} selected of {targetList.length} needed
              </p>
            </div>
            <span className="text-3xl">🧺</span>
          </div>

          <TapSelectGrid
            language={language}
            items={selectionPool}
            selectedIds={selectedIds}
            onToggle={handleToggle}
            columns={2}
          />

          <div className="pt-4 flex justify-end">
            <button
              type="button"
              disabled={selectedIds.length === 0}
              onClick={handleConfirm}
              className={`px-8 py-4 rounded-2xl text-xl font-bold shadow-lg transition-all flex items-center space-x-3 ${
                selectedIds.length > 0
                  ? 'bg-teal-700 hover:bg-teal-800 text-white cursor-pointer'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              }`}
            >
              <span>Check Basket</span>
              <span>➔</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
