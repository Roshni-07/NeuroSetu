import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import React from 'react';
import PatientTriageList from '../../src/components/dashboard/PatientTriageList.jsx';
import { PRESET_PATIENTS } from '../../src/data/presetPatients.js';
import { clearAllLocalData, closeDB, getDB, STORES } from '../../src/db/indexedDb.js';

describe('ASHA Dashboard Local-Only Patient CRUD Tests', () => {
  beforeEach(async () => {
    localStorage.clear();
    await clearAllLocalData();
    vi.restoreAllMocks();
  });

  afterEach(async () => {
    await closeDB();
  });

  it('1. Persistent prototype banner renders on Add, Edit, and Archive confirmation surfaces', () => {
    render(<PatientTriageList patients={[...PRESET_PATIENTS]} />);

    const prototypeNotice = 'Prototype — not yet connected to shared patient records. Pending backend review.';

    // Open Add Patient view
    const addBtn = screen.getByRole('button', { name: /Add Patient/i });
    fireEvent.click(addBtn);

    expect(screen.getByTestId('add-patient-surface')).toBeInTheDocument();
    expect(screen.getByText(prototypeNotice)).toBeInTheDocument();

    // Cancel back to list
    const cancelAddBtn = screen.getByRole('button', { name: /Cancel adding patient/i });
    fireEvent.click(cancelAddBtn);
    expect(screen.queryByTestId('add-patient-surface')).not.toBeInTheDocument();

    // Open Edit Patient view
    const editBtns = screen.getAllByRole('button', { name: /^Edit /i });
    fireEvent.click(editBtns[0]);

    expect(screen.getByTestId('edit-patient-surface')).toBeInTheDocument();
    expect(screen.getByText(prototypeNotice)).toBeInTheDocument();

    // Cancel back to list
    const cancelEditBtn = screen.getByRole('button', { name: /Cancel editing patient/i });
    fireEvent.click(cancelEditBtn);
    expect(screen.queryByTestId('edit-patient-surface')).not.toBeInTheDocument();

    // Open Archive Patient confirmation view
    const archiveBtns = screen.getAllByRole('button', { name: /^Archive /i });
    fireEvent.click(archiveBtns[0]);

    expect(screen.getByTestId('archive-patient-surface')).toBeInTheDocument();
    expect(screen.getByText(prototypeNotice)).toBeInTheDocument();

    // Cancel back to list
    const cancelArchiveBtn = screen.getByRole('button', { name: /Cancel archiving/i });
    fireEvent.click(cancelArchiveBtn);
    expect(screen.queryByTestId('archive-patient-surface')).not.toBeInTheDocument();
  });

  it('2. Cancel button on all surfaces discards inputs and returns to list view', () => {
    render(<PatientTriageList patients={[...PRESET_PATIENTS]} />);

    // In Add view: type something and cancel
    fireEvent.click(screen.getByRole('button', { name: /Add Patient/i }));
    const nameInput = screen.getByLabelText(/Patient Name \*/i);
    fireEvent.change(nameInput, { target: { value: 'Discarded Person' } });
    fireEvent.click(screen.getByRole('button', { name: /Cancel adding patient/i }));

    expect(screen.queryByText('Discarded Person')).not.toBeInTheDocument();

    // Reopen Add view, input should be reset
    fireEvent.click(screen.getByRole('button', { name: /Add Patient/i }));
    expect(screen.getByLabelText(/Patient Name \*/i).value).toBe('');
    fireEvent.click(screen.getByRole('button', { name: /Cancel adding patient/i }));

    // In Archive confirmation view: type reason and cancel
    const archiveBtns = screen.getAllByRole('button', { name: /^Archive /i });
    fireEvent.click(archiveBtns[0]);
    const reasonInput = screen.getByLabelText(/Reason for Archiving/i);
    fireEvent.change(reasonInput, { target: { value: 'This reason should be discarded' } });
    fireEvent.click(screen.getByRole('button', { name: /Cancel archiving/i }));

    expect(screen.queryByTestId('archive-patient-surface')).not.toBeInTheDocument();
    // Patient should remain active in list
    expect(screen.getByText('Ramesh Patel')).toBeInTheDocument();
  });

  it('3. Add Patient form validates required fields, adds patient, prepends to list, and shows toast', async () => {
    const handleSelect = vi.fn();
    render(<PatientTriageList patients={[...PRESET_PATIENTS]} onSelectPatient={handleSelect} />);

    // Initial count
    expect(screen.getByText(/All Patients \(3\)/i)).toBeInTheDocument();

    // Open Add Form
    fireEvent.click(screen.getByRole('button', { name: /Add Patient/i }));

    // Submit empty form to verify validation errors
    const submitBtn = screen.getByRole('button', { name: /✓ Add Patient/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/Please enter patient name/i)).toBeInTheDocument();
    expect(screen.getByText(/Please enter a valid age/i)).toBeInTheDocument();
    expect(screen.getByText(/Please enter village or town/i)).toBeInTheDocument();
    expect(screen.getByText(/Please select a state/i)).toBeInTheDocument();
    expect(screen.getByText(/Please select a language/i)).toBeInTheDocument();
    expect(screen.getByText(/Please select former occupation/i)).toBeInTheDocument();

    // Fill valid form fields
    const nameInput = screen.getByLabelText(/Patient Name \*/i);
    fireEvent.change(nameInput, { target: { value: 'Hemoprova Saikia' } });

    const ageInput = screen.getByLabelText(/Age \(Years\) \*/i);
    fireEvent.change(ageInput, { target: { value: '70' } });

    const stateSelect = screen.getByLabelText(/NER State \*/i);
    fireEvent.change(stateSelect, { target: { value: 'Assam' } });

    const villageInput = screen.getByLabelText(/Village \/ Town \*/i);
    fireEvent.change(villageInput, { target: { value: 'Titabor' } });

    const languageSelect = screen.getByLabelText(/Language \*/i);
    fireEvent.change(languageSelect, { target: { value: 'as' } });

    const occSelect = screen.getByLabelText(/Former Occupation \*/i);
    fireEvent.change(occSelect, { target: { value: 'weaver' } });

    const sexSelect = screen.getByLabelText(/Sex \*/i);
    fireEvent.change(sexSelect, { target: { value: 'male' } });

    // Add a second family member row
    const addFamilyBtn = screen.getByRole('button', { name: /Add Family Member/i });
    fireEvent.click(addFamilyBtn);

    const familyInputs = screen.getAllByPlaceholderText(/Family member name/i);
    expect(familyInputs).toHaveLength(2);
    fireEvent.change(familyInputs[0], { target: { value: 'Pranjal' } });
    fireEvent.change(familyInputs[1], { target: { value: 'Ananya' } });

    // Submit form
    fireEvent.click(submitBtn);

    // Form should close and return to list view
    expect(screen.queryByTestId('add-patient-surface')).not.toBeInTheDocument();

    // New patient should be displayed at top of list
    expect(screen.getByText('Hemoprova Saikia')).toBeInTheDocument();
    expect(screen.getByText('(70 yrs)')).toBeInTheDocument();
    expect(screen.getByText(/Titabor, Assam/i)).toBeInTheDocument();

    // Active count incremented
    expect(screen.getByText(/All Patients \(4\)/i)).toBeInTheDocument();

    // Toast notification visible
    expect(screen.getByText(/Patient Hemoprova Saikia added successfully/i)).toBeInTheDocument();
  });

  it('4. Edit Patient updates details in place and preserves patient list count', async () => {
    render(<PatientTriageList patients={[...PRESET_PATIENTS]} />);

    expect(screen.getByText(/All Patients \(3\)/i)).toBeInTheDocument();

    // Open Edit for second patient (Savitri Devi)
    const editBtn = screen.getByRole('button', { name: /Edit Savitri Devi/i });
    fireEvent.click(editBtn);

    expect(screen.getByTestId('edit-patient-surface')).toBeInTheDocument();

    // Inputs should be pre-filled
    const nameInput = screen.getByLabelText(/Patient Name \*/i);
    expect(nameInput.value).toBe('Savitri Devi');

    const ageInput = screen.getByLabelText(/Age \(Years\) \*/i);
    expect(ageInput.value).toBe('74');

    // Update name and age
    fireEvent.change(nameInput, { target: { value: 'Savitri Devi Updated' } });
    fireEvent.change(ageInput, { target: { value: '70' } });

    // Submit Edit form
    const updateBtn = screen.getByRole('button', { name: /✓ Update Patient/i });
    fireEvent.click(updateBtn);

    // Form closes
    expect(screen.queryByTestId('edit-patient-surface')).not.toBeInTheDocument();

    // Updated details render
    expect(screen.getByText('Savitri Devi Updated')).toBeInTheDocument();
    expect(screen.getByText('(70 yrs)')).toBeInTheDocument();
    expect(screen.queryByText('Savitri Devi (74 yrs)')).not.toBeInTheDocument();

    // Patient count remains 3
    expect(screen.getByText(/All Patients \(3\)/i)).toBeInTheDocument();

    // Toast notification visible
    expect(screen.getByText(/Patient Savitri Devi Updated updated successfully/i)).toBeInTheDocument();
  });

  it('5. Archive Patient enforces >= 10 chars reason, removes from active view, and decrements counters', () => {
    render(<PatientTriageList patients={[...PRESET_PATIENTS]} />);

    // Initial state: 3 active patients (2 alert/decline, 1 stable)
    expect(screen.getByText(/All Patients \(3\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Alerts \/ Decline \(2\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Stable \(1\)/i)).toBeInTheDocument();
    expect(screen.getByText('Ramesh Patel')).toBeInTheDocument();

    // Open Archive confirmation for Ramesh Patel (critical patient)
    const archiveBtn = screen.getByRole('button', { name: /Archive Ramesh Patel/i });
    fireEvent.click(archiveBtn);

    expect(screen.getByTestId('archive-patient-surface')).toBeInTheDocument();

    const confirmBtn = screen.getByRole('button', { name: /Confirm Archive/i });
    const reasonInput = screen.getByLabelText(/Reason for Archiving/i);

    // Initial: empty reason, button should be disabled
    expect(confirmBtn).toBeDisabled();

    // Type short reason (< 10 chars)
    fireEvent.change(reasonInput, { target: { value: 'Short rsn' } }); // 9 chars
    expect(confirmBtn).toBeDisabled();
    expect(screen.getByText('9/10 min')).toBeInTheDocument();

    // Type valid reason (>= 10 chars)
    fireEvent.change(reasonInput, { target: { value: 'Patient relocated with daughter to Guwahati.' } });
    expect(confirmBtn).not.toBeDisabled();

    // Confirm Archive
    fireEvent.click(confirmBtn);

    // Returns to list view
    expect(screen.queryByTestId('archive-patient-surface')).not.toBeInTheDocument();

    // Bhaben Kalita is removed from active list
    expect(screen.queryByText('Ramesh Patel')).not.toBeInTheDocument();

    // Active counts decremented
    expect(screen.getByText(/All Patients \(2\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Alerts \/ Decline \(1\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Stable \(1\)/i)).toBeInTheDocument();

    // Toast shown
    expect(screen.getByText(/Patient Ramesh Patel archived successfully/i)).toBeInTheDocument();

    // Archived section header indicates 1 archived patient
    expect(screen.getByText(/Archived Patients \(1\)/i)).toBeInTheDocument();
  });

  it('6. Archived section expands, displays archive reason, and unarchive action restores patient to active caseload', () => {
    render(<PatientTriageList patients={[...PRESET_PATIENTS]} />);

    // Archive Anil Kumar (stable patient)
    const archiveBtn = screen.getByRole('button', { name: /Archive Anil Kumar/i });
    fireEvent.click(archiveBtn);

    const reasonInput = screen.getByLabelText(/Reason for Archiving/i);
    fireEvent.change(reasonInput, { target: { value: 'Temporary travel out of state for 6 months.' } });
    fireEvent.click(screen.getByRole('button', { name: /Confirm Archive/i }));

    // Anil Kumar removed from active list
    expect(screen.queryByText('Anil Kumar')).not.toBeInTheDocument();
    expect(screen.getByText(/All Patients \(2\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Stable \(0\)/i)).toBeInTheDocument();

    // Toggle expand archived section
    const toggleArchivedBtn = screen.getByRole('button', { name: /Toggle archived patients/i });
    fireEvent.click(toggleArchivedBtn);

    // Archived card for Anil Kumar should be visible
    expect(screen.getByTestId('archived-patient-preset-3')).toBeInTheDocument();
    expect(screen.getByText('Anil Kumar')).toBeInTheDocument();
    expect(screen.getByText(/Temporary travel out of state for 6 months/i)).toBeInTheDocument();

    // Click Unarchive Patient
    const unarchiveBtn = screen.getByRole('button', { name: /Unarchive Anil Kumar/i });
    fireEvent.click(unarchiveBtn);

    // Toast shown
    expect(screen.getByText(/Patient Anil Kumar unarchived successfully/i)).toBeInTheDocument();

    // Archived count goes to 0
    expect(screen.getByText(/Archived Patients \(0\)/i)).toBeInTheDocument();
    expect(screen.getByText(/No archived patients/i)).toBeInTheDocument();

    // Anil Kumar is restored to active list
    expect(screen.getByText(/All Patients \(3\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Stable \(1\)/i)).toBeInTheDocument();
    expect(screen.getByText('Anil Kumar')).toBeInTheDocument();
  });

  it('7. Add Patient form explicitly supports Sex and Dementia Stage selector, saves to IndexedDB and renders badges', async () => {
    render(<PatientTriageList patients={[...PRESET_PATIENTS]} />);

    // Open Add Form
    fireEvent.click(screen.getByRole('button', { name: /Add Patient/i }));

    // Verify Sex select options exist
    const sexSelect = screen.getByLabelText(/Sex \*/i);
    expect(sexSelect).toBeInTheDocument();
    expect(within(sexSelect).getByRole('option', { name: /♂\s*Male/i })).toBeInTheDocument();
    expect(within(sexSelect).getByRole('option', { name: /♀\s*Female/i })).toBeInTheDocument();
    expect(within(sexSelect).getByRole('option', { name: /Other/i })).toBeInTheDocument();

    // Verify Dementia Stage select exists with mild, moderate, severe options
    const dementiaSelect = screen.getByLabelText(/Dementia Stage/i);
    expect(dementiaSelect).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /Mild \/ Early Stage/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /Moderate \/ Middle Stage/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /Severe \/ Late Stage/i })).toBeInTheDocument();

    // Fill form with female sex and moderate dementia stage
    fireEvent.change(screen.getByLabelText(/Patient Name \*/i), { target: { value: 'Bina Baruah' } });
    fireEvent.change(screen.getByLabelText(/Age \(Years\) \*/i), { target: { value: '69' } });
    fireEvent.change(screen.getByLabelText(/NER State \*/i), { target: { value: 'Assam' } });
    fireEvent.change(screen.getByLabelText(/Village \/ Town \*/i), { target: { value: 'Nagaon' } });
    fireEvent.change(screen.getByLabelText(/Language \*/i), { target: { value: 'as' } });
    fireEvent.change(screen.getByLabelText(/Former Occupation \*/i), { target: { value: 'artisan' } });
    fireEvent.change(sexSelect, { target: { value: 'female' } });
    fireEvent.change(dementiaSelect, { target: { value: 'moderate' } });

    // Submit
    fireEvent.click(screen.getByRole('button', { name: /✓ Add Patient/i }));

    // Card should be rendered with both Sex and Dementia Stage badges
    expect(screen.getByText('Bina Baruah')).toBeInTheDocument();
    expect(screen.getByText('(69 yrs)')).toBeInTheDocument();

    const sexBadges = screen.getAllByTestId('patient-sex-badge');
    const binaSexBadge = sexBadges.find(b => b.textContent.includes('Female'));
    expect(binaSexBadge).toBeDefined();

    const stageBadges = screen.getAllByTestId('patient-dementia-stage-badge');
    const binaStageBadge = stageBadges.find(b => b.textContent.includes('Moderate'));
    expect(binaStageBadge).toBeDefined();

    // Verify saved profile in IndexedDB
    const db = await getDB();
    const allProfiles = await db.getAll(STORES.PROFILES);
    const savedBina = allProfiles.find(p => p.name === 'Bina Baruah');
    expect(savedBina).toBeDefined();
    expect(savedBina.sex).toBe('female');
    expect(savedBina.dementiaStage).toBe('moderate');
    expect(savedBina.dementia_stage).toBe('moderate');
  });

  it('8. Edit Patient pre-populates Sex and Dementia Stage, updates them correctly, and persists to IndexedDB', async () => {
    render(<PatientTriageList patients={[...PRESET_PATIENTS]} />);

    // Edit Ramesh Patel (preset-1: male, mild)
    const editBtn = screen.getByRole('button', { name: /Edit Ramesh Patel/i });
    fireEvent.click(editBtn);

    const sexSelect = screen.getByLabelText(/Sex \*/i);
    expect(sexSelect.value).toBe('male');

    const dementiaSelect = screen.getByLabelText(/Dementia Stage/i);
    expect(dementiaSelect.value).toBe('mild');

    // Change to other sex and severe dementia stage
    fireEvent.change(sexSelect, { target: { value: 'other' } });
    fireEvent.change(dementiaSelect, { target: { value: 'severe' } });

    // Save edit
    fireEvent.click(screen.getByRole('button', { name: /✓ Update Patient/i }));

    // Verify updated badges
    const stageBadges = screen.getAllByTestId('patient-dementia-stage-badge');
    const rameshStageBadge = stageBadges[0];
    expect(rameshStageBadge.textContent).toContain('Severe');

    // Verify saved to IndexedDB
    const db = await getDB();
    const updatedRamesh = await db.get(STORES.PROFILES, 'preset-1');
    expect(updatedRamesh.sex).toBe('other');
    expect(updatedRamesh.dementiaStage).toBe('severe');
    expect(updatedRamesh.dementia_stage).toBe('severe');
  });

  it('9. All preset patients load without undefined errors and display both Sex and Dementia Stage badges', () => {
    render(<PatientTriageList patients={[...PRESET_PATIENTS]} />);

    // Check Ramesh Patel (male, mild)
    expect(screen.getByText('Ramesh Patel')).toBeInTheDocument();
    // Check Savitri Devi (female, moderate)
    expect(screen.getByText('Savitri Devi')).toBeInTheDocument();
    // Check Anil Kumar (male, severe)
    expect(screen.getByText('Anil Kumar')).toBeInTheDocument();

    const sexBadges = screen.getAllByTestId('patient-sex-badge');
    expect(sexBadges.length).toBe(3);
    expect(sexBadges[0].textContent).toContain('Male');
    expect(sexBadges[1].textContent).toContain('Female');
    expect(sexBadges[2].textContent).toContain('Male');

    const stageBadges = screen.getAllByTestId('patient-dementia-stage-badge');
    expect(stageBadges.length).toBe(3);
    expect(stageBadges[0].textContent).toContain('Mild');
    expect(stageBadges[1].textContent).toContain('Moderate');
    expect(stageBadges[2].textContent).toContain('Severe');
  });
});
