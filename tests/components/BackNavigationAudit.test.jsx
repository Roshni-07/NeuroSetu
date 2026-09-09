import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import PinAuthModal from '../../src/components/auth/PinAuthModal.jsx';
import PatientOnboardingModal from '../../src/components/onboarding/PatientOnboardingModal.jsx';
import InstructionsModal from '../../src/components2/InstructionsModal.jsx';
import StoryQuiz from '../../src/shared/StoryQuiz.jsx';
import RoleSelector from '../../src/components/auth/RoleSelector.jsx';
import RemindersHub from '../../src/components/reminders/RemindersHub.jsx';

describe('Back Navigation & Visual Consistency Audit Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. PinAuthModal Back Navigation', () => {
    it('shows "← Back to role selection" when openedFromRoleSelector is true and fires onBackToRoleSelector', () => {
      const handleBackToRole = vi.fn();
      const handleClose = vi.fn();

      render(
        <PinAuthModal
          isOpen={true}
          role="caregiver"
          openedFromRoleSelector={true}
          onBackToRoleSelector={handleBackToRole}
          onClose={handleClose}
        />
      );

      const backBtn = screen.getByRole('button', { name: /Back to role selection/i });
      expect(backBtn).toBeInTheDocument();
      expect(backBtn.className).toContain('min-h-[48px]');
      expect(backBtn.className).toContain('border-slate-300');
      expect(backBtn).toHaveTextContent('←');
      expect(backBtn).toHaveTextContent('Back to role selection');

      fireEvent.click(backBtn);
      expect(handleBackToRole).toHaveBeenCalledTimes(1);
    });

    it('does NOT show "← Back to role selection" when opened directly with known role (openedFromRoleSelector=false)', () => {
      const handleClose = vi.fn();

      render(
        <PinAuthModal
          isOpen={true}
          role="patient"
          openedFromRoleSelector={false}
          onClose={handleClose}
        />
      );

      expect(screen.queryByRole('button', { name: /Back to role selection/i })).not.toBeInTheDocument();
      const cancelBtn = screen.getByRole('button', { name: /Cancel/i });
      expect(cancelBtn).toBeInTheDocument();

      fireEvent.click(cancelBtn);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('2. PatientOnboardingModal Step 1 Back & Multi-Step Data Retention', () => {
    it('Step 1 renders back button that calls onBack if provided and uses accessible 48px target', () => {
      const handleBack = vi.fn();
      const handleClose = vi.fn();

      render(
        <PatientOnboardingModal
          isOpen={true}
          onBack={handleBack}
          onClose={handleClose}
        />
      );

      const backBtn = screen.getByRole('button', { name: /Go back|পিছলৈ/i });
      expect(backBtn).toBeInTheDocument();
      expect(backBtn.className).toContain('min-h-[48px]');
      expect(backBtn.className).toContain('border-slate-300');
      expect(backBtn).toHaveTextContent('←');

      fireEvent.click(backBtn);
      expect(handleBack).toHaveBeenCalledTimes(1);
    });

    it('Step 2 allows going back to Step 1 without losing entered patient data', () => {
      render(
        <PatientOnboardingModal
          isOpen={true}
          initialProfile={{ name: 'Prabin Barman', villageTown: 'Hajo', homeState: 'Assam', language: 'as', sex: 'male' }}
        />
      );

      // Verify Step 1 data
      const nameInput = screen.getByLabelText(/ৰোগীৰ সম্পূৰ্ণ নাম/i);
      expect(nameInput.value).toBe('Prabin Barman');

      // Go to Step 2
      fireEvent.click(screen.getByRole('button', { name: /পৰৱৰ্তী/i }));
      expect(screen.getByText(/২\. পৰিয়ালৰ সদস্য/i)).toBeInTheDocument();

      // Enter Step 2 family member
      const familyInput = screen.getByLabelText(/নিকট আত্মীয়ৰ নাম/i);
      fireEvent.change(familyInput, { target: { value: 'Junali Barman' } });

      // Click Back button
      const backBtn = screen.getByRole('button', { name: /Go back|পিছলৈ/i });
      expect(backBtn.className).toContain('min-h-[48px]');
      fireEvent.click(backBtn);

      // We are back at Step 1 and data is retained
      expect(screen.getByText(/১\. আঞ্চলিক পৰিচয়/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/ৰোগীৰ সম্পূৰ্ণ নাম/i).value).toBe('Prabin Barman');

      // Return to Step 2 to verify Junali Barman was retained
      fireEvent.click(screen.getByRole('button', { name: /পৰৱৰ্তী/i }));
      expect(screen.getByText(/২\. পৰিয়ালৰ সদস্য/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/নিকট আত্মীয়ৰ নাম/i).value).toBe('Junali Barman');
    });
  });

  describe('3. InstructionsModal Back-to-Hub', () => {
    it('renders "← Exit to Hub" with 48px target and fires onBackToHub', () => {
      const handleBackToHub = vi.fn();
      const handleClose = vi.fn();

      render(
        <InstructionsModal
          isOpen={true}
          gameName="Test Cognitive Game"
          onClose={handleClose}
          onBackToHub={handleBackToHub}
          steps={['Step 1', 'Step 2']}
        />
      );

      const exitBtn = screen.getByRole('button', { name: /Exit to Hub|খেল কেন্দ্ৰ/i });
      expect(exitBtn).toBeInTheDocument();
      expect(exitBtn.className).toContain('min-h-[48px]');
      expect(exitBtn.className).toContain('border-slate-300');
      expect(exitBtn).toHaveTextContent('←');

      fireEvent.click(exitBtn);
      expect(handleBackToHub).toHaveBeenCalledTimes(1);
    });
  });

  describe('4. StoryQuiz Previous Page Navigation', () => {
    it('shows "Previous Page" button only when readingPage > 0 and navigates backward', () => {
      const multiPageStory = {
        title: 'Bihu Celebration Story',
        paragraphs: [
          'Paragraph 1 of page 1.',
          'Paragraph 2 of page 1.',
          'Paragraph 3 of page 2.',
          'Paragraph 4 of page 2.'
        ],
        icon: '🌾'
      };

      render(
        <StoryQuiz
          story={multiPageStory}
          questions={[{ question: 'Q1', options: ['A', 'B'], correctIndex: 0 }]}
          onComplete={vi.fn()}
        />
      );

      // On page 1: No previous page button
      expect(screen.getByText(/Page 1 of 2/i)).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Previous page/i })).not.toBeInTheDocument();

      // Navigate to page 2
      fireEvent.click(screen.getByRole('button', { name: /Next →/i }));
      expect(screen.getByText(/Page 2 of 2/i)).toBeInTheDocument();

      // On page 2: Previous page button is present with 48px target
      const prevBtn = screen.getByRole('button', { name: /Previous page/i });
      expect(prevBtn).toBeInTheDocument();
      expect(prevBtn.className).toContain('min-h-[48px]');
      expect(prevBtn).toHaveTextContent('←');

      // Click Previous page
      fireEvent.click(prevBtn);
      expect(screen.getByText(/Page 1 of 2/i)).toBeInTheDocument();
      expect(screen.getByText(/Paragraph 1 of page 1/i)).toBeInTheDocument();
    });
  });

  describe('5. Visual Consistency Checks', () => {
    it('RoleSelector cancel button matches the GrandmasShoppingList 48px back pattern', () => {
      render(<RoleSelector isOpen={true} onSelectRole={vi.fn()} onClose={vi.fn()} />);

      const cancelBtn = screen.getByRole('button', { name: /Cancel/i });
      expect(cancelBtn.className).toContain('min-h-[48px]');
      expect(cancelBtn.className).toContain('border-slate-300');
      expect(cancelBtn).toHaveTextContent('←');
    });

    it('RemindersHub onExit button matches the GrandmasShoppingList 48px back pattern', () => {
      const handleExit = vi.fn();
      render(<RemindersHub onExit={handleExit} />);

      const backBtn = screen.getByRole('button', { name: /উভতি যাওক|Back/i });
      expect(backBtn.className).toContain('min-h-[48px]');
      expect(backBtn.className).toContain('border-slate-300');
      expect(backBtn).toHaveTextContent('←');

      fireEvent.click(backBtn);
      expect(handleExit).toHaveBeenCalledTimes(1);
    });
  });
});
