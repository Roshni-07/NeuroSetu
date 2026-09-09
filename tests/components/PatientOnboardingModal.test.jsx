import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import PatientOnboardingModal from '../../src/components/onboarding/PatientOnboardingModal.jsx';
import GridMemoryGame from '../../src/components/games/GridMemoryGame.jsx';
import SequenceOrderGame from '../../src/components/games/SequenceOrderGame.jsx';
import { clearAllLocalData, closeDB, getProfile } from '../../src/db/indexedDb.js';

describe('NER Deep Localization & Personalized Reminiscence Tests', () => {
  beforeEach(async () => {
    await clearAllLocalData();
    vi.restoreAllMocks();
  });

  afterEach(async () => {
    await closeDB();
  });

  it('1. PatientOnboardingModal captures 4-step intake data and persists to IndexedDB', async () => {
    const handleSave = vi.fn();
    const handleClose = vi.fn();

    render(
      <PatientOnboardingModal
        isOpen={true}
        onSave={handleSave}
        onClose={handleClose}
      />
    );

    expect(screen.getByText(/১\. আঞ্চলিক পৰিচয়/i)).toBeInTheDocument();

    // Fill Step 1: Name and village
    const nameInput = screen.getByLabelText(/ৰোগীৰ সম্পূৰ্ণ নাম/i);
    fireEvent.change(nameInput, { target: { value: 'Padmeswar Deka' } });

    const stateSelect = screen.getByLabelText(/NER State/i);
    fireEvent.change(stateSelect, { target: { value: 'Assam' } });

    const villageInput = screen.getByLabelText(/গৃহগাঁও বা চহৰ/i);
    fireEvent.change(villageInput, { target: { value: 'Sualkuchi' } });

    const langSelect = screen.getByLabelText(/Preferred Language/i);
    fireEvent.change(langSelect, { target: { value: 'as' } });

    const sexSelect = screen.getByLabelText(/Sex/i);
    fireEvent.change(sexSelect, { target: { value: 'male' } });

    // Next to Step 2
    fireEvent.click(screen.getByRole('button', { name: /পৰৱৰ্তী/i }));

    // Step 2: Family member name
    expect(screen.getByText(/২\. পৰিয়ালৰ সদস্য/i)).toBeInTheDocument();
    expect(screen.getByText(/গোপনীয়তা সংৰক্ষণ/i)).toBeInTheDocument();

    const familyInput = screen.getByLabelText(/নিকট আত্মীয়ৰ নাম/i);
    fireEvent.change(familyInput, { target: { value: 'Rumi' } });

    const relSelect = screen.getByLabelText(/Relationship/i);
    fireEvent.change(relSelect, { target: { value: 'daughter' } });

    // Next to Step 3
    fireEvent.click(screen.getByRole('button', { name: /পৰৱৰ্তী/i }));

    // Step 3: Occupation selector (select Handloom Weaver)
    expect(screen.getByText(/৩\. পূৰ্বৰ জীৱিকা/i)).toBeInTheDocument();
    const weaverBtn = screen.getByRole('button', { name: /তাঁতী \/ শিপিনী/i });
    fireEvent.click(weaverBtn);

    // Next to Step 4
    fireEvent.click(screen.getByRole('button', { name: /পৰৱৰ্তী/i }));

    // Step 4: Cultural Anchors & Phase 2 note
    expect(screen.getByText(/৪\. প্ৰিয় উৎসৱ আৰু খাদ্য/i)).toBeInTheDocument();
    expect(screen.getByText(/Phase 2 Feature Notice/i)).toBeInTheDocument();

    // Fill required festival and food fields
    fireEvent.change(screen.getByLabelText(/Favorite Cultural Festival/i), { target: { value: 'Rongali Bihu' } });
    fireEvent.change(screen.getByLabelText(/Favorite Traditional Dish/i), { target: { value: 'Masor Tenga' } });

    // Next to Step 5: Elder's Daily Routine
    fireEvent.click(screen.getByRole('button', { name: /পৰৱৰ্তী/i }));

    // Step 5: Elder's Daily Routine
    expect(screen.getByText(/৫\. দৈনন্দিন কাৰ্যসূচী/i)).toBeInTheDocument();
    expect(screen.getByText(/দৈনন্দিন ক্ৰম নিৰ্ধাৰণ/i)).toBeInTheDocument();

    // Save profile from Step 5
    const saveBtn = screen.getByRole('button', { name: /সংৰক্ষণ কৰক/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(handleSave).toHaveBeenCalled();
    });

    // Verify stored in IndexedDB profiles store
    const saved = handleSave.mock.calls[0][0];
    const fromDB = await getProfile(saved.id);
    expect(fromDB).toBeDefined();
    expect(fromDB.name).toBe('Padmeswar Deka');
    expect(fromDB.villageTown).toBe('Sualkuchi');
    expect(fromDB.formerOccupation).toBe('weaver');
    expect(fromDB.familyMembers[0].name).toBe('Rumi');
    expect(fromDB.dailyRoutine).toBeDefined();
    expect(fromDB.dailyRoutine.length).toBeGreaterThanOrEqual(4);
    expect(fromDB.starting_difficulty_tier).toBe(1);
  });

  it('2. GridMemoryGame personalizes prompts dynamically with family name and hometown', async () => {
    const personalizedProfile = {
      name: 'Padmeswar Deka',
      homeState: 'Assam',
      villageTown: 'Sualkuchi',
      familyMembers: [{ name: 'Rumi', relationship: 'daughter' }]
    };

    render(
      <GridMemoryGame
        profileId="patient_deka"
        patientProfile={personalizedProfile}
        promptDurationMs={10}
        rewardDurationMs={50}
      />
    );

    // Prompt must contain injected family name and hometown
    await waitFor(() => {
      expect(screen.getByText(/Rumiৰ লগত Sualkuchiত/i)).toBeInTheDocument();
      expect(screen.getByText(/Do you remember celebrations in Sualkuchi with Rumi/i)).toBeInTheDocument();
    });
  });

  it('3. GridMemoryGame loads state-specific cultural assets (e.g. Manipur Pena for Manipur patient)', async () => {
    const manipurProfile = {
      name: 'Tombi Devi',
      homeState: 'Manipur',
      villageTown: 'Nambol',
      familyMembers: [{ name: 'Sanatombi', relationship: 'daughter' }]
    };

    render(
      <GridMemoryGame
        profileId="patient_tombi"
        patientProfile={manipurProfile}
        promptDurationMs={10}
        rewardDurationMs={50}
      />
    );

    // Renders Manipuri Pena
    await waitFor(() => {
      expect(screen.getByText(/মণিপুৰৰ পেনা/i)).toBeInTheDocument();
      expect(screen.getByText(/পেনা \(Pena\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Sanatombiৰ সৈতে Nambolত/i)).toBeInTheDocument();
    });
  });

  it('4. SequenceOrderGame maps task steps to patient occupation (Weaver vs Teacher)', () => {
    // 1. Handloom Weaver profile
    const weaverProfile = {
      formerOccupation: 'weaver'
    };

    const { rerender } = render(
      <SequenceOrderGame
        profileId="patient_weaver"
        patientProfile={weaverProfile}
      />
    );

    expect(screen.getByText(/তাঁত শাল সজোৱা আৰু বোৱা/i)).toBeInTheDocument();
    expect(screen.getByText(/১\. চেৰেকী আৰু ববীনত সূতাখিনি/i)).toBeInTheDocument();

    // 2. Teacher profile
    const teacherProfile = {
      formerOccupation: 'teacher_clerk'
    };

    rerender(
      <SequenceOrderGame
        profileId="patient_teacher"
        patientProfile={teacherProfile}
      />
    );

    expect(screen.getByText(/পাঠদান আৰু বহী সজোৱা/i)).toBeInTheDocument();
    expect(screen.getByText(/১\. ছাত্ৰ-ছাত্ৰীৰ উপস্থিতিৰ বহীখন/i)).toBeInTheDocument();
  });
});
