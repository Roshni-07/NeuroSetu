import React from 'react';

/**
 * BlurredImageRevealContainer
 * Allows progressive reveal of the photo either via an accessible tap button or a slider.
 * Tailored for elderly users with zero fine motor strain.
 */
const BlurredImageRevealContainer = ({
  photoUrl,
  name,
  blurPercentage = 100, // 100 is fully blurred, 0 is clear
  onIncreaseClarity,
  onResetClarity,
  isRevealed = false,
}) => {
  // Compute blur pixel value based on percentage (from ~20px blur down to 0px)
  const blurPx = isRevealed ? 0 : Math.round((blurPercentage / 100) * 22);

  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto bg-patient-surface p-4 rounded-2xl shadow-soft border border-patient-border">
      {/* Photo Frame */}
      <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-2xl overflow-hidden shadow-inner bg-patient-canvas border-2 border-patient-border-subtle flex items-center justify-center">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={name ? `Mystery family member: ${name}` : 'Family member'}
            style={{ filter: `blur(${blurPx}px)` }}
            className="w-full h-full object-cover transition-all duration-300 select-none pointer-events-none"
          />
        ) : (
          <div className="text-4xl text-patient-muted font-bold">?</div>
        )}

        {/* Floating Clarity Badge */}
        <div className="absolute top-2 right-2 bg-patient-primary/80 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow">
          {isRevealed ? 'Revealed' : `${100 - blurPercentage}% Clear`}
        </div>
      </div>

      {/* Progressive Reveal Controls */}
      {!isRevealed && (
        <div className="w-full mt-4 flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm text-patient-secondary font-medium px-1">
            <span>Photo Clarity</span>
            <span>{blurPercentage <= 0 ? 'Fully Sharp' : 'Blurred'}</span>
          </div>

          {/* Accessible Large Tap Button */}
          <button
            type="button"
            onClick={onIncreaseClarity}
            disabled={blurPercentage <= 0}
            className={`
              w-full py-3 px-4 rounded-xl font-semibold text-base flex items-center justify-center gap-2
              min-h-touch transition-all shadow-soft
              ${
                blurPercentage <= 0
                  ? 'bg-patient-border-subtle text-patient-muted cursor-not-allowed'
                  : 'bg-patient-accent-light text-patient-accent hover:bg-patient-accent hover:text-white active:scale-95'
              }
            `}
          >
            <span>🔍</span>
            <span>{blurPercentage <= 0 ? 'Photo is completely clear' : 'Tap to Make Clearer (+25%)'}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default BlurredImageRevealContainer;

