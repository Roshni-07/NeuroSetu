import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import PatientOnboardingModal from '../../src/components/onboarding/PatientOnboardingModal.jsx';
import DailyRoutineRecall from '../../src/games/DailyRoutineRecall.jsx';
import { clearAllLocalData, closeDB, getProfile } from '../../src/db/indexedDb.js';

describe('Daily Routine Uncapped Entries & Downstream Integration', () => {
  beforeEach(async () => {
    await clearAllLocalData();
    vi.restoreAllMocks();
  });

  afterEach(async () => {
    await closeDB();
  });

  it('1. Allows adding routine entries well past 6 items without the Add button disappearing', () => {
    render(
      <PatientOnboardingModal
        isOpen={true}
        initialProfile={{
          name: 'Bhaben Kalita',
          homeState: 'Assam',
          villageTown: 'Hajo',
          language: 'as',
          sex: 'female',
          familyMembers: [{ name: 'Rumi', relationship: 'daughter' }],
          formerOccupation: 'farmer',
          dailyRoutine: [
            { id: '1', label: 'Item 1', time: '6 AM', icon: '☕' },
            { id: '2', label: 'Item 2', time: '7 AM', icon: '🌿' },
            { id: '3', label: 'Item 3', time: '8 AM', icon: '💊' },
            { id: '4', label: 'Item 4', time: '9 AM', icon: '🍲' },
            { id: '5', label: 'Item 5', time: '10 AM', icon: '🌙' }
          ]
        }}
      />
    );

    // Navigate to Step 5
    const nextBtn = screen.getByRole('button', { name: /পৰৱৰ্তী/i });
    fireEvent.click(nextBtn); // Step 2
    fireEvent.click(nextBtn); // Step 3
    fireEvent.click(nextBtn); // Step 4
    // Fill required fields on Step 4
    fireEvent.change(screen.getByLabelText(/Favorite Cultural Festival/i), { target: { value: 'Bihu' } });
    fireEvent.change(screen.getByLabelText(/Favorite Traditional Dish/i), { target: { value: 'Masor Tenga' } });
    fireEvent.click(nextBtn); // Step 5: Daily Routine

    expect(screen.getByText(/৫\. দৈনন্দিন কাৰ্যসূচী/i)).toBeInTheDocument();

    // Initially 5 items
    expect(screen.getAllByLabelText(/Routine activity/i)).toHaveLength(5);

    // Add 6th item
    let addBtn = screen.getByRole('button', { name: /Add Routine Activity/i });
    fireEvent.click(addBtn);
    expect(screen.getAllByLabelText(/Routine activity/i)).toHaveLength(6);

    // Add 7th item (previously capped at 6)
    addBtn = screen.getByRole('button', { name: /Add Routine Activity/i });
    expect(addBtn).toBeInTheDocument();
    fireEvent.click(addBtn);
    expect(screen.getAllByLabelText(/Routine activity/i)).toHaveLength(7);

    // Add 8th, 9th, and 10th items
    addBtn = screen.getByRole('button', { name: /Add Routine Activity/i });
    fireEvent.click(addBtn);
    addBtn = screen.getByRole('button', { name: /Add Routine Activity/i });
    fireEvent.click(addBtn);
    addBtn = screen.getByRole('button', { name: /Add Routine Activity/i });
    fireEvent.click(addBtn);

    expect(screen.getAllByLabelText(/Routine activity/i)).toHaveLength(10);
    // Button still present and shows 10 items
    expect(screen.getByRole('button', { name: /Add Routine Activity — 10/i })).toBeInTheDocument();
  });

  it('2. Allows deleting entries down past 4 items, locking delete only at 2 items', () => {
    render(
      <PatientOnboardingModal
        isOpen={true}
        initialProfile={{
          name: 'Bhaben Kalita',
          homeState: 'Assam',
          villageTown: 'Hajo',
          language: 'as',
          sex: 'female',
          familyMembers: [{ name: 'Rumi', relationship: 'daughter' }],
          formerOccupation: 'farmer',
          dailyRoutine: [
            { id: '1', label: 'Item 1', time: '6 AM', icon: '☕' },
            { id: '2', label: 'Item 2', time: '7 AM', icon: '🌿' },
            { id: '3', label: 'Item 3', time: '8 AM', icon: '💊' },
            { id: '4', label: 'Item 4', time: '9 AM', icon: '🍲' },
            { id: '5', label: 'Item 5', time: '10 AM', icon: '🌙' }
          ]
        }}
      />
    );

    // Navigate to Step 5
    const nextBtn = screen.getByRole('button', { name: /পৰৱৰ্তী/i });
    fireEvent.click(nextBtn); // Step 2
    fireEvent.click(nextBtn); // Step 3
    fireEvent.click(nextBtn); // Step 4
    // Fill required fields on Step 4
    fireEvent.change(screen.getByLabelText(/Favorite Cultural Festival/i), { target: { value: 'Chapchar Kut' } });
    fireEvent.change(screen.getByLabelText(/Favorite Traditional Dish/i), { target: { value: 'Bai' } });
    fireEvent.click(nextBtn); // Step 5

    // Delete 5th item -> 4 remain (previously this disabled delete)
    const removeButtons = screen.getAllByLabelText(/Remove activity/i);
    fireEvent.click(removeButtons[4]);
    expect(screen.getAllByLabelText(/Routine activity/i)).toHaveLength(4);

    // Delete 4th item -> 3 remain (previously blocked)
    const removeButtonsAt4 = screen.getAllByLabelText(/Remove activity/i);
    expect(removeButtonsAt4[0]).not.toBeDisabled();
    fireEvent.click(removeButtonsAt4[3]);
    expect(screen.getAllByLabelText(/Routine activity/i)).toHaveLength(3);

    // Delete 3rd item -> 2 remain
    const removeButtonsAt3 = screen.getAllByLabelText(/Remove activity/i);
    expect(removeButtonsAt3[0]).not.toBeDisabled();
    fireEvent.click(removeButtonsAt3[2]);
    expect(screen.getAllByLabelText(/Routine activity/i)).toHaveLength(2);

    // At 2 items, delete is disabled to protect minimum game sequencing requirement
    const removeButtonsAt2 = screen.getAllByLabelText(/Remove activity/i);
    expect(removeButtonsAt2[0]).toBeDisabled();
    expect(removeButtonsAt2[1]).toBeDisabled();
  });

  it('3. Persists 8 routine items to IndexedDB without validation errors', async () => {
    const handleSave = vi.fn();

    render(
      <PatientOnboardingModal
        isOpen={true}
        onSave={handleSave}
        initialProfile={{
          name: 'Mukuta Sarma',
          homeState: 'Assam',
          villageTown: 'Nalbari',
          language: 'as',
          sex: 'female',
          familyMembers: [{ name: 'Anima', relationship: 'daughter' }],
          formerOccupation: 'teacher_clerk',
          dailyRoutine: [
            { id: 'act_1', label: 'Morning Tea', time: '6:00 AM', icon: '☕' },
            { id: 'act_2', label: 'Morning Walk', time: '7:00 AM', icon: '🌿' },
            { id: 'act_3', label: 'Breakfast', time: '8:30 AM', icon: '🍲' },
            { id: 'act_4', label: 'Newspaper Reading', time: '9:30 AM', icon: '📰' },
            { id: 'act_5', label: 'Medication', time: '11:00 AM', icon: '💊' },
            { id: 'act_6', label: 'Lunch', time: '1:00 PM', icon: '🍛' },
            { id: 'act_7', label: 'Afternoon Nap', time: '2:30 PM', icon: '🛏️' },
            { id: 'act_8', label: 'Evening Stroll', time: '5:30 PM', icon: '🚶' }
          ]
        }}
      />
    );

    // Navigate to Step 5
    const nextBtn = screen.getByRole('button', { name: /পৰৱৰ্তী/i });
    fireEvent.click(nextBtn); // Step 2
    fireEvent.click(nextBtn); // Step 3
    fireEvent.click(nextBtn); // Step 4
    // Fill required fields on Step 4
    fireEvent.change(screen.getByLabelText(/Favorite Cultural Festival/i), { target: { value: 'Yaoshang' } });
    fireEvent.change(screen.getByLabelText(/Favorite Traditional Dish/i), { target: { value: 'Kangshoi' } });
    fireEvent.click(nextBtn); // Step 5

    expect(screen.getAllByLabelText(/Routine activity/i)).toHaveLength(8);

    // Save profile directly from Step 5
    const saveBtn = screen.getByRole('button', { name: /সংৰক্ষণ কৰক/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(handleSave).toHaveBeenCalled();
    });

    const saved = handleSave.mock.calls[0][0];
    const fromDB = await getProfile(saved.id);
    expect(fromDB).toBeDefined();
    expect(fromDB.name).toBe('Mukuta Sarma');
    expect(fromDB.dailyRoutine).toHaveLength(8);
    expect(fromDB.dailyRoutine[7].label).toBe('Evening Stroll');
  });

  it('4. DailyRoutineRecall gracefully slices from an 8-item routine pool without crashing', () => {
    const profileWith8Items = {
      name: 'Mukuta Sarma',
      dailyRoutine: [
        { id: '1', label: 'Morning Tea', time: '6:00 AM', icon: '☕' },
        { id: '2', label: 'Morning Walk', time: '7:00 AM', icon: '🌿' },
        { id: '3', label: 'Breakfast', time: '8:30 AM', icon: '🍲' },
        { id: '4', label: 'Newspaper', time: '9:30 AM', icon: '📰' },
        { id: '5', label: 'Medication', time: '11:00 AM', icon: '💊' },
        { id: '6', label: 'Lunch', time: '1:00 PM', icon: '🍛' },
        { id: '7', label: 'Afternoon Nap', time: '2:30 PM', icon: '🛏️' },
        { id: '8', label: 'Evening Stroll', time: '5:30 PM', icon: '🚶' }
      ]
    };

    // Test Level 2 (should slice 2 items)
    const { unmount } = render(
      <DailyRoutineRecall
        level={2}
        patientProfile={profileWith8Items}
      />
    );

    expect(screen.getByText('Morning Tea')).toBeInTheDocument();
    expect(screen.getByText('Morning Walk')).toBeInTheDocument();
    expect(screen.queryByText('Breakfast')).not.toBeInTheDocument();
    unmount();

    // Test Level 10 (should slice top 6 items)
    render(
      <DailyRoutineRecall
        level={10}
        patientProfile={profileWith8Items}
      />
    );

    expect(screen.getByText('Morning Tea')).toBeInTheDocument();
    expect(screen.getByText('Morning Walk')).toBeInTheDocument();
    expect(screen.getByText('Breakfast')).toBeInTheDocument();
    expect(screen.getByText('Newspaper')).toBeInTheDocument();
    expect(screen.getByText('Medication')).toBeInTheDocument();
    expect(screen.getByText('Lunch')).toBeInTheDocument();
    // 7th and 8th items are not included in the 6-item level slice
    expect(screen.queryByText('Afternoon Nap')).not.toBeInTheDocument();
    expect(screen.queryByText('Evening Stroll')).not.toBeInTheDocument();
  });
});
