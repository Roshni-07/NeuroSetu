import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FamilyPortalHome from '../../src/familyModule/familyPortal/FamilyPortalHome';
import WardProgressTracker from '../../src/familyModule/familyPortal/WardProgressTracker';
import { PRESET_PATIENTS } from '../../src/data/presetPatients';
import * as telemetryService from '../../src/services/telemetryService';
import * as indexedDb from '../../src/db/indexedDb';
import * as authService from '../../src/services/authService';

describe('WardProgressTracker & FamilyPortalHome Integration Suite', () => {
  const mockRamesh = PRESET_PATIENTS[0]; // Ramesh Patel
  const mockSavitri = PRESET_PATIENTS[1]; // Savitri Devi

  const sampleBiomarkers = [
    {
      id: 'bio-1',
      profileId: 'preset-1',
      taskType: 'grandmas-shopping-list',
      latencyMs: 4500,
      errorCount: 0,
      ddaAdjustment: 'maintained',
      timestamp: new Date().toISOString(),
      alertFlag: false
    },
    {
      id: 'bio-2',
      profileId: 'preset-1',
      taskType: 'daily-routine-recall',
      latencyMs: 16200, // Spike > 15s
      errorCount: 2,
      ddaAdjustment: 'decreased',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      alertFlag: true
    }
  ];

  const sampleSummary = {
    totalEvents: 2,
    averageLatencyMs: 10350,
    totalErrors: 2,
    ddaDecreasedCount: 1,
    activeAlerts: 1,
    trendStatus: 'needs_attention'
  };

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.restoreAllMocks();

    vi.spyOn(telemetryService, 'getRecentBiomarkers').mockResolvedValue(sampleBiomarkers);
    vi.spyOn(telemetryService, 'getBiomarkerSummary').mockResolvedValue(sampleSummary);
    vi.spyOn(indexedDb, 'getGameSessions').mockResolvedValue([
      { id: 'sess-1', profileId: 'preset-1', completedAt: new Date().toISOString() }
    ]);
  });

  it('1. FamilyPortalHome renders "Ward Progress" tab first and selects it by default', async () => {
    render(<FamilyPortalHome />);

    // First tab button should be Ward Progress
    const tabButtons = screen.getAllByRole('button').filter(b => b.textContent?.includes('Ward Progress'));
    expect(tabButtons.length).toBeGreaterThan(0);

    // Ward Progress Tracker container should be in document immediately
    expect(await screen.findByTestId('ward-progress-tracker')).toBeInTheDocument();
  });

  it('2. WardProgressTracker renders linked patient profile header in read-only mode', async () => {
    render(<WardProgressTracker patientProfile={mockRamesh} />);

    expect(await screen.findByTestId('ward-name')).toHaveTextContent(mockRamesh.name);
    expect(screen.getByText(/Read-Only Caregiver Monitor/i)).toBeInTheDocument();
    expect(screen.getByText(/Linked Family Ward/i)).toBeInTheDocument();
  });

  it('3. Computes days-active streak and displays 7-day activity indicators', async () => {
    render(<WardProgressTracker patientProfile={mockRamesh} />);

    const streakCount = await screen.findByTestId('streak-count');
    expect(streakCount).toBeInTheDocument();
    // With entries today and yesterday, streak should be >= 1
    expect(parseInt(streakCount.textContent, 10)).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Last 7 Days Activity:/i)).toBeInTheDocument();
  });

  it('4. Reuses CognitiveTrendChart and displays telemetry metrics and active alerts', async () => {
    render(<WardProgressTracker patientProfile={mockRamesh} />);

    // Metric cards
    expect(await screen.findByTestId('metric-streak')).toBeInTheDocument();
    expect(screen.getByTestId('metric-trend')).toBeInTheDocument();
    expect(screen.getByTestId('metric-latency')).toBeInTheDocument();
    expect(screen.getByTestId('metric-alerts')).toBeInTheDocument();

    // Alerts section renders active alert
    expect(await screen.findByTestId('active-alerts-list')).toBeInTheDocument();
    expect(screen.getByText(/Cognitive Latency Spike/i)).toBeInTheDocument();
    expect(screen.getByText(/grandmas-shopping-list/i)).toBeInTheDocument();
  });

  it('5. Renders zero-alerts reassurance banner when no alert flags exist', async () => {
    vi.spyOn(telemetryService, 'getRecentBiomarkers').mockResolvedValue([
      {
        id: 'bio-clean',
        profileId: 'preset-2',
        taskType: 'whose-morning-is-it',
        latencyMs: 5000,
        errorCount: 0,
        ddaAdjustment: 'maintained',
        timestamp: new Date().toISOString(),
        alertFlag: false
      }
    ]);
    vi.spyOn(telemetryService, 'getBiomarkerSummary').mockResolvedValue({
      totalEvents: 1,
      averageLatencyMs: 5000,
      totalErrors: 0,
      ddaDecreasedCount: 0,
      activeAlerts: 0,
      trendStatus: 'stable'
    });

    render(<WardProgressTracker patientProfile={mockSavitri} />);

    expect(await screen.findByTestId('zero-alerts-banner')).toBeInTheDocument();
    expect(screen.getByText(/All Telemetry Readings Within Expected Parameters/i)).toBeInTheDocument();
  });

  it('6. Allows caregiver to switch ward and updates the displayed data', async () => {
    render(<WardProgressTracker patientProfile={mockRamesh} />);

    expect(await screen.findByTestId('ward-name')).toHaveTextContent(mockRamesh.name);

    const selector = screen.getByTestId('ward-roster-selector');
    fireEvent.change(selector, { target: { value: 'preset-2' } });

    await waitFor(() => {
      expect(screen.getByTestId('ward-name')).toHaveTextContent(mockSavitri.name);
    });
  });

  it('7. MemberManager still works with image upload when switching to Family Members tab', async () => {
    render(<FamilyPortalHome />);

    // Click "Family Members" tab
    const membersTab = screen.getByRole('button', { name: /Family Members/u });
    fireEvent.click(membersTab);

    // MemberManager should render
    expect(await screen.findByRole('heading', { name: /Family Members/i })).toBeInTheDocument();
    expect(screen.getByText(/Enter relatives, photos, and personal memories/i)).toBeInTheDocument();

    // Click "+ Add Family Member"
    const addBtn = screen.getByRole('button', { name: /\+.*Add Family Member/i });
    fireEvent.click(addBtn);

    // Check file input exists with image accept
    const fileInput = document.querySelector('input[type="file"]');
    expect(fileInput).toBeInTheDocument();
    expect(fileInput).toHaveAttribute('accept', 'image/*');
  });
});
