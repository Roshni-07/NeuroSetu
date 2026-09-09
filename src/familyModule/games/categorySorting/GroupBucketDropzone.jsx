import React, { useState } from 'react';

/**
 * GroupBucketDropzone
 * An interactive destination bucket.
 * Supports:
 * 1. HTML5 onDrop
 * 2. Click-to-place when a card is selected
 */
const GroupBucketDropzone = ({
  categoryName,
  icon = '📁',
  placedMembers = [],
  onDropMember,
  isTargetActive = false, // When a card is currently selected, buckets glow invitingly
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
    const memberId = e.dataTransfer.getData('text/plain');
    if (memberId && onDropMember) {
      onDropMember(memberId, categoryName);
    }
  };

  const handleClick = () => {
    if (onDropMember) {
      onDropMember(null, categoryName);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      className={`
        flex-1 min-w-[220px] p-4 rounded-3xl border-2 border-dashed transition-all duration-300
        flex flex-col min-h-[220px] cursor-pointer
        ${
          isDragOver
            ? 'border-patient-accent bg-patient-accent-light/80 scale-[1.02] shadow-soft-lg'
            : isTargetActive
            ? 'border-patient-accent/60 bg-patient-accent-light/30 shadow-soft animate-pulse'
            : 'border-patient-border bg-patient-surface shadow-soft hover:border-patient-accent/40'
        }
      `}
      role="region"
      aria-label={`Bucket: ${categoryName}. Tap here or drop card here to sort.`}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-patient-border">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{icon}</span>
          <h4 className="font-bold text-patient-primary text-base sm:text-lg">{categoryName}</h4>
        </div>
        <span className="text-xs font-bold px-2.5 py-1 bg-patient-canvas rounded-full text-patient-secondary border border-patient-border">
          {placedMembers.length} {placedMembers.length === 1 ? 'person' : 'people'}
        </span>
      </div>

      {/* Target hint for elderly users */}
      {isTargetActive && placedMembers.length === 0 && (
        <div className="text-center py-4 text-patient-accent font-semibold text-sm">
          👉 Tap here to place card
        </div>
      )}

      {/* Placed Members Avatar Cloud */}
      <div className="flex-1 flex flex-wrap gap-2 content-start py-3">
        {placedMembers.map((m) => (
          <div
            key={m.id}
            className="flex items-center gap-2 px-3 py-1.5 bg-patient-canvas rounded-full border border-patient-border-subtle shadow-sm animate-pop-in"
          >
            <img src={m.photoUrl} alt={m.name} className="w-6 h-6 rounded-full object-cover" />
            <span className="text-xs font-semibold text-patient-primary">{m.name}</span>
          </div>
        ))}
        {placedMembers.length === 0 && !isTargetActive && (
          <div className="w-full h-24 flex items-center justify-center text-patient-muted text-sm italic">
            Drop or tap to place members here
          </div>
        )}
      </div>

      {/* Subtle guide */}
      <div className="text-center text-xs text-patient-muted font-medium pt-2 border-t border-patient-border-subtle">
        {isTargetActive ? 'Tap here to put selected person in this group' : 'Drag or tap to sort'}
      </div>

      <style>{`
        @keyframes pop-in {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-pop-in {
          animation: pop-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
      `}</style>
    </div>
  );
};

export default GroupBucketDropzone;

