import React, { useState, useEffect, useMemo } from 'react';
import { familyDataService } from '../../data/familyDataService';
import ProgressRewardHeader from '../../shared/ProgressRewardHeader';
import DynamicHintDrawer from '../../shared/DynamicHintDrawer';
import ContactCard from './ContactCard';
import GroupBucketDropzone from './GroupBucketDropzone';

const CategorySortingGame = ({ onBackToMenu }) => {
  const [categories, setCategories] = useState([]);
  const [allMembers, setAllMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Screen phase: 'category_picker' | 'playing' | 'completed'
  const [phase, setPhase] = useState('category_picker');
  const [primaryCategory, setPrimaryCategory] = useState(null);
  const [secondaryCategory, setSecondaryCategory] = useState(null);

  // Sorting Deck
  const [unplacedCards, setUnplacedCards] = useState([]);
  const [bucketPlacements, setBucketPlacements] = useState({}); // { [categoryName]: [member, ...] }
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [shakingCardId, setShakingCardId] = useState(null);

  const [feedbackMessage, setFeedbackMessage] = useState('Sort each person into their rightful group');
  const [streak, setStreak] = useState(0);

  // Interaction mode toggle: 'tap' or 'drag'
  const [interactionMode, setInteractionMode] = useState('tap'); // tap-to-select default with drag enhanced

  // Load data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [cats, mems] = await Promise.all([
        familyDataService.getCategories(),
        familyDataService.getMembers(),
      ]);
      setCategories(cats);
      setAllMembers(mems);
      setLoading(false);
    };
    fetchData();
  }, []);

  // Initialize a round once category is chosen
  const handleStartGameWithCategory = (chosenCat) => {
    setPrimaryCategory(chosenCat);

    // Pick a complementary second category for contrast (e.g. if chosen is 'Immediate Family', pick 'School Friends' or 'Paternal Relatives')
    const otherCats = categories.filter((c) => c !== chosenCat);
    const altCat = otherCats.length > 0 ? otherCats[0] : 'Others';
    setSecondaryCategory(altCat);

    // Members from primary category (up to 4)
    const primaryMembers = allMembers.filter((m) => m.category === chosenCat).slice(0, 4);
    // Members from other categories (2 or 3)
    const otherMembers = allMembers.filter((m) => m.category !== chosenCat).slice(0, 3);

    // Combine and shuffle
    const deck = [...primaryMembers, ...otherMembers].sort(() => 0.5 - Math.random());

    setUnplacedCards(deck);
    setBucketPlacements({
      [chosenCat]: [],
      [altCat]: [],
    });
    setSelectedCardId(null);
    setStreak(0);
    setFeedbackMessage(`Sort the cards: ${chosenCat} vs ${altCat}`);
    setPhase('playing');
  };

  // Currently selected member object
  const selectedCard = useMemo(() => {
    return unplacedCards.find((m) => m.id === selectedCardId) || null;
  }, [unplacedCards, selectedCardId]);

  // Handle card selection (tap mode)
  const handleCardSelect = (member) => {
    if (selectedCardId === member.id) {
      setSelectedCardId(null);
    } else {
      setSelectedCardId(member.id);
      setFeedbackMessage(`Now tap the bucket where ${member.name} belongs`);
    }
  };

  // Perform placement validation
  const handlePlaceCardIntoBucket = (memberIdFromDrag, targetBucketName) => {
    const targetMemberId = memberIdFromDrag || selectedCardId;
    if (!targetMemberId) return;

    const targetMember = unplacedCards.find((m) => m.id === targetMemberId);
    if (!targetMember) return;

    // Check if targetBucketName matches member.category or is suitable
    const isCorrect =
      targetMember.category === targetBucketName ||
      (targetBucketName === secondaryCategory && targetMember.category !== primaryCategory);

    if (isCorrect) {
      // Settle into bucket with soft positive feedback
      setBucketPlacements((prev) => ({
        ...prev,
        [targetBucketName]: [...(prev[targetBucketName] || []), targetMember],
      }));
      const remaining = unplacedCards.filter((m) => m.id !== targetMemberId);
      setUnplacedCards(remaining);
      setSelectedCardId(null);
      setStreak((s) => s + 1);
      setFeedbackMessage(`Yes! ${targetMember.name} belongs in ${targetBucketName}! 🌟`);

      // Check if finished
      if (remaining.length === 0) {
        setTimeout(() => {
          setPhase('completed');
        }, 600);
      }
    } else {
      // Gentle bounce-back: no harsh red error, gentle shake
      setShakingCardId(targetMemberId);
      setStreak(0);
      setFeedbackMessage(`Let's think again about ${targetMember.name}'s relationship.`);
      setTimeout(() => {
        setShakingCardId(null);
      }, 500);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[50vh] text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-patient-accent mb-4"></div>
        <p className="text-xl font-medium text-patient-primary">Loading Family Groups...</p>
      </div>
    );
  }

  // --- Phase 1: Category Picker ---
  if (phase === 'category_picker') {
    return (
      <div className="max-w-xl mx-auto px-4 py-6">
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
            Game 2 • Category Sorting
          </span>
        </div>

        <div className="bg-patient-surface rounded-3xl p-6 sm:p-8 shadow-soft border border-patient-border text-center">
          <div className="text-5xl mb-3">🧺</div>
          <h2 className="text-2xl sm:text-3xl font-bold text-patient-primary mb-2">
            Choose a Group to Sort
          </h2>
          <p className="text-patient-secondary text-base sm:text-lg mb-6">
            Select a family circle or friendship group you would like to explore today:
          </p>

          <div className="grid grid-cols-1 gap-3 text-left">
            {categories.map((cat, idx) => {
              const count = allMembers.filter((m) => m.category === cat).length;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleStartGameWithCategory(cat)}
                  className="flex items-center justify-between p-4 rounded-2xl border-2 border-patient-border hover:border-patient-accent hover:bg-patient-accent-light/40 bg-white transition-all shadow-soft group min-h-touch"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {cat.includes('Family') ? '🏡' : cat.includes('School') ? '🏫' : '🌿'}
                    </span>
                    <div>
                      <h4 className="font-bold text-lg text-patient-primary group-hover:text-patient-accent">
                        {cat}
                      </h4>
                      <p className="text-xs text-patient-secondary">{count} relatives & friends</p>
                    </div>
                  </div>
                  <span className="text-patient-accent font-bold text-sm bg-patient-accent-light px-3 py-1 rounded-full">
                    Select →
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // --- Phase 3: Completed Screen ---
  if (phase === 'completed') {
    const totalPlaced = Object.values(bucketPlacements).reduce(
      (acc, list) => acc + list.length,
      0
    );
    return (
      <div className="max-w-xl mx-auto p-6 bg-patient-surface rounded-3xl shadow-soft border border-patient-border text-center">
        <div className="text-5xl mb-3">💐✨</div>
        <h2 className="text-3xl font-bold text-patient-primary mb-2">All Sorted with Care!</h2>
        <p className="text-lg text-patient-secondary mb-6">
          You smoothly categorized all {totalPlaced} loved ones into their rightful circles.
        </p>

        {/* Buckets summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 text-left">
          {Object.entries(bucketPlacements).map(([bucketName, membersList]) => (
            <div key={bucketName} className="p-4 bg-white rounded-2xl border border-patient-border shadow-soft">
              <h4 className="font-bold text-patient-primary mb-2 flex items-center gap-2">
                <span>📁</span> {bucketName} ({membersList.length})
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {membersList.map((m) => (
                  <span
                    key={m.id}
                    className="text-xs bg-patient-canvas border border-patient-border px-2.5 py-1 rounded-full text-patient-secondary"
                  >
                    {m.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => setPhase('category_picker')}
            className="flex-1 py-4 bg-patient-accent text-white font-bold rounded-xl text-lg hover:bg-patient-accent-hover active:scale-95 transition-all shadow-soft"
          >
            Sort Another Group
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

  // --- Phase 2: Active Playing Deck ---
  const totalCardsInRound =
    unplacedCards.length +
    Object.values(bucketPlacements).reduce((acc, l) => acc + l.length, 0);
  const currentStep = totalCardsInRound - unplacedCards.length;

  const hintContent = selectedCard ? (
    <div>
      <p className="text-base font-bold text-patient-primary mb-1">
        Clue for {selectedCard.name}:
      </p>
      <p className="text-sm text-patient-secondary mb-2">
        Relationship: <span className="font-semibold text-patient-primary">{selectedCard.relationship}</span>
      </p>
      {selectedCard.bio && (
        <p className="text-sm text-patient-secondary italic bg-patient-accent-light/40 p-2.5 rounded-lg">
          "{selectedCard.bio}"
        </p>
      )}
    </div>
  ) : (
    <p className="text-patient-secondary text-sm">
      Tap any card above to select it, or drag it straight into one of the buckets below.
    </p>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setPhase('category_picker')}
          className="text-patient-secondary hover:text-patient-primary font-semibold text-sm py-2 px-3 rounded-lg hover:bg-patient-border-subtle"
        >
          ← Change Category
        </button>
        <span className="text-xs uppercase tracking-wider font-bold text-patient-accent bg-patient-accent-light px-3 py-1 rounded-full">
          Game 2 • Category Sorting
        </span>
      </div>

      {/* Progress Reward Header */}
      <ProgressRewardHeader
        currentStep={currentStep}
        totalSteps={totalCardsInRound}
        streak={streak}
        message={feedbackMessage}
      />

      {/* Interaction Mode Assist Bar */}
      <div className="flex items-center justify-between bg-patient-canvas px-4 py-2.5 rounded-xl border border-patient-border mb-6">
        <span className="text-sm font-medium text-patient-secondary flex items-center gap-1.5">
          <span>💡</span>
          <span>Tip: Tap a card, then tap a bucket — or drag and drop!</span>
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-patient-muted hidden sm:inline">Preference:</span>
          <button
            type="button"
            onClick={() => setInteractionMode(interactionMode === 'tap' ? 'drag' : 'tap')}
            className="text-xs font-semibold px-2.5 py-1 rounded-md bg-white border border-patient-border text-patient-primary shadow-sm"
          >
            {interactionMode === 'tap' ? '👆 Tap Mode' : '✋ Drag Mode'}
          </button>
        </div>
      </div>

      {/* Cards waiting to be sorted */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-patient-primary text-base">
            Cards to Sort ({unplacedCards.length} remaining)
          </h3>
          {selectedCard && (
            <span className="text-xs font-bold text-patient-accent animate-pulse">
              Selected: {selectedCard.name}
            </span>
          )}
        </div>

        <div className="min-h-[170px] p-4 bg-patient-canvas rounded-3xl border-2 border-dashed border-patient-border flex flex-wrap gap-4 items-center justify-center">
          {unplacedCards.map((member) => (
            <ContactCard
              key={member.id}
              member={member}
              isSelected={selectedCardId === member.id}
              onSelect={handleCardSelect}
              isShaking={shakingCardId === member.id}
            />
          ))}
          {unplacedCards.length === 0 && (
            <div className="text-patient-accent font-bold text-lg py-8">
              All cards sorted! Wrapping up...
            </div>
          )}
        </div>
      </div>

      {/* Buckets Dropzones */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <GroupBucketDropzone
          categoryName={primaryCategory}
          icon="🏡"
          placedMembers={bucketPlacements[primaryCategory] || []}
          onDropMember={handlePlaceCardIntoBucket}
          isTargetActive={!!selectedCardId}
        />
        <GroupBucketDropzone
          categoryName={secondaryCategory}
          icon="👥"
          placedMembers={bucketPlacements[secondaryCategory] || []}
          onDropMember={handlePlaceCardIntoBucket}
          isTargetActive={!!selectedCardId}
        />
      </div>

      {/* Dynamic Hint Drawer */}
      <DynamicHintDrawer
        hintContent={hintContent}
        inactivitySeconds={14}
      />
    </div>
  );
};

export default CategorySortingGame;

