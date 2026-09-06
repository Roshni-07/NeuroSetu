import React from 'react';
import { sounds } from '../utils/soundEffects.js';

/**
 * TapSelectGrid - Accessible grid of items for recall & categorization
 * 
 * Tuned for elderly motor skills:
 * - Minimum 56px touch target height
 * - Large 18px+ typography
 * - High contrast visual feedback and checkmark badges
 * - Gentle tactile sound feedback on tap
 */
export default function TapSelectGrid({
  items = [],
  selectedIds = [],
  onToggle,
  disabled = false,
  columns = 2,
  maxSelect = null,
  language = 'en',
  showCheckmarks = true,
  className = ''
}) {
  const isSelected = (id) => {
    if (Array.isArray(selectedIds)) {
      return selectedIds.includes(id);
    }
    return selectedIds === id;
  };

  const handleItemClick = (id) => {
    if (disabled) return;
    sounds.playGentleTap();
    if (onToggle) {
      onToggle(id);
    }
  };

  const getColClass = () => {
    if (columns === 1) return 'grid-cols-1';
    if (columns === 3) return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3';
    if (columns === 4) return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4';
    return 'grid-cols-1 sm:grid-cols-2';
  };

  return (
    <div className={`grid ${getColClass()} gap-4 w-full ${className}`} role="group">
      {items.map((item) => {
        const active = isSelected(item.id);
        const reachedMax = maxSelect && !active && Array.isArray(selectedIds) && selectedIds.length >= maxSelect;

        return (
          <button
            key={item.id}
            type="button"
            disabled={disabled || reachedMax}
            onClick={() => handleItemClick(item.id)}
            aria-pressed={active}
            className={`relative flex items-center p-4 rounded-2xl text-left transition-all duration-150 min-h-[80px] select-none border-2 active:scale-[0.98] ${
              active
                ? 'bg-teal-50 border-teal-700 shadow-md ring-2 ring-teal-600/30'
                : 'bg-white border-slate-300 hover:border-teal-500 hover:bg-slate-50 shadow-sm'
            } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'} ${
              reachedMax ? 'opacity-40 cursor-not-allowed' : ''
            }`}
          >
            {/* Left Icon / Avatar */}
            {item.icon && (
              <div
                className={`flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center text-3xl mr-4 transition-colors ${
                  active ? 'bg-teal-100 text-teal-900' : 'bg-teal-50 text-slate-800'
                }`}
              >
                {item.icon}
              </div>
            )}

            {/* Label & Subtitle */}
            <div className="flex-1 min-w-0 pr-2">
              <div className="text-lg font-bold text-slate-900 leading-snug">
                {item.label || item.name}
              </div>
              {item.subtext && (
                <div className="text-base text-slate-600 mt-1 leading-normal font-medium">
                  {item.subtext}
                </div>
              )}
            </div>
            {/* Selection Checkmark Badge */}
            {showCheckmarks && (
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                  active
                    ? 'bg-teal-700 border-teal-700 text-white shadow-sm'
                    : 'border-slate-300 bg-slate-50 text-transparent'
                }`}
                aria-hidden="true"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="3"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
