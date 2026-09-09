import React, { useState, useMemo, useEffect, useRef } from 'react';
import TapSelectGrid from '../shared/TapSelectGrid.jsx';
import { sounds } from '../utils/soundEffects.js';
import { getDifficultyParams } from '../engine/difficultyScaling.js';
import { getLevel } from '../engine/ddaEngine.js';

// Expanded pool of 6 rich cultural emotion scenarios
const ALL_EMOTION_ROUNDS = [
  {
    id: 'round_joy',
    emotion: 'Joyful & Happy',
    emotionAs: 'আনন্দ আৰু হাঁহি',
    emoji: '😊',
    color: 'from-teal-400 to-yellow-500',
    correctId: 'bihu_reunion',
    situations: [
      {
        id: 'bihu_reunion',
        label: 'Festival Family Reunion',
        subtext: 'Daughter arrives home for Bihu bearing fresh homemade sweets.',
        icon: '🏡'
      },
      {
        id: 'storm_clouds',
        label: 'Heavy Monsoon Storm Approaching',
        subtext: 'Dark rain clouds gathering over the unharvested tea garden.',
        icon: '⛈️'
      },
      {
        id: 'lost_specs',
        label: 'Misplaced Reading Glasses',
        subtext: 'Searching through every drawer trying to find spectacles.',
        icon: '👓'
      },
      {
        id: 'evening_silence',
        label: 'Quiet River Breeze',
        subtext: 'Sitting motionless on the veranda as evening settles.',
        icon: '🌅'
      }
    ]
  },
  {
    id: 'round_calm',
    emotion: 'Calm & Peaceful',
    emotionAs: 'শান্ত আৰু প্ৰশান্ত মন',
    emoji: '😌',
    color: 'from-teal-400 to-emerald-600',
    correctId: 'temple_prayer',
    situations: [
      {
        id: 'temple_prayer',
        label: 'Morning Namghar Chanting',
        subtext: 'Gentle prayer bells and fragrant incense at dawn.',
        icon: '🪔'
      },
      {
        id: 'wild_alert',
        label: 'Rustling in the Bamboo Grove',
        subtext: 'Sudden unexpected loud crack of dry bamboo branches.',
        icon: '🎋'
      },
      {
        id: 'market_rush',
        label: 'Crowded Weekly Haat',
        subtext: 'Bustling bazaar stalls with vendors shouting prices.',
        icon: '📢'
      },
      {
        id: 'spilled_milk',
        label: 'Spilled Boiling Tea',
        subtext: 'The kettle boiled over onto the stove top.',
        icon: '🫖'
      }
    ]
  },
  {
    id: 'round_concern',
    emotion: 'Loving Concern',
    emotionAs: 'স্নেহ আৰু যত্নশীল চিন্তা',
    emoji: '😟',
    color: 'from-orange-400 to-teal-600',
    correctId: 'child_fever',
    situations: [
      {
        id: 'child_fever',
        label: 'Grandchild Caught in Rain',
        subtext: 'Little one got soaked in monsoon rain and is sneezing.',
        icon: '🌧️'
      },
      {
        id: 'harvest_dance',
        label: 'Village Harvest Dance',
        subtext: 'Singing and beating the dhol drum with neighbours.',
        icon: '🥁'
      },
      {
        id: 'weaver_award',
        label: 'Admiring Finished Muga Silk',
        subtext: 'Holding up an exquisite golden handloom cloth just off the loom.',
        icon: '🧣'
      },
      {
        id: 'afternoon_nap',
        label: 'Warm Afternoon Nap',
        subtext: 'Resting comfortably on the wicker lounge chair.',
        icon: '🛋️'
      }
    ]
  },
  {
    id: 'round_pride',
    emotion: 'Proud Accomplishment',
    emotionAs: 'গৌৰৱ আৰু আত্মতৃপ্তি',
    emoji: '🌟',
    color: 'from-amber-400 to-teal-600',
    correctId: 'handloom_praise',
    situations: [
      {
        id: 'handloom_praise',
        label: 'Golden Weave Praised by Master Weaver',
        subtext: 'Neighbours admire the intricate diamond motifs on your newly woven gamosa.',
        icon: '🧵'
      },
      {
        id: 'dark_path',
        label: 'Walking Alone on an Unlit Village Lane',
        subtext: 'Stumbling over wet pebbles in the pitch dark without a torch.',
        icon: '🌑'
      },
      {
        id: 'dull_market',
        label: 'Empty Vegetable Stall on Rainy Day',
        subtext: 'Sitting with unsold cabbages while the rain floods the road.',
        icon: '🥬'
      },
      {
        id: 'leaking_roof',
        label: 'Rain Dripping Through Thatch Roof',
        subtext: 'Placing brass bowls under continuous monsoon leaks.',
        icon: '🛖'
      }
    ]
  },
  {
    id: 'round_nostalgia',
    emotion: 'Warm Nostalgia & Fond Memories',
    emotionAs: 'মধুৰ অতীতৰ সোঁৱৰণি',
    emoji: '🍂',
    color: 'from-yellow-500 to-teal-700',
    correctId: 'old_photo_album',
    situations: [
      {
        id: 'old_photo_album',
        label: 'Looking at Grandmother’s Brass Betel Box',
        subtext: 'Remembering family gatherings from fifty years ago on the ancestral veranda.',
        icon: '🪙'
      },
      {
        id: 'alarm_clock',
        label: 'Loud Morning Alarm Ringing',
        subtext: 'Sudden sharp bell ringing beside the bed before daylight.',
        icon: '⏰'
      },
      {
        id: 'traffic_jam',
        label: 'Noisy City Bus Horns',
        subtext: 'Stuck in bumper-to-bumper smoke and honking.',
        icon: '🚌'
      },
      {
        id: 'burnt_rice',
        label: 'Charred Bottom of Rice Pot',
        subtext: 'The smell of overcooked burnt rice filling the kitchen.',
        icon: '🍚'
      }
    ]
  },
  {
    id: 'round_kindness',
    emotion: 'Neighbourly Care & Kindness',
    emotionAs: 'চুবুৰীয়াৰ প্ৰতি সহানুভূতি',
    emoji: '🤝',
    color: 'from-teal-500 to-cyan-700',
    correctId: 'helping_elder',
    situations: [
      {
        id: 'helping_elder',
        label: 'Carrying Fresh Water for an Elderly Neighbour',
        subtext: 'Bringing a heavy brass jug of sweet well water to an elderly aunt who lives alone.',
        icon: '🪣'
      },
      {
        id: 'broken_pot',
        label: 'Dropped Clay Cooking Pot',
        subtext: 'Shattered shards of clay pottery across the kitchen floor.',
        icon: '🏺'
      },
      {
        id: 'mosquito_bite',
        label: 'Mosquitoes Swarming at Dusk',
        subtext: 'Swatting at insects around the evening kerosene lantern.',
        icon: '🦟'
      },
      {
        id: 'thorny_bush',
        label: 'Snagged Clothes on Thorn Hedge',
        subtext: 'Pricking fingers while trying to untangle a silk scarf from brambles.',
        icon: '🌵'
      }
    ]
  }
];

export default function WhoseEmotion({
  onComplete,
  onExit,
  language = 'en',
  level = null,
  masteryScore = null,
  tier = null,
  startingTier = null,
  initialTier = null,
  patientProfile = null,
  onLevelChange = null
}) {
  const isExplicitLevel = level !== null && level !== undefined;
  const hasConfig = isExplicitLevel || masteryScore !== null || tier !== null || startingTier !== null || initialTier !== null || patientProfile !== null;

  // Standardized fallback resolver: level prop -> masteryScore -> patientProfile -> legacy status -> 5
  const currentLevel = useMemo(() => {
    if (isExplicitLevel && Number(level) >= 1 && Number(level) <= 10) return Math.round(Number(level));
    if (masteryScore !== null && masteryScore !== undefined) return getLevel(masteryScore);
    if (patientProfile?.masteryScore !== undefined) return getLevel(patientProfile.masteryScore);
    const legacyTier = tier || startingTier || initialTier || patientProfile?.starting_difficulty_tier || patientProfile?.startingTier || (patientProfile?.status === 'critical' ? 1 : patientProfile?.status === 'attention' ? 2 : patientProfile?.status === 'stable' ? 3 : null);
    if (legacyTier) {
      const t = Number(legacyTier);
      if (t === 1) return 1;
      if (t === 3) return 10;
      return 5;
    }
    return 5;
  }, [isExplicitLevel, level, masteryScore, patientProfile, tier, startingTier, initialTier]);

  useEffect(() => {
    if (onLevelChange) onLevelChange(currentLevel);
  }, [currentLevel, onLevelChange]);

  const difficultyParams = useMemo(() => {
    return getDifficultyParams('whose-emotion', currentLevel);
  }, [currentLevel]);

  // Scaled rounds count: 2 (L1) to 6 (L10). Defaults to 3 when unconfigured.
  const activeRoundCount = useMemo(() => {
    if (!hasConfig) return 3;
    return Math.max(2, Math.min(6, difficultyParams.itemCount || 3));
  }, [hasConfig, difficultyParams.itemCount]);

  // Scaled distractors per round: 1 distractor (L1, 2 choices) to 3 distractors (L10, 4 choices). Defaults to 3 when unconfigured.
  const activeDistractorCount = useMemo(() => {
    if (!hasConfig) return 3; // 4 choices total
    return Math.max(1, Math.min(3, difficultyParams.distractorCount || 3));
  }, [hasConfig, difficultyParams.distractorCount]);

  // Sliced active rounds with scaled options
  const activeRounds = useMemo(() => {
    const rawRounds = ALL_EMOTION_ROUNDS.slice(0, activeRoundCount);
    return rawRounds.map((round) => {
      const correctSituation = round.situations.find(s => s.id === round.correctId);
      const distractors = round.situations.filter(s => s.id !== round.correctId).slice(0, activeDistractorCount);
      // Place correct situation deterministically
      const combined = (round.id.length % 2 === 0)
        ? [correctSituation, ...distractors]
        : [...distractors.slice(0, 1), correctSituation, ...distractors.slice(1)];
      return {
        ...round,
        situations: combined
      };
    });
  }, [activeRoundCount, activeDistractorCount]);

  const startTime = useRef(Date.now());
  const [roundIdx, setRoundIdx] = useState(0);
  const [selectedId, setSelectedId] = useState(null);
  const [roundScores, setRoundScores] = useState([]);

  // Reset when level changes
  useEffect(() => {
    setRoundIdx(0);
    setSelectedId(null);
    setRoundScores([]);
    startTime.current = Date.now();
  }, [currentLevel]);

  const currentRound = activeRounds[roundIdx] || activeRounds[0];

  const handleSelect = (id) => {
    setSelectedId(id);
  };

  const handleConfirm = () => {
    if (!selectedId) return;

    const isCorrect = selectedId === currentRound.correctId;
    if (isCorrect) {
      sounds.playSuccessChime();
    } else {
      sounds.playEncouragingSoft();
    }

    const updated = [...roundScores, isCorrect];
    setRoundScores(updated);

    if (roundIdx >= activeRounds.length - 1) {
      // Finished all rounds
      const correctCount = updated.filter(Boolean).length;
      const totalRounds = activeRounds.length;
      const accuracy = Math.round((correctCount / totalRounds) * 100);
      const score = Math.max(35, Math.round((correctCount / totalRounds) * 100));
      const responseTimeMs = Math.max(100, Date.now() - startTime.current);
      const errorCount = Math.max(0, totalRounds - correctCount);
      const derivedTier = currentLevel <= 3 ? 1 : currentLevel <= 7 ? 2 : 3;

      let message = 'Heartwarming empathy! Emotional awareness keeps community bonds strong.';
      if (correctCount === totalRounds) {
        message = 'Deep empathy! You understood every person’s feelings and situations perfectly.';
      } else if (correctCount >= 1) {
        message = 'Well done! You connected feelings with life situations warmly.';
      }

      onComplete({
        gameId: 'whose-emotion',
        score,
        maxScore: 100,
        accuracy,
        errorCount,
        responseTimeMs,
        latencyMs: responseTimeMs,
        level: currentLevel,
        tier: derivedTier,
        difficultyTier: derivedTier,
        sessionLevel: currentLevel,
        message,
        subtext: `Matched ${correctCount} of ${totalRounds} emotional situations.`,
        difficultyParams
      });
    } else {
      // Proceed to next round
      setRoundIdx((i) => i + 1);
      setSelectedId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {onExit && (
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onExit}
            className="inline-flex items-center gap-2 px-4 py-2 min-h-[48px] bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 hover:text-slate-900 border border-slate-300 rounded-xl text-sm font-bold shadow-xs transition cursor-pointer"
            aria-label="Exit to hub"
          >
            <span className="text-lg leading-none">←</span>
            <span>Exit to Hub</span>
          </button>
        </div>
      )}

      {/* Adaptive Level Badge */}
      <div className="flex items-center justify-between px-4 py-2 bg-teal-50 border border-teal-200 rounded-2xl">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-700 text-white">
            Level {currentLevel}
          </span>
          <span className="text-xs font-semibold text-slate-600">
            {activeRounds.length} Emotional Scenarios • {activeDistractorCount + 1} Choices / Round
          </span>
        </div>
        <span className="text-xs font-bold text-teal-800">
          {currentLevel <= 3 ? 'Gentle Warmup' : currentLevel <= 7 ? 'Target Challenge' : 'Focused Mastery'}
        </span>
      </div>

      {/* Round Header & Emotion Portrait */}
      <div className="p-6 rounded-3xl bg-teal-50 border-3 border-teal-300 shadow-sm text-center space-y-4">
        <div className="flex items-center justify-between text-sm font-bold text-teal-900">
          <span>Question {roundIdx + 1} of {activeRounds.length}</span>
          <span className="bg-teal-200 px-3 py-1 rounded-full uppercase tracking-wider">
            Emotional Awareness
          </span>
        </div>

        {/* Emotion Display Card */}
        <div className="flex flex-col items-center justify-center">
          <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${currentRound.color} flex items-center justify-center text-6xl shadow-md transform hover:scale-105 transition-transform`}>
            {currentRound.emoji}
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3">
            {currentRound.emotion}
          </h3>
          <p className="text-base text-teal-800 font-semibold">
            {currentRound.emotionAs}
          </p>
        </div>

        <p className="text-lg text-slate-700 font-medium">
          Which village situation best matches this emotion?
        </p>
      </div>

      {/* Situations Grid */}
      <TapSelectGrid
        language={language}
        items={currentRound.situations}
        selectedIds={selectedId ? [selectedId] : []}
        onToggle={handleSelect}
        maxSelect={1}
        columns={1}
      />

      <div className="pt-4 flex justify-end">
        <button
          type="button"
          disabled={!selectedId}
          onClick={handleConfirm}
          className={`px-8 py-4 rounded-2xl text-xl font-bold shadow-lg transition-all flex items-center space-x-3 ${
            selectedId
              ? 'bg-teal-700 hover:bg-teal-800 text-white cursor-pointer'
              : 'bg-slate-300 text-slate-500 cursor-not-allowed'
          }`}
        >
          <span>{roundIdx < activeRounds.length - 1 ? 'Next Emotion' : 'Finish'}</span>
          <span>➔</span>
        </button>
      </div>
    </div>
  );
}
