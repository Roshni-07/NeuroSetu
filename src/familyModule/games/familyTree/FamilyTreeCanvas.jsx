import React from 'react';
import GenerationNodeSlot from './GenerationNodeSlot';

/**
 * FamilyTreeCanvas
 * Organizes generations into structured, visually connected tiers.
 */
const FamilyTreeCanvas = ({
  generationsConfig = [],
  treeSlots = [],
  allMembers = [],
  activeSlot = null,
  onSlotClick,
  onRemoveMember,
}) => {
  // Helper to find member by id
  const getMember = (id) => allMembers.find((m) => m.id === id) || null;

  return (
    <div className="w-full bg-patient-canvas/60 rounded-3xl p-4 sm:p-8 border-2 border-patient-border shadow-inner overflow-x-auto">
      <div className="min-w-[500px] flex flex-col items-center gap-10 relative">
        {generationsConfig.map((genTier, tierIdx) => {
          // Find slots belonging to this generation
          const slotsForTier = treeSlots.filter((s) => s.generation === genTier.generation);

          return (
            <div key={genTier.generation} className="w-full flex flex-col items-center relative">
              {/* Generation Header Pill */}
              <div className="flex items-center gap-2 mb-4 bg-white/90 backdrop-blur-xs px-4 py-1.5 rounded-full border border-patient-border shadow-xs">
                <span className="text-base">{genTier.icon}</span>
                <h4 className="font-bold text-xs sm:text-sm text-patient-primary">
                  {genTier.title}
                </h4>
                <span className="text-[11px] text-patient-muted bg-patient-canvas px-2 py-0.5 rounded-full">
                  {slotsForTier.filter((s) => !!s.memberId).length} / {slotsForTier.length} Placed
                </span>
              </div>

              {/* Node Slots Row */}
              <div className="flex items-center justify-center gap-4 sm:gap-8 flex-wrap">
                {slotsForTier.map((slot) => {
                  const member = getMember(slot.memberId);
                  const isSelected =
                    activeSlot?.generation === slot.generation &&
                    activeSlot?.position === slot.position;

                  return (
                    <GenerationNodeSlot
                      key={`${slot.generation}-${slot.position}`}
                      generation={slot.generation}
                      position={slot.position}
                      member={member}
                      isSelectedSlot={isSelected}
                      onSlotClick={onSlotClick}
                      onRemoveMember={onRemoveMember}
                    />
                  );
                })}
              </div>

              {/* Generational Connector Line (if not last tier) */}
              {tierIdx < generationsConfig.length - 1 && (
                <div className="w-1 h-6 bg-patient-border-strong rounded-full my-2"></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FamilyTreeCanvas;

