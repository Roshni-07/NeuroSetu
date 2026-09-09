import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import PatientTriageList from '../../src/components/dashboard/PatientTriageList.jsx';
import CognitiveTrendChart from '../../src/components/dashboard/CognitiveTrendChart.jsx';
import SyncStatusPanel from '../../src/components/dashboard/SyncStatusPanel.jsx';
import { clearAllLocalData, closeDB, getUnsyncedTelemetry } from '../../src/db/indexedDb.js';

describe('Task 29–31: ASHA / Caregiver Dashboard Components Tests', () => {
  beforeEach(async () => {
    await clearAllLocalData();
    vi.restoreAllMocks();
  });

  afterEach(async () => {
    await closeDB();
  });

  it('1. PatientTriageList renders patient cards, filters by alert severity, and searches', () => {
    const handleSelect = vi.fn();
    render(<PatientTriageList onSelectPatient={handleSelect} />);

    // Renders sample patients
    expect(screen.getByText('Ramesh Patel')).toBeInTheDocument();
    expect(screen.getByText('Savitri Devi')).toBeInTheDocument();
    expect(screen.getByText('Anil Kumar')).toBeInTheDocument();

    // Click "Alerts / Decline" filter
    const alertFilterBtn = screen.getByRole('button', { name: /Alerts \/ Decline/i });
    fireEvent.click(alertFilterBtn);

    // Stable patients (Anil Kumar, Bhaben Kalita) should now be filtered out
    expect(screen.getByText('Ramesh Patel')).toBeInTheDocument();
    expect(screen.queryByText('Anil Kumar')).not.toBeInTheDocument();

    // Search by village
    const searchInput = screen.getByPlaceholderText(/Search by patient name/i);
    fireEvent.change(searchInput, { target: { value: 'Guwahati' } });
    expect(screen.getByText('Ramesh Patel')).toBeInTheDocument();
    expect(screen.queryByText('Savitri Devi')).not.toBeInTheDocument();

    // Select patient
    fireEvent.click(screen.getByText('Ramesh Patel'));
    expect(handleSelect).toHaveBeenCalledWith('preset-1');
  });

  it('2. CognitiveTrendChart renders SVG chart with latency values and 15s alert line', () => {
    render(<CognitiveTrendChart patientName="Bhaben Kalita" />);

    expect(screen.getByText(/Cognitive Biomarker Trend: Bhaben Kalita/i)).toBeInTheDocument();
    expect(screen.getByText(/15s Cognitive Alert/i)).toBeInTheDocument();
    expect(screen.getAllByText(/16.4s/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Tier 1/i).length).toBeGreaterThan(0);
  });

  it('3. SyncStatusPanel renders pending count and simulates household visit session', async () => {
    const handleSyncComplete = vi.fn();
    render(
      <SyncStatusPanel
        pendingCount={2}
        isOnline={true}
        onSyncComplete={handleSyncComplete}
      />
    );

    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText(/● Online/i)).toBeInTheDocument();

    // Simulate household visit session
    const simBtn = screen.getByRole('button', { name: /\+ Simulate Household Visit Session/i });
    fireEvent.click(simBtn);

    await waitFor(() => {
      expect(handleSyncComplete).toHaveBeenCalled();
    });

    const unsynced = await getUnsyncedTelemetry();
    expect(unsynced.length).toBe(1);
    expect(unsynced[0].taskType).toBe('asha_home_visit_bihu');
  });
});
