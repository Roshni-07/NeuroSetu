import React, { useState } from 'react';
import DragDropZone from '../shared/DragDropZone.jsx';

const HOUSEHOLD_ZONES = [
  { id: 'kitchen', title: 'Traditional Kitchen', subtitle: 'পাকঘৰ (Cooking & Meals)', icon: '🍳' },
  { id: 'prayer', title: 'Prayer & Living Room', subtitle: 'নামঘৰ / বৈঠকী (Sacred & Calm)', icon: '🪔' },
  { id: 'courtyard', title: 'Entrance & Courtyard', subtitle: 'পদূলি / চোতাল (Garden & Outdoor)', icon: '🌾' }
];

const HOMESTEAD_OBJECTS = [
  { id: 'kettle', label: 'Tea Kettle', icon: '🫖', correctZone: 'kitchen' },
  { id: 'kahi', label: 'Brass Kahi Plate', icon: '🍽️', correctZone: 'kitchen' },
  { id: 'pan', label: 'Cast Iron Kerahi', icon: '🍳', correctZone: 'kitchen' },
  { id: 'bell', label: 'Prayer Bell', icon: '🔔', correctZone: 'prayer' },
  { id: 'diya', label: 'Sacred Oil Lamp', icon: '🪔', correctZone: 'prayer' },
  { id: 'incense', label: 'Incense Stand', icon: '🕯️', correctZone: 'prayer' },
  { id: 'broom', label: 'Grass Broom', icon: '🧹', correctZone: 'courtyard' },
  { id: 'khurpi', label: 'Garden Sickle', icon: '🌾', correctZone: 'courtyard' },
  { id: 'japi', label: 'Farmer Japi Hat', icon: '👒', correctZone: 'courtyard' }
];

export default function WhatBelongsHere({ onComplete, onExit, language = 'en' }) {
  const [assignments, setAssignments] = useState({});

  const handleAssign = (itemId, zoneId) => {
    setAssignments((prev) => {
      const next = { ...prev };
      if (!zoneId) {
        delete next[itemId];
      } else {
        next[itemId] = zoneId;
      }
      return next;
    });
  };

  const handleCheckPlacement = () => {
    let correct = 0;
    HOMESTEAD_OBJECTS.forEach((item) => {
      if (assignments[item.id] === item.correctZone) {
        correct++;
      }
    });

    const accuracy = Math.round((correct / HOMESTEAD_OBJECTS.length) * 100);
    const score = Math.max(30, accuracy);

    let message = 'Wise reasoning! You organized the homestead with great clarity.';
    if (accuracy === 100) {
      message = 'Outstanding! Every village household item has found its rightful place.';
    } else if (accuracy >= 65) {
      message = 'Good job! Most household belongings are placed in their proper room.';
    }

    onComplete({
      score,
      maxScore: 100,
      accuracy,
      message,
      subtext: `${correct} of ${HOMESTEAD_OBJECTS.length} items placed correctly.`
    });
  };

  const allAssigned = Object.keys(assignments).length === HOMESTEAD_OBJECTS.length;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
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
      <div className="p-4 rounded-2xl bg-teal-50 border-2 border-teal-300 flex items-center justify-between">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
            What Belongs In Each Room?
          </h3>
          <p className="text-base text-slate-600 font-medium">
            Tap or drag each object to its rightful household area.
          </p>
        </div>
        <span className="text-3xl">🏡</span>
      </div>

      <DragDropZone
        language={language}
        items={HOMESTEAD_OBJECTS}
        zones={HOUSEHOLD_ZONES}
        assignments={assignments}
        onAssign={handleAssign}
        unassignedTitle="Homestead Items (Tap to pick, then tap a room above):"
      />

      <div className="pt-4 flex justify-end">
        <button
          type="button"
          disabled={!allAssigned}
          onClick={handleCheckPlacement}
          className={`px-8 py-4 rounded-2xl text-xl font-bold shadow-lg transition-all flex items-center space-x-3 ${
            allAssigned
              ? 'bg-teal-700 hover:bg-teal-800 text-white cursor-pointer'
              : 'bg-slate-300 text-slate-500 cursor-not-allowed'
          }`}
        >
          <span>Confirm Room Placement</span>
          <span>➔</span>
        </button>
      </div>
    </div>
  );
}
