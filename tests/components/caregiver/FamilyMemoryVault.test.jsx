import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import React from 'react';
import FamilyMemoryVault, { RELATION_OPTIONS } from '../../../src/components/caregiver/FamilyMemoryVault.jsx';
import {
  getVaultEntries,
  addVaultEntry,
  deleteVaultEntry,
  clearVaultForPatient,
  closeVaultDB,
  LOCAL_STORAGE_KEY
} from '../../../src/services/memoryVaultStorage.js';

describe('FamilyMemoryVault & memoryVaultStorage Suite', () => {
  // Polyfill FileReader for jsdom testing of file upload conversion
  const originalFileReader = global.FileReader;

  beforeEach(async () => {
    localStorage.clear();
    await clearVaultForPatient();

    global.FileReader = class {
      constructor() {
        this.onload = null;
        this.onerror = null;
        this.onloadend = null;
        this.result = null;
      }
      readAsDataURL(blob) {
        setTimeout(() => {
          this.result = 'data:image/png;base64,mockBase64ImageDataString';
          if (this.onload) this.onload({ target: { result: this.result } });
          if (this.onloadend) this.onloadend();
        }, 5);
      }
    };
  });

  afterEach(async () => {
    global.FileReader = originalFileReader;
    await closeVaultDB();
    vi.restoreAllMocks();
  });

  describe('1. Storage Manager (memoryVaultStorage.js)', () => {
    it('adds, queries, and filters vault entries by patientId', async () => {
      const entry1 = await addVaultEntry({
        patientId: 'patient-A',
        personName: 'Rumi Kalita',
        relation: 'Daughter',
        imageUrl: 'data:image/png;base64,rumiImage',
        clueText: 'Brings morning tea and helps with silk loom'
      });

      const entry2 = await addVaultEntry({
        patientId: 'patient-B',
        personName: 'Lalrinsanga',
        relation: 'Son',
        imageUrl: 'data:image/png;base64,sonImage',
        clueText: 'Plays guitar and sings hymns'
      });

      expect(entry1.id).toBeDefined();
      expect(entry1.createdAt).toBeDefined();

      const patientAEntries = await getVaultEntries('patient-A');
      expect(patientAEntries).toHaveLength(1);
      expect(patientAEntries[0].personName).toBe('Rumi Kalita');

      const patientBEntries = await getVaultEntries('patient-B');
      expect(patientBEntries).toHaveLength(1);
      expect(patientBEntries[0].personName).toBe('Lalrinsanga');

      const allEntries = await getVaultEntries();
      expect(allEntries).toHaveLength(2);
    });

    it('deletes an entry by ID from both IndexedDB and localStorage', async () => {
      const saved = await addVaultEntry({
        patientId: 'patient-A',
        personName: 'Dipak',
        relation: 'Son',
        imageUrl: 'data:image/png;base64,dipakImage',
        clueText: 'Helps in tea garden'
      });

      const initial = await getVaultEntries('patient-A');
      expect(initial).toHaveLength(1);

      await deleteVaultEntry(saved.id);

      const afterDelete = await getVaultEntries('patient-A');
      expect(afterDelete).toHaveLength(0);

      // Verify localStorage is synchronized
      const localData = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
      expect(localData.find((e) => e.id === saved.id)).toBeUndefined();
    });

    it('clears all entries for a specific patient while retaining others', async () => {
      await addVaultEntry({ patientId: 'patient-A', personName: 'P1', relation: 'Friend', imageUrl: 'a', clueText: 'c' });
      await addVaultEntry({ patientId: 'patient-A', personName: 'P2', relation: 'Spouse', imageUrl: 'b', clueText: 'd' });
      await addVaultEntry({ patientId: 'patient-B', personName: 'P3', relation: 'Daughter', imageUrl: 'c', clueText: 'e' });

      await clearVaultForPatient('patient-A');

      const patientA = await getVaultEntries('patient-A');
      expect(patientA).toHaveLength(0);

      const patientB = await getVaultEntries('patient-B');
      expect(patientB).toHaveLength(1);
      expect(patientB[0].personName).toBe('P3');
    });
  });

  describe('2. Header Banner & Form Layout', () => {
    it('renders header, caregiver prototype notification, and all relation options', () => {
      render(<FamilyMemoryVault patientId="preset-1" patientName="Ramesh Patel" />);

      expect(screen.getByRole('heading', { level: 1, name: /Family Memory Vault/i })).toBeInTheDocument();
      expect(screen.getByText('Caregiver Portal')).toBeInTheDocument();
      expect(screen.getByText(/Personalizing reminiscence for/i)).toHaveTextContent('Ramesh Patel');

      // Check prototype notification banner
      expect(screen.getByTestId('vault-prototype-banner')).toHaveTextContent(
        'Family Memory Vault — Upload photos and memories to personalize recognition games for your loved one.'
      );

      // Check relationship dropdown options
      const relationSelect = screen.getByTestId('relation-select');
      RELATION_OPTIONS.forEach((opt) => {
        expect(within(relationSelect).getByRole('option', { name: opt })).toBeInTheDocument();
      });
    });

    it('renders back button when onBack callback is passed', () => {
      const handleBack = vi.fn();
      render(<FamilyMemoryVault onBack={handleBack} />);

      const backBtn = screen.getByRole('button', { name: /Back to Caregiver Hub/i });
      fireEvent.click(backBtn);
      expect(handleBack).toHaveBeenCalledTimes(1);
    });
  });

  describe('3. Photo Upload Validation & Error Handling', () => {
    it('shows error if a non-image file is uploaded', () => {
      render(<FamilyMemoryVault />);

      const fileInput = screen.getByTestId('photo-file-input');
      const pdfFile = new File(['dummy-content'], 'medical_record.pdf', { type: 'application/pdf' });

      fireEvent.change(fileInput, { target: { files: [pdfFile] } });

      expect(screen.getByTestId('vault-error-banner')).toHaveTextContent(
        'Please select a valid image file (PNG, JPG, or JPEG).'
      );
    });

    it('rejects files exceeding 2MB limit with an explicit warning', () => {
      render(<FamilyMemoryVault />);

      const fileInput = screen.getByTestId('photo-file-input');
      // Create a 3MB file
      const largeFile = new File(['x'.repeat(3 * 1024 * 1024)], 'large_photo.png', {
        type: 'image/png'
      });

      fireEvent.change(fileInput, { target: { files: [largeFile] } });

      expect(screen.getByTestId('vault-error-banner')).toHaveTextContent(
        'File size exceeds 2MB limit. Please upload a smaller photo.'
      );
    });

    it('accepts valid photo under 2MB, converts to base64, and shows preview with remove option', async () => {
      render(<FamilyMemoryVault />);

      const fileInput = screen.getByTestId('photo-file-input');
      const validPhoto = new File(['valid-image-bytes'], 'granddaughter.jpg', { type: 'image/jpeg' });

      fireEvent.change(fileInput, { target: { files: [validPhoto] } });

      await waitFor(() => {
        expect(screen.getByTestId('image-preview')).toBeInTheDocument();
      });

      expect(screen.getByText('granddaughter.jpg')).toBeInTheDocument();
      expect(screen.getByText('Photo loaded successfully')).toBeInTheDocument();

      // Click Remove Photo
      const removeBtn = screen.getByRole('button', { name: /Remove Photo/i });
      fireEvent.click(removeBtn);

      expect(screen.queryByTestId('image-preview')).not.toBeInTheDocument();
      expect(screen.getByText(/Click to choose a photo or drag & drop here/i)).toBeInTheDocument();
    });
  });

  describe('4. Adding Family Records & Gallery Updates', () => {
    it('validates mandatory fields before submission', async () => {
      render(<FamilyMemoryVault />);

      const submitBtn = screen.getByTestId('submit-vault-entry-btn');

      // Attempt submit with no photo
      fireEvent.click(submitBtn);
      expect(screen.getByTestId('vault-error-banner')).toHaveTextContent(
        'Please upload a family photo before saving.'
      );

      // Upload photo
      const fileInput = screen.getByTestId('photo-file-input');
      const photo = new File(['photo'], 'sonia.png', { type: 'image/png' });
      fireEvent.change(fileInput, { target: { files: [photo] } });

      await waitFor(() => {
        expect(screen.getByTestId('image-preview')).toBeInTheDocument();
      });

      // Attempt submit without name
      fireEvent.click(submitBtn);
      expect(screen.getByTestId('vault-error-banner')).toHaveTextContent(
        "Please enter the family member's full name."
      );
    });

    it('submits valid entry, resets form, and updates the gallery cards', async () => {
      render(<FamilyMemoryVault patientId="pat-101" patientName="Ramesh Patel" />);

      // 1. Upload photo
      const fileInput = screen.getByTestId('photo-file-input');
      const photo = new File(['bytes'], 'sonia.png', { type: 'image/png' });
      fireEvent.change(fileInput, { target: { files: [photo] } });

      await waitFor(() => {
        expect(screen.getByTestId('image-preview')).toBeInTheDocument();
      });

      // 2. Fill Name, Relation, and Clue
      fireEvent.change(screen.getByTestId('person-name-input'), { target: { value: 'Sonia Patel' } });
      fireEvent.change(screen.getByTestId('relation-select'), { target: { value: 'Granddaughter' } });
      fireEvent.change(screen.getByTestId('clue-textarea'), {
        target: { value: 'Brings you hot lemon tea every Sunday morning' }
      });

      // 3. Submit
      fireEvent.click(screen.getByTestId('submit-vault-entry-btn'));

      // 4. Verify gallery updates
      await waitFor(() => {
        expect(screen.getByText('Sonia Patel')).toBeInTheDocument();
      });

      const galleryGrid = screen.getByTestId('vault-gallery-grid');
      expect(within(galleryGrid).getByText('Granddaughter')).toBeInTheDocument();
      expect(within(galleryGrid).getByText(/"Brings you hot lemon tea every Sunday morning"/i)).toBeInTheDocument();
      expect(screen.getByTestId('vault-count-badge')).toHaveTextContent('1');
      expect(screen.getByTestId('vault-toast-notification')).toHaveTextContent(
        'Saved Sonia Patel to the Memory Vault!'
      );

      // Verify form is reset
      expect(screen.getByTestId('person-name-input')).toHaveValue('');
      expect(screen.getByTestId('clue-textarea')).toHaveValue('');
      expect(screen.queryByTestId('image-preview')).not.toBeInTheDocument();
    });
  });

  describe('5. Voice Note Recorder Widget', () => {
    it('toggles recording with fallback simulation and provides preview button', async () => {
      render(<FamilyMemoryVault />);

      const recordBtn = screen.getByTestId('record-voice-btn');
      expect(recordBtn).toHaveTextContent('Record Voice Note');

      // 1. Start recording
      fireEvent.click(recordBtn);

      // In recording mode, Stop button should be visible
      const stopBtn = screen.getByTestId('stop-voice-btn');
      expect(stopBtn).toBeInTheDocument();
      expect(stopBtn).toHaveTextContent(/Stop Recording/i);

      // 2. Stop recording
      fireEvent.click(stopBtn);

      // Should stop and attach audio note
      expect(screen.getByText('Audio Prompt Attached')).toBeInTheDocument();
      expect(screen.getByTestId('preview-voice-btn')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Re-record Voice Note/i })).toBeInTheDocument();
    });
  });

  describe('6. Deletion Modal Flow & Permanent Removal', () => {
    it('opens confirmation modal and cancels deletion without modifying store', async () => {
      // Pre-seed an entry in storage
      const entry = await addVaultEntry({
        patientId: 'patient-test',
        personName: 'Priya Patel',
        relation: 'Daughter',
        imageUrl: 'data:image/png;base64,priyaPhoto',
        clueText: 'Loves cooking fish curry with you'
      });

      render(<FamilyMemoryVault patientId="patient-test" />);

      await waitFor(() => {
        expect(screen.getByText('Priya Patel')).toBeInTheDocument();
      });

      // Click delete button on the card
      const deleteBtn = screen.getByTestId(`delete-btn-${entry.id}`);
      fireEvent.click(deleteBtn);

      // Modal appears
      expect(screen.getByTestId('delete-confirmation-modal')).toBeInTheDocument();
      expect(screen.getByText(/Are you sure you want to remove/i)).toHaveTextContent('Priya Patel');

      // Click Cancel
      fireEvent.click(screen.getByTestId('cancel-delete-btn'));

      // Modal closed, entry remains
      expect(screen.queryByTestId('delete-confirmation-modal')).not.toBeInTheDocument();
      expect(screen.getByText('Priya Patel')).toBeInTheDocument();

      const stored = await getVaultEntries('patient-test');
      expect(stored).toHaveLength(1);
    });

    it('confirms deletion in modal, removing entry from UI and storage', async () => {
      const entry = await addVaultEntry({
        patientId: 'patient-test',
        personName: 'Arun Patel',
        relation: 'Son',
        imageUrl: 'data:image/png;base64,arunPhoto',
        clueText: 'Takes you on walks around the lake'
      });

      render(<FamilyMemoryVault patientId="patient-test" />);

      await waitFor(() => {
        expect(screen.getByText('Arun Patel')).toBeInTheDocument();
      });

      // Click delete button
      fireEvent.click(screen.getByTestId(`delete-btn-${entry.id}`));

      // Confirm deletion in modal
      const confirmBtn = screen.getByTestId('confirm-delete-btn');
      fireEvent.click(confirmBtn);

      // Modal closes, entry is gone from UI
      await waitFor(() => {
        expect(screen.queryByText('Arun Patel')).not.toBeInTheDocument();
      });

      expect(screen.getByTestId('vault-empty-state')).toBeInTheDocument();

      // Confirmed removed from storage
      const stored = await getVaultEntries('patient-test');
      expect(stored).toHaveLength(0);
    });
  });

  describe('7. Touch Target Accessibility (WCAG 2.1 AA)', () => {
    it('ensures interactive elements have minimum 48px touch targets', () => {
      render(<FamilyMemoryVault />);

      const submitBtn = screen.getByTestId('submit-vault-entry-btn');
      expect(submitBtn.className).toContain('min-h-[48px]');
      expect(submitBtn.className).toContain('min-w-[48px]');

      const nameInput = screen.getByTestId('person-name-input');
      expect(nameInput.className).toContain('min-h-[48px]');

      const relationSelect = screen.getByTestId('relation-select');
      expect(relationSelect.className).toContain('min-h-[48px]');

      const recordBtn = screen.getByTestId('record-voice-btn');
      expect(recordBtn.className).toContain('min-h-[48px]');
      expect(recordBtn.className).toContain('min-w-[48px]');
    });
  });
});
