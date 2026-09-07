import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import App from '../../src/App.jsx';
import {
  clearAllLocalData,
  closeDB,
  getGameSessions,
  getUnsyncedTelemetry
} from '../../src/db/indexedDb.js';
import { createSession } from '../../src/services/authService.js';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

describe('Task 32–34: Full Offline Core Loop & Multi-Surface E2E Suite', () => {
  beforeEach(async () => {
    await clearAllLocalData();
    sessionStorage.clear();
    localStorage.clear();
    localStorage.setItem('neurosetu_tutorial_memory_recall_seen', 'true');
    window.location.hash = '';
    vi.restoreAllMocks();
  });

  afterEach(async () => {
    await closeDB();
  });

  it('1. Multi-surface navigation: Switches cleanly between Patient, Dashboard, and Marketing surfaces', async () => {
    createSession('Caregiver Maya', 'caregiver');
    render(<App />);

    // 1. Initially on Home surface (unauthenticated first load, English default)
    expect(screen.getByText(/Cognitive Games That Speak Your Language/i)).toBeInTheDocument();

    // 2. Navigate to ASHA Dashboard surface
    const dashboardBtn = screen.getByRole('button', { name: /ASHA \/ Caregiver Dashboard/i });
    fireEvent.click(dashboardBtn);

    expect(screen.getByText(/North East Dementia Triage & Telemetry Portal/i)).toBeInTheDocument();
    expect(screen.getByText(/ASHA Household Patient Triage/i)).toBeInTheDocument();

    // 3. Navigate back to Home
    const homeBtn = screen.getByRole('button', { name: 'Home' });
    fireEvent.click(homeBtn);

    expect(screen.getByText(/Cognitive Games That Speak Your Language/i)).toBeInTheDocument();
  });

  it('2. Offline Dementia Care Loop: Authenticates, plays Bihu memory game, and triggers SOS safely', async () => {
    render(<App />);

    // 1. Open PIN Authentication modal
    const enterPinBtn = screen.getByRole('button', { name: /🔑 Enter Profile PIN/i });
    fireEvent.click(enterPinBtn);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/(Create Profile PIN|Enter 4-Digit PIN)/i)).toBeInTheDocument();

    // Enter PIN 1-2-3-4
    fireEvent.click(screen.getByRole('button', { name: '1' }));
    fireEvent.click(screen.getByRole('button', { name: '2' }));
    fireEvent.click(screen.getByRole('button', { name: '3' }));
    fireEvent.click(screen.getByRole('button', { name: '4' }));

    // Wait for auth modal to close
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    // 2. Launch Memory Recall Game
    const playMemoryBtn = screen.getAllByRole('button', { name: /(Play|খেলক) →/i })[0];
    fireEvent.click(playMemoryBtn);

    // Wait for question prompt to load
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 2, name: /(Do you remember|বিহুৰ বাদ্য)/i })).toBeInTheDocument();
    });

    await sleep(35);

    // Select Dhol / Drum option
    const dholBtn = screen.getByRole('button', { name: /(Bihu Drum|Dhol|ঢোল)/i });
    fireEvent.click(dholBtn);

    await waitFor(() => {
      expect(screen.getByTestId('success-banner')).toBeInTheDocument();
    });

    // Exit Game back to Hub
    const exitBtn = screen.getByRole('button', { name: /(Exit|বন্ধ কৰক)/i });
    fireEvent.click(exitBtn);

    // 3. Test One-Touch SOS Emergency Button
    const sosBtn = screen.getByRole('button', { name: /Emergency Assistance SOS/i });
    fireEvent.click(sosBtn);

    expect(screen.getByText(/সহায় বিচৰা হৈছে.../i)).toBeInTheDocument();
    expect(screen.getByTestId('sos-countdown')).toBeInTheDocument();

    // Cancel SOS safely within grace period
    const cancelSosBtn = screen.getByRole('button', { name: /বাতিল কৰক \(Cancel Alert\)/i });
    fireEvent.click(cancelSosBtn);

    await waitFor(() => {
      expect(screen.queryByText(/সহায় বিচৰা হৈছে.../i)).not.toBeInTheDocument();
    });

    // 4. Verify local persistence: confirm telemetry was stored in IndexedDB without network
    const unsynced = await getUnsyncedTelemetry();
    expect(unsynced.length).toBeGreaterThanOrEqual(1);
    expect(unsynced[0].taskType).toBe('mem_bihu_dhol');
  });
});
