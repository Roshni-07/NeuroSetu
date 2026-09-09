import React, { useState } from 'react';
import EventCard from './EventCard';

/**
 * RearrangeableSlot
 * Position slot along the timeline (e.g. Step 1, 2, 3...).
 * Supports dropping and clicking to insert/swap selected cards.
 */
const RearrangeableSlot = ({
  index,
  totalSlots,
  event = null,
  isTargetActive = false,
  onDropEvent,
  onSlotClick,
  onSelectEvent,
  isRevealed = false,
  isCorrectPosition = null,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const eventId = e.dataTransfer.getData('text/plain');
    if (eventId && onDropEvent) {
      onDropEvent(eventId, index);
    }
  };

  const label =
    index === 0
      ? 'Earliest Memory'
      : index === totalSlots - 1
      ? 'Recent Life Chapter'
      : `Chapter ${index + 1}`;

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => onSlotClick && onSlotClick(index)}
      className={`
        relative flex flex-col items-center justify-start p-3 rounded-3xl border-2 transition-all duration-300
        min-w-[240px] sm:min-w-[270px] min-h-[220px] cursor-pointer
        ${
          isDragOver
            ? 'border-patient-accent bg-patient-accent-light scale-105 shadow-soft-lg'
            : isTargetActive && !event
            ? 'border-patient-accent/70 bg-patient-accent-light/40 border-dashed animate-pulse'
            : event
            ? 'border-patient-border bg-patient-surface shadow-soft'
            : 'border-patient-border-strong border-dashed bg-patient-canvas/70 hover:border-patient-accent/50'
        }
      `}
      role="region"
      aria-label={`Slot ${index + 1}: ${label}`}
    >
      {/* Ordinal Step Badge */}
      <div className="w-full flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-patient-secondary bg-patient-canvas px-3 py-1 rounded-full border border-patient-border">
          {index + 1}. {label}
        </span>
        {isTargetActive && !event && (
          <span className="text-[11px] font-bold text-patient-accent">
            Tap here to place
          </span>
        )}
      </div>

      {/* Content */}
      <div className="w-full flex-1 flex items-center justify-center">
        {event ? (
          <EventCard
            event={event}
            onSelect={() => onSelectEvent && onSelectEvent(event)}
            isRevealed={isRevealed}
            isCorrectPosition={isCorrectPosition}
            compact={true}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-4">
            <div className="w-10 h-10 rounded-full bg-patient-canvas border border-patient-border-strong flex items-center justify-center text-patient-muted text-xl font-bold mb-2">
              ↓
            </div>
            <p className="text-xs font-semibold text-patient-secondary">
              Place event here
            </p>
            <p className="text-[10px] text-patient-muted">
              Tap or drag to position
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RearrangeableSlot;

