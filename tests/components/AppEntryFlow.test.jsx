import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import App from '../../src/App.jsx';
import { clearAllLocalData, closeDB, saveProfile } from '../../src/db/indexedDb.js';
import { setProfilePin } from '../../src/services/authService.js';

describe('App Entry Flow: Home First, Device Check & Gated Routing', () => {
  beforeEach(async () => {
    await clearAllLocalData();
    localStorage.clear();
    sessionStorage.clear();
    window.location.hash = '';
    vi.restoreAllMocks();
  });

  afterEach(async () => {
    await closeDB();
  });

  it('1. On initial load, always renders Home first with English default', () => {
    render(<App />);

    // Must show Home hero content with English default
    expect(screen.getByText(/Cognitive Games That Speak Your Language/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Launch Patient Experience/i })).toBeInTheDocument();

    // Patient games hub should NOT be visible yet
    expect(screen.queryByText(/Welcome to NeuroSetu/i)).not.toBeInTheDocument();
  });

  it('2. From Home, "Enter Profile PIN" opens PIN entry modal', () => {
    render(<App />);

    const unlockBtn = screen.getByRole('button', { name: /Enter Profile PIN/i });
    fireEvent.click(unlockBtn);

    // PinAuthModal should now be open
    expect(screen.getByRole('heading', { name: /(Create Profile PIN|Enter [46]-Digit PIN)/i })).toBeInTheDocument();
  });

  it('3. "Launch Patient Experience" opens ProfileCheckModal and routes to Signup when device has no profile', async () => {
    render(<App />);

    const launchBtn = screen.getByRole('button', { name: /Launch Patient Experience/i });
    fireEvent.click(launchBtn);

    // ProfileCheckModal opens
    expect(screen.getByRole('heading', { name: /ৰোগীৰ পৰিচয় পৰীক্ষা/i })).toBeInTheDocument();

    // Device check completes: no profile found
    await waitFor(() => {
      expect(screen.getByText(/নতুন ৰোগী \(No Profile Found\)/i)).toBeInTheDocument();
    });

    // Click "Start Registration"
    const registerBtn = screen.getByRole('button', { name: /নতুন ৰোগীৰ পঞ্জীয়ন আৰম্ভ কৰক/i });
    fireEvent.click(registerBtn);

    // Routes into 6-step PatientOnboardingModal (including daily routine step)
    await waitFor(() => {
      expect(screen.getByText(/১\. আঞ্চলিক পৰিচয়/i)).toBeInTheDocument();
      expect(screen.getByText(/1 \/ 6/i)).toBeInTheDocument();
    });
  });

  it('4. "Launch Patient Experience" detects existing device profile in IndexedDB and routes to PIN entry', async () => {
    // Pre-seed an existing profile and PIN in device storage
    await saveProfile({
      id: 'patient_pre_seeded',
      name: 'Gauri Borah',
      homeState: 'Assam',
      villageTown: 'Tezpur',
      language: 'en'
    });
    await setProfilePin('123456');

    render(<App />);

    // Starts on Home
    expect(screen.getByText(/Cognitive Games That Speak Your Language/i)).toBeInTheDocument();

    // Click Launch Patient Experience
    const launchBtn = screen.getByRole('button', { name: /Launch Patient Experience/i });
    fireEvent.click(launchBtn);

    // ProfileCheckModal detects existing profile
    await waitFor(() => {
      expect(screen.getByText(/সংৰক্ষিত পৰিচয় পোৱা গৈছে/i)).toBeInTheDocument();
      expect(screen.getByText(/Gauri Borah/i)).toBeInTheDocument();
    });

    // Click "Enter PIN to Unlock"
    const enterPinBtn = screen.getByRole('button', { name: /পিন প্ৰৱেশ কৰি খুলক/i });
    fireEvent.click(enterPinBtn);

    // PinAuthModal opens
    expect(screen.getByRole('heading', { name: /Enter [46]-Digit PIN/i })).toBeInTheDocument();
  });

  it('5. Completing PIN authentication unlocks the main Patient App; logging out returns to Home', async () => {
    await setProfilePin('987654');

    render(<App />);

    // 1. Click Unlock from top bar
    fireEvent.click(screen.getByRole('button', { name: /Enter Profile PIN/i }));

    // 2. Enter PIN digits on 3x4 keypad (auto-submits on 6th digit)
    fireEvent.click(screen.getByRole('button', { name: '9' }));
    fireEvent.click(screen.getByRole('button', { name: '8' }));
    fireEvent.click(screen.getByRole('button', { name: '7' }));
    fireEvent.click(screen.getByRole('button', { name: '6' }));
    fireEvent.click(screen.getByRole('button', { name: '5' }));
    fireEvent.click(screen.getByRole('button', { name: '4' }));

    // 3. Unlocks into Patient App (English default)
    await waitFor(() => {
      expect(screen.getByText(/Welcome to NeuroSetu/i)).toBeInTheDocument();
      expect(screen.getByTestId('roadmap-view-container')).toBeInTheDocument();
    });

    // 4. Logout / Lock
    const logoutBtn = screen.getByRole('button', { name: /Lock \/ Logout/i });
    fireEvent.click(logoutBtn);

    // 5. Must return to Home
    await waitFor(() => {
      expect(screen.getByText(/Cognitive Games That Speak Your Language/i)).toBeInTheDocument();
      expect(screen.queryByText(/Welcome to NeuroSetu/i)).not.toBeInTheDocument();
    });
  });
});
