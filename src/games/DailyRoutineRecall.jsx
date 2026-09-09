import React, { useState, useEffect, useMemo, useRef } from 'react';
import DragDropZone from '../shared/DragDropZone.jsx';
import { getActiveProfile } from '../db/indexedDb.js';
import { getDifficultyParams } from '../engine/difficultyScaling.js';
import { getLevel } from '../engine/ddaEngine.js';

const MASTER_ROUTINE_ITEMS = [
  { id: 'tea', label: 'Morning Chai', icon: '☕', subtext: 'Dawn tea on the veranda' },
  { id: 'garden', label: 'Tending Garden', icon: '🌿', subtext: 'Watering tea plants & herbs' },
  { id: 'medicine', label: 'Taking Medicine', icon: '💊', subtext: 'Prescribed morning pills' },
  { id: 'lunch', label: 'Midday Meal', icon: '🍲', subtext: 'Rice, lentils, and garden greens' },
  { id: 'rest', label: 'Afternoon Rest', icon: '🛏️', subtext: 'Veranda rest & quiet' },
  { id: 'bedtime', label: 'Night Rest', icon: '🌙', subtext: 'Prayer lamp and quiet sleep' }
];

const MASTER_ORDER_ZONES = [
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
  level = null,
  masteryScore = null,
  tier = null,
  startingTier = null,
  initialTier = null,
  patientProfile = null,
  profileId = null,
  onLevelChange = null
}) {
  const currentLevel = useMemo(() => {
    if (level && Number(level) >= 1 && Number(level) <= 10) return Math.round(Number(level));
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
  }, [level, masteryScore, patientProfile, tier, startingTier, initialTier]);

  useEffect(() => {
    if (onLevelChange) onLevelChange(currentLevel);
  }, [currentLevel, onLevelChange]);

  const params = useMemo(() => {
    return getDifficultyParams('daily-routine-recall', currentLevel);
  }, [currentLevel]);

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

  // Use captured patient routine if available, else fallback to master list scaled by params.itemCount
  const hasCustomRoutine = Boolean(
    profile?.dailyRoutine && Array.isArray(profile.dailyRoutine) && profile.dailyRoutine.length >= 2
  );

  const activeRoutineItems = useMemo(() => {
    if (hasCustomRoutine) {
      const itemsToTake = currentLevel <= 3 ? 2 : currentLevel >= 8 ? 6 : Math.min(5, profile.dailyRoutine.length);
      const sliced = profile.dailyRoutine.slice(0, itemsToTake);
      return sliced.map((item, idx) => ({
        id: item.id || `custom_routine_${idx + 1}`,
        label: item.label,
        icon: item.icon || '⏰',
        subtext: item.time || `Daily step ${idx + 1}`,
        time: item.time,
        correctSlot: `slot_${idx + 1}`
      }));
    }

    if (currentLevel <= 3) {
      return [
        { ...MASTER_ROUTINE_ITEMS[0], correctSlot: 'slot_1' },
        { ...MASTER_ROUTINE_ITEMS[5], correctSlot: 'slot_2' }
      ];
    }

    if (currentLevel >= 8) {
      return MASTER_ROUTINE_ITEMS.map((item, idx) => ({
        ...item,
        correctSlot: `slot_${idx + 1}`
      }));
    }

    return [
      { ...MASTER_ROUTINE_ITEMS[0], correctSlot: 'slot_1' },
      { ...MASTER_ROUTINE_ITEMS[1], correctSlot: 'slot_2' },
      { ...MASTER_ROUTINE_ITEMS[2], correctSlot: 'slot_3' },
      { ...MASTER_ROUTINE_ITEMS[3], correctSlot: 'slot_4' },
      { ...MASTER_ROUTINE_ITEMS[5], correctSlot: 'slot_5' }
    ];
  }, [hasCustomRoutine, profile, currentLevel]);

  const activeOrderZones = useMemo(() => {
    if (hasCustomRoutine) {
      const ordinals = ['1st', '2nd', '3rd', '4th', '5th', '6th'];
      return activeRoutineItems.map((item, idx) => ({
        id: `slot_${idx + 1}`,
        title: `${ordinals[idx] || `${idx + 1}th`} • ${item.subtext || `Step ${idx + 1}`}`,
        subtitle: item.time ? `Scheduled: ${item.time}` : 'Daily order',
        icon: item.icon || '🌅'
      }));
    }

    if (activeRoutineItems.length === 2) {
      return [
        { id: 'slot_1', title: '1st • Early Morning', subtitle: 'At dawn', icon: '🌅' },
        { id: 'slot_2', title: '2nd • Night Rest', subtitle: 'Bedtime peaceful sleep', icon: '🌙' }
      ];
    }

    if (activeRoutineItems.length === 6) {
      return MASTER_ORDER_ZONES;
    }

    return [
      MASTER_ORDER_ZONES[0],
      MASTER_ORDER_ZONES[1],
      MASTER_ORDER_ZONES[2],
      MASTER_ORDER_ZONES[3],
      { id: 'slot_5', title: '5th • Night Rest', subtitle: 'Bedtime peaceful sleep', icon: '🌙' }
    ];
  }, [hasCustomRoutine, activeRoutineItems]);

  const startTime = useRef(Date.now());

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
    const responseTimeMs = Math.max(100, Date.now() - startTime.current);
    const errorCount = Math.max(0, activeRoutineItems.length - correctCount);
    const derivedTier = currentLevel <= 3 ? 1 : currentLevel <= 7 ? 2 : 3;

    let message = 'Great daily rhythm! Keeping a peaceful routine supports memory.';
    if (accuracy === 100) {
      message = profile?.name
        ? `Splendid! You organized ${profile.name}’s daily routine in perfect order.`
        : 'Splendid! You organized the entire village daily routine in perfect order.';
    } else if (accuracy >= 60) {
      message = 'Good effort! Most of the daily sequence is in harmonious order.';
    }

    onComplete({
      gameId: 'daily-routine-recall',
      score,
      maxScore: 100,
      accuracy,
      errorCount,
      responseTimeMs,
      latencyMs: responseTimeMs,
      level: currentLevel,
      tier: derivedTier,
      difficultyTier: derivedTier,
      sessionLevel: currentLevel,
      message,
      subtext: `${correctCount} of ${activeRoutineItems.length} routine steps placed in order.`
    });
  };

  const allAssigned = Object.keys(assignments).length === activeRoutineItems.length;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        {onExit ? (
          <button
            type="button"
            onClick={onExit}
            className="inline-flex items-center gap-2 px-4 py-2 min-h-[48px] bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 hover:text-slate-900 border border-slate-300 rounded-xl text-sm font-bold shadow-xs transition cursor-pointer"
            aria-label="Exit to hub"
          >
            <span className="text-lg leading-none">←</span>
            <span>Exit to Hub</span>
          </button>
        ) : <div />}
        <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
          Level {currentLevel}/10
        </span>
      </div>
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
