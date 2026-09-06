import React from 'react';
import { sounds } from '../utils/soundEffects.js';

/**
 * FlipCard - 3D card-flip matching component
 * 
 * Back face features an authentic North-East textile motif (Gamusa border / weave styling).
 * Large accessible touch target (min 80px x 88px).
 * Sound effect triggers on flip.
 */
export default function FlipCard({
  id,
  isFlipped = false,
  isMatched = false,
  onClick,
  icon = '📯',
  label = '',
  disabled = false,
  className = ''
}) {
  const handleClick = () => {
    if (disabled || isFlipped || isMatched) return;
    sounds.playCardFlip();
    if (onClick) {
      onClick(id);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`relative w-full aspect-square max-w-[140px] select-none perspective-1000 cursor-pointer ${
        disabled || isMatched ? 'cursor-default' : 'active:scale-95'
      } ${className}`}
      role="button"
      tabIndex={disabled || isMatched ? -1 : 0}
      aria-label={isFlipped || isMatched ? label : 'Hidden card'}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <div
        className={`w-full h-full rounded-2xl transition-transform duration-500 transform-style-3d shadow-md ${
          isFlipped || isMatched ? 'rotate-y-180' : ''
        }`}
      >
        {/* Card Back (Hidden state with NER Gamusa/Textile inspired pattern) */}
        <div className="absolute inset-0 w-full h-full rounded-2xl backface-hidden bg-gradient-to-br from-teal-700 via-red-800 to-rose-900 border-3 border-teal-300 flex flex-col items-center justify-center p-2 text-white shadow-inner overflow-hidden">
          {/* Traditional Geometric Weave Motif */}
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]" />
          <div className="w-12 h-12 rounded-full border-2 border-teal-300/60 flex items-center justify-center mb-1">
            <span className="text-2xl opacity-90">❖</span>
          </div>
          <span className="text-xs font-bold tracking-widest text-teal-200 uppercase">
            NER Mat
          </span>
        </div>

        {/* Card Front (Revealed state) */}
        <div
          className={`absolute inset-0 w-full h-full rounded-2xl backface-hidden rotate-y-180 border-3 flex flex-col items-center justify-center p-3 text-center transition-colors ${
            isMatched
              ? 'bg-emerald-50 border-emerald-600 ring-4 ring-emerald-500/20'
              : 'bg-white border-teal-600 shadow-lg'
          }`}
        >
          <span className="text-4xl sm:text-5xl mb-1 transform transition-transform hover:scale-110">
            {icon}
          </span>
          <span className="text-base sm:text-lg font-bold text-slate-900 leading-tight line-clamp-2">
            {label}
          </span>
          {isMatched && (
            <span className="mt-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
              ✓ Pair
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
