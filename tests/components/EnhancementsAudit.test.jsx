import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import PatientOnboardingModal from '../../src/components/onboarding/PatientOnboardingModal.jsx';
import WelcomeLanding from '../../src/pages/WelcomeLanding.jsx';
import MemoryRecallGame from '../../src/components/games/MemoryRecallGame.jsx';
import GameTutorialOverlay from '../../src/components/games/GameTutorialOverlay.jsx';
import { clearAllLocalData, closeDB } from '../../src/db/indexedDb.js';
import { hasConfiguredPin, getActiveSession } from '../../src/services/authService.js';
import * as bhashiniService from '../../src/services/bhashiniService.js';

describe('Audit Enhancements & Fixes Verification (Items 1–6)', () => {
  beforeEach(async () => {
    await clearAllLocalData();
    localStorage.clear();
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(async () => {
    await closeDB();
  });

  it('1. Language Authenticity: Restricted to authentic Assamese and English only (no false fallbacks)', () => {
    render(<PatientOnboardingModal isOpen={true} isInitialSignup={false} />);

    const languageSelect = screen.getByLabelText(/পছন্দৰ ভাষা/i);
    const options = Array.from(languageSelect.querySelectorAll('option')).map(o => o.value);

    // Verify only 'as' and 'en' are offered
    expect(options).toEqual(['as', 'en']);
    expect(options).not.toContain('mni');
    expect(options).not.toContain('lus');
  });

  it('2. Language Authenticity: English profile renders English prompt as primary and invokes English TTS', async () => {
    const speakSpy = vi.spyOn(bhashiniService, 'synthesizeSpeech').mockResolvedValue({ success: true });

    const englishProfile = {
      name: 'John Hmar',
      homeState: 'Assam',
      villageTown: 'Haflong',
      language: 'en',
      familyMembers: [{ name: 'Mary', relationship: 'daughter' }]
    };

    render(
      <MemoryRecallGame
        profileId="patient_en"
        patientProfile={englishProfile}
        promptDurationMs={10}
        rewardDurationMs={50}
      />
    );

    // Primary question in English
    await waitFor(() => {
      expect(screen.getByText(/Do you remember celebrations in Haflong with Mary/i)).toBeInTheDocument();
      expect(screen.getByText(/Bihu Drum/i)).toBeInTheDocument();
    });

    // Click speaker button
    const speakBtn = screen.getByRole('button', { name: /Listen to question/i });
    fireEvent.click(speakBtn);

    expect(speakSpy).toHaveBeenCalledWith(
      expect.stringContaining('Do you remember celebrations in Haflong with Mary'),
      'en'
    );
  });

  it('3. First-Load Welcome Landing: Renders app identity, purpose, and Get Started CTA', () => {
    const handleGetStarted = vi.fn();
    const handleEnterPin = vi.fn();

    render(
      <WelcomeLanding
        onGetStarted={handleGetStarted}
        onEnterPin={handleEnterPin}
      />
    );

    expect(screen.getAllByText(/NeuroSetu/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/নিওৰোসেতু/i)).toBeInTheDocument();
    expect(screen.getByText(/Culturally grounded cognitive stimulation/i)).toBeInTheDocument();
    expect(screen.getByText(/১০০% অফলাইন সুৰক্ষা/i)).toBeInTheDocument();

    const startBtn = screen.getByRole('button', { name: /প্ৰথমবাৰ আৰম্ভ কৰক/i });
    fireEvent.click(startBtn);
    expect(handleGetStarted).toHaveBeenCalledTimes(1);

    const pinBtn = screen.getByRole('button', { name: /পিন প্ৰৱেশ কৰক/i });
    fireEvent.click(pinBtn);
    expect(handleEnterPin).toHaveBeenCalledTimes(1);
  });

  it('4. Gated Signup Flow: 5-step onboarding creates profile, sets 4-digit PIN, and establishes session', async () => {
    const handleSave = vi.fn();

    render(
      <PatientOnboardingModal
        isOpen={true}
        isInitialSignup={true}
        onSave={handleSave}
      />
    );

    expect(screen.getByText(/1 \/ 5/i)).toBeInTheDocument();

    // Step 1
    fireEvent.change(screen.getByLabelText(/ৰোগীৰ সম্পূৰ্ণ নাম/i), { target: { value: 'Dhiren Das' } });
    fireEvent.change(screen.getByLabelText(/গৃহগাঁও বা চহৰ/i), { target: { value: 'Barpeta' } });
    fireEvent.click(screen.getByRole('button', { name: /পৰৱৰ্তী/i }));

    // Step 2
    fireEvent.change(screen.getByLabelText(/নিকট আত্মীয়ৰ নাম/i), { target: { value: 'Minati' } });
    fireEvent.click(screen.getByRole('button', { name: /পৰৱৰ্তী/i }));

    // Step 3
    fireEvent.click(screen.getByRole('button', { name: /পৰৱৰ্তী/i }));

    // Step 4
    fireEvent.click(screen.getByRole('button', { name: /পৰৱৰ্তী/i }));

    // Step 5: PIN Setup
    expect(screen.getByText(/৫\. ৪-সংখ্যাৰ পিন নিৰ্ধাৰণ/i)).toBeInTheDocument();
    expect(screen.getByText(/5 \/ 5/i)).toBeInTheDocument();

    const pinInput = screen.getByLabelText(/৪-সংখ্যাৰ নতুন পিন/i);
    const confirmInput = screen.getByLabelText(/পিন পুনৰ দিয়ক/i);

    fireEvent.change(pinInput, { target: { value: '4321' } });
    fireEvent.change(confirmInput, { target: { value: '4321' } });

    const saveBtn = screen.getByRole('button', { name: /সংৰক্ষণ আৰু প্ৰৱেশ/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(handleSave).toHaveBeenCalled();
    });

    // Verify PIN was configured and session active
    expect(hasConfiguredPin()).toBe(true);
    const session = getActiveSession();
    expect(session).toBeDefined();
    expect(session.profileName).toBe('Dhiren Das');
  });

  it('5. Game Tutorial Overlay: Displays instructions, speaks audio guide, and allows dismissal', () => {
    const speakSpy = vi.spyOn(bhashiniService, 'synthesizeSpeech').mockResolvedValue({ success: true });
    const handleStart = vi.fn();

    render(
      <GameTutorialOverlay
        gameType="memory_recall"
        language="as"
        isOpen={true}
        onStart={handleStart}
      />
    );

    expect(screen.getByText(/সাংস্কৃতিক স্মৃতি খেলৰ নিৰ্দেশনা/i)).toBeInTheDocument();
    expect(screen.getByText(/ছবিখন চাওক আৰু প্ৰশ্নটো পঢ়ক/i)).toBeInTheDocument();

    // Test audio guide
    const audioBtn = screen.getByRole('button', { name: /নিৰ্দেশনা শুনক/i });
    fireEvent.click(audioBtn);
    expect(speakSpy).toHaveBeenCalledWith(expect.any(String), 'as');

    // Test start game
    const startBtn = screen.getByRole('button', { name: /খেল আৰম্ভ কৰক/i });
    fireEvent.click(startBtn);
    expect(handleStart).toHaveBeenCalledTimes(1);
  });

  it('6. Visible DDA Progression: Renders tier level indicators and help trigger', async () => {
    render(
      <MemoryRecallGame
        profileId="patient_dda"
        initialTier={2}
        promptDurationMs={10}
        rewardDurationMs={50}
      />
    );

    await waitFor(() => {
      // Visible progression indicator in header
      expect(screen.getByText(/পৰ্যায় 2:/i)).toBeInTheDocument();
      expect(screen.getByText(/মানক/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /\(\?\) সহায়/i })).toBeInTheDocument();
    });
  });
});
