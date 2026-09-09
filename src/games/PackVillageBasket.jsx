import React, { useState, useEffect, useMemo } from 'react';
import TapSelectGrid from '../shared/TapSelectGrid.jsx';
import { getDifficultyParams } from '../engine/difficultyScaling.js';
import { getLevel } from '../engine/ddaEngine.js';

/**
 * Game 13 — Pack the Village Basket (Categorization / Executive Function)
 * Players identify and pack contextually appropriate items into a village basket,
 * discriminating essential tools from cultural and everyday distractors.
 * 
 * Migrated to 10-Level Shared Difficulty Scaling Engine:
 * - Target items scale from 2 (Level 1) to 5 (Level 10)
 * - Distractor items scale from 1 (Level 1) to 5 (Level 10)
 * - Total grid choices scale from 3 items (Level 1) to 10 items (Level 10)
 * - All mission types expanded with >= 6 targets + >= 6 distractors
 */

const BASKET_MISSIONS = [
  {
    id: 'tea_plucking',
    title: 'Pack for Morning Tea Plucking',
    prompt: 'Granddaughter is going to pluck tender two-leaves-and-a-bud in the tea estate. What should she pack in her bamboo basket?',
    icon: '🍃',
    requiredItems: [
      { id: 'basket', label: 'Bamboo Back-Basket', subtext: 'খোৰাং (To hold fresh leaves)', icon: '🧺' },
      { id: 'japi', label: 'Conical Japi Hat', subtext: 'জাপি (Protects from sun & drizzle)', icon: '👒' },
      { id: 'gamusa', label: 'Cotton Gamusa', subtext: 'গামোচা (To wipe brow & shield neck)', icon: '🧣' },
      { id: 'water_gourd', label: 'Fresh Water Gourd', subtext: 'পানীৰ লাও (Hydration in the heat)', icon: '🍶' },
      { id: 'tiffin_box', label: 'Steel Tiffin Box', subtext: 'টিফিন বাটি (Midday snack meal)', icon: '🍱' },
      { id: 'rain_umbrella', label: 'Bamboo Handle Umbrella', subtext: 'বাঁহৰ ছাতি (Sudden estate rain)', icon: '🌂' }
    ],
    distractorItems: [
      { id: 'pot', label: 'Heavy Cooking Pot', subtext: 'কেৰাহী (Too heavy for fields)', icon: '🍳' },
      { id: 'bell', label: 'Prayer Bell', subtext: 'নামঘৰৰ ঘণ্টা (Belongs in shrine)', icon: '🔔' },
      { id: 'hammer', label: 'Iron Hammer', subtext: 'হাতুৰী (Carpenter tool)', icon: '🔨' },
      { id: 'blanket', label: 'Woolen Quilt', subtext: 'কম্বল (For sleeping at night)', icon: '🛏️' },
      { id: 'spindle', label: 'Cotton Spindle', subtext: 'তাকুৰী (For spinning yarn)', icon: '🧵' },
      { id: 'brass_bowl', label: 'Heavy Brass Kahi', subtext: 'কাঁহৰ বাটি (Delicate dining ware)', icon: '🥣' }
    ]
  },
  {
    id: 'bihu_cooking',
    title: 'Pack for Village Feast Cooking',
    prompt: 'Preparing the community Bihu feast kitchen! Which items belong in the cooking basket?',
    icon: '🍲',
    requiredItems: [
      { id: 'rice', label: 'Joha Aromatic Rice', subtext: 'জহা চাউল (Fragrant feast grain)', icon: '🌾' },
      { id: 'spices', label: 'Turmeric & Mustard Oil', subtext: 'হালধি আৰু তেল (Essential flavours)', icon: '🫚' },
      { id: 'ladle', label: 'Wooden Stirring Ladle', subtext: 'হেঁতা (For stirring large pots)', icon: '🥄' },
      { id: 'tava', label: 'Cast Iron Tava', subtext: 'তাৱা (For roasting pitha)', icon: '🍳' },
      { id: 'banana_leaves', label: 'Fresh Banana Leaves', subtext: 'কলপাত (Natural feast plates)', icon: '🍃' },
      { id: 'bamboo_strainer', label: 'Bamboo Food Strainer', subtext: 'চালনী (Strains grain & flour)', icon: '🎋' }
    ],
    distractorItems: [
      { id: 'sickle', label: 'Garden Sickle', subtext: 'দা / কাঁচি (For harvesting crops)', icon: '🌾' },
      { id: 'shuttle', label: 'Loom Shuttle', subtext: 'মাঁকো (For textile weaving)', icon: '🧵' },
      { id: 'dhol', label: 'Festival Drum', subtext: 'ঢোল (Musical instrument)', icon: '🥁' },
      { id: 'fishing_net', label: 'River Fishing Net', subtext: 'জাল (For river catch)', icon: '🎣' },
      { id: 'loom_reed', label: 'Wooden Loom Reed', subtext: 'ৰাঁচ (Textile tool)', icon: '🪵' },
      { id: 'pepa', label: 'Buffalo Horn Pepa', subtext: 'পেঁপা (Dance horn)', icon: '🎺' }
    ]
  },
  {
    id: 'namghar_prayer',
    title: 'Pack for Namghar Morning Prayer',
    prompt: 'Heading to the village Namghar for morning devotional prayer. What sacred items belong in the prayer basket?',
    icon: '🪔',
    requiredItems: [
      { id: 'diya', label: 'Brass Oil Lamp', subtext: 'পিতলৰ চাকি (Sacred altar flame)', icon: '🪔' },
      { id: 'incense', label: 'Fragrant Agarbatti', subtext: 'ধূপ-ধূনা (Sweet temple aroma)', icon: '🕯️' },
      { id: 'prayer_bell', label: 'Sacred Prayer Bell', subtext: 'কাঁহৰ ঘণ্টা (Devotional ringing)', icon: '🔔' },
      { id: 'prasad_fruits', label: 'Betel & Offering Fruit', subtext: 'তামোল-পাণ আৰু ফল (Community prasad)', icon: '🍌' },
      { id: 'white_gamusa', label: 'Clean White Gamusa', subtext: 'বগা গামোচা (Reverent altar cloth)', icon: '🧣' },
      { id: 'mustard_oil', label: 'Mustard Oil Flask', subtext: 'সৰিয়হৰ তেল (Fuel for lamps)', icon: '🍶' }
    ],
    distractorItems: [
      { id: 'plow', label: 'Wooden Field Plow', subtext: 'নাঙল (Heavy farming tool)', icon: '🪵' },
      { id: 'fish_trap', label: 'River Fish Trap', subtext: 'চেপা (For catching river fish)', icon: '🎣' },
      { id: 'tea_shears', label: 'Tea Leaf Shears', subtext: 'কেঁচি (Pruning tool)', icon: '✂️' },
      { id: 'muddy_boots', label: 'Mud Walking Boots', subtext: 'জোতা (Removed before prayer)', icon: '🥾' },
      { id: 'wood_axe', label: 'Woodchopping Axe', subtext: 'কুঠাৰ (Firewood tool)', icon: '🪓' },
      { id: 'firecrackers', label: 'Loud Firecrackers', subtext: 'ফটকা (Disruptive in prayer)', icon: '💥' }
    ]
  }
];

export default function PackVillageBasket({
  onComplete,
  onExit,
  language = 'en',
  level = null,
  masteryScore = null,
  tier = null,
  startingTier = null,
  initialTier = null,
  patientProfile = null,
  onLevelChange = null
}) {
  const isExplicitLevel = level !== null && level !== undefined;
  const hasConfig = isExplicitLevel || masteryScore !== null || tier !== null || startingTier !== null || initialTier !== null || patientProfile !== null;

  // Standardized fallback resolver: level prop -> masteryScore -> patientProfile -> legacy status -> 5
  const currentLevel = useMemo(() => {
    if (isExplicitLevel && Number(level) >= 1 && Number(level) <= 10) return Math.round(Number(level));
    if (masteryScore !== null && masteryScore !== undefined) return getLevel(masteryScore);
    if (patientProfile?.masteryScore !== undefined) return getLevel(patientProfile.masteryScore);
    const legacyTier = tier || startingTier || initialTier || patientProfile?.starting_difficulty_tier || patientProfile?.startingTier || (patientProfile?.status === 'critical' ? 1 : patientProfile?.status === 'attention' ? 2 : patientProfile?.status === 'stable' ? 3 : null);
    if (legacyTier) {
      const t = Number(legacyTier);
      if (t === 1) return 1;
      if (t === 3) return 10;
      return 5;
    }
    return 5;
  }, [isExplicitLevel, level, masteryScore, patientProfile, tier, startingTier, initialTier]);

  useEffect(() => {
    if (onLevelChange) onLevelChange(currentLevel);
  }, [currentLevel, onLevelChange]);

  const difficultyParams = useMemo(() => {
    return getDifficultyParams('pack-village-basket', currentLevel);
  }, [currentLevel]);

  // Target count: 2 (L1) to 6 (L10). Defaults to 4 when unconfigured.
  const activeTargetCount = useMemo(() => {
    if (!hasConfig) return 4;
    return Math.max(2, Math.min(6, difficultyParams.itemCount || 3));
  }, [hasConfig, difficultyParams.itemCount]);

  // Distractor count: 1 (L1) to 6 (L10). Defaults to 4 when unconfigured.
  const activeDistractorCount = useMemo(() => {
    if (!hasConfig) return 4;
    return Math.max(1, Math.min(6, difficultyParams.distractorCount || 2));
  }, [hasConfig, difficultyParams.distractorCount]);

  const [missionIndex, setMissionIndex] = useState(0);
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    // Seed mission deterministically or randomly
    const idx = hasConfig ? (currentLevel - 1) % BASKET_MISSIONS.length : Math.floor(Math.random() * BASKET_MISSIONS.length);
    setMissionIndex(idx);
    setSelectedIds([]);
  }, [hasConfig, currentLevel]);

  const currentMission = BASKET_MISSIONS[missionIndex] || BASKET_MISSIONS[0];

  // Sliced targets and distractors
  const activeTargets = useMemo(() => {
    return currentMission.requiredItems.slice(0, activeTargetCount);
  }, [currentMission, activeTargetCount]);

  const activeRequiredIds = useMemo(() => {
    return activeTargets.map(t => t.id);
  }, [activeTargets]);

  const activeDistractors = useMemo(() => {
    return currentMission.distractorItems.slice(0, activeDistractorCount);
  }, [currentMission, activeDistractorCount]);

  // Combined grid items deterministically shuffled
  const displayItems = useMemo(() => {
    const combined = [...activeTargets, ...activeDistractors];
    return combined.sort((a, b) => (a.id.length + currentLevel) % 2 === 0 ? 1 : -1);
  }, [activeTargets, activeDistractors, currentLevel]);

  const handleToggle = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleConfirm = () => {
    const required = activeRequiredIds;
    const correctPicked = selectedIds.filter((id) => required.includes(id)).length;
    const wrongPicked = selectedIds.filter((id) => !required.includes(id)).length;

    const accuracy = Math.max(
      0,
      Math.round(((correctPicked - wrongPicked * 0.3) / required.length) * 100)
    );
    const score = Math.max(35, Math.round((accuracy / 100) * 100));

    let message = 'Wise preparation! You packed exactly what was needed for the village task.';
    if (accuracy === 100) {
      message = 'Superb reasoning! The basket is packed with every single right tool.';
    } else if (accuracy >= 60) {
      message = 'Good thinking! You selected the most important items for the task.';
    }

    if (onComplete) {
      onComplete({
        score,
        maxScore: 100,
        accuracy,
        message,
        subtext: `Selected ${correctPicked} of ${required.length} needed items.`,
        level: currentLevel,
        difficultyParams
      });
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {onExit && (
        <div className="flex items-center justify-between">
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

      {/* Adaptive Level Badge */}
      <div className="flex items-center justify-between px-4 py-2 bg-teal-50 border border-teal-200 rounded-2xl">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-700 text-white">
            Level {currentLevel}
          </span>
          <span className="text-xs font-semibold text-slate-600">
            Find {activeTargets.length} Items • {displayItems.length} Choices
          </span>
        </div>
        <span className="text-xs font-bold text-teal-800">
          {currentLevel <= 3 ? 'Gentle Warmup' : currentLevel <= 7 ? 'Target Challenge' : 'Focused Mastery'}
        </span>
      </div>

      {/* Task Prompt Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-teal-50 border-3 border-teal-300 shadow-sm space-y-2">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-teal-200 text-teal-950 text-sm font-bold uppercase tracking-wider">
          <span>{currentMission.icon}</span>
          <span>{currentMission.title}</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">
          {currentMission.prompt}
        </h3>
        <p className="text-base text-slate-600 font-medium">
          Tap only the {activeTargets.length} items that belong in this basket ({selectedIds.length} selected):
        </p>
      </div>

      <TapSelectGrid
        language={language}
        items={displayItems}
        selectedIds={selectedIds}
        onToggle={handleToggle}
        columns={displayItems.length >= 6 ? 2 : 2}
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
          <span>Confirm Basket</span>
          <span>➔</span>
        </button>
      </div>
    </div>
  );
}
