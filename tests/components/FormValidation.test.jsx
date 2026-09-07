import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import PinAuthModal from '../../src/components/auth/PinAuthModal.jsx';
import PatientOnboardingModal from '../../src/components/onboarding/PatientOnboardingModal.jsx';
import * as authService from '../../src/services/authService.js';

describe('Item 6: Form Validation & Inline Error States', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('1. PinAuthModal displays error with role=alert and highlights dots on auth failure', async () => {
    vi.spyOn(authService, 'hasConfiguredPin').mockReturnValue(true);
    vi.spyOn(authService, 'authenticatePin').mockResolvedValue({
      success: false,
      error: 'Invalid PIN entered'
    });

    render(
      <PinAuthModal
        isOpen={true}
        profileName="Bhaben Kalita"
        role="patient"
      />
    );

    // Enter 4 digits to trigger auto-submit
    fireEvent.click(screen.getByRole('button', { name: '1' }));
    fireEvent.click(screen.getByRole('button', { name: '2' }));
    fireEvent.click(screen.getByRole('button', { name: '3' }));
    fireEvent.click(screen.getByRole('button', { name: '4' }));

    await waitFor(() => {
      const alertEl = screen.getByRole('alert');
      expect(alertEl).toHaveTextContent(/Invalid PIN entered/i);
      expect(alertEl).toHaveClass('text-rose-700');
    });

    // Dots indicator container should show rose border
    const dotsContainer = screen.getByLabelText('PIN Entry Dots');
    expect(dotsContainer).toHaveClass('border-rose-300');
  });

  it('2. PatientOnboardingModal highlights field with error border and renders inline error text', () => {
    render(
      <PatientOnboardingModal
        isOpen={true}
        isInitialSignup={false}
      />
    );

    // Clear name field
    const nameInput = screen.getByLabelText(/Patient Name/i);
    fireEvent.change(nameInput, { target: { value: '' } });

    // Click Next
    const nextBtn = screen.getByRole('button', { name: /(পৰৱৰ্তী|Next)/i });
    fireEvent.click(nextBtn);

    // Inline error and top banner should appear with role="alert"
    const inlineAlerts = screen.getAllByRole('alert');
    expect(inlineAlerts.length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/অনুগ্ৰহ কৰি ৰোগীৰ নামটো দিয়ক/i).length).toBe(2);

    // Field should have error border
    expect(nameInput).toHaveClass('border-rose-400');

    // Editing clears error border
    fireEvent.change(nameInput, { target: { value: 'Bhaben Kalita' } });
    expect(nameInput).not.toHaveClass('border-rose-400');
  });

  it('3. PatientOnboardingModal validates mismatched PINs with inline error on confirm-pin', async () => {
    render(
      <PatientOnboardingModal
        isOpen={true}
        isInitialSignup={true}
        initialProfile={{
          name: 'Bhaben Kalita',
          villageTown: 'Sualkuchi',
          familyMembers: [{ name: 'Rumi', relationship: 'daughter' }],
          dailyRoutine: [
            { id: '1', label: 'Tea', time: '6 AM', icon: '☕' },
            { id: '2', label: 'Walk', time: '7 AM', icon: '🌿' },
            { id: '3', label: 'Medicine', time: '9 AM', icon: '💊' },
            { id: '4', label: 'Lunch', time: '1 PM', icon: '🍲' }
          ]
        }}
      />
    );

    // Advance to Step 6
    const nextBtn = screen.getByRole('button', { name: /(পৰৱৰ্তী|Next)/i });
    fireEvent.click(nextBtn); // step 2
    fireEvent.click(nextBtn); // step 3
    fireEvent.click(nextBtn); // step 4
    fireEvent.click(nextBtn); // step 5
    fireEvent.click(nextBtn); // step 6

    // On Step 6: enter mismatched PINs
    const pinInput = screen.getByLabelText(/New 4-Digit PIN/i);
    const confirmInput = screen.getByLabelText(/Confirm 4-Digit PIN/i);

    fireEvent.change(pinInput, { target: { value: '1234' } });
    fireEvent.change(confirmInput, { target: { value: '5678' } });

    // Submit
    const saveBtn = screen.getByRole('button', { name: /(সংৰক্ষণ|Save)/i });
    fireEvent.click(saveBtn);

    // Mismatched error should appear inline under confirm-pin
    await waitFor(() => {
      expect(screen.getAllByText(/দুয়োটা পিন মিল খোৱা নাই/i).length).toBeGreaterThanOrEqual(1);
      expect(confirmInput).toHaveClass('border-rose-400');
    });
  });
});
