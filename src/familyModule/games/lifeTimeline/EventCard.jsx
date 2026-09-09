import React from 'react';

/**
 * EventCard
 * Represents a life story event.
 * Can be dragged or tapped to place into a timeline slot.
 */
const EventCard = ({
  event,
  isSelected = false,
  onSelect,
  isRevealed = false,
  actualOrderIndex = null,
  isCorrectPosition = null, // true | false | null
  compact = false,
}) => {
  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', event.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={() => onSelect && onSelect(event)}
      className={`
        relative rounded-2xl p-4 transition-all duration-200 cursor-pointer select-none
        border-2 flex flex-col justify-between shadow-soft min-h-touch
        ${
          isSelected
            ? 'border-patient-accent bg-patient-accent-light ring-4 ring-patient-accent/30 shadow-soft-lg scale-[1.02]'
            : 'border-patient-border bg-white hover:border-patient-accent/50 hover:shadow-soft-md'
        }
        ${compact ? 'w-56 min-h-[140px]' : 'w-full max-w-sm min-h-[150px]'}
      `}
      role="button"
      tabIndex={0}
      aria-label={`Event: ${event.title}. ${isRevealed ? `Year: ${event.date}` : ''}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onSelect && onSelect(event);
        }
      }}
    >
      <div>
        {/* Top bar with Tag / Date */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-xs font-bold text-patient-accent bg-patient-accent-light px-2.5 py-0.5 rounded-full">
            📖 Life Story
          </span>

          {isRevealed ? (
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                isCorrectPosition
                  ? 'bg-patient-success-light text-patient-success'
                  : 'bg-patient-teal-light text-patient-teal'
              }`}
            >
              📅 {event.date}
            </span>
          ) : (
            <span className="text-xs font-semibold text-patient-muted bg-patient-canvas px-2 py-0.5 rounded-full">
              Year: ???
            </span>
          )}
        </div>

        {/* Title */}
        <h4 className="font-bold text-patient-primary text-base leading-snug line-clamp-2">
          {event.title}
        </h4>

        {/* Description */}
        <p className="text-xs text-patient-secondary mt-1.5 line-clamp-3 leading-relaxed">
          {event.description}
        </p>
      </div>

      {/* Gentle Result Badge on Reveal */}
      {isRevealed && isCorrectPosition !== null && (
        <div className="mt-3 pt-2 border-t border-patient-border-subtle flex items-center justify-between text-xs">
          {isCorrectPosition ? (
            <span className="text-patient-success font-bold flex items-center gap-1">
              ✓ In Perfect Order
            </span>
          ) : (
            <span className="text-patient-teal font-medium flex items-center gap-1">
              🌱 Occurred around {event.date}
            </span>
          )}
        </div>
      )}

      {/* Selected Indicator */}
      {isSelected && (
        <span className="absolute -top-2 -right-2 bg-patient-accent text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow">
          Active
        </span>
      )}
    </div>
  );
};

export default EventCard;

