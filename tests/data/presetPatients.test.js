import { describe, it, expect } from 'vitest';
import {
  PRESET_PATIENTS,
  getPresetPatientByPin,
  getDailyRecommendations
} from '../../src/data/presetPatients.js';

describe('Preset Dementia Patient Profiles & Recommendations', () => {
  it('defines exactly 3 clinical preset profiles with required attributes', () => {
    expect(PRESET_PATIENTS).toHaveLength(3);

    // Profile 1: Mild / Early Stage
    const p1 = PRESET_PATIENTS.find(p => p.id === 'preset-1');
    expect(p1).toBeDefined();
    expect(p1.name).toBe('Ramesh Patel');
    expect(p1.pin).toBe('100100');
    expect(p1.age).toBe(68);
    expect(p1.stage).toBe('Mild / Early Stage');
    expect(p1.dailyCap).toBe(5);
    expect(p1.recommendedGames).toEqual([
      'grandmas-shopping-list',
      'find-the-difference',
      'daily-routine-recall',
      'remember-the-story',
      'care-for-companion'
    ]);

    // Profile 2: Moderate / Middle Stage
    const p2 = PRESET_PATIENTS.find(p => p.id === 'preset-2');
    expect(p2).toBeDefined();
    expect(p2.name).toBe('Savitri Devi');
    expect(p2.pin).toBe('200200');
    expect(p2.age).toBe(74);
    expect(p2.stage).toBe('Moderate / Middle Stage');
    expect(p2.dailyCap).toBe(3);
    expect(p2.recommendedGames).toEqual([
      'whose-morning-is-it',
      'festival-memory-match',
      'shell-memory-trail'
    ]);

    // Profile 3: Severe / Late Stage
    const p3 = PRESET_PATIENTS.find(p => p.id === 'preset-3');
    expect(p3).toBeDefined();
    expect(p3.name).toBe('Anil Kumar');
    expect(p3.pin).toBe('300300');
    expect(p3.age).toBe(81);
    expect(p3.stage).toBe('Severe / Late Stage');
    expect(p3.dailyCap).toBe(2);
    expect(p3.recommendedGames).toEqual([
      'whose-morning-is-it',
      'care-for-companion'
    ]);
  });

  describe('getPresetPatientByPin', () => {
    it('finds patient profile by string PIN', () => {
      const patient = getPresetPatientByPin('100100');
      expect(patient).toBeDefined();
      expect(patient.id).toBe('preset-1');
      expect(patient.name).toBe('Ramesh Patel');
    });

    it('finds patient profile by numeric PIN', () => {
      const patient = getPresetPatientByPin(200200);
      expect(patient).toBeDefined();
      expect(patient.id).toBe('preset-2');
      expect(patient.name).toBe('Savitri Devi');
    });

    it('returns null for unknown PIN or null/undefined', () => {
      expect(getPresetPatientByPin('999999')).toBeNull();
      expect(getPresetPatientByPin(null)).toBeNull();
      expect(getPresetPatientByPin(undefined)).toBeNull();
    });
  });

  describe('getDailyRecommendations', () => {
    it('returns recommended games array for preset-1', () => {
      const games = getDailyRecommendations('preset-1');
      expect(games).toHaveLength(5);
      expect(games).toContain('grandmas-shopping-list');
      expect(games).toContain('care-for-companion');
    });

    it('returns recommended games array for preset-2', () => {
      const games = getDailyRecommendations('preset-2');
      expect(games).toEqual([
        'whose-morning-is-it',
        'festival-memory-match',
        'shell-memory-trail'
      ]);
    });

    it('returns recommended games array for preset-3', () => {
      const games = getDailyRecommendations('preset-3');
      expect(games).toEqual([
        'whose-morning-is-it',
        'care-for-companion'
      ]);
    });

    it('returns recommended games when passed patient object', () => {
      const games = getDailyRecommendations({ id: 'preset-3' });
      expect(games).toHaveLength(2);
    });

    it('returns empty array for unknown or missing patientId', () => {
      expect(getDailyRecommendations('unknown-id')).toEqual([]);
      expect(getDailyRecommendations(null)).toEqual([]);
      expect(getDailyRecommendations(undefined)).toEqual([]);
    });
  });
});
