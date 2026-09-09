import React from 'react';

/**
 * SequentialStepper
 * Step controls and indicators with extra-large accessible tap targets.
 */
const SequentialStepper = ({
  currentIndex,
  totalItems,
  onPrevious,
  onNext,
  canGoNext = false,
  isLast = false,
}) => {
  return (
    <div className="w-full max-w-md mx-auto flex items-center justify-between gap-4 mt-6">
      <button
        type="button"
        onClick={onPrevious}
        disabled={currentIndex === 0}
        className={`
          flex-1 py-3 px-4 rounded-xl font-semibold text-base min-h-touch border-2 transition-all flex items-center justify-center gap-2
          ${
            currentIndex === 0
              ? 'opacity-40 bg-patient-border-subtle border-transparent text-patient-muted cursor-not-allowed'
              : 'bg-white border-patient-border text-patient-primary hover:bg-patient-canvas active:scale-95'
          }
        `}
      >
        <span>←</span>
        <span>Previous</span>
      </button>

      <button
        type="button"
        onClick={onNext}
        disabled={!canGoNext}
        className={`
          flex-1 py-3 px-4 rounded-xl font-semibold text-base min-h-touch transition-all flex items-center justify-center gap-2 shadow-soft
          ${
            !canGoNext
              ? 'bg-patient-border-subtle text-patient-muted cursor-not-allowed'
              : isLast
              ? 'bg-patient-success text-white hover:bg-patient-success/90 active:scale-95'
              : 'bg-patient-accent text-white hover:bg-patient-accent-hover active:scale-95'
          }
        `}
      >
        <span>{isLast ? 'Complete Exercise 🎉' : 'Next Person →'}</span>
      </button>
    </div>
  );
};

export default SequentialStepper;

