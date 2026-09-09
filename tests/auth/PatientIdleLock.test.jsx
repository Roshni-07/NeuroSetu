import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import React from 'react';
import App from '../../src/App.jsx';
import { clearAllLocalData, closeDB, saveProfile } from '../../src/db/indexedDb.js';
import { resetAllAuthData, createSession, ROLES, PATIENT_IDLE_TIMEOUT_MS } from '../../src/services/authService.js';

describe('Part 2: Patient Session Inactivity Idle Auto-Lock Suite', () => {
  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] });
    await clearAllLocalData();
    resetAllAuthData();
    localStorage.clear();
    sessionStorage.clear();
    window.location.hash = '';
    vi.restoreAllMocks();
  });

  afterEach(async () => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    await closeDB();
  });

  it('1. Triggers gentle lock overlay after 5 minutes of patient inactivity', async () => {
    await saveProfile({
      id: 'preset-1',
      name: 'Ramesh Patel',
      homeState: 'Assam',
      stage: 'Mild / Early Stage',
      language: 'en'
    });
    createSession('Ramesh Patel', ROLES.PATIENT, 'preset-1');

    window.location.hash = '#/patient';
    render(<App />);

    // Initially, Roadmap is rendered and Idle Lock is closed
    expect(screen.getByTestId('roadmap-view-container')).toBeInTheDocument();
    expect(screen.queryByRole('dialog', { name: /Resting/i })).not.toBeInTheDocument();

    // Advance timers by 5 minutes (PATIENT_IDLE_TIMEOUT_MS = 300,000ms)
    act(() => {
      vi.advanceTimersByTime(PATIENT_IDLE_TIMEOUT_MS);
    });

    // Gentle Lock dialog must now be visible with patient name and 6-dot indicator
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/Resting, Ramesh Patel/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/PIN entered: 0 of 6 digits/i)).toBeInTheDocument();
  });

  it('2. User interaction resets the idle timer and prevents premature lock', async () => {
    await saveProfile({
      id: 'preset-1',
      name: 'Ramesh Patel',
      homeState: 'Assam',
      stage: 'Mild / Early Stage',
      language: 'en'
    });
    createSession('Ramesh Patel', ROLES.PATIENT, 'preset-1');

    window.location.hash = '#/patient';
    render(<App />);

    // Advance 4 minutes (240,000ms) - still active
    act(() => {
      vi.advanceTimersByTime(240 * 1000);
    });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // User touches the screen (activity event)
    act(() => {
      window.dispatchEvent(new Event('touchstart'));
    });

    // Advance another 3 minutes (total 7 minutes, but only 3 min since last touch)
    act(() => {
      vi.advanceTimersByTime(180 * 1000);
    });
    // Still not locked because touch reset timer
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // Advance remaining 2.1 minutes (5.1 minutes total since touch)
    act(() => {
      vi.advanceTimersByTime(130 * 1000);
    });
    // Now it locks
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/Resting, Ramesh Patel/i)).toBeInTheDocument();
  });

  it('3. Entering 6-digit PIN on gentle lock keypad successfully unlocks session and restores UI', async () => {
    await saveProfile({
      id: 'preset-1',
      name: 'Ramesh Patel',
      homeState: 'Assam',
      stage: 'Mild / Early Stage',
      language: 'en'
    });
    createSession('Ramesh Patel', ROLES.PATIENT, 'preset-1');

    window.location.hash = '#/patient';
    render(<App />);

    // Advance timer to trigger lock
    act(() => {
      vi.advanceTimersByTime(PATIENT_IDLE_TIMEOUT_MS);
    });
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // Enter preset 1 PIN: 100100
    const digit1 = screen.getByRole('button', { name: 'Digit 1' });
    const digit0 = screen.getByRole('button', { name: 'Digit 0' });

    await act(async () => {
      fireEvent.click(digit1);
      fireEvent.click(digit0);
      fireEvent.click(digit0);
      fireEvent.click(digit1);
      fireEvent.click(digit0);
      fireEvent.click(digit0);
    });

    // Modal dismisses and Roadmap is restored cleanly
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByTestId('roadmap-view-container')).toBeInTheDocument();
  });

  it('4. Header Logout button remains single unambiguous action routing immediately to Home without modal', async () => {
    await saveProfile({
      id: 'preset-1',
      name: 'Ramesh Patel',
      homeState: 'Assam',
      stage: 'Mild / Early Stage',
      language: 'en'
    });
    createSession('Ramesh Patel', ROLES.PATIENT, 'preset-1');

    window.location.hash = '#/patient';
    render(<App />);

    // Click header Logout button
    const logoutBtn = screen.getByRole('button', { name: /Logout/i });
    expect(logoutBtn).toBeInTheDocument();

    act(() => {
      fireEvent.click(logoutBtn);
    });

    // Immediately navigates to Home without any choice modal
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByText(/Cognitive Games That Speak Your Language\./i)).toBeInTheDocument();
  });

  it('5. Staff sessions (Caregiver / ASHA) do NOT trigger patient idle auto-lock', async () => {
    createSession('Caregiver Maya', ROLES.CAREGIVER, null);
    window.location.hash = '#/dashboard';
    render(<App />);

    // Advance by 6 minutes
    act(() => {
      vi.advanceTimersByTime(6 * 60 * 1000);
    });

    // No idle lock modal for staff
    expect(screen.queryByRole('dialog', { name: /Resting/i })).not.toBeInTheDocument();
    expect(screen.getByText(/North East Dementia Triage & Telemetry Portal/i)).toBeInTheDocument();
  });
});
