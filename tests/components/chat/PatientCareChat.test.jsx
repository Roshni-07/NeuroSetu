import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import React from 'react';
import PatientCareChat, {
  CAREGIVER_OBSERVATION_TAGS,
  ASHA_QUICK_ACTIONS
} from '../../../src/components/chat/PatientCareChat.jsx';
import {
  getChatMessages,
  addChatMessage,
  clearChatForPatient,
  logSystemGameSummary,
  closeChatDB,
  LOCAL_STORAGE_KEY
} from '../../../src/services/chatStorage.js';

describe('PatientCareChat & chatStorage Suite', () => {
  beforeEach(async () => {
    localStorage.clear();
    await clearChatForPatient();
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  afterEach(async () => {
    await closeChatDB();
    vi.restoreAllMocks();
  });

  describe('1. Chat Storage Manager (chatStorage.js)', () => {
    it('saves and retrieves messages chronologically by patientId', async () => {
      const msg1 = await addChatMessage({
        patientId: 'patient-01',
        senderRole: 'caregiver',
        senderName: 'Sonia',
        text: 'Grandpa seemed very cheerful during breakfast.',
        timestamp: '2026-09-01T08:00:00.000Z'
      });

      const msg2 = await addChatMessage({
        patientId: 'patient-01',
        senderRole: 'asha',
        senderName: 'Sangeeta',
        text: 'Noted. I will check on him this afternoon.',
        timestamp: '2026-09-01T08:30:00.000Z'
      });

      const msgOtherPatient = await addChatMessage({
        patientId: 'patient-02',
        senderRole: 'caregiver',
        senderName: 'Lalrin',
        text: 'Morning walk went well.',
        timestamp: '2026-09-01T09:00:00.000Z'
      });

      expect(msg1.id).toBeDefined();
      expect(msg2.id).toBeDefined();

      const messages = await getChatMessages('patient-01');
      expect(messages).toHaveLength(2);
      expect(messages[0].text).toBe('Grandpa seemed very cheerful during breakfast.');
      expect(messages[1].text).toBe('Noted. I will check on him this afternoon.');

      const patient2Messages = await getChatMessages('patient-02');
      expect(patient2Messages).toHaveLength(1);
    });

    it('formats and auto-injects automated system game summary audit log', async () => {
      const audit = await logSystemGameSummary('patient-01', 3, 86.4, 4);

      expect(audit).toBeDefined();
      expect(audit.senderRole).toBe('system');
      expect(audit.category).toBe('game_audit');
      expect(audit.text).toBe(
        '[System Audit]: Patient completed 3/3 games today at Level 4. Average accuracy: 86%.'
      );

      const retrieved = await getChatMessages('patient-01');
      expect(retrieved).toHaveLength(1);
      expect(retrieved[0].text).toContain('[System Audit]: Patient completed 3/3 games today at Level 4.');
    });

    it('clears chat messages for a specific patient while retaining others', async () => {
      await addChatMessage({ patientId: 'p-1', text: 'Msg 1' });
      await addChatMessage({ patientId: 'p-2', text: 'Msg 2' });

      await clearChatForPatient('p-1');

      const p1Messages = await getChatMessages('p-1');
      expect(p1Messages).toHaveLength(0);

      const p2Messages = await getChatMessages('p-2');
      expect(p2Messages).toHaveLength(1);
    });
  });

  describe('2. Header, Banner & Role Switch Toggle', () => {
    it('renders patient header, prototype notification, and switches between roles', async () => {
      render(
        <PatientCareChat
          patientId="preset-1"
          patientName="Ramesh Patel"
          patientStage="Mild / Early Stage"
          initialRole="caregiver"
        />
      );

      expect(screen.getByRole('heading', { level: 1, name: 'Ramesh Patel' })).toBeInTheDocument();
      expect(screen.getByTestId('chat-stage-badge')).toHaveTextContent('Mild / Early Stage');

      // Check prototype disclaimer banner
      expect(screen.getByTestId('chat-prototype-banner')).toHaveTextContent(
        'ASHA Care Portal — Synchronized observations and automated cognitive progress logs.'
      );

      // Caregiver role is active initially -> tag selector should be visible
      expect(screen.getByTestId('caregiver-tag-selector')).toBeInTheDocument();
      expect(screen.queryByTestId('asha-quick-actions-bar')).not.toBeInTheDocument();

      // Switch to ASHA Worker role
      const ashaToggleBtn = screen.getByTestId('switch-role-asha');
      fireEvent.click(ashaToggleBtn);

      // Now ASHA quick action bar should be visible and caregiver tag selector hidden
      expect(screen.getByTestId('asha-quick-actions-bar')).toBeInTheDocument();
      expect(screen.queryByTestId('caregiver-tag-selector')).not.toBeInTheDocument();
    });

    it('triggers onBack handler when back button is clicked', () => {
      const handleBack = vi.fn();
      render(<PatientCareChat onBack={handleBack} />);

      const backBtn = screen.getByRole('button', { name: /Back to Portal/i });
      fireEvent.click(backBtn);

      expect(handleBack).toHaveBeenCalledTimes(1);
    });
  });

  describe('3. Message Stream Rendering & Bubble Differentiation', () => {
    it('renders caregiver, ASHA, and system messages with distinct styles and badges', async () => {
      // Seed 3 messages in storage: caregiver, asha, and system
      await addChatMessage({
        patientId: 'patient-test',
        senderRole: 'caregiver',
        senderName: 'Family Caregiver',
        text: 'Father was searching for his glasses for 20 minutes.',
        category: 'behavioral_flag',
        timestamp: '2026-09-02T10:00:00.000Z'
      });

      await addChatMessage({
        patientId: 'patient-test',
        senderRole: 'asha',
        senderName: 'ASHA Worker (Sangeeta)',
        text: 'I will bring a high-contrast glasses lanyard during my visit tomorrow.',
        category: 'visit_request',
        timestamp: '2026-09-02T10:15:00.000Z'
      });

      await logSystemGameSummary('patient-test', 3, 90, 5);

      render(<PatientCareChat patientId="patient-test" />);

      // Wait for messages to load
      await waitFor(() => {
        expect(
          screen.getByText('Father was searching for his glasses for 20 minutes.')
        ).toBeInTheDocument();
      });

      // Verify Caregiver bubble has indigo styling
      const caregiverBubble = screen.getByText('Father was searching for his glasses for 20 minutes.').closest('[data-testid^="bubble-content-"]');
      expect(caregiverBubble.className).toContain('bg-indigo-600');
      expect(caregiverBubble.className).toContain('text-white');

      // Verify ASHA bubble has teal styling
      const ashaBubble = screen.getByText('I will bring a high-contrast glasses lanyard during my visit tomorrow.').closest('[data-testid^="bubble-content-"]');
      expect(ashaBubble.className).toContain('bg-teal-600');
      expect(ashaBubble.className).toContain('text-white');

      // Verify System message has centered pill styling
      const systemPill = screen.getByText(/\[System Audit\]: Patient completed 3\/3 games today/i);
      expect(systemPill.closest('[data-testid^="system-message-"]')).toBeInTheDocument();

      // Check category badge
      expect(screen.getByText(/BEHAVIORAL FLAG/i)).toBeInTheDocument();
    });
  });

  describe('4. Caregiver Behavioral Tags & Message Sending', () => {
    it('sends caregiver message with selected behavioral tag and updates UI', async () => {
      render(<PatientCareChat patientId="patient-test" initialRole="caregiver" />);

      // Tap 'Evening Confusion' tag
      const confusionTag = screen.getByTestId('tag-chip-Evening Confusion');
      fireEvent.click(confusionTag);

      // Type observation message
      const textInput = screen.getByTestId('chat-text-input');
      fireEvent.change(textInput, {
        target: { value: 'Patient woke up disoriented around 6 PM.' }
      });

      // Click Send
      const sendBtn = screen.getByTestId('chat-send-btn');
      fireEvent.click(sendBtn);

      // Verify message appears in UI with tag prefixed
      await waitFor(() => {
        expect(
          screen.getByText(/\[Evening Confusion\]: Patient woke up disoriented around 6 PM\./i)
        ).toBeInTheDocument();
      });

      // Verify input and tag reset
      expect(textInput).toHaveValue('');

      // Verify persisted in storage
      const stored = await getChatMessages('patient-test');
      expect(stored).toHaveLength(1);
      expect(stored[0].category).toBe('behavioral_flag');
    });
  });

  describe('5. ASHA Quick-Action Chip Prompts', () => {
    it('pre-fills chat input when an ASHA quick-action chip is clicked and sends clinical note', async () => {
      render(<PatientCareChat patientId="patient-test" initialRole="asha" />);

      const quickActionBtn = screen.getByTestId('quick-action-Schedule Home Visit');
      fireEvent.click(quickActionBtn);

      const textInput = screen.getByTestId('chat-text-input');
      expect(textInput).toHaveValue('Schedule Home Visit');

      // User expands on the note
      fireEvent.change(textInput, {
        target: { value: 'Schedule Home Visit for Thursday 11:00 AM' }
      });

      // Send message
      const sendBtn = screen.getByTestId('chat-send-btn');
      fireEvent.click(sendBtn);

      await waitFor(() => {
        expect(
          screen.getByText('Schedule Home Visit for Thursday 11:00 AM')
        ).toBeInTheDocument();
      });

      // Verify sender role in storage
      const stored = await getChatMessages('patient-test');
      expect(stored[0].senderRole).toBe('asha');
      expect(stored[0].category).toBe('visit_request');
    });
  });

  describe('6. Touch Target Accessibility (WCAG 2.1 AA)', () => {
    it('verifies send button and interactive controls meet minimum 48px touch targets', () => {
      render(<PatientCareChat />);

      const sendBtn = screen.getByTestId('chat-send-btn');
      expect(sendBtn.className).toContain('min-h-[48px]');
      expect(sendBtn.className).toContain('min-w-[48px]');

      const textInput = screen.getByTestId('chat-text-input');
      expect(textInput.className).toContain('min-h-[48px]');
    });
  });
});
