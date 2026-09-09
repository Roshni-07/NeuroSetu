import React from 'react';
import RearrangeableSlot from './RearrangeableSlot';

/**
 * TimelineTrack
 * Visual progression track showing chronological slots from earliest to latest.
 */
const TimelineTrack = ({
  slots = [],
  selectedCardId = null,
  onDropEvent,
  onSlotClick,
  onSelectEvent,
  isRevealed = false,
  results = {},
}) => {
  return (
    <div className="w-full bg-patient-canvas/80 p-4 sm:p-6 rounded-3xl border border-patient-border shadow-inner">
      {/* Time Arrow Header */}
      <div className="flex items-center justify-between px-2 mb-4 text-xs font-bold text-patient-secondary">
        <span className="flex items-center gap-1">
          <span>🌅</span> Youth / Early Days
        </span>
        <div className="flex-1 mx-4 h-0.5 bg-patient-border-strong relative hidden sm:block">
          <span className="absolute right-0 -top-1.5 text-patient-border-strong">▶</span>
        </div>
        <span className="flex items-center gap-1">
          <span>🌄</span> Mature Years & Present
        </span>
      </div>

      {/* Horizontal / Wrapped Scroll Track */}
      <div className="flex items-stretch gap-4 overflow-x-auto pb-4 pt-2">
        {slots.map((event, idx) => {
          const isCorrect = results[idx]?.isCorrect ?? null;

          return (
            <div key={idx} className="flex items-center gap-2 shrink-0">
              <RearrangeableSlot
                index={idx}
                totalSlots={slots.length}
                event={event}
                isTargetActive={!!selectedCardId}
                onDropEvent={onDropEvent}
                onSlotClick={onSlotClick}
                onSelectEvent={onSelectEvent}
                isRevealed={isRevealed}
                isCorrectPosition={isCorrect}
              />
              {idx < slots.length - 1 && (
                <div className="text-patient-muted font-bold text-xl px-1 select-none hidden sm:block">
                  →
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TimelineTrack;

