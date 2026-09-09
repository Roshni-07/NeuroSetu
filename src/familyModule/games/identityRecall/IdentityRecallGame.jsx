import React, { useState, useEffect, useMemo } from 'react';
import { familyDataService } from '../../data/familyDataService';
import ProgressRewardHeader from '../../shared/ProgressRewardHeader';
import DynamicHintDrawer from '../../shared/DynamicHintDrawer';
import BlurredImageRevealContainer from './BlurredImageRevealContainer';
import MultipleChoiceNameGrid from './MultipleChoiceNameGrid';
import SequentialStepper from './SequentialStepper';

const IdentityRecallGame = ({ onBackToMenu }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  // State per question: record answers & blur levels
  // gameState: { [index]: { blurPercentage: number, selectedName: string, isCorrect: boolean, isAnswered: boolean } }
  const [answersState, setAnswersState] = useState({});
  const [streak, setStreak] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // Load family members from service
  useEffect(() => {
    const loadMembers = async () => {
      setLoading(true);
      const data = await familyDataService.getMembers();
      // Select 5-6 members for a comfortable session
      const sample = [...data].sort(() => 0.5 - Math.random()).slice(0, 5);
      setMembers(sample);
      setLoading(false);
    };
    loadMembers();
  }, []);

  const currentMember = members[currentIndex] || null;
  const currentAnswer = answersState[currentIndex] || {
    blurPercentage: 100,
    selectedName: null,
    isCorrect: false,
    isAnswered: false,
  };

  // Generate 3-4 options: 1 correct, distractors prioritized from the same category
  const currentOptions = useMemo(() => {
    if (!currentMember || members.length === 0) return [];

    const correct = currentMember.name;
    // Same category distractors
    const sameCat = members
      .filter((m) => m.id !== currentMember.id && m.category === currentMember.category)
      .map((m) => m.name);
    // Other category distractors
    const diffCat = members
      .filter((m) => m.id !== currentMember.id && m.category !== currentMember.category)
      .map((m) => m.name);

    const pool = [...sameCat, ...diffCat];
    const shuffledPool = pool.sort(() => 0.5 - Math.random());
    const selectedDistractors = shuffledPool.slice(0, 3);

    const allOptions = [correct, ...selectedDistractors].sort(() => 0.5 - Math.random());
    return allOptions;
  }, [currentIndex, currentMember, members]);

  // Handle clarity increase (tapping +25%)
  const handleIncreaseClarity = () => {
    setAnswersState((prev) => {
      const existing = prev[currentIndex] || { blurPercentage: 100 };
      const nextBlur = Math.max(0, existing.blurPercentage - 25);
      return {
        ...prev,
        [currentIndex]: {
          ...existing,
          blurPercentage: nextBlur,
        },
      };
    });
  };

  // Handle selecting a name
  const handleSelectName = (name) => {
    if (currentAnswer.isAnswered || !currentMember) return;

    const isCorrect = name === currentMember.name;
    if (isCorrect) {
      setStreak((s) => s + 1);
    } else {
      setStreak(0);
    }

    setAnswersState((prev) => ({
      ...prev,
      [currentIndex]: {
        ...prev[currentIndex],
        selectedName: name,
        isCorrect,
        isAnswered: true,
        // When answered, photo automatically reveals fully
        blurPercentage: 0,
      },
    }));
  };

  const handleNext = () => {
    if (currentIndex < members.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      setIsFinished(true);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  };

  const handleRestart = () => {
    setAnswersState({});
    setCurrentIndex(0);
    setStreak(0);
    setIsFinished(false);
    // Reshuffle members
    setMembers((prev) => [...prev].sort(() => 0.5 - Math.random()));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[50vh] text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-patient-accent mb-4"></div>
        <p className="text-xl font-medium text-patient-primary">Gathering family memories...</p>
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="p-8 text-center max-w-lg mx-auto bg-white rounded-2xl shadow-soft">
        <p className="text-lg text-patient-secondary mb-4">No family members found in records.</p>
        {onBackToMenu && (
          <button
            onClick={onBackToMenu}
            className="px-6 py-3 bg-patient-accent text-white rounded-xl font-semibold"
          >
            Back to Games Hub
          </button>
        )}
      </div>
    );
  }

  // Summary Screen
  if (isFinished) {
    const totalCorrect = Object.values(answersState).filter((a) => a.isCorrect).length;
    return (
      <div className="max-w-xl mx-auto p-6 bg-patient-surface rounded-3xl shadow-soft border border-patient-border text-center">
        <div className="text-5xl mb-3">🌿🌸</div>
        <h2 className="text-3xl font-bold text-patient-primary mb-2">Beautiful Memories!</h2>
        <p className="text-lg text-patient-secondary mb-6">
          You recognized {totalCorrect} out of {members.length} cherished family members and friends.
        </p>

        <div className="bg-patient-accent-light/60 p-4 rounded-2xl mb-6 text-patient-primary border border-patient-accent/20">
          <p className="font-medium">
            "Every face connects us to stories, laughter, and warm moments from the heart."
          </p>
        </div>

        {/* List of reviewed members */}
        <div className="flex flex-col gap-3 mb-8 text-left">
          {members.map((m, idx) => {
            const ans = answersState[idx];
            return (
              <div
                key={m.id}
                className="flex items-center justify-between p-3 bg-white rounded-xl border border-patient-border"
              >
                <div className="flex items-center gap-3">
                  <img src={m.photoUrl} alt={m.name} className="w-12 h-12 rounded-full object-cover shadow-sm" />
                  <div>
                    <h4 className="font-bold text-patient-primary">{m.name}</h4>
                    <p className="text-sm text-patient-muted">{m.relationship} • {m.category}</p>
                  </div>
                </div>
                <div>
                  {ans?.isCorrect ? (
                    <span className="text-patient-success font-semibold flex items-center gap-1 text-sm bg-patient-success-light px-3 py-1 rounded-full">
                      ✓ Recognized
                    </span>
                  ) : (
                    <span className="text-patient-secondary font-medium text-sm bg-patient-border-subtle px-3 py-1 rounded-full">
                      Reviewed
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={handleRestart}
            className="flex-1 py-4 bg-patient-accent text-white font-bold rounded-xl text-lg hover:bg-patient-accent-hover active:scale-95 transition-all shadow-soft"
          >
            Play Again
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

  // Encouragement messaging
  const encouragingMessage =
    streak > 1
      ? `Wonderful! ${streak} in a row!`
      : currentAnswer.isAnswered
      ? currentAnswer.isCorrect
        ? 'Spot on! You remembered!'
        : 'Thank you for taking time to remember.'
      : 'Who is pictured in this memory?';

  // Dynamic Hint Content
  const hintContent = (
    <div className="space-y-3">
      <p className="text-base text-patient-primary font-semibold">
        Helpful Clues:
      </p>
      <div className="bg-patient-accent-light/50 p-3 rounded-xl border border-patient-accent/20 text-patient-primary">
        <p className="text-sm">
          <strong>Relationship:</strong> {currentMember.relationship}
        </p>
        <p className="text-sm mt-1">
          <strong>Group:</strong> {currentMember.category}
        </p>
      </div>
      <p className="text-sm text-patient-secondary italic">
        "First letter starts with: <span className="font-bold text-patient-accent text-lg not-italic">{currentMember.name[0]}</span>"
      </p>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-4">
        {onBackToMenu && (
          <button
            onClick={onBackToMenu}
            className="text-patient-secondary hover:text-patient-primary flex items-center gap-1 font-semibold text-sm py-2 px-3 rounded-lg hover:bg-patient-border-subtle transition-colors"
          >
            ← Back to Game Hub
          </button>
        )}
        <span className="text-xs uppercase tracking-wider font-bold text-patient-accent bg-patient-accent-light px-3 py-1 rounded-full">
          Game 1 • Identity & Recall
        </span>
      </div>

      {/* Progress and Encouragement */}
      <ProgressRewardHeader
        currentStep={currentIndex + 1}
        totalSteps={members.length}
        streak={streak}
        message={encouragingMessage}
      />

      {/* Main Interaction Area */}
      <div className="flex flex-col items-center gap-6">
        {/* Photo Container with progressive unblur */}
        <BlurredImageRevealContainer
          photoUrl={currentMember.photoUrl}
          name={currentMember.name}
          blurPercentage={currentAnswer.blurPercentage}
          onIncreaseClarity={handleIncreaseClarity}
          isRevealed={currentAnswer.isAnswered}
        />

        {/* Selection or Bio View */}
        {!currentAnswer.isAnswered ? (
          <div className="w-full">
            <h3 className="text-center font-bold text-patient-primary text-xl mb-4">
              Whose face is this?
            </h3>
            <MultipleChoiceNameGrid
              options={currentOptions}
              selectedName={currentAnswer.selectedName}
              correctName={currentMember.name}
              onSelectOption={handleSelectName}
              isAnswered={false}
            />
          </div>
        ) : (
          /* Revealed Bio Card upon selection */
          <div className="w-full max-w-md bg-white p-5 rounded-2xl border-2 border-patient-success/30 shadow-soft animate-fade-in text-center">
            <div className="inline-block px-3 py-1 bg-patient-success-light text-patient-success font-bold text-sm rounded-full mb-2">
              {currentAnswer.isCorrect ? '✓ Correctly Identified!' : 'Memory Revealed'}
            </div>
            <h3 className="text-2xl font-bold text-patient-primary">{currentMember.name}</h3>
            <p className="text-patient-accent font-semibold text-base mb-3">
              {currentMember.relationship} • {currentMember.category}
            </p>
            {currentMember.bio && (
              <p className="text-patient-body text-patient-secondary bg-patient-canvas p-3 rounded-xl border border-patient-border-subtle text-left">
                {currentMember.bio}
              </p>
            )}
          </div>
        )}

        {/* Stepper Navigation */}
        <SequentialStepper
          currentIndex={currentIndex}
          totalItems={members.length}
          onPrevious={handlePrevious}
          onNext={handleNext}
          canGoNext={currentAnswer.isAnswered}
          isLast={currentIndex === members.length - 1}
        />
      </div>

      {/* Gentle Inactivity Hint Drawer */}
      <DynamicHintDrawer
        hintContent={hintContent}
        inactivitySeconds={12}
      />
    </div>
  );
};

export default IdentityRecallGame;

