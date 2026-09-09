import React from 'react';

const ProgressRewardHeader = ({ currentStep, totalSteps, streak = 0, message = "Let's begin!" }) => {
  const progressPercent = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0;

  return (
    <div className="w-full bg-patient-surface shadow-soft rounded-2xl p-4 mb-6 flex flex-col gap-3">
      <div className="flex justify-between items-center">
        {/* Step Indicator */}
        <div className="text-patient-secondary font-medium">
          Step {currentStep} of {totalSteps}
        </div>
        
        {/* Streak / Encouragement text */}
        <div className="flex items-center gap-3">
          <div className="text-patient-primary font-semibold text-lg">
            {message}
          </div>
          {streak > 1 && (
            <div className="bg-patient-teal-light text-patient-teal font-bold px-3 py-1 rounded-full flex items-center gap-1 animate-bounce">
              <span>🔥</span> {streak} Streak!
            </div>
          )}
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="w-full bg-patient-canvas rounded-full h-3 overflow-hidden border border-patient-border">
        <div 
          className="bg-patient-accent h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressRewardHeader;

