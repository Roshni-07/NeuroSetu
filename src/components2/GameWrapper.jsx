import React, { createContext, useContext, useState } from 'react';
import InstructionsModal from './InstructionsModal.jsx';
import ResultScreen from './ResultScreen.jsx';
import { sounds } from '../utils/soundEffects.js';
import { saveGameScore } from '../utils/storage.js';
import SpeakButton from './SpeakButton.jsx';
import { getLocalizedGame, getGameVoiceExplanation, getUIString } from '../data/gamesLocalization.js';

const GameWrapperContext = createContext(false);

/**
 * GameWrapper - Unified frame for all cognitive training games
 * 
 * Features:
 * - Dynamic localization of game title, cultural tag, instructions, and result screen
 * - Voice Guide button that explains how the game works in the active language
 * - Help button to recall instructions anytime
 * - Soothing audio toggle
 * - Auto-presents InstructionsModal before initial play
 * - Manages 'instructions' | 'playing' | 'result' states
 * - Saves completion & best scores to localStorage
 */
export default function GameWrapper({
  gameConfig,
  onBack,
  onExit,
  onComplete,
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
  const [resultData, setResultData] = useState(null);
  const [gameKey, setGameKey] = useState(0);

  // Merge raw config with full localization
  const rawConfig = gameConfig || {
    id: 'custom-game',
    name: title,
    icon: emoji,
    culturalTag: category,
    instructions
  };

  const displayConfig = getLocalizedGame(rawConfig, language) || rawConfig;

  const instructionSteps = Array.isArray(displayConfig.instructions) && displayConfig.instructions.length > 0
    ? displayConfig.instructions
    : [
        'Look carefully at the items on your screen.',
        'Tap the choices that match the prompt.',
        'Take all the time you need!'
      ];

  const voiceExplanationText = getGameVoiceExplanation(displayConfig.id, language) ||
    `${displayConfig.name}. ${instructionSteps.join('. ')}`;

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
    const payload = {
      score,
      maxScore,
      accuracy,
      message,
      subtext
    };
    if (gameConfig?.id) {
      saveGameScore(gameConfig.id, score, { accuracy });
    }
    setResultData(payload);
  };

  const handlePlayAgain = () => {
    if (onRetry) onRetry();
    setResultData(null);
    setGameKey((k) => k + 1);
  };

  const content = (
    <div className={isNestedWrapper ? '' : 'game-surface min-h-screen bg-[#FAF8F5] text-slate-900 flex flex-col'}>
      {/* Top Header Bar */}
      {!isNestedWrapper && (
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b-2 border-teal-200 px-3 py-2 sm:px-5 shadow-sm">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            {/* Back Button (Min 52px touch target) */}
            <button
              type="button"
              onClick={() => {
                sounds.playGentleTap();
                if (onExit) onExit();
                else if (onBack) onBack();
              }}
              className="flex items-center space-x-2 px-3 py-2 min-h-[48px] bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 rounded-xl font-bold text-base border border-slate-300 shadow-sm cursor-pointer transition-colors"
              aria-label={getUIString('gamesHub', language)}
            >
              <span className="text-2xl leading-none">←</span>
              <span className="hidden sm:inline">{getUIString('gamesHub', language)}</span>
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
                  🌿 {displayConfig.culturalTag}
                </span>
              )}
            </div>

            {/* Actions: Voice Guide + Sound toggle + Help */}
            <div className="flex items-center space-x-2">
              {/* Voice Guide Button */}
              <SpeakButton
                text={voiceExplanationText}
                language={language}
                label={`${getUIString('voiceGuide', language)}: ${displayConfig.name}`}
                className="bg-teal-50 border-teal-300 text-teal-800 hover:bg-teal-100 font-bold"
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
                title={getUIString('howToPlay', language)}
                aria-label={getUIString('howToPlay', language)}
              >
                ?
              </button>
            </div>
          </div>
        </header>
      )}

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
            language={language}
            onPlayAgain={handlePlayAgain}
            onBackToHub={onExit || onBack}
          />
        ) : (
          <div key={gameKey} className="w-full">
            {typeof children === 'function'
              ? children({ onComplete: handleGameComplete, language, onExit: onExit || onBack })
              : React.Children.map(children, (child) =>
                  React.isValidElement(child) && typeof child.type !== 'string'
                    ? React.cloneElement(child, {
                        onComplete: (data) => {
                          if (child.props.onComplete) {
                            child.props.onComplete(data);
                          }
                          handleGameComplete(data || {});
                        },
                        language,
                        onExit: child.props.onExit || onExit || onBack
                      })
                    : child
                )}
          </div>
        )}
      </main>

      {/* Instructions Modal (shown before initial play or on clicking ?) */}
      {!isNestedWrapper && (
        <InstructionsModal
          isOpen={showInstructions}
          onClose={() => setShowInstructions(false)}
          gameName={displayConfig.name}
          culturalTag={displayConfig.culturalTag}
          language={language}
          steps={instructionSteps}
          voiceText={voiceExplanationText}
        />
      )}
    </div>
  );

  return isNestedWrapper ? content : (
    <GameWrapperContext.Provider value>{content}</GameWrapperContext.Provider>
  );
}
