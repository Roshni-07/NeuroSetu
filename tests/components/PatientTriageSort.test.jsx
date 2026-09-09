import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import PatientTriageList from '../../src/components/dashboard/PatientTriageList.jsx';
import { PRESET_PATIENTS } from '../../src/data/presetPatients.js';
import { clearAllLocalData, closeDB } from '../../src/db/indexedDb.js';

describe('ASHA Dashboard Patient Triage Sort & Multi-Filter Composition Tests', () => {
  beforeEach(async () => {
    localStorage.clear();
    await clearAllLocalData();
    vi.restoreAllMocks();
  });

  afterEach(async () => {
    await closeDB();
  });

  const getRenderedPatientNames = () => {
    const nameHeadings = screen.getAllByRole('heading', { level: 3 });
    return nameHeadings.map(h => h.textContent.trim());
  };

  it('1. Sorts active caseload correctly by age (youngest first and oldest first) and region using PRESET_PATIENTS', () => {
    render(<PatientTriageList patients={[...PRESET_PATIENTS]} />);

    const sortSelect = screen.getByLabelText(/Sort by/i);

    expect(getRenderedPatientNames()).toEqual([
      'Ramesh Patel',
      'Savitri Devi',
      'Anil Kumar'
    ]);

    fireEvent.change(sortSelect, { target: { value: 'age_asc' } });
    expect(getRenderedPatientNames()).toEqual([
      'Ramesh Patel',
      'Savitri Devi',
      'Anil Kumar'
    ]);

    fireEvent.change(sortSelect, { target: { value: 'age_desc' } });
    expect(getRenderedPatientNames()).toEqual([
      'Anil Kumar',
      'Savitri Devi',
      'Ramesh Patel'
    ]);

    fireEvent.change(sortSelect, { target: { value: 'region_asc' } });
    expect(getRenderedPatientNames()).toEqual([
      'Ramesh Patel',
      'Savitri Devi',
      'Anil Kumar'
    ]);

    fireEvent.change(sortSelect, { target: { value: 'language_asc' } });
    expect(getRenderedPatientNames()).toEqual([
      'Ramesh Patel',
      'Savitri Devi',
      'Anil Kumar'
    ]);
  });

  it('2. Sex sort is now enabled and sorts patients alphabetically by sex', () => {
    render(<PatientTriageList patients={[...PRESET_PATIENTS]} />);

    const sortSelect = screen.getByLabelText(/Sort by/i);

    const sexOption = screen.getByRole('option', { name: /Sex/i });
    expect(sexOption).not.toBeDisabled();

    // PRESET_PATIENTS: Ramesh (male), Savitri (female), Anil (male)
    // Alphabetical: female (Savitri) < male (Ramesh, Anil)
    fireEvent.change(sortSelect, { target: { value: 'sex' } });
    expect(getRenderedPatientNames()).toEqual([
      'Savitri Devi',
      'Ramesh Patel',
      'Anil Kumar'
    ]);
  });

  it('3. Dementia stage sort is now enabled and sorts patients by clinical severity (mild < moderate < severe)', () => {
    render(<PatientTriageList patients={[...PRESET_PATIENTS]} />);

    const sortSelect = screen.getByLabelText(/Sort by/i);

    const dementiaOption = screen.getByRole('option', { name: /Dementia stage/i });
    expect(dementiaOption).not.toBeDisabled();

    // PRESET_PATIENTS: Ramesh (mild), Savitri (moderate), Anil (severe)
    // Sort weight: mild=1, moderate=2, severe=3
    fireEvent.change(sortSelect, { target: { value: 'dementia_stage' } });
    expect(getRenderedPatientNames()).toEqual([
      'Ramesh Patel',
      'Savitri Devi',
      'Anil Kumar'
    ]);
  });

  it('4. Filter + Sort + Search all compose correctly together without overriding each other', () => {
    render(<PatientTriageList />);

    const sortSelect = screen.getByLabelText(/Sort by/i);
    const searchInput = screen.getByPlaceholderText(/Search by patient name/i);
    const alertFilterBtn = screen.getByRole('button', { name: /Alerts \/ Decline/i });
    const allFilterBtn = screen.getByRole('button', { name: /All Patients/i });

    // 1. Activate "Alerts / Decline" filter
    // SAMPLE_ASHA_PATIENTS: Ramesh Patel (critical, 68) and Savitri Devi (attention, 74) match.
    // Anil Kumar (stable) and Bhaben Kalita (stable) are filtered out.
    fireEvent.click(alertFilterBtn);
    expect(getRenderedPatientNames()).toEqual([
      'Ramesh Patel',
      'Savitri Devi'
    ]);

    // 2. Compose with Sort: Age (youngest first)
    // Between Ramesh (68) and Savitri (74), Ramesh should now appear FIRST
    fireEvent.change(sortSelect, { target: { value: 'age_asc' } });
    expect(getRenderedPatientNames()).toEqual([
      'Ramesh Patel',
      'Savitri Devi'
    ]);

    // 3. Compose with Sort: Age (oldest first)
    // Savitri (74) should now appear FIRST
    fireEvent.change(sortSelect, { target: { value: 'age_desc' } });
    expect(getRenderedPatientNames()).toEqual([
      'Savitri Devi',
      'Ramesh Patel'
    ]);

    // 4. Compose with Search query: 'Guwahati' (village of Ramesh Patel)
    fireEvent.change(searchInput, { target: { value: 'Guwahati' } });
    expect(getRenderedPatientNames()).toEqual([
      'Ramesh Patel'
    ]);

    // 5. Change Search query to 'Shillong' (village of Savitri Devi)
    fireEvent.change(searchInput, { target: { value: 'Shillong' } });
    expect(getRenderedPatientNames()).toEqual([
      'Savitri Devi'
    ]);

    // 6. Clear search and switch back to "All Patients" filter while sort is still 'age_desc'
    fireEvent.change(searchInput, { target: { value: '' } });
    fireEvent.click(allFilterBtn);

    // All 4 patients rendered, sorted oldest to youngest (81, 74, 72, 68)
    expect(getRenderedPatientNames()).toEqual([
      'Anil Kumar',
      'Savitri Devi',
      'Bhaben Kalita',
      'Ramesh Patel'
    ]);
  });
});
