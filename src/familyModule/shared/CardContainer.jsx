import React from 'react';

const CardContainer = ({
  photoUrl,
  name,
  hintOverlay, // true/false or a react node
  state = 'default', // 'default', 'selected', 'correct', 'incorrect'
  onClick,
  className = '',
  size = 'md', // 'sm', 'md', 'lg'
}) => {
  const stateStyles = {
    default: 'bg-white border-patient-border shadow-soft',
    selected: 'bg-patient-accent-light border-patient-accent border-2 shadow-soft-md',
    correct: 'bg-patient-success-light border-patient-success border-2 shadow-soft-md',
    incorrect: 'bg-patient-rose-light border-patient-rose border-2 shadow-soft-md opacity-80',
  };

  const sizeStyles = {
    sm: 'w-24 h-32',
    md: 'w-36 h-48',
    lg: 'w-48 h-64',
  };

  const imgSizeStyles = {
    sm: 'h-16',
    md: 'h-28',
    lg: 'h-40',
  };

  return (
    <button
      onClick={onClick}
      disabled={state === 'correct'}
      className={`
        relative rounded-xl overflow-hidden flex flex-col items-center justify-start
        transition-all duration-300 ease-in-out cursor-pointer focus:outline-none focus:ring-4 focus:ring-patient-accent/50
        min-h-touch min-w-touch
        ${sizeStyles[size]}
        ${stateStyles[state] || stateStyles.default}
        ${className}
      `}
      aria-label={name ? `Card for ${name}` : 'Card'}
    >
      <div className={`w-full relative bg-patient-canvas ${imgSizeStyles[size]}`}>
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={name || "Avatar"}
            className={`w-full h-full object-cover ${hintOverlay === true ? 'blur-md' : ''}`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-patient-muted text-white text-3xl font-bold">
            {name ? name.charAt(0).toUpperCase() : '?'}
          </div>
        )}
        
        {hintOverlay && typeof hintOverlay !== 'boolean' && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-2 text-white text-center text-sm font-medium">
            {hintOverlay}
          </div>
        )}
      </div>
      
      <div className="w-full flex-grow flex items-center justify-center p-2 text-center bg-white">
        <span className="font-semibold text-patient-primary line-clamp-2 leading-tight">
          {name || 'Unknown'}
        </span>
      </div>
      
      {/* Correct State Indicator (Checkmark) */}
      {state === 'correct' && (
        <div className="absolute top-2 right-2 bg-patient-success text-white rounded-full p-1 shadow-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
      )}
    </button>
  );
};

export default CardContainer;

