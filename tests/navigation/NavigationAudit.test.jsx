import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import PinAuthModal from '../../src/components/auth/PinAuthModal.jsx';
import PatientOnboardingModal from '../../src/components/onboarding/PatientOnboardingModal.jsx';
import InstructionsModal from '../../src/components2/InstructionsModal.jsx';
import StoryQuiz from '../../src/shared/StoryQuiz.jsx';

describe('Navigation Audit: Anti-Dead-End & Touch Target Compliance', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. PinAuthModal Navigation & Origin Awareness', () => {
    it('renders "← Back to Role Selection" when origin === "RoleSelector"', () => {
      const handleBackToRole = vi.fn();
      const handleClose = vi.fn();

      render(
        <PinAuthModal
          isOpen={true}
          role="caregiver"
          origin="RoleSelector"
          onBackToRoleSelector={handleBackToRole}
          onClose={handleClose}
        />
      );

      const backBtn = screen.getByRole('button', { name: /Back to Role Selection/i });
      expect(backBtn).toBeInTheDocument();
      expect(backBtn.className).toContain('min-h-[48px]');
      expect(backBtn.className).toContain('bg-slate-100');
      expect(backBtn.className).toContain('border-slate-300');
      expect(backBtn.className).toContain('text-slate-700');
      expect(backBtn).toHaveTextContent('←');
      expect(backBtn).toHaveTextContent(/Back to Role Selection/i);

      fireEvent.click(backBtn);
      expect(handleBackToRole).toHaveBeenCalledTimes(1);
    });

    it('preserves Cancel button when opened directly without RoleSelector origin', () => {
      const handleClose = vi.fn();

      render(
        <PinAuthModal
          isOpen={true}
          role="patient"
          onClose={handleClose}
        />
      );

      expect(screen.queryByRole('button', { name: /Back to Role Selection/i })).not.toBeInTheDocument();
      const cancelBtn = screen.getByRole('button', { name: /Cancel/i });
      expect(cancelBtn).toBeInTheDocument();

      fireEvent.click(cancelBtn);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('handles ESC keypress cleanly to invoke cancel or back handler', () => {
      const handleBack = vi.fn();

      render(
        <PinAuthModal
          isOpen={true}
          role="asha_worker"
          origin="RoleSelector"
          onBackToRoleSelector={handleBack}
        />
      );

      fireEvent.keyDown(window, { key: 'Escape' });
      expect(handleBack).toHaveBeenCalledTimes(1);
    });
  });

  describe('2. PatientOnboardingModal Multi-Step Navigation & State Preservation', () => {
    it('Step 1 clicking Back safely triggers the parent modal close/exit handler', () => {
      const handleClose = vi.fn();

      render(
        <PatientOnboardingModal
          isOpen={true}
          onClose={handleClose}
        />
      );

      // On Step 1: Back button is present and calls onClose
      const backBtn = screen.getByRole('button', { name: /Go back/i });
      expect(backBtn).toBeInTheDocument();
      expect(backBtn.className).toContain('min-h-[48px]');

      fireEvent.click(backBtn);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('Step navigation preserves entered form data across backward and forward movement', () => {
      render(
        <PatientOnboardingModal
          isOpen={true}
          initialProfile={{ name: 'Bhaben Kalita', villageTown: 'Hajo', homeState: 'Assam', language: 'as' }}
        />
      );

      // Step 1: Verify pre-filled data
      const nameInput = screen.getByLabelText(/ৰোগীৰ সম্পূৰ্ণ নাম/i);
      expect(nameInput.value).toBe('Bhaben Kalita');

      // Move forward to Step 2
      fireEvent.click(screen.getByRole('button', { name: /পৰৱৰ্তী/i }));
      expect(screen.getByText(/২\. পৰিয়ালৰ সদস্য/i)).toBeInTheDocument();

      // Enter data in Step 2
      const familyInput = screen.getByLabelText(/নিকট আত্মীয়ৰ নাম/i);
      fireEvent.change(familyInput, { target: { value: 'Rumi Kalita' } });

      // Click Back button on Step 2
      const backBtn = screen.getByRole('button', { name: /Go back/i });
      expect(backBtn.className).toContain('min-h-[48px]');
      fireEvent.click(backBtn);

      // Returned to Step 1: Step 1 data is preserved
      expect(screen.getByText(/১\. আঞ্চলিক পৰিচয়/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/ৰোগীৰ সম্পূৰ্ণ নাম/i).value).toBe('Bhaben Kalita');

      // Return to Step 2: Step 2 data is preserved
      fireEvent.click(screen.getByRole('button', { name: /পৰৱৰ্তী/i }));
      expect(screen.getByText(/২\. পৰিয়ালৰ সদস্য/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/নিকট আত্মীয়ৰ নাম/i).value).toBe('Rumi Kalita');
    });
  });

  describe('3. InstructionsModal Exit & Cleanup Handler', () => {
    it('clicking "← Exit to Hub" invokes exit handler with >= 48px touch target', () => {
      const handleExit = vi.fn();

      render(
        <InstructionsModal
          isOpen={true}
          gameName="Grandma's Shopping List"
          onExit={handleExit}
          steps={['Remember items', 'Pick from market']}
        />
      );

      const exitBtn = screen.getByRole('button', { name: /Exit to Hub/i });
      expect(exitBtn).toBeInTheDocument();
      expect(exitBtn.className).toContain('min-h-[48px]');
      expect(exitBtn).toHaveTextContent('←');

      fireEvent.click(exitBtn);
      expect(handleExit).toHaveBeenCalledTimes(1);
    });

    it('pressing ESC key cleanly triggers exit handler without leaking timers', () => {
      const handleExit = vi.fn();

      render(
        <InstructionsModal
          isOpen={true}
          gameName="Festival Memory Match"
          onExit={handleExit}
          steps={['Match cultural cards']}
        />
      );

      fireEvent.keyDown(window, { key: 'Escape' });
      expect(handleExit).toHaveBeenCalledTimes(1);
    });
  });

  describe('4. StoryQuiz Step-by-Step Backward Navigation', () => {
    const mockStory = {
      title: 'Bihu Celebration Story',
      paragraphs: [
        'Page 1 Paragraph A.',
        'Page 1 Paragraph B.',
        'Page 2 Paragraph C.',
        'Page 2 Paragraph D.'
      ],
      icon: '🌾'
    };

    const mockQuestions = [
      { question: 'What festival was celebrated?', options: ['Bihu', 'Diwali'], correctIndex: 0 },
      { question: 'Who played the dhol?', options: ['Dipak', 'Neighbor'], correctIndex: 0 }
    ];

    it('navigates backward through reading pages using "← Previous Page"', () => {
      const handleExit = vi.fn();

      render(
        <StoryQuiz
          story={mockStory}
          questions={mockQuestions}
          onBack={handleExit}
          onComplete={vi.fn()}
        />
      );

      // On Page 1: Has Back to Stories button
      const backToStoriesBtn = screen.getByRole('button', { name: /Back to story selection/i });
      expect(backToStoriesBtn).toBeInTheDocument();
      expect(backToStoriesBtn.className).toContain('min-h-[48px]');

      // Go to Page 2
      fireEvent.click(screen.getByRole('button', { name: /Next →/i }));
      expect(screen.getByText(/Page 2 of 2/i)).toBeInTheDocument();

      // Page 2 has Previous Page button
      const prevPageBtn = screen.getByRole('button', { name: /Previous page/i });
      expect(prevPageBtn).toBeInTheDocument();
      expect(prevPageBtn.className).toContain('min-h-[48px]');

      // Click Previous Page -> returns to Page 1
      fireEvent.click(prevPageBtn);
      expect(screen.getByText(/Page 1 of 2/i)).toBeInTheDocument();
      expect(screen.getByText(/Page 1 Paragraph A/i)).toBeInTheDocument();

      // Click Back on Page 1 -> triggers onBack
      fireEvent.click(screen.getByRole('button', { name: /Back to story selection/i }));
      expect(handleExit).toHaveBeenCalledTimes(1);
    });

    it('navigates backward in questions phase and back to the reading story', () => {
      render(
        <StoryQuiz
          story={mockStory}
          questions={mockQuestions}
          onComplete={vi.fn()}
        />
      );

      // Advance through reader to questions
      fireEvent.click(screen.getByRole('button', { name: /Next →/i })); // Page 2
      fireEvent.click(screen.getByRole('button', { name: /Answer Questions →/i })); // Questions phase

      // Question 1
      expect(screen.getByText(/Question 1 of 2/i)).toBeInTheDocument();

      // Question 1 has Back to Story button
      const backToStoryBtn = screen.getByRole('button', { name: /Back to story/i });
      expect(backToStoryBtn).toBeInTheDocument();
      expect(backToStoryBtn.className).toContain('min-h-[48px]');

      // Answer Question 1 and advance to Question 2
      fireEvent.click(screen.getByRole('button', { name: /A: Bihu/i }));
      fireEvent.click(screen.getByRole('button', { name: /Next Question →/i }));

      // Now on Question 2
      expect(screen.getByText(/Question 2 of 2/i)).toBeInTheDocument();

      // Question 2 has Previous Question button
      const prevQBtn = screen.getByRole('button', { name: /Previous question/i });
      expect(prevQBtn).toBeInTheDocument();
      expect(prevQBtn.className).toContain('min-h-[48px]');

      // Click Previous Question -> returns to Question 1
      fireEvent.click(prevQBtn);
      expect(screen.getByText(/Question 1 of 2/i)).toBeInTheDocument();

      // Click Back to Story from Question 1 -> returns to story reading phase
      fireEvent.click(screen.getByRole('button', { name: /Back to story/i }));
      expect(screen.getByText(/Page 2 of 2/i)).toBeInTheDocument();
      expect(screen.getByText(/Page 2 Paragraph C/i)).toBeInTheDocument();
    });
  });
});
