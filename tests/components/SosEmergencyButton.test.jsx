import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import SosEmergencyButton from '../../src/components/sos/SosEmergencyButton.jsx';
import {
  clearAllLocalData,
  closeDB,
  getUnsyncedTelemetry
} from '../../src/db/indexedDb.js';

describe('Task 27 & 28: SOS Emergency Assistance Button Tests', () => {
  beforeEach(async () => {
    await clearAllLocalData();
    vi.restoreAllMocks();
  });

  afterEach(async () => {
    await closeDB();
  });

  it('1. Renders emergency modal with grace period countdown and cancel button', () => {
    render(<SosEmergencyButton isOpen={true} countdownSeconds={5} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/সহায় বিচৰা হৈছে.../i)).toBeInTheDocument();
    expect(screen.getByTestId('sos-countdown')).toHaveTextContent('5');
    expect(screen.getByRole('button', { name: /বাতিল কৰক/i })).toBeInTheDocument();
  });

  it('2. Grace period cancellation triggers onClose and aborts alert trigger', () => {
    const handleClose = vi.fn();
    render(<SosEmergencyButton isOpen={true} onClose={handleClose} countdownSeconds={5} />);

    const cancelBtn = screen.getByRole('button', { name: /বাতিল কৰক/i });
    fireEvent.click(cancelBtn);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('3. Countdown expiration transitions to Elderline 14567 intent and logs telemetry', async () => {
    render(
      <SosEmergencyButton
        isOpen={true}
        countdownSeconds={1} // 1 second for fast test execution
        profileId="patient_ner_sos_test"
      />
    );

    // Wait for 1s countdown to expire
    await waitFor(() => {
      expect(screen.getByText(/Elderline \(এল্ডাৰলাইন\)/i)).toBeInTheDocument();
      expect(screen.getByText(/14567/i)).toBeInTheDocument();
    }, { timeout: 2500 });

    // Verify critical priority telemetry record was dispatched to local IndexedDB
    const unsynced = await getUnsyncedTelemetry();
    expect(unsynced.length).toBe(1);
    expect(unsynced[0].taskType).toBe('sos_emergency');
    expect(unsynced[0].alertFlag).toBe(true);
  });
});
