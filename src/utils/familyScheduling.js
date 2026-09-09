/**
 * familyScheduling.js - Fixed-calendar-day scheduling for NeuroSetu Family Reminiscence Module
 *
 * Pair A (Monday): IdentityRecall + FamilyTreeBuilder (Immediate Social & Relational Orientation)
 * Pair B (Thursday): CategorySorting + LifeStoryTimeline (Categorical Schemas & Episodic Autobiographical Memory)
 * Other days (Tue, Wed, Fri, Sat, Sun): No family games (rest from reminiscence, core cognitive training only)
 */

export const FAMILY_GAMES_METADATA = {
  'identity_recall': {
    id: 'identity_recall',
    name: 'Family Face & Name Recall',
    icon: '🖼️',
    description: 'Recognize your family members and loved ones',
    category: 'Family Memory',
    thematicPair: 'Pair A (Social & Relational Orientation)'
  },
  'family_tree': {
    id: 'family_tree',
    name: 'Family Tree Builder',
    icon: '🌳',
    description: 'Connect your parents, children, and grandchildren',
    category: 'Family Memory',
    thematicPair: 'Pair A (Social & Relational Orientation)'
  },
  'category_sorting': {
    id: 'category_sorting',
    name: 'Family Sorting & Circles',
    icon: '🗂️',
    description: 'Group family members by generations and circles',
    category: 'Family Memory',
    thematicPair: 'Pair B (Categorical Schemas & Episodic Memory)'
  },
  'life_timeline': {
    id: 'life_timeline',
    name: 'Life Story Timeline',
    icon: '📜',
    description: 'Arrange your precious life moments in order',
    category: 'Family Memory',
    thematicPair: 'Pair B (Categorical Schemas & Episodic Memory)'
  }
};

/**
 * Returns scheduled family games for a target date (defaults to current date).
 * 
 * @param {Date|string|number} [targetDate=new Date()]
 * @returns {Array<typeof FAMILY_GAMES_METADATA[keyof typeof FAMILY_GAMES_METADATA]>}
 */
export function getScheduledFamilyGames(targetDate = new Date()) {
  const d = targetDate instanceof Date ? targetDate : new Date(targetDate);
  const day = d.getDay(); // 0 = Sunday, 1 = Monday, ..., 4 = Thursday, 6 = Saturday

  if (day === 1) {
    // Monday: Pair A (Identity Recall + Family Tree)
    return [FAMILY_GAMES_METADATA.identity_recall, FAMILY_GAMES_METADATA.family_tree];
  }

  if (day === 4) {
    // Thursday: Pair B (Category Sorting + Life Story Timeline)
    return [FAMILY_GAMES_METADATA.category_sorting, FAMILY_GAMES_METADATA.life_timeline];
  }

  // All other days: no family games scheduled
  return [];
}
