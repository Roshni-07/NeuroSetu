import React, { useState, useEffect, useMemo, useRef } from 'react';
import { familyDataService } from '../../data/familyDataService';
import ProgressRewardHeader from '../../shared/ProgressRewardHeader';
import DynamicHintDrawer from '../../shared/DynamicHintDrawer';
import FamilyTreeCanvas from './FamilyTreeCanvas';
import MemberDrawer from './MemberDrawer';

const GENERATIONS_CONFIG = [
  { generation: -1, title: 'Parents & Elders', icon: '👴👵' },
  { generation: 0, title: 'Self, Spouse & Siblings', icon: '👨👩' },
  { generation: 1, title: 'Children & Spouses', icon: '🧑👧' },
  { generation: 2, title: 'Grandchildren', icon: '👶' },
];

const FamilyTreeBuilderGame = ({ onBackToMenu, onComplete, patientProfile, profileId, level }) => {
  const [allMembers, setAllMembers] = useState([]);
  const [treeSlots, setTreeSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  const startTime = useRef(Date.now());
  const errorsRef = useRef(0);

  // Interaction State
  const [activeSlot, setActiveSlot] = useState(null); // { generation, position }
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('Tap any empty slot to add a family member');
  const [streak, setStreak] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // Load members and set up slots
  useEffect(() => {
    const initGame = async () => {
      setLoading(true);
      const members = await familyDataService.getMembers();
      setAllMembers(members);

      // Create tree slots layout based on available members per generation
      const slots = [
        { generation: -1, position: 0, memberId: null },
        { generation: -1, position: 1, memberId: null },
        { generation: 0, position: 0, memberId: null },
        { generation: 0, position: 1, memberId: null },
        { generation: 0, position: 2, memberId: null },
        { generation: 1, position: 0, memberId: null },
        { generation: 1, position: 1, memberId: null },
        { generation: 2, position: 0, memberId: null },
      ];

      // Pre-seed 1 or 2 slots (e.g. Self: Bhaben Kalita) to anchor the tree!
      const selfMember = members.find((m) => m.relationship === 'Self' || m.name.includes('Bhaben'));
      if (selfMember) {
        slots[2].memberId = selfMember.id;
      }

      setTreeSlots(slots);
      setLoading(false);
    };
    initGame();
  }, []);

  // Compute placed member IDs
  const placedMemberIds = useMemo(() => {
    return new Set(treeSlots.filter((s) => !!s.memberId).map((s) => s.memberId));
  }, [treeSlots]);

  // Unplaced members
  const unplacedMembers = useMemo(() => {
    return allMembers.filter((m) => !placedMemberIds.has(m.id));
  }, [allMembers, placedMemberIds]);

  const totalSlotsCount = treeSlots.length;
  const filledSlotsCount = placedMemberIds.size;

  // Handle clicking an empty slot
  const handleSlotClick = (generation, position) => {
    setActiveSlot({ generation, position });
    setIsDrawerOpen(true);
  };

  // Handle removing a member from a slot
  const handleRemoveMember = (generation, position) => {
    setTreeSlots((prev) =>
      prev.map((slot) =>
        slot.generation === generation && slot.position === position
          ? { ...slot, memberId: null }
          : slot
      )
    );
    setFeedbackMessage('Member returned to drawer. Pick another relative when ready.');
  };

  // Handle selecting a member from the drawer
  const handleSelectMember = (member) => {
    if (!activeSlot) return;

    // Generational validation
    const targetGen = activeSlot.generation;
    if (member.generation !== targetGen) {
      // Gentle hint without blocking hard
      errorsRef.current += 1;
      const targetConfig = GENERATIONS_CONFIG.find((g) => g.generation === targetGen);
      setFeedbackMessage(
        `Note: ${member.name} (${member.relationship}) belongs in a different row than "${targetConfig?.title}".`
      );
    }

    // Place member into slot
    setTreeSlots((prev) =>
      prev.map((slot) =>
        slot.generation === activeSlot.generation && slot.position === activeSlot.position
          ? { ...slot, memberId: member.id }
          : slot
      )
    );

    setIsDrawerOpen(false);
    setActiveSlot(null);
    setStreak((s) => s + 1);
    setFeedbackMessage(`Lovely! ${member.name} is now woven into the family tree! 🌸`);

    // Check completion
    const newFilledCount = filledSlotsCount + 1;
    if (newFilledCount >= totalSlotsCount) {
      setTimeout(() => {
        setIsCompleted(true);
      }, 700);
    }
  };

  useEffect(() => {
    if (!isCompleted) return;
    const errors = errorsRef.current;
    const accuracy = Math.max(10, Math.round(100 - (errors * 15)));
    const responseTimeMs = Math.max(100, Date.now() - startTime.current);
    const currentLevel = level ? Number(level) : 5;
    const derivedTier = currentLevel <= 3 ? 1 : currentLevel <= 7 ? 2 : 3;

    const result = {
      gameId: 'family_tree',
      accuracy,
      errorCount: errors,
      responseTimeMs,
      latencyMs: responseTimeMs,
      score: accuracy,
      maxScore: 100,
      level: currentLevel,
      sessionLevel: currentLevel,
      tier: derivedTier,
      difficultyTier: derivedTier,
      patientId: profileId || patientProfile?.id || 'demo_patient_001',
      profileId: profileId || patientProfile?.id || 'demo_patient_001',
      totalSlots: totalSlotsCount,
      timestamp: new Date().toISOString()
    };

    if (onComplete) {
      onComplete(result);
    }
  }, [isCompleted, totalSlotsCount, level, onComplete, profileId, patientProfile]);

  const handleResetTree = () => {
    setTreeSlots((prev) =>
      prev.map((slot, idx) => (idx === 2 ? slot : { ...slot, memberId: null }))
    );
    setIsCompleted(false);
    setStreak(0);
    startTime.current = Date.now();
    errorsRef.current = 0;
    setFeedbackMessage('Let’s build the family branches step-by-step.');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[50vh] text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-patient-accent mb-4"></div>
        <p className="text-xl font-medium text-patient-primary">Preparing family tree branches...</p>
      </div>
    );
  }

  // Summary / Completed Tree Celebration
  if (isCompleted) {
    return (
      <div className="max-w-2xl mx-auto p-6 sm:p-8 bg-patient-surface rounded-3xl shadow-soft border border-patient-border text-center">
        <div className="text-6xl mb-3">🌳🌿</div>
        <h2 className="text-3xl font-bold text-patient-primary mb-2">Family Tree Complete!</h2>
        <p className="text-lg text-patient-secondary mb-6">
          Every generation is standing together — connecting the wisdom of elders to the joy of grandchildren.
        </p>

        <div className="bg-patient-accent-light/50 p-4 rounded-2xl mb-8 border border-patient-accent/20 text-patient-primary">
          <p className="font-semibold text-base">
            "A family is like branches on a tree; we all grow in different directions, yet our roots remain as one."
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={handleResetTree}
            className="flex-1 py-4 bg-patient-accent text-white font-bold rounded-xl text-lg hover:bg-patient-accent-hover active:scale-95 transition-all shadow-soft"
          >
            Rebuild Tree
          </button>
          {onBackToMenu && (
            <button
              type="button"
              onClick={onBackToMenu}
              className="flex-1 py-4 bg-patient-canvas border-2 border-patient-border text-patient-primary font-bold rounded-xl text-lg hover:bg-patient-border-subtle active:scale-95 transition-all"
            >
              Back to Games
            </button>
          )}
        </div>
      </div>
    );
  }

  const hintContent = (
    <div>
      <h4 className="font-bold text-patient-primary mb-1">Family Tree Help:</h4>
      <p className="text-sm text-patient-secondary mb-2">
        • Top row: Grandparents & Parents (e.g. Late Khagen & Sabita)
        <br />
        • Middle row: Yourself (Bhaben), your wife Nandita, and brother Pradip
        <br />
        • Lower row: Son Arup & daughter-in-law Rumi
        <br />
        • Bottom row: Grandson Arnab
      </p>
      <p className="text-xs text-patient-accent font-semibold">
        Tap any dashed box with "+" to select who fits into that generation.
      </p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-4">
        {onBackToMenu && (
          <button
            onClick={onBackToMenu}
            className="text-patient-secondary hover:text-patient-primary font-semibold text-sm py-2 px-3 rounded-lg hover:bg-patient-border-subtle"
          >
            ← Back to Game Hub
          </button>
        )}
        <span className="text-xs uppercase tracking-wider font-bold text-patient-accent bg-patient-accent-light px-3 py-1 rounded-full">
          Game 3 • Family Tree Builder
        </span>
      </div>

      {/* Progress & Encouragement */}
      <ProgressRewardHeader
        currentStep={filledSlotsCount}
        totalSteps={totalSlotsCount}
        streak={streak}
        message={feedbackMessage}
      />

      {/* Action Bar */}
      <div className="flex items-center justify-between bg-patient-surface px-5 py-3 rounded-2xl border border-patient-border shadow-soft mb-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🌱</span>
          <div>
            <h3 className="font-bold text-patient-primary text-sm sm:text-base">
              Interactive Family Branches
            </h3>
            <p className="text-xs text-patient-secondary">
              {unplacedMembers.length} relatives remaining to place
            </p>
          </div>
        </div>

        {unplacedMembers.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setActiveSlot(treeSlots.find((s) => !s.memberId) || null);
              setIsDrawerOpen(true);
            }}
            className="px-4 py-2 bg-patient-accent-light text-patient-accent hover:bg-patient-accent hover:text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xs"
          >
            Open Relatives List ({unplacedMembers.length})
          </button>
        )}
      </div>

      {/* Tree Canvas */}
      <FamilyTreeCanvas
        generationsConfig={GENERATIONS_CONFIG}
        treeSlots={treeSlots}
        allMembers={allMembers}
        activeSlot={activeSlot}
        onSlotClick={handleSlotClick}
        onRemoveMember={handleRemoveMember}
      />

      {/* Member Selection Drawer */}
      <MemberDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setActiveSlot(null);
        }}
        unplacedMembers={unplacedMembers}
        onSelectMember={handleSelectMember}
        targetGeneration={activeSlot ? activeSlot.generation : null}
      />

      {/* Inactivity Hint */}
      <DynamicHintDrawer
        hintContent={hintContent}
        inactivitySeconds={15}
      />
    </div>
  );
};

export default FamilyTreeBuilderGame;

