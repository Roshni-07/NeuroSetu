import { describe, it, expect } from 'vitest';
import {
  GAMES_LOCALIZATION,
  CATEGORY_LOCALIZATIONS,
  UI_LOCALIZATIONS,
  getLocalizedGame,
  getGameVoiceExplanation,
  getCategoryLocalized,
  getUIString
} from '../../src/data/gamesLocalization.js';
import { GAMES_CONFIG } from '../../src/data/gamesConfig.js';
import { SUPPORTED_LANGUAGES } from '../../src/data/multilingualAudioHelp.js';

describe('gamesLocalization.js - Multilingual & Voice Guide Verification', () => {
  it('1. Provides localization and voice explanation scripts for all 15 suite games', () => {
    expect(GAMES_CONFIG.length).toBe(15);

    GAMES_CONFIG.forEach((game) => {
      const loc = GAMES_LOCALIZATION[game.id];
      expect(loc).toBeDefined();
      expect(loc.en).toBeDefined();
      expect(loc.en.name).toBeTruthy();
      expect(loc.en.voiceExplanation).toBeTruthy();
      expect(loc.as).toBeDefined();
      expect(loc.as.name).toBeTruthy();
      expect(loc.as.voiceExplanation).toBeTruthy();
      expect(loc.hi).toBeDefined();
      expect(loc.hi.name).toBeTruthy();
      expect(loc.hi.voiceExplanation).toBeTruthy();
    });
  });

  it('2. getLocalizedGame returns localized properties according to selected language', () => {
    const rawGame = GAMES_CONFIG.find((g) => g.id === 'grandmas-shopping-list');
    expect(rawGame).toBeDefined();

    const enGame = getLocalizedGame(rawGame, 'en');
    expect(enGame.name).toBe("Grandma's Shopping List");

    const asGame = getLocalizedGame(rawGame, 'as');
    expect(asGame.name).toBe('আইতাৰ বজাৰৰ তালিকা');

    const hiGame = getLocalizedGame(rawGame, 'hi');
    expect(hiGame.name).toBe('दादी की बाज़ार की सूची');

    const bnGame = getLocalizedGame(rawGame, 'bn');
    expect(bnGame.name).toBe('ঠাকুরমার বাজারের ফর্দ');
  });

  it('3. getGameVoiceExplanation returns valid spoken scripts across all supported languages', () => {
    SUPPORTED_LANGUAGES.forEach((lang) => {
      const voiceText = getGameVoiceExplanation('festival-memory-match', lang.code);
      expect(voiceText).toBeTruthy();
      expect(typeof voiceText).toBe('string');
      expect(voiceText.length).toBeGreaterThan(10);
    });
  });

  it('4. getCategoryLocalized returns accurate category names across languages', () => {
    const memAs = getCategoryLocalized('Memory', 'as');
    expect(memAs.title).toBe('স্মৃতি অনুশীলন');

    const memHi = getCategoryLocalized('Memory', 'hi');
    expect(memHi.title).toBe('स्मृति और याददाश्त');

    const attEn = getCategoryLocalized('Attention', 'en');
    expect(attEn.title).toBe('Attention & Focus');
  });

  it('5. getUIString translates UI elements across languages', () => {
    expect(getUIString('hubTitle', 'en')).toBe('NeuroSetu Cognitive Hub');
    expect(getUIString('hubTitle', 'as')).toBe('নিওৰোসেতু কগনিটিভ হাব');
    expect(getUIString('howToPlay', 'hi')).toBe('खेलने का तरीका');
    expect(getUIString('voiceGuide', 'as')).toBe('মাত শুনক (নিয়ম)');
  });
});
