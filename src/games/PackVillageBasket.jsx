import React, { useState, useEffect } from 'react';
import TapSelectGrid from '../shared/TapSelectGrid.jsx';

const BASKET_MISSIONS = [
  {
    id: 'tea_plucking',
    title: 'Pack for Morning Tea Plucking',
    prompt: 'Granddaughter is going to pluck tender two-leaves-and-a-bud in the tea estate. What should she pack in her bamboo basket?',
    icon: '🍃',
    requiredIds: ['basket', 'japi', 'gamusa', 'water_gourd'],
    items: [
      { id: 'basket', label: 'Bamboo Back-Basket', subtext: 'খোৰাং (To hold fresh leaves)', icon: '🧺' },
      { id: 'japi', label: 'Conical Japi Hat', subtext: 'জাপি (Protects from sun & drizzle)', icon: '👒' },
      { id: 'gamusa', label: 'Cotton Gamusa', subtext: 'গামোচা (To wipe brow & shield neck)', icon: '🧣' },
      { id: 'water_gourd', label: 'Fresh Water Gourd', subtext: 'পানীৰ লাও (Hydration in the heat)', icon: '🍶' },
      { id: 'pot', label: 'Heavy Cooking Pot', subtext: 'কেৰাহী (Too heavy for fields)', icon: '🍳' },
      { id: 'bell', label: 'Prayer Bell', subtext: 'নামঘৰৰ ঘণ্টা (Belongs in shrine)', icon: '🔔' },
      { id: 'hammer', label: 'Iron Hammer', subtext: 'হাতুৰী (Carpenter tool)', icon: '🔨' },
      { id: 'blanket', label: 'Woolen Quilt', subtext: 'কম্বল (For sleeping at night)', icon: '🛏️' }
    ]
  },
  {
    id: 'bihu_cooking',
    title: 'Pack for Village Feast Cooking',
    prompt: 'Preparing the community Bihu feast kitchen! Which items belong in the cooking basket?',
    icon: '🍲',
    requiredIds: ['rice', 'spices', 'ladle', 'tava'],
    items: [
      { id: 'rice', label: 'Joha Aromatic Rice', subtext: 'জহা চাউল (Fragrant feast grain)', icon: '🌾' },
      { id: 'spices', label: 'Turmeric & Mustard Oil', subtext: 'হালধি আৰু তেল (Essential flavours)', icon: '🫚' },
      { id: 'ladle', label: 'Wooden Stirring Ladle', subtext: 'হেঁতা (For stirring large pots)', icon: '🥄' },
      { id: 'tava', label: 'Cast Iron Tava', subtext: 'তাৱা (For roasting pitha)', icon: '🍳' },
      { id: 'sickle', label: 'Garden Sickle', subtext: 'দা / কাঁচি (For harvesting crops)', icon: '🌾' },
      { id: 'shuttle', label: 'Loom Shuttle', subtext: 'মাঁকো (For textile weaving)', icon: '🧵' },
      { id: 'dhol', label: 'Festival Drum', subtext: 'ঢোল (Musical instrument)', icon: '🥁' },
      { id: 'fishing_net', label: 'River Fishing Net', subtext: 'জাল (For river catch)', icon: '🎣' }
    ]
  }
];

export default function PackVillageBasket({ onComplete, language = 'en' }) {
  const [missionIndex, setMissionIndex] = useState(0);
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    // Pick a mission
    setMissionIndex(Math.floor(Math.random() * BASKET_MISSIONS.length));
    setSelectedIds([]);
  }, []);

  const currentMission = BASKET_MISSIONS[missionIndex];

  const handleToggle = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleConfirm = () => {
    const required = currentMission.requiredIds;
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

    onComplete({
      score,
      maxScore: 100,
      accuracy,
      message,
      subtext: `Selected ${correctPicked} of ${required.length} needed items.`
    });
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
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
          Tap only the items that belong in this basket ({selectedIds.length} selected):
        </p>
      </div>

      <TapSelectGrid
        language={language}
        items={currentMission.items}
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
          <span>Confirm Basket</span>
          <span>➔</span>
        </button>
      </div>
    </div>
  );
}
