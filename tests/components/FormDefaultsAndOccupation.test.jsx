import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import PatientOnboardingModal from '../../src/components/onboarding/PatientOnboardingModal.jsx';
import PatientTriageList, { SAMPLE_ASHA_PATIENTS } from '../../src/components/dashboard/PatientTriageList.jsx';
import FamilyMemoryVault from '../../src/components/caregiver/FamilyMemoryVault.jsx';
import {
  NER_OCCUPATIONS,
  formatOccupationDisplay,
  getSequencingTaskByOccupation
} from '../../src/data/reminiscenceContent.js';
import { clearAllLocalData, closeDB } from '../../src/db/indexedDb.js';

describe('Form Defaults & Expanded NER Occupation / Life Background Suite', () => {
  beforeEach(async () => {
    localStorage.clear();
    await clearAllLocalData();
    vi.restoreAllMocks();
  });

  afterEach(async () => {
    await closeDB();
  });

  describe('1. NER_OCCUPATIONS Data & Helper Functions', () => {
    it('exports all 8 NER elderly livelihood categories plus Other option', () => {
      expect(NER_OCCUPATIONS).toHaveLength(9);
      const ids = NER_OCCUPATIONS.map(o => o.id);
      expect(ids).toEqual([
        'farmer',
        'weaver',
        'teacher_clerk',
        'homemaker',
        'artisan',
        'govt_service',
        'business_trader',
        'fisherman',
        'other'
      ]);

      // Every item has valid label, labelAs, and icon
      NER_OCCUPATIONS.forEach(occ => {
        expect(occ.label).toBeTruthy();
        expect(occ.labelAs).toBeTruthy();
        expect(occ.icon).toBeTruthy();
      });
    });

    it('formatOccupationDisplay handles profiles, raw IDs, and custom Other occupations', () => {
      // Standard ID
      expect(formatOccupationDisplay('weaver')).toBe('Handloom Weaver');
      expect(formatOccupationDisplay('farmer')).toBe('Farmer / Tea Plantation Worker');
      expect(formatOccupationDisplay('fisherman')).toBe('Fisherman / Boatman');

      // Custom Other
      expect(formatOccupationDisplay('other', 'Pottery Artisan')).toBe('Other: Pottery Artisan');
      expect(formatOccupationDisplay({ formerOccupation: 'other', otherOccupation: 'Herbalist' })).toBe('Other: Herbalist');

      // Profile object with standard ID
      expect(formatOccupationDisplay({ formerOccupation: 'artisan' })).toBe('Artisan / Craftsman');

      // Profile with custom text directly in formerOccupation
      expect(formatOccupationDisplay({ formerOccupation: 'Forest Guard' })).toBe('Forest Guard');

      // Empty profile
      expect(formatOccupationDisplay({})).toBe('');
      expect(formatOccupationDisplay(null)).toBe('');
    });

    it('getSequencingTaskByOccupation maps all livelihoods gracefully with fallbacks', () => {
      expect(getSequencingTaskByOccupation('artisan').occupation).toBe('weaver');
      expect(getSequencingTaskByOccupation('govt_service').occupation).toBe('teacher_clerk');
      expect(getSequencingTaskByOccupation('business_trader').occupation).toBe('teacher_clerk');
      expect(getSequencingTaskByOccupation('fisherman').occupation).toBe('farmer');
      expect(getSequencingTaskByOccupation('unknown_custom_trade').occupation).toBe('homemaker');
    });
  });

  describe('2. PatientOnboardingModal: Empty Defaults & Validation', () => {
    it('starts with completely empty/unselected values and unselected prompt options', () => {
      render(<PatientOnboardingModal isOpen={true} isInitialSignup={false} />);

      // Step 1 inputs
      const nameInput = screen.getByLabelText(/ৰোগীৰ সম্পূৰ্ণ নাম/i);
      expect(nameInput.value).toBe('');

      const stateSelect = screen.getByLabelText(/উত্তৰ-পূৰ্বাঞ্চলৰ ৰাজ্য/i);
      expect(stateSelect.value).toBe('');
      expect(stateSelect.options[0].text).toContain('ৰাজ্য বাছনি কৰক');

      const villageInput = screen.getByLabelText(/গৃহগাঁও বা চহৰ/i);
      expect(villageInput.value).toBe('');

      const langSelect = screen.getByLabelText(/পছন্দৰ ভাষা/i);
      expect(langSelect.value).toBe('');
      expect(langSelect.options[0].text).toContain('ভাষা বাছনি কৰক');
    });

    it('requires state and language before proceeding past Step 1', () => {
      render(<PatientOnboardingModal isOpen={true} isInitialSignup={false} />);

      // Fill name and village but leave state and language empty
      fireEvent.change(screen.getByLabelText(/ৰোগীৰ সম্পূৰ্ণ নাম/i), { target: { value: 'Tarun Gogoi' } });
      fireEvent.change(screen.getByLabelText(/গৃহগাঁও বা চহৰ/i), { target: { value: 'Jorhat' } });

      const nextBtn = screen.getByRole('button', { name: /(পৰৱৰ্তী|Next)/i });
      fireEvent.click(nextBtn);

      // Should remain on Step 1 with error
      expect(screen.getByText(/১\. আঞ্চলিক পৰিচয়/i)).toBeInTheDocument();
      expect(screen.getAllByText(/অনুগ্ৰহ কৰি ৰাজ্য বাছনি কৰক/i).length).toBeGreaterThanOrEqual(1);

      // Select state, try again -> language error
      fireEvent.change(screen.getByLabelText(/উত্তৰ-পূৰ্বাঞ্চলৰ ৰাজ্য/i), { target: { value: 'Assam' } });
      fireEvent.click(nextBtn);
      expect(screen.getAllByText(/অনুগ্ৰহ কৰি ভাষা বাছনি কৰক/i).length).toBeGreaterThanOrEqual(1);

      // Select language -> successfully advance to Step 2
      fireEvent.change(screen.getByLabelText(/পছন্দৰ ভাষা/i), { target: { value: 'as' } });
      fireEvent.click(nextBtn);
      expect(screen.getByText(/২\. পৰিয়ালৰ সদস্য/i)).toBeInTheDocument();
    });

    it('requires relationship on Step 2 before proceeding', () => {
      render(<PatientOnboardingModal isOpen={true} isInitialSignup={false} />);
      const nextBtn = screen.getByRole('button', { name: /(পৰৱৰ্তী|Next)/i });

      // Step 1
      fireEvent.change(screen.getByLabelText(/ৰোগীৰ সম্পূৰ্ণ নাম/i), { target: { value: 'Tarun Gogoi' } });
      fireEvent.change(screen.getByLabelText(/উত্তৰ-পূৰ্বাঞ্চলৰ ৰাজ্য/i), { target: { value: 'Assam' } });
      fireEvent.change(screen.getByLabelText(/গৃহগাঁও বা চহৰ/i), { target: { value: 'Jorhat' } });
      fireEvent.change(screen.getByLabelText(/পছন্দৰ ভাষা/i), { target: { value: 'as' } });
      fireEvent.click(nextBtn);

      // Step 2
      expect(screen.getByText(/২\. পৰিয়ালৰ সদস্য/i)).toBeInTheDocument();
      const relSelect = screen.getByLabelText(/সম্পৰ্ক/i);
      expect(relSelect.value).toBe('');
      expect(relSelect.options[0].text).toContain('সম্পৰ্ক বাছনি কৰক');

      fireEvent.change(screen.getByLabelText(/নিকট আত্মীয়ৰ নাম/i), { target: { value: 'Gaurav' } });
      fireEvent.click(nextBtn);

      // Blocked because relationship is empty
      expect(screen.getAllByText(/অনুগ্ৰহ কৰি সম্পৰ্ক বাছনি কৰক/i).length).toBeGreaterThanOrEqual(1);

      // Choose relationship -> advances to Step 3
      fireEvent.change(relSelect, { target: { value: 'son' } });
      fireEvent.click(nextBtn);
      expect(screen.getByText(/৩\. পূৰ্বৰ জীৱিকা/i)).toBeInTheDocument();
    });

    it('displays 9 livelihood choices on Step 3, validates selection, and captures Other custom input', async () => {
      const handleSave = vi.fn();
      render(
        <PatientOnboardingModal
          isOpen={true}
          isInitialSignup={false}
          onSave={handleSave}
          initialProfile={{
            name: 'Pabitra Deka',
            homeState: 'Assam',
            villageTown: 'Sarthebari',
            language: 'as',
            familyMembers: [{ name: 'Deep', relationship: 'son' }]
          }}
        />
      );

      const nextBtn = screen.getByRole('button', { name: /(পৰৱৰ্তী|Next)/i });

      // Step 1 -> 2 -> 3
      fireEvent.click(nextBtn); // Step 2
      fireEvent.click(nextBtn); // Step 3

      expect(screen.getByText(/৩\. পূৰ্বৰ জীৱিকা/i)).toBeInTheDocument();

      // Verify all 9 options are rendered
      expect(screen.getByText(/চাহ বাগিচাৰ কৰ্মী/i)).toBeInTheDocument();
      expect(screen.getByText(/তাঁতী \/ শিপিনী/i)).toBeInTheDocument();
      expect(screen.getByText(/শিক্ষক \/ কৰ্মচাৰী/i)).toBeInTheDocument();
      expect(screen.getByText(/গৃহিণী/i)).toBeInTheDocument();
      expect(screen.getByText(/কাৰিকৰ \/ হস্তশিল্পী/i)).toBeInTheDocument();
      expect(screen.getByText(/চৰকাৰী কৰ্মচাৰী/i)).toBeInTheDocument();
      expect(screen.getByText(/ব্যৱসায়ী \/ দোকানী/i)).toBeInTheDocument();
      expect(screen.getByText(/মাছুৱৈ \/ নাৱৰীয়া/i)).toBeInTheDocument();
      expect(screen.getByText(/অন্যান্য \(দয়া কৰি উল্লেখ কৰক\)/i)).toBeInTheDocument();

      // Click Next without selecting occupation
      fireEvent.click(nextBtn);
      expect(screen.getAllByText(/অনুগ্ৰহ কৰি পূৰ্বৰ কৰ্ম বা জীৱিকা বাছনি কৰক/i).length).toBeGreaterThanOrEqual(1);

      // Select "Other"
      const otherBtn = screen.getByText(/অন্যান্য \(দয়া কৰি উল্লেখ কৰক\)/i);
      fireEvent.click(otherBtn);

      // "Other" free text input appears
      const otherInput = screen.getByTestId('other-occupation-input');
      expect(otherInput).toBeInTheDocument();

      // Click Next with empty Other input
      fireEvent.click(nextBtn);
      expect(screen.getAllByText(/অনুগ্ৰহ কৰি আপোনাৰ জীৱিকা উল্লেখ কৰক/i).length).toBeGreaterThanOrEqual(1);

      // Fill custom occupation
      fireEvent.change(otherInput, { target: { value: 'Bell Metal Artisan (কাঁহ-পিতলৰ কাৰিকৰ)' } });
      fireEvent.click(nextBtn);

      // Successfully advances to Step 4
      expect(screen.getByText(/৪\. প্ৰিয় উৎসৱ আৰু খাদ্য/i)).toBeInTheDocument();

      // Advance to Step 5
      fireEvent.click(nextBtn);
      expect(screen.getByText(/৫\. দৈনন্দিন কাৰ্যসূচী/i)).toBeInTheDocument();

      // Save profile
      const saveBtn = screen.getByRole('button', { name: /সংৰক্ষণ কৰক/i });
      fireEvent.click(saveBtn);

      await waitFor(() => {
        expect(handleSave).toHaveBeenCalledTimes(1);
      });

      const savedData = handleSave.mock.calls[0][0];
      expect(savedData.formerOccupation).toBe('Bell Metal Artisan (কাঁহ-পিতলৰ কাৰিকৰ)');
      expect(savedData.otherOccupation).toBe('Bell Metal Artisan (কাঁহ-পিতলৰ কাৰিকৰ)');
    });
  });

  describe('3. PatientTriageList: Add & Edit Form Defaults & Occupation', () => {
    it('Add Patient form starts with empty defaults and prompt options', () => {
      render(<PatientTriageList patients={[...SAMPLE_ASHA_PATIENTS]} />);

      fireEvent.click(screen.getByRole('button', { name: /Add Patient/i }));

      // State select has empty value and prompt option
      const stateSelect = screen.getByLabelText(/NER State \*/i);
      expect(stateSelect.value).toBe('');
      expect(stateSelect.options[0].text).toContain('Select State');

      // Language select has empty value and prompt option
      const langSelect = screen.getByLabelText(/Language \*/i);
      expect(langSelect.value).toBe('');
      expect(langSelect.options[0].text).toContain('Select Language');

      // Former occupation select has empty value and prompt option
      const occSelect = screen.getByLabelText(/Former Occupation \*/i);
      expect(occSelect.value).toBe('');
      expect(occSelect.options[0].text).toContain('Select Occupation');

      // Family member relationship select has empty value and prompt option
      const relSelects = screen.getAllByRole('combobox');
      const famRelSelect = relSelects.find(s => s.parentElement?.className?.includes('gap-2'));
      expect(famRelSelect?.value).toBe('');
    });

    it('Add Patient form validates required fields including occupation, reveals Other input, and saves', async () => {
      render(<PatientTriageList patients={[...SAMPLE_ASHA_PATIENTS]} />);

      fireEvent.click(screen.getByRole('button', { name: /Add Patient/i }));
      const submitBtn = screen.getByRole('button', { name: /✓ Add Patient/i });

      // Submit empty
      fireEvent.click(submitBtn);
      expect(screen.getByText(/Please enter patient name/i)).toBeInTheDocument();
      expect(screen.getByText(/Please enter a valid age/i)).toBeInTheDocument();
      expect(screen.getByText(/Please select a state/i)).toBeInTheDocument();
      expect(screen.getByText(/Please enter village or town/i)).toBeInTheDocument();
      expect(screen.getByText(/Please select a language/i)).toBeInTheDocument();
      expect(screen.getByText(/Please select former occupation/i)).toBeInTheDocument();

      // Fill details
      fireEvent.change(screen.getByLabelText(/Patient Name \*/i), { target: { value: 'Bhuban Medhi' } });
      fireEvent.change(screen.getByLabelText(/Age \(Years\) \*/i), { target: { value: '68' } });
      fireEvent.change(screen.getByLabelText(/NER State \*/i), { target: { value: 'Assam' } });
      fireEvent.change(screen.getByLabelText(/Village \/ Town \*/i), { target: { value: 'Sualkuchi' } });
      fireEvent.change(screen.getByLabelText(/Language \*/i), { target: { value: 'as' } });

      // Select 'other' occupation
      fireEvent.change(screen.getByLabelText(/Former Occupation \*/i), { target: { value: 'other' } });

      // "Specify Occupation" input appears
      const otherInput = screen.getByTestId('patient-other-occupation-input');
      expect(otherInput).toBeInTheDocument();

      // Submitting without entering custom text shows error
      fireEvent.click(submitBtn);
      expect(screen.getByText(/Please specify occupation/i)).toBeInTheDocument();

      // Enter custom occupation
      fireEvent.change(otherInput, { target: { value: 'Master Silk Dyer' } });

      // Submit valid form
      fireEvent.click(submitBtn);

      // Returned to list view
      expect(screen.queryByTestId('add-patient-surface')).not.toBeInTheDocument();

      // Card displays new patient and occupation badge
      expect(screen.getByText('Bhuban Medhi')).toBeInTheDocument();
      expect(screen.getByText(/Master Silk Dyer/i)).toBeInTheDocument();
    });

    it('Edit Patient form pre-populates existing occupation and allows updating to Other', () => {
      render(<PatientTriageList patients={[...SAMPLE_ASHA_PATIENTS]} />);

      // Edit first patient (Bhaben Kalita - farmer)
      const editBtn = screen.getByRole('button', { name: /Edit Bhaben Kalita/i });
      fireEvent.click(editBtn);

      expect(screen.getByTestId('edit-patient-surface')).toBeInTheDocument();

      const occSelect = screen.getByLabelText(/Former Occupation \*/i);
      expect(occSelect.value).toBe('farmer');

      // Change to 'other'
      fireEvent.change(occSelect, { target: { value: 'other' } });
      const otherInput = screen.getByTestId('edit-patient-other-occupation-input');
      expect(otherInput).toBeInTheDocument();

      fireEvent.change(otherInput, { target: { value: 'Veterinary Assistant' } });

      // Save edit
      fireEvent.click(screen.getByRole('button', { name: /✓ Update Patient/i }));

      // Form closed and updated occupation badge displayed
      expect(screen.queryByTestId('edit-patient-surface')).not.toBeInTheDocument();
      expect(screen.getByText(/Veterinary Assistant/i)).toBeInTheDocument();
    });
  });

  describe('4. FamilyMemoryVault: Empty Relationship Default & Prompt', () => {
    it('initializes relationship dropdown with empty string and prompt option', () => {
      render(<FamilyMemoryVault patientId="pat-100" patientName="Ramesh Patel" />);

      const relSelect = screen.getByTestId('relation-select');
      expect(relSelect.value).toBe('');
      expect(relSelect.options[0].text).toContain('Select Relationship');
    });

    it('blocks submission if relationship is not selected', async () => {
      render(<FamilyMemoryVault patientId="pat-100" patientName="Ramesh Patel" />);

      // Upload mock photo
      const fileInput = screen.getByTestId('photo-file-input');
      const photo = new File(['bytes'], 'test.png', { type: 'image/png' });
      fireEvent.change(fileInput, { target: { files: [photo] } });

      await waitFor(() => {
        expect(screen.getByTestId('image-preview')).toBeInTheDocument();
      });

      fireEvent.change(screen.getByTestId('person-name-input'), { target: { value: 'Ananya' } });
      fireEvent.change(screen.getByTestId('clue-textarea'), { target: { value: 'Loves gardening' } });

      // Submit with empty relation
      fireEvent.click(screen.getByTestId('submit-vault-entry-btn'));

      expect(screen.getByTestId('vault-error-banner')).toHaveTextContent(
        'Please select a relationship.'
      );

      // Select relationship
      fireEvent.change(screen.getByTestId('relation-select'), { target: { value: 'Daughter' } });
      fireEvent.click(screen.getByTestId('submit-vault-entry-btn'));

      await waitFor(() => {
        expect(screen.getByText('Ananya')).toBeInTheDocument();
      });

      // After save, form resets relation back to empty string
      expect(screen.getByTestId('relation-select').value).toBe('');
    });
  });
});
