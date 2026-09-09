import React from 'react';

/**
 * GenerationNodeSlot
 * Represents one node position in the family tree.
 * Can be empty (inviting a tap) or filled with a member card.
 */
const GenerationNodeSlot = ({
  generation,
  position,
  member = null,
  isSelectedSlot = false,
  onSlotClick,
  onRemoveMember,
}) => {
  if (!member) {
    return (
      <button
        type="button"
        onClick={() => onSlotClick(generation, position)}
        className={`
          w-28 sm:w-36 h-36 sm:h-44 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-3
          transition-all duration-200 cursor-pointer min-h-touch min-w-touch
          ${
            isSelectedSlot
              ? 'border-patient-accent bg-patient-accent-light/80 shadow-soft-lg ring-4 ring-patient-accent/30 scale-105'
              : 'border-patient-border-strong bg-white/70 hover:border-patient-accent hover:bg-patient-accent-light/30 shadow-soft'
          }
        `}
        aria-label={`Empty slot in row ${generation + 1}, position ${position + 1}. Tap to choose a family member.`}
      >
        <div className="w-12 h-12 rounded-full bg-patient-canvas border border-patient-border flex items-center justify-center text-patient-accent text-2xl font-bold mb-2 shadow-inner">
          +
        </div>
        <span className="text-xs sm:text-sm font-semibold text-patient-secondary text-center">
          Tap to Place
        </span>
      </button>
    );
  }

  // Filled State
  return (
    <div
      className="relative w-28 sm:w-36 h-36 sm:h-44 rounded-2xl bg-white border-2 border-patient-accent/60 shadow-soft-md flex flex-col items-center justify-between p-2.5 transition-all duration-300 animate-pop-in"
    >
      {/* Remove / Change button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemoveMember(generation, position);
        }}
        className="absolute -top-2 -right-2 w-7 h-7 bg-white text-patient-muted hover:text-patient-rose border border-patient-border rounded-full flex items-center justify-center shadow-sm text-sm font-bold transition-colors"
        title="Remove from slot"
        aria-label={`Remove ${member.name} from tree`}
      >
        ✕
      </button>

      {/* Member Photo */}
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-patient-accent shadow-sm bg-patient-canvas">
        <img
          src={member.photoUrl}
          alt={member.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Info */}
      <div className="w-full text-center mt-1">
        <h5 className="font-bold text-xs sm:text-sm text-patient-primary line-clamp-1">
          {member.name}
        </h5>
        <span className="text-[11px] font-medium text-patient-accent bg-patient-accent-light px-2 py-0.5 rounded-full inline-block mt-0.5">
          {member.relationship}
        </span>
      </div>

      <style>{`
        @keyframes pop-in {
          0% { transform: scale(0.85); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-pop-in {
          animation: pop-in 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
      `}</style>
    </div>
  );
};

export default GenerationNodeSlot;

