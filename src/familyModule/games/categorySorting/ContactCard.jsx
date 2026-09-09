import React from 'react';

/**
 * ContactCard
 * Represents a member card to be categorized.
 * Supports HTML5 Drag-and-Drop and Tap-to-Select.
 */
const ContactCard = ({
  member,
  isSelected = false,
  onSelect,
  isShaking = false,
}) => {
  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', member.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={() => onSelect && onSelect(member)}
      className={`
        relative flex flex-col items-center justify-center p-3 bg-white rounded-2xl border-2
        cursor-pointer select-none transition-all duration-200 min-w-touch min-h-touch
        ${
          isSelected
            ? 'border-patient-accent bg-patient-accent-light shadow-soft-lg scale-105 ring-4 ring-patient-accent/30'
            : 'border-patient-border shadow-soft hover:border-patient-border-strong hover:shadow-soft-md'
        }
        ${isShaking ? 'animate-gentle-shake' : ''}
      `}
      style={{ width: '130px', height: '155px' }}
      aria-label={`Member ${member.name}. Tap to select or drag into a bucket.`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onSelect && onSelect(member);
        }
      }}
    >
      {/* Photo */}
      <div className="w-16 h-16 rounded-full overflow-hidden mb-2 border-2 border-patient-border bg-patient-canvas">
        <img
          src={member.photoUrl}
          alt={member.name}
          className="w-full h-full object-cover pointer-events-none"
        />
      </div>

      {/* Name */}
      <span className="font-bold text-sm text-patient-primary text-center line-clamp-1">
        {member.name}
      </span>

      {/* Subtle relationship indicator */}
      <span className="text-xs text-patient-secondary text-center line-clamp-1">
        {member.relationship}
      </span>

      {/* Selected Indicator Pill */}
      {isSelected && (
        <span className="absolute -top-2 bg-patient-accent text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-sm">
          Selected
        </span>
      )}

      <style>{`
        @keyframes gentle-shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          75% { transform: translateX(6px); }
        }
        .animate-gentle-shake {
          animation: gentle-shake 0.4s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default ContactCard;

