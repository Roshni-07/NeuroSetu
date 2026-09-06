import React, { createContext, useContext, useState } from 'react';
import InstructionsModal from './InstructionsModal.jsx';
import ResultScreen from './ResultScreen.jsx';
import { sounds } from '../utils/soundEffects.js';
import { saveGameScore } from '../utils/storage.js';
import SpeakButton from './SpeakButton.jsx';

const GameWrapperContext = createContext(false);

/**
 * GameWrapper - Unified frame for all cognitive training games
 * 
 * Features:
 * - Header with Game Name, Cultural Category, and Large Back Button (min 52px)
 * - Help button to recall instructions anytime
 * - Soothing audio toggle
 * - Auto-presents InstructionsModal before play
 * - Manages 'instructions' | 'playing' | 'result' states
 * - Saves completion & best scores to localStorage
 */
export default function GameWrapper({
  gameConfig,
  onBack,
  children,
  language = 'en',
  title = '',
  emoji = '🎮',
  category = '',
  instructions = [],
  result = null,
  onRetry = null
}) {
  const isNestedWrapper = useContext(GameWrapperContext);
  const [showInstructions, setShowInstructions] = useState(true);
  const [isMuted, setIsMuted] = useState(sounds.isMuted());
  const [resultData, setResultData] = useState(null); // { score, maxScore, accuracy, message, subtext }
  const [gameKey, setGameKey] = useState(0); // for clean restarts
  const displayConfig = gameConfig || {
    name: title,
    icon: emoji,
    culturalTag: category,
    instructions
  };
  const instructionSteps = Array.isArray(displayConfig.instructions)
    ? displayConfig.instructions
    : displayConfig.instructions
      ? [displayConfig.instructions]
      : [
        'Look carefully at the items on your screen.',
        'Tap the choices that match the prompt.',
        'Take all the time you need!'
      ];
  const displayedResult = resultData || result;

  const handleToggleSound = () => {
    const nextMuted = sounds.toggleMute();
    setIsMuted(nextMuted);
  };

  const handleGameComplete = ({
    score = 100,
    maxScore = 100,
    accuracy = 100,
    message = 'Well done! Exercising your mind helps keep it vibrant.',
    subtext = ''
  }) => {
    // Save to localStorage
    if (gameConfig?.id) {
      saveGameScore(gameConfig.id, score, { accuracy });
    }
    setResultData({
      score,
      maxScore,
      accuracy,
      message,
      subtext
    });
  };

  const handlePlayAgain = () => {
    if (onRetry) onRetry();
    setResultData(null);
    setGameKey((k) => k + 1);
  };

  const content = (
    <div className={isNestedWrapper ? '' : 'game-surface min-h-screen bg-[#FAF8F5] text-slate-900 flex flex-col'}>
      {/* Top Header Bar */}
      {!isNestedWrapper && <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b-2 border-teal-200 px-3 py-2 sm:px-5 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {/* Back Button (Min 52px touch target) */}
          <button
            type="button"
            onClick={() => {
              sounds.playGentleTap();
              onBack();
            }}
            className="flex items-center space-x-2 px-3 py-2 min-h-[48px] bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 rounded-xl font-bold text-base border border-slate-300 shadow-sm cursor-pointer transition-colors"
            aria-label="Back to Games Hub"
          >
            <span className="text-2xl leading-none">←</span>
            <span className="hidden sm:inline">Hub</span>
          </button>

          {/* Game Title & Category Badge */}
          <div className="text-center px-2 flex-1">
            <div className="flex items-center justify-center space-x-2">
              <span className="text-xl">{displayConfig.icon || '🎮'}</span>
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 truncate">
                {displayConfig.name}
              </h1>
            </div>
            {displayConfig.culturalTag && (
              <span className="text-xs sm:text-sm font-semibold text-teal-800">
                {displayConfig.culturalTag}
              </span>
            )}
          </div>

          {/* Actions: Sound toggle + Help */}
          <div className="flex items-center space-x-2">
            <SpeakButton
              text={instructionSteps.join('. ')}
              language={language}
              label={language === 'en' ? 'Read game instructions aloud' : 'খেলৰ নিৰ্দেশনা শুনক'}
            />
            <button
              type="button"
              onClick={handleToggleSound}
              className="w-11 h-11 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-lg border border-slate-300 cursor-pointer"
              title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
              aria-label={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            >
              {isMuted ? '🔇' : '🔔'}
            </button>

            <button
              type="button"
              onClick={() => setShowInstructions(true)}
              className="w-11 h-11 flex items-center justify-center rounded-xl bg-teal-100 hover:bg-teal-200 text-lg font-bold border border-teal-300 cursor-pointer"
              title="View Instructions"
              aria-label="View Instructions"
            >
              ?
            </button>
          </div>
        </div>
      </header>}

      {/* Main Game Surface */}
      <main className={isNestedWrapper ? 'w-full' : 'flex-1 max-w-4xl w-full mx-auto p-3 sm:p-5 flex flex-col justify-center'}>
        {displayedResult ? (
          <ResultScreen
            gameName={displayConfig.name}
            score={displayedResult.score}
            maxScore={displayedResult.maxScore}
            accuracy={displayedResult.accuracy}
            message={displayedResult.message}
            subtext={displayedResult.subtext}
            onPlayAgain={handlePlayAgain}
            onBackToHub={onBack}
          />
        ) : (
          <div key={gameKey} className="w-full">
            {typeof children === 'function'
              ? children({ onComplete: handleGameComplete, language })
              : React.Children.map(children, (child) => (
                React.isValidElement(child) && typeof child.type !== 'string'
                  ? React.cloneElement(child, { onComplete: handleGameComplete, language })
                  : child
              ))}
          </div>
        )}
      </main>

      {/* Instructions Modal (shown before initial play or on clicking ?) */}
      {!isNestedWrapper && <InstructionsModal
        isOpen={showInstructions}
        onClose={() => setShowInstructions(false)}
        gameName={displayConfig.name}
        culturalTag={displayConfig.culturalTag}
        language={language}
        steps={instructionSteps}
      />}
    </div>
  );

  return isNestedWrapper
    ? content
    : <GameWrapperContext.Provider value>{content}</GameWrapperContext.Provider>;
}
