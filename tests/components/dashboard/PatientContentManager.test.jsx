import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import PatientContentManager, { REGION_PACKS } from '../../../src/components/dashboard/PatientContentManager.jsx';
import { assignDailyGames, COGNITIVE_DOMAINS } from '../../../src/engine/dailyAssignmentEngine.js';
import App from '../../../src/App.jsx';
import { createSession, ROLES } from '../../../src/services/authService.js';

describe('V1 ASHA Content & Cognitive Domain Management Suite', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it('1. Renders patient content management shell with regional packs and 5 domain toggles', () => {
    render(<PatientContentManager />);

    // Header & Shell Title
    expect(screen.getByText(/Patient Content & Cognitive Domain Management/i)).toBeInTheDocument();
    expect(screen.getByText(/⚡ Immediate Local Persistence/i)).toBeInTheDocument();

    // Default sample patients rendered
    expect(screen.getByText('Bhaben Kalita')).toBeInTheDocument();
    expect(screen.getByText('Malsawmi Ralte')).toBeInTheDocument();
    expect(screen.getByText('Tombi Devi')).toBeInTheDocument();

    // 5 Domain toggles present for Bhaben Kalita
    expect(screen.getByRole('button', { name: /Toggle Memory for Bhaben Kalita/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Toggle Attention for Bhaben Kalita/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Toggle Reasoning for Bhaben Kalita/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Toggle Visual for Bhaben Kalita/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Toggle Emotional for Bhaben Kalita/i })).toBeInTheDocument();
  });

  it('2. Changing region pack immediately updates patient language code and persists to localStorage', () => {
    render(<PatientContentManager />);

    const bhabenDropdown = screen.getByLabelText(/Region Pack for Bhaben Kalita/i);
    expect(bhabenDropdown.value).toBe('as'); // Assamese default

    // Change to Bodoland (brx)
    fireEvent.change(bhabenDropdown, { target: { value: 'brx' } });

    expect(bhabenDropdown.value).toBe('brx');

    // Immediate write verification in localStorage
    const savedList = JSON.parse(localStorage.getItem('neurosetu_asha_triage_patients'));
    expect(savedList).toBeDefined();
    const bhaben = savedList.find(p => p.id === 'patient_001');
    expect(bhaben.languageCode).toBe('brx');
    expect(bhaben.language).toBe('Bodo (बर’)');

    // Transient "Saved ✓" indicator displayed
    expect(screen.getByText('Saved ✓')).toBeInTheDocument();
  });

  it('3. Toggling off a domain checkbox immediately updates activeCognitiveDomains in localStorage', () => {
    render(<PatientContentManager />);

    const emotionalBtn = screen.getByRole('button', { name: /Toggle Emotional for Bhaben Kalita/i });
    expect(emotionalBtn).toHaveAttribute('aria-pressed', 'true');

    // Click to toggle off Emotional domain
    fireEvent.click(emotionalBtn);
    expect(emotionalBtn).toHaveAttribute('aria-pressed', 'false');

    // Verify localStorage write
    const savedList = JSON.parse(localStorage.getItem('neurosetu_asha_triage_patients'));
    const bhaben = savedList.find(p => p.id === 'patient_001');
    expect(bhaben.activeCognitiveDomains).not.toContain('Emotional Cognition');
    expect(bhaben.activeCognitiveDomains.length).toBe(4);
    expect(bhaben.activeCognitiveDomains).toContain('Memory');
  });

  it('4. Validation Guard: Prevents deselecting all 5 domains and displays a warning', () => {
    const singleDomainPatient = [
      {
        id: 'patient_test',
        name: 'Single Domain Patient',
        languageCode: 'as',
        activeCognitiveDomains: ['Memory']
      }
    ];

    render(<PatientContentManager patients={singleDomainPatient} />);

    const memoryBtn = screen.getByRole('button', { name: /Toggle Memory for Single Domain Patient/i });
    expect(memoryBtn).toHaveAttribute('aria-pressed', 'true');

    // Attempt to deselect the last remaining domain
    fireEvent.click(memoryBtn);

    // Warning appears and domain remains checked
    expect(screen.getByText(/At least one cognitive domain must remain active/i)).toBeInTheDocument();
    expect(memoryBtn).toHaveAttribute('aria-pressed', 'true');
  });

  it('5. EDGE CASE CHECK: Severe patient (2 games/day) with 3 domains excluded assigns exactly 2 games without error', () => {
    // Severe dementia profile (dailyCap: 2, masteryScore: 20 -> Base Level 2, curve [1, 2])
    const severeProfile = {
      id: 'severe_edge_patient',
      name: 'Anil Kumar',
      dailyCap: 2,
      masteryScore: 20,
      stage: 'Severe / Late Stage',
      // 3 of 5 domains excluded: Attention, Visual Reasoning, Emotional Cognition excluded
      // Only Memory and Reasoning/Executive Function remain active
      activeCognitiveDomains: ['Memory', 'Reasoning/Executive Function']
    };

    const assigned = assignDailyGames({
      patientProfile: severeProfile,
      date: new Date('2026-09-09T10:00:00Z')
    });

    // 1. Must assign EXACTLY 2 games (matches severity-scaled dailyCap = 2)
    expect(assigned).toHaveLength(2);

    // 2. Games must come ONLY from the 2 active domains
    const assignedDomains = assigned.map(g => g.category);
    expect(assignedDomains).toContain('Memory');
    expect(assignedDomains).toContain('Reasoning/Executive Function');
    expect(assignedDomains).not.toContain('Attention');
    expect(assignedDomains).not.toContain('Visual Reasoning');
    expect(assignedDomains).not.toContain('Emotional Cognition');

    // 3. Difficulty curve logic from Batch 7 remains intact [1, 2] (warmup Level 1 -> target Level 2)
    expect(assigned[0].sessionLevel).toBe(1);
    expect(assigned[1].sessionLevel).toBe(2);
  });

  it('6. ASHA Dashboard provides 2-tab segmented control switching between Triage and Content views', () => {
    createSession('ASHA Rina Borah', ROLES.ASHA_WORKER);
    window.location.hash = '#/dashboard';

    render(<App />);

    // Default view is Clinical Triage
    expect(screen.getByRole('tab', { name: /Clinical Triage & Telemetry/i })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText(/Silent passive monitoring/i)).toBeInTheDocument();
    expect(screen.queryByTestId('patient-content-manager')).not.toBeInTheDocument();

    // Click Content & Domain Packs Tab
    const contentTab = screen.getByRole('tab', { name: /Content & Domain Packs/i });
    fireEvent.click(contentTab);

    // View switches to PatientContentManager
    expect(contentTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('patient-content-manager')).toBeInTheDocument();
    expect(screen.getByText(/Patient Content & Cognitive Domain Management/i)).toBeInTheDocument();

    // Switch back to Triage
    const triageTab = screen.getByRole('tab', { name: /Clinical Triage & Telemetry/i });
    fireEvent.click(triageTab);
    expect(triageTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.queryByTestId('patient-content-manager')).not.toBeInTheDocument();
  });
});
