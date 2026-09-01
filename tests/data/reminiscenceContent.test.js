import { describe, it, expect } from 'vitest';
import {
  NER_STATES,
  STATE_MEMORY_TASKS,
  STATE_TEXTILE_TASKS,
  OCCUPATION_SEQUENCING_TASKS,
  getCulturalContentByState,
  getSequencingTaskByOccupation,
  interpolatePersonalPrompt
} from '../../src/data/reminiscenceContent.js';

describe('NER Deep Localization & Reminiscence Content Tests', () => {
  it('1. All 8 NER states have dedicated cultural memory tasks with authentic assets', () => {
    const states = Object.values(NER_STATES);
    expect(states.length).toBe(8);

    states.forEach((stateName) => {
      const memoryTasks = STATE_MEMORY_TASKS[stateName];
      expect(memoryTasks).toBeDefined();
      expect(memoryTasks.length).toBeGreaterThan(0);
      expect(memoryTasks[0].state).toBe(stateName);
      expect(memoryTasks[0].correctAnswer).toBeDefined();
      expect(memoryTasks[0].acceptedAliases.length).toBeGreaterThan(0);
    });

    // Check specific distinct state instruments
    expect(STATE_MEMORY_TASKS[NER_STATES.ASSAM][0].id).toBe('mem_bihu_dhol');
    expect(STATE_MEMORY_TASKS[NER_STATES.MANIPUR][0].id).toBe('mem_mani_pena');
    expect(STATE_MEMORY_TASKS[NER_STATES.MIZORAM][0].id).toBe('mem_mizo_khuang');
    expect(STATE_MEMORY_TASKS[NER_STATES.NAGALAND][0].id).toBe('mem_naga_logdrum');
  });

  it('2. All 8 NER states have authentic handloom textile matching tasks', () => {
    const states = Object.values(NER_STATES);

    states.forEach((stateName) => {
      const textileTasks = STATE_TEXTILE_TASKS[stateName];
      expect(textileTasks).toBeDefined();
      expect(textileTasks.length).toBeGreaterThan(0);
      expect(textileTasks[0].state).toBe(stateName);
      expect(textileTasks[0].patternColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(textileTasks[0].options.length).toBeGreaterThanOrEqual(3);
    });

    // Check specific regional handlooms
    expect(STATE_TEXTILE_TASKS[NER_STATES.ASSAM][0].id).toBe('pat_muga_silk');
    expect(STATE_TEXTILE_TASKS[NER_STATES.MEGHALAYA][0].id).toBe('pat_garo_dakmanda');
    expect(STATE_TEXTILE_TASKS[NER_STATES.MIZORAM][0].id).toBe('pat_mizo_puanchei');
    expect(STATE_TEXTILE_TASKS[NER_STATES.NAGALAND][0].id).toBe('pat_naga_shawl');
  });

  it('3. getSequencingTaskByOccupation maps occupations to respective routines with fallback', () => {
    const teaTask = getSequencingTaskByOccupation('Tea Plantation Worker');
    expect(teaTask.id).toBe('seq_tea_plucking');
    expect(teaTask.steps.length).toBe(4);

    const weaverTask = getSequencingTaskByOccupation('Handloom Weaver');
    expect(weaverTask.id).toBe('seq_handloom_weaving');
    expect(weaverTask.steps.length).toBe(4);

    const teacherTask = getSequencingTaskByOccupation('Primary School Teacher');
    expect(teacherTask.id).toBe('seq_classroom_prep');
    expect(teacherTask.steps.length).toBe(4);

    // Fallback for unknown/unprovided occupation
    const fallbackTask = getSequencingTaskByOccupation(null);
    expect(fallbackTask.id).toBe('seq_assam_tea');
    expect(fallbackTask.occupation).toBe('homemaker');
  });

  it('4. interpolatePersonalPrompt dynamically injects family member names and hometown', () => {
    const profile = {
      name: 'Bhaben Kalita',
      homeState: 'Assam',
      villageTown: 'Sualkuchi',
      familyMembers: [{ name: 'Rumi', relationship: 'daughter' }]
    };

    const templateAs = '{name}ৰ লগত {village}ত বিহু চোৱা মনত আছেনে?';
    const result = interpolatePersonalPrompt(templateAs, profile);

    expect(result).toBe('Rumiৰ লগত Sualkuchiত বিহু চোৱা মনত আছেনে?');
  });
});
