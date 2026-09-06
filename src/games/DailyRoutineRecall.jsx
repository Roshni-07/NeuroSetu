import React, { useState } from 'react';
import DragDropZone from '../shared/DragDropZone.jsx';

const ROUTINE_ITEMS = [
  { id: 'tea', label: 'Morning Chai', icon: '☕', subtext: 'Dawn tea on the veranda', correctSlot: 'slot_1' },
  { id: 'garden', label: 'Tending Garden', icon: '🌿', subtext: 'Watering tea plants & herbs', correctSlot: 'slot_2' },
  { id: 'medicine', label: 'Taking Medicine', icon: '💊', subtext: 'Prescribed morning pills', correctSlot: 'slot_3' },
  { id: 'lunch', label: 'Midday Meal', icon: '🍲', subtext: 'Rice, lentils, and garden greens', correctSlot: 'slot_4' },
  { id: 'bedtime', label: 'Night Rest', icon: '🌙', subtext: 'Prayer lamp and quiet sleep', correctSlot: 'slot_5' }
];

const ORDER_ZONES = [
  { id: 'slot_1', title: '1st • Early Morning', subtitle: 'At dawn', icon: '🌅' },
  { id: 'slot_2', title: '2nd • Morning Routine', subtitle: 'Forenoon work', icon: '🐓' },
  { id: 'slot_3', title: '3rd • Midday Care', subtitle: 'Daily health', icon: '💊' },
  { id: 'slot_4', title: '4th • Afternoon Lunch', subtitle: 'Midday nutrition', icon: '🍲' },
  { id: 'slot_5', title: '5th • Night Rest', subtitle: 'Bedtime peaceful sleep', icon: '🌙' }
];

export default function DailyRoutineRecall({ onComplete, language = 'en' }) {
  const [assignments, setAssignments] = useState({}); // { [itemId]: zoneId }

  const handleAssign = (itemId, zoneId) => {
    setAssignments((prev) => {
      const next = { ...prev };
      if (!zoneId) {
        delete next[itemId];
      } else {
        // If another item is already in this slot, remove that item
        Object.keys(next).forEach((k) => {
          if (next[k] === zoneId) delete next[k];
        });
        next[itemId] = zoneId;
      }
      return next;
    });
  };

  const handleCheckSequence = () => {
    let correctCount = 0;
    ROUTINE_ITEMS.forEach((item) => {
      if (assignments[item.id] === item.correctSlot) {
        correctCount++;
      }
    });

    const accuracy = Math.round((correctCount / ROUTINE_ITEMS.length) * 100);
    const score = Math.max(30, accuracy);

    let message = 'Great daily rhythm! Keeping a peaceful routine supports memory.';
    if (accuracy === 100) {
      message = 'Splendid! You organized the entire village daily routine in perfect order.';
    } else if (accuracy >= 60) {
      message = 'Good effort! Most of the daily sequence is in harmonious order.';
    }

    onComplete({
      score,
      maxScore: 100,
      accuracy,
      message,
      subtext: `${correctCount} of ${ROUTINE_ITEMS.length} routine steps placed in order.`
    });
  };

  const allAssigned = Object.keys(assignments).length === ROUTINE_ITEMS.length;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="p-4 rounded-2xl bg-teal-50 border-2 border-teal-300 flex items-center justify-between">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
            Arrange the Day's Routine in Order:
          </h3>
          <p className="text-base text-slate-600 font-medium">
            Drag or tap an activity below, then place it into the matching time slot.
          </p>
        </div>
        <span className="text-3xl">🗓️</span>
      </div>

      <DragDropZone
        language={language}
        items={ROUTINE_ITEMS}
        zones={ORDER_ZONES}
        assignments={assignments}
        onAssign={handleAssign}
        unassignedTitle="Daily Activities (Tap to select, then tap slot above):"
      />

      <div className="pt-4 flex justify-end">
        <button
          type="button"
          disabled={!allAssigned}
          onClick={handleCheckSequence}
          className={`px-8 py-4 rounded-2xl text-xl font-bold shadow-lg transition-all flex items-center space-x-3 ${
            allAssigned
              ? 'bg-teal-700 hover:bg-teal-800 text-white cursor-pointer'
              : 'bg-slate-300 text-slate-500 cursor-not-allowed'
          }`}
        >
          <span>Confirm Daily Order</span>
          <span>➔</span>
        </button>
      </div>
    </div>
  );
}
