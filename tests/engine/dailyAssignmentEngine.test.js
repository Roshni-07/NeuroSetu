import { describe, it, expect } from 'vitest';
import {
  assignDailyGames,
  COGNITIVE_DOMAINS,
  resolvePatientStartingTier
} from '../../src/engine/dailyAssignmentEngine.js';
import {
  assignDailyGames as ddaAssignDailyGames,
  COGNITIVE_DOMAINS as ddaCognitiveDomains
} from '../../src/engine/ddaEngine.js';
import { GAMES_CONFIG } from '../../src/data/gamesConfig.js';
import { SAMPLE_ASHA_PATIENTS } from '../../src/components/dashboard/PatientTriageList.jsx';

describe('dailyAssignmentEngine', () => {
  it('re-exports cleanly from ddaEngine.js', () => {
    expect(ddaAssignDailyGames).toBe(assignDailyGames);
    expect(ddaCognitiveDomains).toEqual(COGNITIVE_DOMAINS);
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

  describe('assignDailyGames 5-Domain Coverage & Structure', () => {
    it('assigns exactly 5 games, covering each cognitive domain once', () => {
      const assigned = assignDailyGames({
        patientProfile: { id: 'p_101', name: 'Bhaben' },
        gamesConfig: GAMES_CONFIG
      });

      expect(assigned).toHaveLength(5);

      const assignedCategories = assigned.map((g) => g.category);
      COGNITIVE_DOMAINS.forEach((domain) => {
        expect(assignedCategories).toContain(domain);
      });

      // Verify each game has assignedTier, startingDifficultyTier, domain, and assignedDate
      assigned.forEach((g) => {
        expect(g.assignedTier).toBeDefined();
        expect([1, 2, 3]).toContain(g.assignedTier);
        expect(g.startingDifficultyTier).toBe(g.assignedTier);
        expect(g.domain).toBe(g.category);
        expect(g.assignedDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(g.component).toBeDefined();
      });
    });

    it('assigns correct tier to games based on patient clinical status', () => {
      const criticalPatient = { id: 'p_crit', status: 'critical' };
      const attentionPatient = { id: 'p_att', status: 'attention' };
      const stablePatient = { id: 'p_stab', status: 'stable' };

      const gamesCrit = assignDailyGames({ patientProfile: criticalPatient });
      expect(gamesCrit.every((g) => g.assignedTier === 1)).toBe(true);

      const gamesAtt = assignDailyGames({ patientProfile: attentionPatient });
      expect(gamesAtt.every((g) => g.assignedTier === 2)).toBe(true);

      const gamesStab = assignDailyGames({ patientProfile: stablePatient });
      expect(gamesStab.every((g) => g.assignedTier === 3)).toBe(true);
    });

    it('correctly processes SAMPLE_ASHA_PATIENTS with their designated tiers', () => {
      const [patient1, patient2, patient3] = SAMPLE_ASHA_PATIENTS;

      const p1Games = assignDailyGames({ patientProfile: patient1 });
      expect(p1Games.every((g) => g.assignedTier === 1)).toBe(true);

      const p2Games = assignDailyGames({ patientProfile: patient2 });
      expect(p2Games.every((g) => g.assignedTier === 2)).toBe(true);

      const p3Games = assignDailyGames({ patientProfile: patient3 });
      expect(p3Games.every((g) => g.assignedTier === 3)).toBe(true);
    });
  });

  describe('Consecutive Days Rotation & History Awareness', () => {
    it('rotates games on consecutive days for multi-game domains', () => {
      const patient = { id: 'patient_ner_01', name: 'Rupali Borah' };
      const day1 = new Date('2026-09-07T10:00:00Z');
      const day2 = new Date('2026-09-08T10:00:00Z');

      const set1 = assignDailyGames({ patientProfile: patient, date: day1 });
      const set2 = assignDailyGames({ patientProfile: patient, date: day2 });

      // In Memory (7 games): day 1 and day 2 should pick different games
      const mem1 = set1.find((g) => g.category === 'Memory');
      const mem2 = set2.find((g) => g.category === 'Memory');
      expect(mem1.id).not.toBe(mem2.id);

      // In Attention (2 games): day 1 and day 2 should alternate
      const att1 = set1.find((g) => g.category === 'Attention');
      const att2 = set2.find((g) => g.category === 'Attention');
      expect(att1.id).not.toBe(att2.id);

      // In Reasoning (4 games): day 1 and day 2 should rotate
      const reas1 = set1.find((g) => g.category === 'Reasoning/Executive Function');
      const reas2 = set2.find((g) => g.category === 'Reasoning/Executive Function');
      expect(reas1.id).not.toBe(reas2.id);
    });

    it('avoids recently played games when gameHistory is provided', () => {
      const patient = { id: 'patient_ner_02' };
      const date = new Date('2026-09-07T10:00:00Z');

      // First run without history
      const initialSet = assignDailyGames({ patientProfile: patient, date });
      const pickedMemoryId = initialSet.find((g) => g.category === 'Memory').id;

      // Run with the previously picked game in history
      const historySet = assignDailyGames({
        patientProfile: patient,
        date,
        gameHistory: [pickedMemoryId]
      });
      const newMemoryId = historySet.find((g) => g.category === 'Memory').id;

      expect(newMemoryId).not.toBe(pickedMemoryId);
    });
  });
});
