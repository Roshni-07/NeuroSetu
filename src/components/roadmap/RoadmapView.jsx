import React, { useState, useMemo, useEffect } from 'react';
import { Trophy, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';
import RoadmapNode from './RoadmapNode.jsx';
import {
  PRESET_PATIENTS,
} from '../../data/presetPatients.js';
import { GAMES_CONFIG } from '../../data/gamesConfig.js';
import { getDifficultyParams } from '../../engine/difficultyScaling.js';
import {
  assignDailyGames,
  resolveDailyGameCount,
  FAMILY_GAMES_METADATA
} from '../../engine/dailyAssignmentEngine.js';
import { getScheduledFamilyGames } from '../../utils/familyScheduling.js';
import { getFamilyGameCompletion } from '../../utils/storage.js';


// Fallback metadata for all 15 games ensuring reliable labels, icons, and categories
const GAME_METADATA_FALLBACK = {
  'grandmas-shopping-list':  { name: "Grandma's Shopping List",    icon: '👵', category: 'Memory' },
  'find-the-difference':     { name: 'Find the Difference',        icon: '🔍', category: 'Visual Reasoning' },
  'daily-routine-recall':    { name: 'Daily Routine Recall',       icon: '🌅', category: 'Memory' },
  'remember-the-story':      { name: 'Remember the Story',         icon: '📖', category: 'Memory' },
  'care-for-companion':      { name: 'Care for Your Companion',    icon: '🌱', category: 'Reasoning' },
  'whose-morning-is-it':     { name: 'Whose Morning Is It?',       icon: '🐓', category: 'Attention' },
  'festival-memory-match':   { name: 'Festival Memory Match',      icon: '🪘', category: 'Memory' },
  'shell-memory-trail':      { name: 'Shell Memory Trail',         icon: '🐚', category: 'Attention' },
  'tea-garden-detective':    { name: 'Tea Garden Detective',       icon: '🍃', category: 'Visual Reasoning' },
  'what-belongs-here':       { name: 'What Belongs Here',          icon: '🧺', category: 'Visual Reasoning' },
  'pack-village-basket':     { name: 'Pack Village Basket',        icon: '🧺', category: 'Reasoning' },
  'whose-emotion':           { name: 'Whose Emotion',              icon: '🎭', category: 'Emotional Cognition' },
  'memory-map-home':         { name: 'Memory Map Home',            icon: '🗺️', category: 'Memory' },
  'day-in-my-village':       { name: 'A Day in My Village',        icon: '🏡', category: 'Memory' },
  'finish-grandmas-weave':   { name: "Finish Grandma's Weave",     icon: '🧵', category: 'Attention' }
};

// Alternating winding pattern (Center -> Left -> Center -> Right)
const WINDING_OFFSETS = ['center', 'left', 'center', 'right'];

/**
 * Generate smooth SVG path connecting adjacent offset positions.
 */
function getConnectorPath(fromOffset, toOffset) {
  const xMap = { left: 30, center: 80, right: 130 };
  const x1 = xMap[fromOffset] || 80;
  const x2 = xMap[toOffset] || 80;
  return `M ${x1},0 C ${x1},20 ${x2},20 ${x2},40`;
}

/**
 * RoadmapView.jsx - Candy Crush-style Sequential Cognitive Game Journey
 *
 * Uses assignDailyGames() for severity-scaled game count (2–5/day) and per-node
 * session difficulty levels. Supports a 4-state node system:
 *   completed | in-progress | active | locked
 *
 * @param {Object} props
 * @param {Object} [props.patientProfile]     - Active patient profile (defaults to preset-1)
 * @param {number} [props.level]              - Override for current difficulty level (1-10)
 * @param {string[]} [props.completedGameIds] - Game IDs already finished today
 * @param {string|null} [props.activeGameId]  - Game currently being played (in-progress state)
 * @param {Object} [props.gameScores]         - Map of gameId → { stars, accuracy }
 * @param {Function} [props.onSelectGame]     - Callback (gameId, currentLevel, difficultyParams)
 * @param {Function} [props.onExit]           - Optional exit/back handler
 */
export default function RoadmapView({
  patientProfile = null,
  level = null,
  completedGameIds = [],
  activeGameId = null,
  gameScores = {},
  onSelectGame = null,
  onPlayFamilyGame = null,
  onExit = null,
  currentDate = null
}) {
  // 1. Resolve Active Patient Profile (props -> local storage -> fallback preset-1)
  const activePatient = useMemo(() => {
    if (patientProfile) return patientProfile;
    try {
      const stored = localStorage.getItem('neurosetu_active_patient');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.id) return parsed;
      }
    } catch (e) {}
    // Default fallback to Profile 1 (Ramesh Patel, Mild / Early Stage)
    return PRESET_PATIENTS[0];
  }, [patientProfile]);

  const dateStr = useMemo(() => {
    if (!currentDate) return new Date().toISOString().slice(0, 10);
    const d = currentDate instanceof Date ? currentDate : new Date(currentDate);
    return d.toISOString().slice(0, 10);
  }, [currentDate]);

  // Family Game Scheduling & Completion State (strictly isolated per patient)
  const scheduledFamilyGames = useMemo(() => {
    return getScheduledFamilyGames(currentDate || new Date());
  }, [currentDate]);

  const [completedFamilyIds, setCompletedFamilyIds] = useState(() => {
    return getFamilyGameCompletion(activePatient?.id, dateStr);
  });

  useEffect(() => {
    setCompletedFamilyIds(getFamilyGameCompletion(activePatient?.id, dateStr));
    const handleUpdate = (e) => {
      if (!e.detail?.patientId || e.detail.patientId === (activePatient?.id || 'default_patient')) {
        setCompletedFamilyIds(getFamilyGameCompletion(activePatient?.id, dateStr));
      }
    };
    window.addEventListener('neurosetu:family-progress-updated', handleUpdate);
    return () => window.removeEventListener('neurosetu:family-progress-updated', handleUpdate);
  }, [activePatient?.id, dateStr]);



  // 2. Resolve Current Difficulty Level (1 to 10)
  const currentLevel = useMemo(() => {
    if (typeof level === 'number') return Math.min(10, Math.max(1, level));
    if (activePatient.masteryScore) {
      return Math.min(10, Math.max(1, Math.ceil(activePatient.masteryScore / 10)));
    }
    if (activePatient.starting_difficulty_tier === 3) return 8;
    if (activePatient.starting_difficulty_tier === 2) return 5;
    return 2;
  }, [level, activePatient]);

  // 3. Resolve daily games via the engine (severity-scaled core + 1 family game)
  const dailyGames = useMemo(() => {
    const assigned = assignDailyGames({
      patientProfile: activePatient,
      gamesConfig: GAMES_CONFIG,
      date: currentDate || new Date()
    });

    // Enrich with fallback metadata for display
    return assigned.map((g) => {
      const fallback = GAME_METADATA_FALLBACK[g.id] || FAMILY_GAMES_METADATA[g.id] || {
        name: g.id.split(/[_-]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        icon: g.isFamilyGame ? '👨‍👩‍👧‍👦' : '🎮',
        category: g.isFamilyGame ? 'Family & Identity' : 'Cognitive'
      };
      return {
        id:           g.id,
        name:         g.name        || fallback.name,
        icon:         g.icon        || fallback.icon,
        category:     g.category    || fallback.category,
        culturalTag:  g.culturalTag || (g.isFamilyGame ? 'Family Memory' : ''),
        sessionLevel: g.sessionLevel || currentLevel,
        isFamilyGame: Boolean(g.isFamilyGame),
        domain:       g.domain || fallback.category
      };
    });
  }, [activePatient, currentLevel, currentDate]);

  const totalDailyTarget = dailyGames.length;

  // 4. Track Progression State
  const completedCount = useMemo(() => {
    return dailyGames.filter(g => {
      if (g.isFamilyGame) {
        return completedGameIds.includes(g.id) || completedFamilyIds.includes(g.id);
      }
      return completedGameIds.includes(g.id);
    }).length;
  }, [dailyGames, completedGameIds, completedFamilyIds]);

  const progressPercentage = Math.min(
    100,
    Math.round((completedCount / Math.max(1, totalDailyTarget)) * 100)
  );

  const isDailyGoalAchieved = completedCount >= totalDailyTarget;

  // 5. Handle Game Selection
  const handleLaunchGame = (gameId, nodeLevel) => {
    const targetGame = dailyGames.find(g => g.id === gameId);
    if (targetGame?.isFamilyGame) {
      if (onPlayFamilyGame) {
        onPlayFamilyGame(gameId);
      }
    } else {
      const params = getDifficultyParams(gameId, nodeLevel);
      if (onSelectGame) {
        onSelectGame(gameId, nodeLevel, params);
      }
    }
  };

  // Stage Badge Visual Theming
  const stageBadgeStyle = useMemo(() => {
    const s = (activePatient.stage || '').toLowerCase();
    if (s.includes('mild') || s.includes('early')) {
      return 'bg-teal-100 text-teal-900 border-teal-300';
    }
    if (s.includes('moderate') || s.includes('middle')) {
      return 'bg-amber-100 text-amber-900 border-amber-300';
    }
    return 'bg-rose-100 text-rose-900 border-rose-300';
  }, [activePatient.stage]);

  return (
    <div
      data-testid="roadmap-view-container"
      className="max-w-2xl mx-auto px-4 py-6 sm:py-8 space-y-6 animate-fade-in"
    >
      {/* Top Banner & Progress Header Card - Culturally Grounded Assamese Silk & Canvas Theming */}
      <header className="bg-gradient-to-r from-amber-50/50 via-white to-teal-50/30 rounded-3xl border border-teal-200/80 shadow-soft p-5 sm:p-6 space-y-4 text-left">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-2xl shadow-xs">
              👴
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold text-teal-800 bg-teal-50 border border-teal-200/90 px-2.5 py-0.5 rounded-lg shadow-2xs">
                  Welcome to NeuroSetu
                </span>
                <h1 className="text-lg sm:text-xl font-black text-slate-900">
                  {activePatient.name}
                </h1>
                <span
                  data-testid="dementia-stage-badge"
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${stageBadgeStyle}`}
                >
                  {activePatient.stage || 'Clinical Caseload'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {activePatient.homeState ? `${activePatient.homeState} • ` : ''}Personalized Cognitive Stimulation Journey
              </p>
            </div>
          </div>

          {/* Level Pill */}
          <div className="flex items-center gap-2">
            <span
              data-testid="active-level-indicator"
              className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-black text-xs border border-slate-200 flex items-center gap-1.5 shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>Level {currentLevel} / 10</span>
            </span>

            {onExit && (
              <button
                type="button"
                onClick={onExit}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 font-bold text-xs border border-slate-200 transition cursor-pointer"
                aria-label="Exit to Hub"
              >
                ← Exit
              </button>
            )}
          </div>
        </div>

        {/* Progress Tracker & Visual Bar */}
        <div className="pt-3 border-t border-slate-100 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span data-testid="daily-progress-tracker" className="font-bold text-slate-700 flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-teal-600" />
              <span>Daily Progress: {completedCount} / {totalDailyTarget} Games Completed</span>
            </span>
            <span className="font-black text-teal-700">{progressPercentage}%</span>
          </div>

          {/* Horizontal Progress Bar */}
          <div className="w-full bg-slate-100 rounded-full h-3.5 p-0.5 border border-slate-200 shadow-inner">
            <div
              data-testid="daily-progress-bar"
              className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Goal Achieved Celebration Banner */}
        {isDailyGoalAchieved && (
          <div
            data-testid="goal-achieved-banner"
            className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-900 font-bold shadow-xs animate-fade-in"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>🎉 Outstanding! Today's recommended cognitive journey is complete. Rest well!</span>
          </div>
        )}
      </header>

      {/* Candy Crush-style Winding Roadmap Canvas - Culturally Themed Pathway */}
      <main
        data-testid="roadmap-path-canvas"
        className="relative bg-gradient-to-b from-amber-50/30 via-teal-50/25 to-amber-50/40 rounded-3xl border border-teal-200/70 shadow-soft p-6 sm:p-10 flex flex-col items-center overflow-hidden"
      >
        <div className="w-full flex flex-col items-center space-y-2">
          {dailyGames.map((game, index) => {
            // 4-state node status determination
            const isCompleted   = game.isFamilyGame
              ? (completedGameIds.includes(game.id) || completedFamilyIds.includes(game.id))
              : completedGameIds.includes(game.id);
            const isCurrentGame = !isCompleted && game.id === activeGameId;

            // First uncompleted, non-in-progress game is the active target
            const firstUncompletedIndex = dailyGames.findIndex(
              g => {
                const finished = g.isFamilyGame
                  ? (completedGameIds.includes(g.id) || completedFamilyIds.includes(g.id))
                  : completedGameIds.includes(g.id);
                return !finished && g.id !== activeGameId;
              }
            );
            const isActive = !isCompleted && !isCurrentGame && index === firstUncompletedIndex;
            const isLocked = !isCompleted && !isCurrentGame && !isActive;

            const nodeStatus = isCompleted   ? 'completed'
                             : isCurrentGame ? 'in-progress'
                             : isActive      ? 'active'
                             : 'locked';

            const offset     = WINDING_OFFSETS[index % WINDING_OFFSETS.length];
            const nextOffset = WINDING_OFFSETS[(index + 1) % WINDING_OFFSETS.length];
            const starsEarned = gameScores[game.id]?.stars || 3;
            // Use per-node session level from the engine; fall back to global level
            const nodeLevel = game.sessionLevel || currentLevel;

            return (
              <React.Fragment key={game.id}>
                {/* Interactive Node */}
                <RoadmapNode
                  game={game}
                  index={index}
                  totalNodes={dailyGames.length}
                  status={nodeStatus}
                  stars={starsEarned}
                  level={nodeLevel}
                  onSelect={handleLaunchGame}
                  offset={offset}
                />

                {/* Dotted Trail Connector between adjacent nodes */}
                {index < dailyGames.length - 1 && (
                  <div
                    data-testid={`roadmap-connector-${index}`}
                    className="w-full flex items-center justify-center my-1 pointer-events-none select-none"
                    aria-hidden="true"
                  >
                    <svg
                      className="w-40 h-10 overflow-visible"
                      viewBox="0 0 160 40"
                      preserveAspectRatio="none"
                    >
                      <path
                        d={getConnectorPath(offset, nextOffset)}
                        fill="none"
                        stroke={isCompleted ? '#10b981' : '#cbd5e1'}
                        strokeWidth="4"
                        strokeDasharray="6 6"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Roadmap Trail End Marker */}
        <div className="mt-8 pt-4 border-t border-teal-200/60 w-full flex flex-col items-center text-center text-xs text-slate-500 space-y-1">
          <span className="text-2xl">🏁</span>
          <span className="font-bold text-slate-700">Daily Milestone Cap</span>
          <span className="text-[11px] text-slate-400">
            {totalDailyTarget} cognitive & family tasks tuned for {activePatient.stage}
          </span>
        </div>
      </main>

      {/* Dedicated Family Memory Bonus Section (Rendered ONLY on scheduled days: Monday & Thursday) */}
      {scheduledFamilyGames.length > 0 && (
        <section
          data-testid="family-memory-section"
          className="bg-gradient-to-r from-amber-50/80 via-white to-rose-50/60 rounded-3xl border-2 border-amber-300/80 shadow-soft p-5 sm:p-6 space-y-4 animate-fade-in text-left"
          aria-label="Family Memory Reminiscence Games"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200/70 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl" role="img" aria-label="Family">👨‍👩‍👧‍👦</span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-100 border border-amber-300/80 px-2 py-0.5 rounded-md">
                    Twice-Weekly Special
                  </span>
                  <span className="text-xs font-bold text-rose-700">
                    {scheduledFamilyGames[0]?.thematicPair || 'Family Memory'}
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
                  Family Reminiscence Corner
                </h2>
              </div>
            </div>
              <span className="text-xs font-semibold text-amber-800/80 bg-amber-100/60 px-2.5 py-1 rounded-xl">
              Family Reminiscence • Counts Toward Daily Goal
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Revisit memories of your loved ones, photos, and milestones. These gentle sessions count toward your daily goal.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            {scheduledFamilyGames.map((game) => {
              const isDone = completedFamilyIds.includes(game.id);
              return (
                <div
                  key={game.id}
                  data-testid={`family-card-${game.id}`}
                  className={`p-4 rounded-2xl border-2 transition-all flex flex-col justify-between space-y-3 ${
                    isDone
                      ? 'bg-emerald-50/70 border-emerald-300/80'
                      : 'bg-white hover:bg-amber-50/40 border-amber-200/90 shadow-xs'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl p-2 rounded-xl bg-amber-100/70 border border-amber-200/80 shrink-0">
                      {game.icon}
                    </span>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="text-sm font-bold text-slate-900">
                          {game.name}
                        </h3>
                        {isDone && (
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-1.5 py-0.5 rounded-md">
                            Cherished ✓
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2">
                        {game.description}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    data-testid={`play-family-game-${game.id}`}
                    onClick={() => onPlayFamilyGame && onPlayFamilyGame(game.id)}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      isDone
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-xs active:scale-95'
                    }`}
                  >
                    <span>{isDone ? 'Replay Memory' : 'Play Activity'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

