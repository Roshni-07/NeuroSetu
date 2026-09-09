import { describe, it, expect } from 'vitest';
import {
  assignDailyGames,
  COGNITIVE_DOMAINS,
  FAMILY_GAMES,
  resolveDailyFamilyGame,
  resolvePatientStartingTier,
  resolveDailyGameCount,
  buildSessionDifficultyCurve
} from '../../src/engine/dailyAssignmentEngine.js';
import {
  assignDailyGames as ddaAssignDailyGames,
  COGNITIVE_DOMAINS as ddaCognitiveDomains,
  FAMILY_GAMES as ddaFamilyGames,
  resolveDailyFamilyGame as ddaResolveDailyFamilyGame
} from '../../src/engine/ddaEngine.js';
import { GAMES_CONFIG } from '../../src/data/gamesConfig.js';
import { PRESET_PATIENTS } from '../../src/data/presetPatients.js';

describe('dailyAssignmentEngine', () => {
  it('re-exports cleanly from ddaEngine.js', () => {
    expect(ddaAssignDailyGames).toBe(assignDailyGames);
    expect(ddaCognitiveDomains).toEqual(COGNITIVE_DOMAINS);
    expect(ddaFamilyGames).toEqual(FAMILY_GAMES);
    expect(ddaResolveDailyFamilyGame).toBe(resolveDailyFamilyGame);
  });

  describe('resolvePatientStartingTier', () => {
    it('prioritizes explicit tier override', () => {
      expect(resolvePatientStartingTier({ starting_difficulty_tier: 1, status: 'critical' }, 3)).toBe(3);
    });

    it('uses patientProfile starting_difficulty_tier when present', () => {
      expect(resolvePatientStartingTier({ starting_difficulty_tier: 2 })).toBe(2);
      expect(resolvePatientStartingTier({ startingTier: 3 })).toBe(3);
    });

    it('infers tier correctly from clinical status', () => {
      expect(resolvePatientStartingTier({ status: 'critical' })).toBe(1);
      expect(resolvePatientStartingTier({ status: 'attention' })).toBe(2);
      expect(resolvePatientStartingTier({ status: 'stable' })).toBe(3);
    });

    it('falls back to safe clinical floor Tier 1 when unset', () => {
      expect(resolvePatientStartingTier({})).toBe(1);
    });
  });

  describe('resolveDailyGameCount', () => {
    it('uses explicit dailyCap when set', () => {
      expect(resolveDailyGameCount({ dailyCap: 4 })).toBe(4);
      expect(resolveDailyGameCount({ dailyCap: 2 })).toBe(2);
      expect(resolveDailyGameCount({ dailyCap: 5 })).toBe(5);
    });

    it('clamps dailyCap to [2, 5]', () => {
      expect(resolveDailyGameCount({ dailyCap: 1 })).toBe(2);
      expect(resolveDailyGameCount({ dailyCap: 9 })).toBe(5);
    });

    it('resolves from stage string: severe→2, moderate→3, mild→5', () => {
      expect(resolveDailyGameCount({ stage: 'Severe / Late Stage' })).toBe(2);
      expect(resolveDailyGameCount({ stage: 'Moderate / Middle Stage' })).toBe(3);
      expect(resolveDailyGameCount({ stage: 'Mild / Early Stage' })).toBe(5);
    });

    it('resolves from masteryScore when no stage set', () => {
      expect(resolveDailyGameCount({ masteryScore: 20 })).toBe(2);  // <35
      expect(resolveDailyGameCount({ masteryScore: 45 })).toBe(3);  // 35–60
      expect(resolveDailyGameCount({ masteryScore: 65 })).toBe(4);  // 60–80
      expect(resolveDailyGameCount({ masteryScore: 85 })).toBe(5);  // ≥80
    });

    it('resolves from status string as last resort', () => {
      expect(resolveDailyGameCount({ status: 'critical' })).toBe(2);
      expect(resolveDailyGameCount({ status: 'attention' })).toBe(3);
      expect(resolveDailyGameCount({ status: 'stable' })).toBe(5);
    });

    it('falls back to 3 for an empty profile', () => {
      expect(resolveDailyGameCount({})).toBe(3);
    });

    it('preset patients resolve correctly: Ramesh→5, Savitri→3, Anil→2', () => {
      // Ramesh Patel: dailyCap=5 (Mild, masteryScore=65)
      expect(resolveDailyGameCount({ dailyCap: 5, stage: 'Mild / Early Stage', masteryScore: 65 })).toBe(5);
      // Savitri Devi: dailyCap=3 (Moderate, masteryScore=45)
      expect(resolveDailyGameCount({ dailyCap: 3, stage: 'Moderate / Middle Stage', masteryScore: 45 })).toBe(3);
      // Anil Kumar: dailyCap=2 (Severe, masteryScore=20)
      expect(resolveDailyGameCount({ dailyCap: 2, stage: 'Severe / Late Stage', masteryScore: 20 })).toBe(2);
    });
  });

  describe('buildSessionDifficultyCurve', () => {
    it('produces a warmup ramp starting one below base level', () => {
      expect(buildSessionDifficultyCurve(3, 5)).toEqual([4, 5, 6]);
      expect(buildSessionDifficultyCurve(5, 7)).toEqual([6, 7, 8, 9, 10]);
      expect(buildSessionDifficultyCurve(2, 2)).toEqual([1, 2]);
    });

    it('clamps levels to [1, 10]', () => {
      // base=1 → warmup=clamp(0)=1, steps go 1,2,3
      expect(buildSessionDifficultyCurve(3, 1)).toEqual([1, 2, 3]);
      // base=10 → warmup=9, steps go 9,10 — stretch clamped at 10
      expect(buildSessionDifficultyCurve(3, 10)).toEqual([9, 10, 10]);
    });

    it('produces correct length for each game count', () => {
      [2, 3, 4, 5].forEach(count => {
        expect(buildSessionDifficultyCurve(count, 5)).toHaveLength(count);
      });
    });

    it('severe session (2 games) spans exactly 2 difficulty levels — by design', () => {
      // Anil Kumar: masteryScore=20 → baseLevel=2 → curve [1, 2]
      const curve = buildSessionDifficultyCurve(2, 2);
      expect(curve).toHaveLength(2);
      expect(new Set(curve).size).toBeLessThanOrEqual(2);
    });
  });

  describe('assignDailyGames — Variable Count & Structure', () => {
    it('assigns 5 core games + 1 family game for a mild patient (dailyCap=5)', () => {
      const assigned = assignDailyGames({
        patientProfile: { id: 'p_mild', name: 'Ramesh', dailyCap: 5, stage: 'Mild / Early Stage', masteryScore: 65 },
        gamesConfig: GAMES_CONFIG
      });

      expect(assigned).toHaveLength(6);
      expect(assigned.filter(g => !g.isFamilyGame)).toHaveLength(5);
      expect(assigned.filter(g => g.isFamilyGame)).toHaveLength(1);

      // Should cover the first 5 domains in priority order
      const domains = assigned.filter(g => !g.isFamilyGame).map(g => g.category);
      expect(domains).toContain('Memory');
      expect(domains).toContain('Attention');

      // includeFamilyGame: false yields only core games
      const coreOnly = assignDailyGames({
        patientProfile: { id: 'p_mild', name: 'Ramesh', dailyCap: 5, stage: 'Mild / Early Stage', masteryScore: 65 },
        gamesConfig: GAMES_CONFIG,
        includeFamilyGame: false
      });
      expect(coreOnly).toHaveLength(5);
    });

    it('assigns 3 core games + 1 family game for a moderate patient (dailyCap=3)', () => {
      const assigned = assignDailyGames({
        patientProfile: { id: 'p_mod', name: 'Savitri', dailyCap: 3, stage: 'Moderate / Middle Stage', masteryScore: 45 },
        gamesConfig: GAMES_CONFIG
      });

      expect(assigned).toHaveLength(4);
      expect(assigned.filter(g => !g.isFamilyGame)).toHaveLength(3);
      expect(assigned.filter(g => g.isFamilyGame)).toHaveLength(1);

      // Domain priority: Memory, Attention, Reasoning/EF
      const coreCategories = assigned.filter(g => !g.isFamilyGame).map(g => g.category);
      expect(coreCategories).toContain('Memory');
      expect(coreCategories).toContain('Attention');

      // includeFamilyGame: false yields only 3 core games
      const coreOnly = assignDailyGames({
        patientProfile: { id: 'p_mod', name: 'Savitri', dailyCap: 3, stage: 'Moderate / Middle Stage', masteryScore: 45 },
        includeFamilyGame: false
      });
      expect(coreOnly).toHaveLength(3);
    });

    it('assigns 2 core games + 1 family game for a severe patient (dailyCap=2)', () => {
      const assigned = assignDailyGames({
        patientProfile: { id: 'p_sev', name: 'Anil', dailyCap: 2, stage: 'Severe / Late Stage', masteryScore: 20 },
        gamesConfig: GAMES_CONFIG
      });

      expect(assigned).toHaveLength(3);
      expect(assigned.filter(g => !g.isFamilyGame)).toHaveLength(2);
      expect(assigned.filter(g => g.isFamilyGame)).toHaveLength(1);

      // Core domain priority: Memory, Attention
      const coreGames = assigned.filter(g => !g.isFamilyGame);
      expect(coreGames[0].category).toBe('Memory');
      expect(coreGames[1].category).toBe('Attention');

      // includeFamilyGame: false yields only 2 core games
      const coreOnly = assignDailyGames({
        patientProfile: { id: 'p_sev', name: 'Anil', dailyCap: 2, stage: 'Severe / Late Stage', masteryScore: 20 },
        includeFamilyGame: false
      });
      expect(coreOnly).toHaveLength(2);
    });

    it('each game has assignedTier, startingDifficultyTier, domain, assignedDate, sessionLevel', () => {
      const assigned = assignDailyGames({
        patientProfile: { id: 'p_101', name: 'Bhaben', masteryScore: 65 },
        gamesConfig: GAMES_CONFIG
      });

      assigned.forEach(g => {
        expect(g.assignedTier).toBeDefined();
        expect([1, 2, 3]).toContain(g.assignedTier);
        expect(g.startingDifficultyTier).toBe(g.assignedTier);
        expect(g.domain).toBe(g.category);
        expect(g.assignedDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        if (!g.isFamilyGame) {
          expect(g.component).toBeDefined();
        }
        expect(typeof g.sessionLevel).toBe('number');
        expect(g.sessionLevel).toBeGreaterThanOrEqual(1);
        expect(g.sessionLevel).toBeLessThanOrEqual(10);
      });
    });

    it('session difficulty curve increases across assigned core games', () => {
      const assigned = assignDailyGames({
        patientProfile: { id: 'p_curve', masteryScore: 50, dailyCap: 4 },
        gamesConfig: GAMES_CONFIG
      });
      const coreGames = assigned.filter(g => !g.isFamilyGame);
      // Each subsequent sessionLevel must be >= the previous (warmup→stretch)
      for (let i = 1; i < coreGames.length; i++) {
        expect(coreGames[i].sessionLevel).toBeGreaterThanOrEqual(coreGames[i - 1].sessionLevel);
      }
    });

    it('assigns correct tier to games based on patient clinical status', () => {
      const criticalPatient = { id: 'p_crit', status: 'critical' };
      const attentionPatient = { id: 'p_att', status: 'attention' };
      const stablePatient = { id: 'p_stab', status: 'stable' };

      const gamesCrit = assignDailyGames({ patientProfile: criticalPatient });
      expect(gamesCrit.every(g => g.assignedTier === 1)).toBe(true);

      const gamesAtt = assignDailyGames({ patientProfile: attentionPatient });
      expect(gamesAtt.every(g => g.assignedTier === 2)).toBe(true);

      const gamesStab = assignDailyGames({ patientProfile: stablePatient });
      expect(gamesStab.every(g => g.assignedTier === 3)).toBe(true);
    });

    it('correctly processes PRESET_PATIENTS with their designated tiers', () => {
      const [patient1, patient2, patient3] = PRESET_PATIENTS;

      const p1Games = assignDailyGames({ patientProfile: patient1 });
      expect(p1Games.every(g => g.assignedTier === 1)).toBe(true);

      const p2Games = assignDailyGames({ patientProfile: patient2 });
      expect(p2Games.every(g => g.assignedTier === 2)).toBe(true);

      const p3Games = assignDailyGames({ patientProfile: patient3 });
      expect(p3Games.every(g => g.assignedTier === 3)).toBe(true);
    });
  });

  describe('Consecutive Days Rotation & History Awareness', () => {
    it('rotates games on consecutive days for multi-game domains', () => {
      const patient = { id: 'patient_ner_01', name: 'Rupali Borah', dailyCap: 5 };
      const day1 = new Date('2026-09-07T10:00:00Z');
      const day2 = new Date('2026-09-08T10:00:00Z');

      const set1 = assignDailyGames({ patientProfile: patient, date: day1 });
      const set2 = assignDailyGames({ patientProfile: patient, date: day2 });

      // In Memory (7 games): day 1 and day 2 should pick different games
      const mem1 = set1.find(g => g.category === 'Memory');
      const mem2 = set2.find(g => g.category === 'Memory');
      expect(mem1.id).not.toBe(mem2.id);

      // In Attention (2 games): day 1 and day 2 should alternate
      const att1 = set1.find(g => g.category === 'Attention');
      const att2 = set2.find(g => g.category === 'Attention');
      expect(att1.id).not.toBe(att2.id);

      // In Reasoning (4 games): day 1 and day 2 should rotate
      const reas1 = set1.find(g => g.category === 'Reasoning/Executive Function');
      const reas2 = set2.find(g => g.category === 'Reasoning/Executive Function');
      expect(reas1.id).not.toBe(reas2.id);
    });

    it('avoids recently played games when gameHistory is provided', () => {
      const patient = { id: 'patient_ner_02', dailyCap: 5 };
      const date = new Date('2026-09-07T10:00:00Z');

      // First run without history
      const initialSet = assignDailyGames({ patientProfile: patient, date });
      const pickedMemoryId = initialSet.find(g => g.category === 'Memory').id;

      // Run with the previously picked game in history
      const historySet = assignDailyGames({
        patientProfile: patient,
        date,
        gameHistory: [pickedMemoryId]
      });
      const newMemoryId = historySet.find(g => g.category === 'Memory').id;

      expect(newMemoryId).not.toBe(pickedMemoryId);
    });
  });

  describe('Daily Family Game Integration (+1 flat slot)', () => {
    it('FAMILY_GAMES contains all 4 family game identifiers', () => {
      expect(FAMILY_GAMES).toEqual([
        'identity_recall',
        'category_sorting',
        'family_tree',
        'life_timeline'
      ]);
    });

    it('assignDailyGames includes exactly 1 family game as the final node by default', () => {
      const assigned = assignDailyGames({
        patientProfile: { id: 'p_mod', dailyCap: 3, stage: 'Moderate' }
      });
      expect(assigned).toHaveLength(4);
      const lastNode = assigned[assigned.length - 1];
      expect(lastNode.isFamilyGame).toBe(true);
      expect(FAMILY_GAMES).toContain(lastNode.id);
      expect(lastNode.category).toBe('Family & Identity');
      expect(lastNode.domain).toBe('Family & Identity');
      expect(lastNode.culturalTag).toBe('Family Memory');
    });

    it('is strictly additive across all dementia stages without reducing core games', () => {
      // Severe: 2 core + 1 family = 3
      const severe = assignDailyGames({ patientProfile: { id: 'p_sev', dailyCap: 2, stage: 'Severe' } });
      expect(severe).toHaveLength(3);
      expect(severe.filter(g => !g.isFamilyGame)).toHaveLength(2);
      expect(severe.filter(g => g.isFamilyGame)).toHaveLength(1);

      // Moderate: 3 core + 1 family = 4
      const moderate = assignDailyGames({ patientProfile: { id: 'p_mod', dailyCap: 3, stage: 'Moderate' } });
      expect(moderate).toHaveLength(4);
      expect(moderate.filter(g => !g.isFamilyGame)).toHaveLength(3);
      expect(moderate.filter(g => g.isFamilyGame)).toHaveLength(1);

      // Mild: 5 core + 1 family = 6
      const mild = assignDailyGames({ patientProfile: { id: 'p_mild', dailyCap: 5, stage: 'Mild' } });
      expect(mild).toHaveLength(6);
      expect(mild.filter(g => !g.isFamilyGame)).toHaveLength(5);
      expect(mild.filter(g => g.isFamilyGame)).toHaveLength(1);
    });

    it('resolveDailyFamilyGame rotates through all 4 games across 4 consecutive days without immediate repeats', () => {
      const patient = { id: 'patient_rot_test' };
      const baseDate = new Date('2026-09-01T10:00:00Z');
      const picked = [];

      for (let day = 0; day < 4; day++) {
        const d = new Date(baseDate);
        d.setDate(baseDate.getDate() + day);
        const gameId = resolveDailyFamilyGame({ patientProfile: patient, date: d });
        picked.push(gameId);
      }

      // All 4 games should be represented across 4 consecutive days
      expect(new Set(picked).size).toBe(4);
      FAMILY_GAMES.forEach(id => expect(picked).toContain(id));
    });

    it('resolveDailyFamilyGame respects familyGameHistory to select least-recently-played', () => {
      const patient = { id: 'patient_hist_test' };
      const date = new Date('2026-09-01T10:00:00Z');

      // If 3 of the 4 games were played recently, it must choose the 4th unplayed game
      const history = ['identity_recall', 'category_sorting', 'family_tree'];
      const nextGame = resolveDailyFamilyGame({
        patientProfile: patient,
        date,
        familyGameHistory: history
      });
      expect(nextGame).toBe('life_timeline');
    });

    it('includeFamilyGame: false completely excludes family game', () => {
      const assigned = assignDailyGames({
        patientProfile: { id: 'p_sev', dailyCap: 2 },
        includeFamilyGame: false
      });
      expect(assigned).toHaveLength(2);
      expect(assigned.every(g => !g.isFamilyGame)).toBe(true);
    });
  });
});
