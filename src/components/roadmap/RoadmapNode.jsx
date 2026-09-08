import React from 'react';
import { Star, Lock, Play, Check } from 'lucide-react';

/**
 * RoadmapNode.jsx - Individual Game Node for Candy Crush-style Journey Path
 *
 * Renders an interactive, touch-friendly circular level node with four visual states:
 * - completed:    Emerald green background, 1–3 star ratings, checkmark badge.
 * - active:       Pulsing amber/teal focus ring, "Play Today" callout badge, clickable.
 * - in-progress:  Teal pulsing ring, hourglass "⏳ In Progress" badge, clickable.
 * - locked:       Grayed-out styling, lock icon, clear tooltip, non-clickable.
 *
 * WCAG 2.1 AA compliant with >= 48px touch targets and high-contrast text.
 *
 * @param {Object} props
 * @param {Object} props.game        - Game definition { id, name, icon, subtitle, category }
 * @param {number} props.index       - Step index (0-based)
 * @param {number} props.totalNodes  - Total daily roadmap nodes count
 * @param {'completed'|'active'|'in-progress'|'locked'} props.status - Current node state
 * @param {number} [props.stars=3]   - Stars earned if completed (1-3)
 * @param {number} [props.level=5]   - This node's difficulty level (1-10)
 * @param {Function} [props.onSelect] - Selection handler triggered when active/in-progress node is tapped
 * @param {'left'|'center'|'right'} [props.offset='center'] - Alternating winding offset
 */
export default function RoadmapNode({
  game,
  index,
  totalNodes,
  status = 'locked',
  stars = 3,
  level = 5,
  onSelect = null,
  offset = 'center'
}) {
  const isCompleted   = status === 'completed';
  const isActive      = status === 'active';
  const isInProgress  = status === 'in-progress';
  const isLocked      = status === 'locked';

  const isClickable = isActive || isInProgress;

  const handleClick = () => {
    if (isClickable && onSelect) {
      onSelect(game.id, level);
    }
  };

  // Horizontal offset alignment classes for the winding roadmap path
  const offsetClasses = {
    left:   'self-start sm:ml-20 ml-6',
    center: 'self-center mx-auto',
    right:  'self-end sm:mr-20 mr-6'
  }[offset] || 'self-center mx-auto';

  // State-specific styling for the circular node bubble
  const bubbleStateClasses = isCompleted
    ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-4 border-emerald-200 shadow-md hover:scale-105 active:scale-95 cursor-pointer'
    : isActive
    ? 'bg-gradient-to-br from-amber-500 via-teal-600 to-teal-700 text-white border-4 border-amber-300 shadow-xl ring-4 ring-amber-400/80 ring-offset-2 animate-pulse hover:scale-105 active:scale-95 cursor-pointer'
    : isInProgress
    ? 'bg-gradient-to-br from-teal-400 to-teal-600 text-white border-4 border-teal-300 shadow-xl ring-4 ring-teal-400/80 ring-offset-2 animate-pulse hover:scale-105 active:scale-95 cursor-pointer'
    : 'bg-slate-200 text-slate-400 border-4 border-slate-300 shadow-none cursor-not-allowed opacity-80';

  const lockedTooltip = 'Complete previous game to unlock';

  return (
    <div
      data-testid={`roadmap-node-container-${game.id}`}
      className={`flex flex-col items-center max-w-[200px] text-center transition-transform duration-300 ${offsetClasses}`}
    >
      {/* Active "Play Today" Callout Badge */}
      {isActive && (
        <div className="mb-2 animate-bounce" data-testid="active-callout-badge">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500 text-white text-xs font-black uppercase tracking-wider rounded-full shadow-lg border border-amber-200">
            <Play className="w-3 h-3 fill-white" />
            <span>Play Today</span>
          </span>
        </div>
      )}

      {/* In-Progress Callout Badge */}
      {isInProgress && (
        <div className="mb-2 animate-bounce" data-testid="in-progress-callout-badge">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-500 text-white text-xs font-black uppercase tracking-wider rounded-full shadow-lg border border-teal-200">
            <span>⏳ In Progress</span>
          </span>
        </div>
      )}

      {/* Main Interactive Node Button (>= 48px touch target) */}
      <button
        type="button"
        data-testid={`roadmap-node-${game.id}`}
        aria-label={`${game.name} - ${status.toUpperCase()} (Step ${index + 1} of ${totalNodes})`}
        aria-disabled={isLocked}
        disabled={isLocked}
        title={isLocked ? lockedTooltip : game.name}
        onClick={handleClick}
        className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-full flex flex-col items-center justify-center transition-all min-h-[48px] min-w-[48px] focus:outline-none focus-visible:ring-4 focus-visible:ring-teal-500 ${bubbleStateClasses}`}
      >
        {/* Step Badge Pill */}
        <span
          className={`absolute -top-1.5 -left-1.5 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black border-2 shadow-xs ${
            isCompleted
              ? 'bg-emerald-700 border-white text-white'
              : isActive
              ? 'bg-amber-600 border-white text-white'
              : isInProgress
              ? 'bg-teal-600 border-white text-white'
              : 'bg-slate-300 border-slate-400 text-slate-600'
          }`}
        >
          {index + 1}
        </span>

        {/* Central Game Icon / Emoji */}
        <span className={`text-3xl sm:text-4xl filter select-none ${isLocked ? 'grayscale opacity-60' : 'drop-shadow-sm'}`}>
          {game.icon || '🎮'}
        </span>

        {/* Status Overlays */}
        {isCompleted && (
          <span
            data-testid="completed-check-icon"
            className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-600 border-2 border-white flex items-center justify-center text-white shadow-xs"
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </span>
        )}

        {isInProgress && (
          <span
            data-testid="in-progress-icon"
            className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-teal-600 border-2 border-white flex items-center justify-center text-white shadow-xs text-[11px]"
          >
            ⏳
          </span>
        )}

        {isLocked && (
          <span
            data-testid="locked-icon"
            className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-slate-400 border-2 border-white flex items-center justify-center text-white shadow-xs"
          >
            <Lock className="w-3.5 h-3.5" />
          </span>
        )}
      </button>

      {/* Completed Stars Rating Display */}
      {isCompleted && (
        <div
          data-testid={`node-stars-${game.id}`}
          className="flex items-center justify-center gap-1 mt-2"
          aria-label={`${stars} of 3 stars earned`}
        >
          {[1, 2, 3].map((starNum) => (
            <Star
              key={starNum}
              className={`w-4 h-4 transition-colors ${
                starNum <= stars
                  ? 'fill-amber-400 text-amber-400 drop-shadow-xs'
                  : 'fill-slate-200 text-slate-300'
              }`}
            />
          ))}
        </div>
      )}

      {/* Game Title & Category Subtext */}
      <div className="mt-2 space-y-0.5">
        <h3 className="text-xs sm:text-sm font-bold text-slate-800 line-clamp-1">
          {game.name}
        </h3>
        <p className={`text-[11px] font-semibold ${
          isCompleted   ? 'text-emerald-700'
          : isActive    ? 'text-amber-700'
          : isInProgress ? 'text-teal-700'
          : 'text-slate-400'
        }`}>
          {isCompleted ? 'Completed' : isActive ? 'Next Up' : isInProgress ? 'Resume' : 'Locked'}
        </p>
      </div>
    </div>
  );
}
