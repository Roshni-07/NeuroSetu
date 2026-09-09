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

  // Helper to extract displayed active patient names in their rendered order
  const getRenderedPatientNames = () => {
    // Each patient card renders its name inside an h3 element
    const nameHeadings = screen.getAllByRole('heading', { level: 3 });
    return nameHeadings.map(h => h.textContent.trim());
  };

  it('1. Sorts active caseload correctly by age (youngest first and oldest first) and region using PRESET_PATIENTS', () => {
    render(<PatientTriageList patients={[...PRESET_PATIENTS]} />);

    const sortSelect = screen.getByLabelText(/Sort by/i);

    // Initial default order in PRESET_PATIENTS:
    // 1. Ramesh Patel (68, Assam)
    // 2. Savitri Devi (74, Meghalaya)
    // 3. Anil Kumar (81, Tripura)
    expect(getRenderedPatientNames()).toEqual([
      'Ramesh Patel',
      'Savitri Devi',
      'Anil Kumar'
    ]);

    // --- SORT 1: Age (youngest first) ---
    // 68 (Ramesh Patel) < 74 (Savitri Devi) < 81 (Anil Kumar)
    fireEvent.change(sortSelect, { target: { value: 'age_asc' } });
    expect(getRenderedPatientNames()).toEqual([
      'Ramesh Patel',
      'Savitri Devi',
      'Anil Kumar'
    ]);

    // --- SORT 2: Age (oldest first) ---
    // 81 (Anil Kumar) > 74 (Savitri Devi) > 68 (Ramesh Patel)
    fireEvent.change(sortSelect, { target: { value: 'age_desc' } });
    expect(getRenderedPatientNames()).toEqual([
      'Anil Kumar',
      'Savitri Devi',
      'Ramesh Patel'
    ]);

    // --- SORT 3: Region / home_state (alphabetical) ---
    // Assam (Ramesh Patel) < Meghalaya (Savitri Devi) < Tripura (Anil Kumar)
    fireEvent.change(sortSelect, { target: { value: 'region_asc' } });
    expect(getRenderedPatientNames()).toEqual([
      'Ramesh Patel',
      'Savitri Devi',
      'Anil Kumar'
    ]);

    // --- SORT 4: Language (alphabetical) ---
    // English is the only language code, so the order remains the preset list.
    fireEvent.change(sortSelect, { target: { value: 'language_asc' } });
    expect(getRenderedPatientNames()).toEqual([
      'Ramesh Patel',
      'Savitri Devi',
      'Anil Kumar'
    ]);
  });

  it('2. Disabled sort options (Sex and Dementia stage) are visibly disabled with tooltip and do not crash when clicked', () => {
    render(<PatientTriageList patients={[...PRESET_PATIENTS]} />);

    const sortSelect = screen.getByLabelText(/Sort by/i);
    const expectedTooltip = 'Coming soon — field not yet collected';

    // Verify Sex option
    const sexOption = screen.getByRole('option', { name: /Sex/i });
    expect(sexOption).toBeDisabled();
    expect(sexOption).toHaveAttribute('title', expectedTooltip);
    expect(sexOption.className).toContain('cursor-not-allowed');

    // Clicking disabled Sex option does not throw or crash
    expect(() => {
      fireEvent.click(sexOption);
    }).not.toThrow();

    // Direct change event targeting disabled option should not change sort value
    fireEvent.change(sortSelect, { target: { value: 'sex' } });
    expect(sortSelect.value).toBe('default');

    // Verify Dementia stage option
    const dementiaOption = screen.getByRole('option', { name: /Dementia stage/i });
    expect(dementiaOption).toBeDisabled();
    expect(dementiaOption).toHaveAttribute('title', expectedTooltip);
    expect(dementiaOption.className).toContain('cursor-not-allowed');

    // Clicking disabled Dementia stage option does not throw or crash
    expect(() => {
      fireEvent.click(dementiaOption);
    }).not.toThrow();

    fireEvent.change(sortSelect, { target: { value: 'dementia_stage' } });
    expect(sortSelect.value).toBe('default');

    // Verify tooltip attributes can also be queried directly
    const tooltipOptions = screen.getAllByTitle(expectedTooltip);
    expect(tooltipOptions).toHaveLength(2);
  });

  it('3. Filter + Sort + Search all compose correctly together without overriding each other', () => {
    render(<PatientTriageList patients={[...PRESET_PATIENTS]} />);

    const sortSelect = screen.getByLabelText(/Sort by/i);
    const searchInput = screen.getByPlaceholderText(/Search by patient name/i);
    const alertFilterBtn = screen.getByRole('button', { name: /Alerts \/ Decline/i });
    const allFilterBtn = screen.getByRole('button', { name: /All Patients/i });

    // 1. Activate "Alerts / Decline" filter
    // Bhaben Kalita (critical, 72) and Malsawmi Ralte (attention, 69) match.
    // Tombi Devi (stable, 66) is filtered out.
    fireEvent.click(alertFilterBtn);
    expect(getRenderedPatientNames()).toEqual([
      'Bhaben Kalita',
      'Malsawmi Ralte'
    ]);
    expect(screen.queryByText('Tombi Devi')).not.toBeInTheDocument();

    // 2. Compose with Sort: Age (youngest first)
    // Between Malsawmi (69) and Bhaben (72), Malsawmi should now appear FIRST
    fireEvent.change(sortSelect, { target: { value: 'age_asc' } });
    expect(getRenderedPatientNames()).toEqual([
      'Malsawmi Ralte',
      'Bhaben Kalita'
    ]);

    // 3. Compose with Sort: Age (oldest first)
    // Bhaben (72) should now appear FIRST
    fireEvent.change(sortSelect, { target: { value: 'age_desc' } });
    expect(getRenderedPatientNames()).toEqual([
      'Bhaben Kalita',
      'Malsawmi Ralte'
    ]);

    // 4. Compose with Search query: 'Reiek' (village of Malsawmi Ralte)
    // Only Malsawmi Ralte should remain visible
    fireEvent.change(searchInput, { target: { value: 'Reiek' } });
    expect(getRenderedPatientNames()).toEqual([
      'Malsawmi Ralte'
    ]);
    expect(screen.queryByText('Bhaben Kalita')).not.toBeInTheDocument();

    // 5. Change Search query to 'Hajo' (village of Bhaben Kalita)
    // Only Bhaben Kalita should remain visible
    fireEvent.change(searchInput, { target: { value: 'Hajo' } });
    expect(getRenderedPatientNames()).toEqual([
      'Bhaben Kalita'
    ]);
    expect(screen.queryByText('Malsawmi Ralte')).not.toBeInTheDocument();

    // 6. Clear search and switch back to "All Patients" filter while sort is still 'age_desc'
    fireEvent.change(searchInput, { target: { value: '' } });
    fireEvent.click(allFilterBtn);

    // All 3 patients rendered, sorted oldest to youngest (72, 69, 66)
    expect(getRenderedPatientNames()).toEqual([
      'Bhaben Kalita',
      'Malsawmi Ralte',
      'Tombi Devi'
    ]);
  });
});
