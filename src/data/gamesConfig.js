import GrandmasShoppingList from '../games/GrandmasShoppingList.jsx';
import FestivalMemoryMatch from '../games/FestivalMemoryMatch.jsx';
import DailyRoutineRecall from '../games/DailyRoutineRecall.jsx';
import ShellMemoryTrail from '../games/ShellMemoryTrail.jsx';
import WhatBelongsHere from '../games/WhatBelongsHere.jsx';
import PackVillageBasket from '../games/PackVillageBasket.jsx';
import WhoseEmotion from '../games/WhoseEmotion.jsx';
import FindTheDifference from '../games/FindTheDifference.jsx';
// Phase 2 games
import TeaGardenDetective from '../games/TeaGardenDetective.jsx';
import MemoryMapHome from '../games/MemoryMapHome.jsx';
import RememberTheStory from '../games/RememberTheStory.jsx';
import DayInMyVillage from '../games/DayInMyVillage.jsx';
import CareForYourCompanion from '../games/CareForYourCompanion.jsx';
import FinishGrandmasWeave from '../games/FinishGrandmasWeave.jsx';
import WhoseMorningIsIt from '../games/WhoseMorningIsIt.jsx';

/**
 * gamesConfig.js - Master Catalog of all 15 Cognitive Training Games
 * 
 * Grouped across 5 categories:
 * - Memory (স্মৃতি)
 * - Attention (মনোযোগ)
 * - Reasoning/Executive Function (যুক্তি আৰু কাৰ্যপ্ৰণালী)
 * - Visual Reasoning (দৃশ্যমান বিশ্লেষণ)
 * - Emotional Cognition (ভাৱ আৰু অনুভূতি)
 * 
 * Phase 1: 8 fully playable games
 * Phase 2: 7 newly added games
 */
export const GAMES_CONFIG = [
  // ==========================================
  // CATEGORY 1: MEMORY
  // ==========================================
  {
    id: 'grandmas-shopping-list',
    name: "Grandma's Shopping List",
    subtitle: 'Assam tea & weekly bazaar market recall',
    icon: '👵',
    category: 'Memory',
    phase: 1,
    culturalTag: 'Village Haat Bazaar',
    instructions: [
      'Take a few seconds to look at Grandma’s shopping list.',
      'When the list hides, tap only the items that were on her list.',
      'Check your basket when ready!'
    ],
    component: GrandmasShoppingList
  },
  {
    id: 'festival-memory-match',
    name: 'Festival Memory Match',
    subtitle: 'Pair matching with Bihu drums, hornpipes & hats',
    icon: '🪘',
    category: 'Memory',
    phase: 1,
    culturalTag: 'Bihu & Hornbill Festivals',
    instructions: [
      'Tap any closed card to reveal its festival symbol.',
      'Tap another card to find its matching twin pair.',
      'Remember where each card was located!'
    ],
    component: FestivalMemoryMatch
  },
  {
    id: 'daily-routine-recall',
    name: 'Daily Routine Recall',
    subtitle: 'Put village morning tea & activities in order',
    icon: '☕',
    category: 'Memory',
    phase: 1,
    culturalTag: 'Village Daily Rhythm',
    instructions: [
      'Look at the daily village activities at the bottom.',
      'Drag or tap each activity into its 1st to 5th chronological slot.',
      'Confirm the daily sequence when done.'
    ],
    component: DailyRoutineRecall
  },
  {
    id: 'shell-memory-trail',
    name: 'Memory Trail',
    subtitle: 'Track the item with the glowing golden pearl',
    icon: '💡',
    category: 'Memory',
    phase: 1,
    culturalTag: 'Daily Items',
    instructions: [
      'Watch carefully as one item lights up with a golden pearl.',
      'Follow the item with your eyes as the items glide and swap positions.',
      'Tap the item where you think the pearl is hiding.'
    ],
    component: ShellMemoryTrail
  },
  {
    id: 'remember-the-story',
    name: 'Remember the Story',
    subtitle: 'Read a NER folk tale, then answer gentle questions',
    icon: '📖',
    category: 'Memory',
    phase: 2,
    culturalTag: 'Assamese & Naga Folklore',
    instructions: [
      'Read the short village story page by page.',
      'When done, answer questions about what happened.',
      'Take your time — there is no rush!'
    ],
    component: RememberTheStory
  },
  {
    id: 'memory-map-home',
    name: 'Memory Map of Home',
    subtitle: 'Watch the village path, then retrace it from memory',
    icon: '🏡',
    category: 'Memory',
    phase: 2,
    culturalTag: 'Village Home & Paths',
    instructions: [
      'Watch the character walk through several village locations.',
      'When the walk is done, tap the same locations in the correct order.',
      'You can watch the path again if you need a reminder!'
    ],
    component: MemoryMapHome
  },
  {
    id: 'whose-morning-is-it',
    name: 'Whose Morning Is It?',
    subtitle: 'Match village morning sounds to their scenes',
    icon: '🌅',
    category: 'Memory',
    phase: 2,
    culturalTag: 'Village Dawn Sounds',
    instructions: [
      'Tap a SOUND card to hear it play.',
      'Then tap the matching SCENE card on the right.',
      'Match all 4 morning sounds to their correct village scenes!'
    ],
    component: WhoseMorningIsIt
  },

  // ==========================================
  // CATEGORY 2: ATTENTION
  // ==========================================
  {
    id: 'find-the-difference',
    name: 'Find the Difference',
    subtitle: 'Spot 4 differences between peaceful tea garden scenes',
    icon: '🔍',
    category: 'Attention',
    phase: 1,
    culturalTag: 'Tea Garden Homestead',
    instructions: [
      'Compare the two side-by-side tea garden village scenes.',
      'Look for swapped flowers, missing birds, or changed objects.',
      'Tap the differing spots on either picture!'
    ],
    component: FindTheDifference
  },
  {
    id: 'tea-garden-detective',
    name: 'Tea Garden Detective',
    subtitle: 'Tap only the fresh tea leaf as it passes by',
    icon: '🌿',
    category: 'Attention',
    phase: 2,
    culturalTag: 'Assam Tea Garden',
    instructions: [
      'Items will move through the tea garden one by one.',
      'Tap the TAP button only when you see the fresh tea leaf 🍃.',
      'Do not tap for any other item — only the fresh leaf!'
    ],
    component: TeaGardenDetective
  },

  // ==========================================
  // CATEGORY 3: REASONING & EXECUTIVE FUNCTION
  // ==========================================
  {
    id: 'what-belongs-here',
    name: 'What Belongs Here?',
    subtitle: 'Sort kitchen utensils, prayer bells & garden tools',
    icon: '🏡',
    category: 'Reasoning/Executive Function',
    phase: 1,
    culturalTag: 'Homestead Architecture',
    instructions: [
      'Review the three rooms: Kitchen, Prayer Room, and Courtyard.',
      'Drag or tap each household item to place it in the correct room.',
      'Press confirm once every item is placed.'
    ],
    component: WhatBelongsHere
  },
  {
    id: 'pack-village-basket',
    name: 'Pack the Village Basket',
    subtitle: 'Select the right tools for tea plucking or feast cooking',
    icon: '🧺',
    category: 'Reasoning/Executive Function',
    phase: 1,
    culturalTag: 'Village Craft & Harvest',
    instructions: [
      'Read the task prompt at the top carefully.',
      'Tap only the objects that are needed for that specific activity.',
      'Confirm your basket when ready!'
    ],
    component: PackVillageBasket
  },
  {
    id: 'day-in-my-village',
    name: 'A Day in My Village',
    subtitle: 'Plan your village chores in the best logical order',
    icon: '🌾',
    category: 'Reasoning/Executive Function',
    phase: 2,
    culturalTag: 'Village Daily Planning',
    instructions: [
      'Read the tasks you need to do today.',
      'Tap the village locations on the map in the smartest order.',
      'Think about which tasks need to be done before others!'
    ],
    component: DayInMyVillage
  },
  {
    id: 'care-for-companion',
    name: 'Care for Your Companion',
    subtitle: 'Make caring decisions for your tea plant or village hen',
    icon: '🌱',
    category: 'Reasoning/Executive Function',
    phase: 2,
    culturalTag: 'Village Animal & Garden Care',
    instructions: [
      'Your companion needs your care through the day.',
      'At each situation, choose the best action to take.',
      'Think carefully — there is always a most sensible choice!'
    ],
    component: CareForYourCompanion
  },

  // ==========================================
  // CATEGORY 4: VISUAL REASONING
  // ==========================================
  {
    id: 'finish-grandmas-weave',
    name: "Finish Grandma's Weave",
    subtitle: 'Complete the traditional NER textile loom pattern',
    icon: '🧵',
    category: 'Visual Reasoning',
    phase: 2,
    culturalTag: 'Muga Silk & Mekhela Handloom',
    instructions: [
      "Grandma's weaving has some missing cells — can you complete it?",
      'Tap a colour piece at the bottom, then tap a missing (?) cell to fill it.',
      'When all cells are filled, tap "Check Pattern" to see your result!'
    ],
    component: FinishGrandmasWeave
  },

  // ==========================================
  // CATEGORY 5: EMOTIONAL COGNITION
  // ==========================================
  {
    id: 'whose-emotion',
    name: 'Whose Emotion?',
    subtitle: 'Match heartfelt expressions with village family stories',
    icon: '❤️',
    category: 'Emotional Cognition',
    phase: 1,
    culturalTag: 'Village Family Life',
    instructions: [
      'Look at the facial expression and emotional mood shown.',
      'Read the village life situations presented below.',
      'Tap the situation that best matches the emotion!'
    ],
    component: WhoseEmotion
  }
];
