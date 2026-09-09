import React, { useState } from 'react';

/**
 * MemberDrawer
 * Slide-over / modal drawer displaying remaining unplaced family members.
 */
const MemberDrawer = ({
  isOpen = false,
  onClose,
  unplacedMembers = [],
  onSelectMember,
  targetGeneration = null, // Generation of the slot that was tapped
}) => {
  const [filterGen, setFilterGen] = useState('all');

  if (!isOpen) return null;

  // Filter members if user toggles filter
  const displayedMembers = unplacedMembers.filter((m) => {
    if (filterGen === 'all') return true;
    return m.generation.toString() === filterGen;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-xs transition-opacity animate-fade-in">
      <div className="bg-white w-full sm:max-w-2xl max-h-[85vh] rounded-t-3xl sm:rounded-3xl shadow-soft-xl flex flex-col overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="p-5 border-b border-patient-border flex items-center justify-between bg-patient-canvas">
          <div>
            <h3 className="text-xl font-bold text-patient-primary flex items-center gap-2">
              <span>👥</span> Choose a Family Member
            </h3>
            <p className="text-xs sm:text-sm text-patient-secondary mt-0.5">
              Tap a relative to place them into the selected branch
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white border border-patient-border flex items-center justify-center text-patient-muted hover:text-patient-primary font-bold text-lg shadow-xs"
            aria-label="Close drawer"
          >
            ✕
          </button>
        </div>

        {/* Filter Pills */}
        <div className="px-5 py-3 border-b border-patient-border-subtle bg-white flex items-center gap-2 overflow-x-auto">
          <span className="text-xs font-semibold text-patient-muted shrink-0">Filter:</span>
          {[
            { id: 'all', label: 'All Relatives' },
            { id: '-1', label: 'Parents / Elders' },
            { id: '0', label: 'Self & Siblings' },
            { id: '1', label: 'Children' },
            { id: '2', label: 'Grandchildren' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterGen(tab.id)}
              className={`
                px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all
                ${
                  filterGen === tab.id
                    ? 'bg-patient-accent text-white shadow-xs'
                    : 'bg-patient-canvas text-patient-secondary hover:bg-patient-border-subtle'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* List of unplaced members */}
        <div className="p-5 overflow-y-auto flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[50vh]">
          {displayedMembers.map((member) => {
            const isMatch = targetGeneration !== null && member.generation === targetGeneration;
            return (
              <button
                key={member.id}
                type="button"
                onClick={() => onSelectMember(member)}
                className={`
                  flex items-center gap-3 p-3.5 rounded-2xl border-2 text-left transition-all min-h-touch
                  ${
                    isMatch
                      ? 'border-patient-accent/40 bg-patient-accent-light/30 hover:border-patient-accent hover:bg-patient-accent-light/70'
                      : 'border-patient-border bg-white hover:border-patient-border-strong hover:bg-patient-canvas'
                  }
                `}
              >
                <img
                  src={member.photoUrl}
                  alt={member.name}
                  className="w-14 h-14 rounded-full object-cover border border-patient-border shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-patient-primary text-base truncate">
                    {member.name}
                  </h4>
                  <p className="text-xs text-patient-accent font-semibold">
                    {member.relationship}
                  </p>
                  <p className="text-[11px] text-patient-muted truncate mt-0.5">
                    {member.category}
                  </p>
                </div>
                {isMatch && (
                  <span className="text-[10px] font-bold bg-patient-accent text-white px-2 py-0.5 rounded-full shrink-0">
                    Fits Row
                  </span>
                )}
              </button>
            );
          })}

          {displayedMembers.length === 0 && (
            <div className="col-span-full py-12 text-center text-patient-secondary italic">
              No unplaced family members in this section.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-patient-border bg-patient-canvas flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-white border border-patient-border rounded-xl font-bold text-patient-secondary hover:bg-patient-border-subtle"
          >
            Cancel
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  );
};

export default MemberDrawer;

