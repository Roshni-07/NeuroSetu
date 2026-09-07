import React, { useState, useEffect, useMemo } from 'react';
import DragDropZone from '../shared/DragDropZone.jsx';
import { getActiveProfile } from '../db/indexedDb.js';
import { resolvePatientStartingTier } from '../engine/dailyAssignmentEngine.js';

const ROUTINE_ITEMS_TIER_2 = [
  { id: 'tea', label: 'Morning Chai', icon: '☕', subtext: 'Dawn tea on the veranda', correctSlot: 'slot_1' },
  { id: 'garden', label: 'Tending Garden', icon: '🌿', subtext: 'Watering tea plants & herbs', correctSlot: 'slot_2' },
  { id: 'medicine', label: 'Taking Medicine', icon: '💊', subtext: 'Prescribed morning pills', correctSlot: 'slot_3' },
  { id: 'lunch', label: 'Midday Meal', icon: '🍲', subtext: 'Rice, lentils, and garden greens', correctSlot: 'slot_4' },
  { id: 'bedtime', label: 'Night Rest', icon: '🌙', subtext: 'Prayer lamp and quiet sleep', correctSlot: 'slot_5' }
];

const ROUTINE_ITEMS_TIER_1 = [
  { id: 'tea', label: 'Morning Chai', icon: '☕', subtext: 'Dawn tea on the veranda', correctSlot: 'slot_1' },
  { id: 'bedtime', label: 'Night Rest', icon: '🌙', subtext: 'Prayer lamp and quiet sleep', correctSlot: 'slot_2' }
];

const ROUTINE_ITEMS_TIER_3 = [
  { id: 'tea', label: 'Morning Chai', icon: '☕', subtext: 'Dawn tea on the veranda', correctSlot: 'slot_1' },
  { id: 'garden', label: 'Tending Garden', icon: '🌿', subtext: 'Watering tea plants & herbs', correctSlot: 'slot_2' },
  { id: 'medicine', label: 'Taking Medicine', icon: '💊', subtext: 'Prescribed morning pills', correctSlot: 'slot_3' },
  { id: 'lunch', label: 'Midday Meal', icon: '🍲', subtext: 'Rice, lentils, and garden greens', correctSlot: 'slot_4' },
  { id: 'rest', label: 'Afternoon Rest', icon: '🛏️', subtext: 'Veranda rest & quiet', correctSlot: 'slot_5' },
  { id: 'bedtime', label: 'Night Rest', icon: '🌙', subtext: 'Prayer lamp and quiet sleep', correctSlot: 'slot_6' }
];

const ORDER_ZONES_TIER_2 = [
  { id: 'slot_1', title: '1st • Early Morning', subtitle: 'At dawn', icon: '🌅' },
  { id: 'slot_2', title: '2nd • Morning Routine', subtitle: 'Forenoon work', icon: '🐓' },
  { id: 'slot_3', title: '3rd • Midday Care', subtitle: 'Daily health', icon: '💊' },
  { id: 'slot_4', title: '4th • Afternoon Lunch', subtitle: 'Midday nutrition', icon: '🍲' },
  { id: 'slot_5', title: '5th • Night Rest', subtitle: 'Bedtime peaceful sleep', icon: '🌙' }
];

const ORDER_ZONES_TIER_1 = [
  { id: 'slot_1', title: '1st • Early Morning', subtitle: 'At dawn', icon: '🌅' },
  { id: 'slot_2', title: '2nd • Night Rest', subtitle: 'Bedtime peaceful sleep', icon: '🌙' }
];

const ORDER_ZONES_TIER_3 = [
  { id: 'slot_1', title: '1st • Early Morning', subtitle: 'At dawn', icon: '🌅' },
  { id: 'slot_2', title: '2nd • Morning Routine', subtitle: 'Forenoon work', icon: '🐓' },
  { id: 'slot_3', title: '3rd • Midday Care', subtitle: 'Daily health', icon: '💊' },
  { id: 'slot_4', title: '4th • Afternoon Lunch', subtitle: 'Midday nutrition', icon: '🍲' },
  { id: 'slot_5', title: '5th • Afternoon Rest', subtitle: 'Quiet veranda rest', icon: '🛏️' },
  { id: 'slot_6', title: '6th • Night Rest', subtitle: 'Bedtime peaceful sleep', icon: '🌙' }
];

export default function DailyRoutineRecall({
  onComplete,
  onExit,
  language = 'en',
  tier = null,
  startingTier = null,
  initialTier = null,
  patientProfile = null,
  profileId = null
}) {
  const effectiveTier = (tier || startingTier || initialTier)
    ? Number(tier || startingTier || initialTier)
    : patientProfile?.starting_difficulty_tier || patientProfile?.startingTier
    ? Number(patientProfile.starting_difficulty_tier || patientProfile.startingTier)
    : patientProfile?.status === 'critical'
    ? 1
    : patientProfile?.status === 'attention'
    ? 2
    : patientProfile?.status === 'stable'
    ? 3
    : 2; // Standard baseline (Tier 2)

  const [profile, setProfile] = useState(patientProfile);
  const [assignments, setAssignments] = useState({}); // { [itemId]: zoneId }

  useEffect(() => {
    if (patientProfile) {
      setProfile(patientProfile);
    } else if (profileId) {
      getActiveProfile(profileId).then((p) => {
        if (p) setProfile(p);
      });
    }
  }, [patientProfile, profileId]);

  // Use captured patient routine if available (3-6 items), else fallback to generic per-tier ROUTINE_ITEMS
  const hasCustomRoutine = Boolean(
    profile?.dailyRoutine && Array.isArray(profile.dailyRoutine) && profile.dailyRoutine.length >= 3
  );

  const activeRoutineItems = useMemo(() => {
    if (!hasCustomRoutine) {
      if (effectiveTier === 1) return ROUTINE_ITEMS_TIER_1;
      if (effectiveTier === 3) return ROUTINE_ITEMS_TIER_3;
      return ROUTINE_ITEMS_TIER_2;
    }

    const itemsToTake = effectiveTier === 1 ? 2 : effectiveTier === 3 ? 6 : Math.min(5, profile.dailyRoutine.length);
    const sliced = profile.dailyRoutine.slice(0, itemsToTake);

    return sliced.map((item, idx) => ({
      id: item.id || `custom_routine_${idx + 1}`,
      label: item.label,
      icon: item.icon || '⏰',
      subtext: item.time || `Daily step ${idx + 1}`,
      time: item.time,
      correctSlot: `slot_${idx + 1}`
    }));
  }, [hasCustomRoutine, profile, effectiveTier]);

  const activeOrderZones = useMemo(() => {
    if (!hasCustomRoutine) {
      if (effectiveTier === 1) return ORDER_ZONES_TIER_1;
      if (effectiveTier === 3) return ORDER_ZONES_TIER_3;
      return ORDER_ZONES_TIER_2;
    }
    const ordinals = ['1st', '2nd', '3rd', '4th', '5th', '6th'];
    return activeRoutineItems.map((item, idx) => ({
      id: `slot_${idx + 1}`,
      title: `${ordinals[idx] || `${idx + 1}th`} • ${item.subtext || `Step ${idx + 1}`}`,
      subtitle: item.time ? `Scheduled: ${item.time}` : 'Daily order',
      icon: item.icon || '🌅'
    }));
  }, [hasCustomRoutine, activeRoutineItems, effectiveTier]);

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
    activeRoutineItems.forEach((item) => {
      if (assignments[item.id] === item.correctSlot) {
        correctCount++;
      }
    });

    const accuracy = Math.round((correctCount / activeRoutineItems.length) * 100);
    const score = Math.max(30, accuracy);

    let message = 'Great daily rhythm! Keeping a peaceful routine supports memory.';
    if (accuracy === 100) {
      message = profile?.name
        ? `Splendid! You organized ${profile.name}’s daily routine in perfect order.`
        : 'Splendid! You organized the entire village daily routine in perfect order.';
    } else if (accuracy >= 60) {
      message = 'Good effort! Most of the daily sequence is in harmonious order.';
    }

    onComplete({
      score,
      maxScore: 100,
      accuracy,
      message,
      subtext: `${correctCount} of ${activeRoutineItems.length} routine steps placed in order.`
    });
  };

  const allAssigned = Object.keys(assignments).length === activeRoutineItems.length;

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
            {profile?.name
              ? `Arrange ${profile.name}'s Routine in Order:`
              : "Arrange the Day's Routine in Order:"}
          </h3>
          <p className="text-base text-slate-600 font-medium">
            Drag or tap an activity below, then place it into the matching time slot.
          </p>
        </div>
        <span className="text-3xl">🗓️</span>
      </div>

      <DragDropZone
        language={language}
        items={activeRoutineItems}
        zones={activeOrderZones}
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
