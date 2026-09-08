import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import PatientTriageList, { SAMPLE_ASHA_PATIENTS } from '../../src/components/dashboard/PatientTriageList.jsx';
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

  it('1. Sorts active caseload correctly by age (youngest first and oldest first) and region using SAMPLE_ASHA_PATIENTS', () => {
    render(<PatientTriageList patients={[...SAMPLE_ASHA_PATIENTS]} />);

    const sortSelect = screen.getByLabelText(/Sort by/i);

    // Initial default order in SAMPLE_ASHA_PATIENTS:
    // 1. Bhaben Kalita (72, Assam)
    // 2. Malsawmi Ralte (69, Mizoram)
    // 3. Tombi Devi (66, Manipur)
    expect(getRenderedPatientNames()).toEqual([
      'Bhaben Kalita',
      'Malsawmi Ralte',
      'Tombi Devi'
    ]);

    // --- SORT 1: Age (youngest first) ---
    // 66 (Tombi Devi) < 69 (Malsawmi Ralte) < 72 (Bhaben Kalita)
    fireEvent.change(sortSelect, { target: { value: 'age_asc' } });
    expect(getRenderedPatientNames()).toEqual([
      'Tombi Devi',
      'Malsawmi Ralte',
      'Bhaben Kalita'
    ]);

    // --- SORT 2: Age (oldest first) ---
    // 72 (Bhaben Kalita) > 69 (Malsawmi Ralte) > 66 (Tombi Devi)
    fireEvent.change(sortSelect, { target: { value: 'age_desc' } });
    expect(getRenderedPatientNames()).toEqual([
      'Bhaben Kalita',
      'Malsawmi Ralte',
      'Tombi Devi'
    ]);

    // --- SORT 3: Region / home_state (alphabetical) ---
    // Assam (Bhaben Kalita) < Manipur (Tombi Devi) < Mizoram (Malsawmi Ralte)
    fireEvent.change(sortSelect, { target: { value: 'region_asc' } });
    expect(getRenderedPatientNames()).toEqual([
      'Bhaben Kalita',
      'Tombi Devi',
      'Malsawmi Ralte'
    ]);

    // --- SORT 4: Language (alphabetical) ---
    // Assamese (Bhaben Kalita) < Manipuri (Tombi Devi) < Mizo (Malsawmi Ralte)
    fireEvent.change(sortSelect, { target: { value: 'language_asc' } });
    expect(getRenderedPatientNames()).toEqual([
      'Bhaben Kalita',
      'Tombi Devi',
      'Malsawmi Ralte'
    ]);
  });

  it('2. Disabled sort options (Sex and Dementia stage) are visibly disabled with tooltip and do not crash when clicked', () => {
    render(<PatientTriageList patients={[...SAMPLE_ASHA_PATIENTS]} />);

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
    render(<PatientTriageList patients={[...SAMPLE_ASHA_PATIENTS]} />);

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
