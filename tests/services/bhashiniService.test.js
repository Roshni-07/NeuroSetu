import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  matchOfflineKeywords,
  blobToBase64,
  transcribeAudio,
  synthesizeSpeech,
  isBhashiniConfigured,
  ASSAMESE_OFFLINE_KEYWORDS
} from '../../src/services/bhashiniService.js';

describe('Task 15 & 17: Bhashini Speech Service & Assamese Keyword Engine', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('1. matchOfflineKeywords matches Assamese cultural words and aliases', () => {
    // Exact Assamese match
    const dholMatch = matchOfflineKeywords('মই ঢোল শুনিছোঁ');
    expect(dholMatch).not.toBeNull();
    expect(dholMatch.matchedKey).toBe('dhol');

    // Transliterated alias match
    const bihuMatch = matchOfflineKeywords('Rongali bihu festival');
    expect(bihuMatch).not.toBeNull();
    expect(bihuMatch.matchedKey).toBe('bihu');

    // Unknown word returns null
    const unknownMatch = matchOfflineKeywords('some random query');
    expect(unknownMatch).toBeNull();
  });

  it('2. blobToBase64 converts Audio Blob to base64 string', async () => {
    const dummyBlob = new Blob(['mock-audio-data'], { type: 'audio/wav' });
    const base64 = await blobToBase64(dummyBlob);
    expect(typeof base64).toBe('string');
  });

  it('3. transcribeAudio executes on-device keyword fallback when offline or unconfigured', async () => {
    // Unconfigured state
    const result = await transcribeAudio(null, 'as');
    expect(result.success).toBe(true);
    expect(result.isOffline).toBe(true);
    expect(result.provider).toBe('on_device_keyword_spotting');
    expect(result.transcript).toBe('ঢোল');
    expect(result.detectedKeyword).toBe('dhol');
  });

  it('4. transcribeAudio calls live Bhashini API endpoint when configured', async () => {
    // Set mock env credentials
    process.env.VITE_BHASHINI_API_KEY = 'mock_bhashini_key';
    process.env.VITE_BHASHINI_USER_ID = 'mock_user_id';

    const mockResponse = {
      pipelineResponse: [
        {
          output: [
            {
              source: 'পেঁপা বজাওক'
            }
          ]
        }
      ]
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(mockResponse)
    });

    const dummyBlob = new Blob(['audio-data'], { type: 'audio/wav' });
    const result = await transcribeAudio(dummyBlob, 'as');

    expect(result.success).toBe(true);
    expect(result.transcript).toBe('পেঁপা বজাওক');
    expect(result.detectedKeyword).toBe('pepa');
    expect(result.isOffline).toBe(false);
    expect(result.provider).toBe('bhashini_cloud');

    // Clean up mock env
    delete process.env.VITE_BHASHINI_API_KEY;
    delete process.env.VITE_BHASHINI_USER_ID;
  });

  it('5. synthesizeSpeech provides safe fallback to Web Speech API when offline', async () => {
    const mockSpeak = vi.fn();
    const mockCancel = vi.fn();
    window.speechSynthesis = {
      speak: mockSpeak,
      cancel: mockCancel
    };
    global.SpeechSynthesisUtterance = vi.fn();

    const result = await synthesizeSpeech('নমস্কাৰ', 'as');
    expect(result.success).toBe(true);
    expect(result.isOffline).toBe(true);
    expect(result.provider).toBe('browser_web_speech');
  });
});
