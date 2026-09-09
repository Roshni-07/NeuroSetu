import React, { useState, useMemo, useEffect, useRef } from 'react';
import DragDropZone from '../shared/DragDropZone.jsx';
import { getDifficultyParams } from '../engine/difficultyScaling.js';
import { getLevel } from '../engine/ddaEngine.js';

/**
 * Game 11 — What Belongs Here? (Semantic Categorization / Spatial Reasoning)
 * Drag/tap household objects into their rightful traditional rooms (Kitchen, Prayer Room, Courtyard).
 * 
 * Migrated to 10-Level Shared Difficulty Scaling Engine:
 * - Slices items dynamically from 3 items (Level 1, 1 per room) to 12 items (Level 10, 4 per room)
 * - Every single level 1..10 has a unique item count (10 distinct difficulty states)
 * - Balanced zone distribution maintained at all levels
 */

const HOUSEHOLD_ZONES = [
  { id: 'kitchen', title: 'Traditional Kitchen', subtitle: 'পাকঘৰ (Cooking & Meals)', icon: '🍳' },
  { id: 'prayer', title: 'Prayer & Living Room', subtitle: 'নামঘৰ / বৈঠকী (Sacred & Calm)', icon: '🪔' },
  { id: 'courtyard', title: 'Entrance & Courtyard', subtitle: 'পদূলি / চোতাল (Garden & Outdoor)', icon: '🌾' }
];

// Expanded pool of 12 homestead objects (4 per zone)
const HOMESTEAD_OBJECTS = [
  // Kitchen (4 items)
  { id: 'kettle', label: 'Tea Kettle', icon: '🫖', correctZone: 'kitchen' },
  { id: 'kahi', label: 'Brass Kahi Plate', icon: '🍽️', correctZone: 'kitchen' },
  { id: 'pan', label: 'Cast Iron Kerahi', icon: '🍳', correctZone: 'kitchen' },
  { id: 'sil_nora', label: 'Grinding Stone Sil-Nora', icon: '🪨', correctZone: 'kitchen' },

  // Prayer & Living Room (4 items)
  { id: 'bell', label: 'Prayer Bell', icon: '🔔', correctZone: 'prayer' },
  { id: 'diya', label: 'Sacred Oil Lamp', icon: '🪔', correctZone: 'prayer' },
  { id: 'incense', label: 'Incense Stand', icon: '🕯️', correctZone: 'prayer' },
  { id: 'dhol', label: 'Festival Dhol Drum', icon: '🥁', correctZone: 'prayer' },

  // Entrance & Courtyard (4 items)
  { id: 'broom', label: 'Grass Broom', icon: '🧹', correctZone: 'courtyard' },
  { id: 'khurpi', label: 'Garden Sickle', icon: '🌾', correctZone: 'courtyard' },
  { id: 'japi', label: 'Farmer Japi Hat', icon: '👒', correctZone: 'courtyard' },
  { id: 'jakoi', label: 'Bamboo Fish Trap', icon: '🎋', correctZone: 'courtyard' }
];

export default function WhatBelongsHere({
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
    return getDifficultyParams('what-belongs-here', currentLevel);
  }, [currentLevel]);

  // Scaled item count: 3 items (L1) to 12 items (L10). Defaults to 9 when unconfigured.
  const activeCount = useMemo(() => {
    if (!hasConfig) return 9;
    return Math.max(3, Math.min(12, difficultyParams.itemCount || 3));
  }, [hasConfig, difficultyParams.itemCount]);

  // Balanced selection across zones
  const activeObjects = useMemo(() => {
    if (!hasConfig) {
      // Legacy 9-item subset (first 3 from each category)
      return HOMESTEAD_OBJECTS.filter(o => o.id !== 'sil_nora' && o.id !== 'dhol' && o.id !== 'jakoi');
    }
    const byZone = {
      kitchen: HOMESTEAD_OBJECTS.filter(o => o.correctZone === 'kitchen'),
      prayer: HOMESTEAD_OBJECTS.filter(o => o.correctZone === 'prayer'),
      courtyard: HOMESTEAD_OBJECTS.filter(o => o.correctZone === 'courtyard')
    };

    const selected = [];
    const zones = ['kitchen', 'prayer', 'courtyard'];
    let zIdx = 0;
    while (selected.length < activeCount) {
      const zoneKey = zones[zIdx % zones.length];
      const pool = byZone[zoneKey];
      const itemIdx = Math.floor(zIdx / zones.length);
      if (itemIdx < pool.length) {
        selected.push(pool[itemIdx]);
      }
      zIdx++;
    }
    // Deterministic shuffle
    return selected.sort((a, b) => (a.id.length + currentLevel) % 2 === 0 ? 1 : -1);
  }, [hasConfig, activeCount, currentLevel]);

  const startTime = useRef(Date.now());
  const [assignments, setAssignments] = useState({});

  useEffect(() => {
    setAssignments({});
    startTime.current = Date.now();
  }, [activeObjects]);

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
    activeObjects.forEach((item) => {
      if (assignments[item.id] === item.correctZone) {
        correct++;
      }
    });

    const accuracy = Math.round((correct / activeObjects.length) * 100);
    const score = Math.max(30, accuracy);
    const responseTimeMs = Math.max(100, Date.now() - startTime.current);
    const errorCount = Math.max(0, activeObjects.length - correct);
    const derivedTier = currentLevel <= 3 ? 1 : currentLevel <= 7 ? 2 : 3;

    let message = 'Wise reasoning! You organized the homestead with great clarity.';
    if (accuracy === 100) {
      message = 'Outstanding! Every village household item has found its rightful place.';
    } else if (accuracy >= 65) {
      message = 'Good job! Most household belongings are placed in their proper room.';
    }

    if (onComplete) {
      onComplete({
        gameId: 'what-belongs-here',
        score,
        maxScore: 100,
        accuracy,
        errorCount,
        responseTimeMs,
        latencyMs: responseTimeMs,
        message,
        subtext: `${correct} of ${activeObjects.length} items placed correctly.`,
        level: currentLevel,
        tier: derivedTier,
        difficultyTier: derivedTier,
        sessionLevel: currentLevel,
        difficultyParams
      });
    }
  };

  const allAssigned = Object.keys(assignments).length === activeObjects.length;

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

      {/* Adaptive Level Badge */}
      <div className="flex items-center justify-between px-4 py-2 bg-teal-50 border border-teal-200 rounded-2xl">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-700 text-white">
            Level {currentLevel}
          </span>
          <span className="text-xs font-semibold text-slate-600">
            Sort {activeObjects.length} Items Across 3 Rooms
          </span>
        </div>
        <span className="text-xs font-bold text-teal-800">
          {currentLevel <= 3 ? 'Gentle Warmup' : currentLevel <= 7 ? 'Target Challenge' : 'Focused Mastery'}
        </span>
      </div>

      <div className="p-4 rounded-2xl bg-teal-50 border-2 border-teal-300 flex items-center justify-between">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
            What Belongs In Each Room?
          </h3>
          <p className="text-base text-slate-600 font-medium">
            Tap or drag each object to its rightful household area ({Object.keys(assignments).length} of {activeObjects.length} placed).
          </p>
        </div>
        <span className="text-3xl">🏡</span>
      </div>

      <DragDropZone
        language={language}
        items={activeObjects}
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
