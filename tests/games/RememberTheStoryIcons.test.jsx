import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act, cleanup, waitFor } from '@testing-library/react';
import React from 'react';
import RememberTheStory from '../../src/games/RememberTheStory.jsx';
import StoryQuiz from '../../src/shared/StoryQuiz.jsx';

describe('Task 1: RememberTheStory.jsx & StoryQuiz Option Icons', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders RememberTheStory with story navigation and advances to questions phase', () => {
    render(<RememberTheStory onComplete={vi.fn()} />);

    // Shows story title and reading phase
    expect(screen.getByText("Grandma's Bihu Morning")).toBeInTheDocument();
    expect(screen.getByText(/Page 1 of 2/i)).toBeInTheDocument();

    // Advance page 1 -> page 2
    const nextBtn = screen.getByRole('button', { name: /Next →/i });
    fireEvent.click(nextBtn);
    expect(screen.getByText(/Page 2 of 2/i)).toBeInTheDocument();

    // Advance page 2 -> Questions
    const answerBtn = screen.getByRole('button', { name: /Answer Questions →/i });
    fireEvent.click(answerBtn);

    // Question 1 should be visible
    expect(screen.getByText(/What did Rupali smell from the kitchen/i)).toBeInTheDocument();
  });

  it('renders emoji icons alongside each answer option for Story 1', () => {
    render(<RememberTheStory onComplete={vi.fn()} />);

    // Go to questions phase
    fireEvent.click(screen.getByRole('button', { name: /Next →/i }));
    fireEvent.click(screen.getByRole('button', { name: /Answer Questions →/i }));

    // Verify each option in Question 1 displays its icon
    expect(screen.getByText('🍃')).toBeInTheDocument();
    expect(screen.getByText('Tea leaves')).toBeInTheDocument();

    expect(screen.getByText('🫒')).toBeInTheDocument();
    expect(screen.getByText('Fresh mustard oil')).toBeInTheDocument();

    expect(screen.getByText('🪵')).toBeInTheDocument();
    expect(screen.getByText('Burning wood')).toBeInTheDocument();

    expect(screen.getByText('🥟')).toBeInTheDocument();
    expect(screen.getByText('Sweet pitha')).toBeInTheDocument();
  });

  it('allows answering questions, shows feedback, and calls onComplete upon finishing', async () => {
    const handleComplete = vi.fn();
    render(<RememberTheStory onComplete={handleComplete} />);

    // Advance to questions
    fireEvent.click(screen.getByRole('button', { name: /Next →/i }));
    fireEvent.click(screen.getByRole('button', { name: /Answer Questions →/i }));

    // Q1: Correct option is "Fresh mustard oil"
    const q1Correct = screen.getByRole('button', { name: /Fresh mustard oil/i });
    fireEvent.click(q1Correct);
    expect(screen.getByText(/Correct!/i)).toBeInTheDocument();

    // Next to Q2
    fireEvent.click(screen.getByRole('button', { name: /Next Question →/i }));
    expect(screen.getByText(/What cloth was Rupali wearing/i)).toBeInTheDocument();
    expect(screen.getByText('👘')).toBeInTheDocument();
    expect(screen.getByText('Mekhela chador')).toBeInTheDocument();

    // Q2: Correct option is "Mekhela chador"
    const q2Correct = screen.getByRole('button', { name: /Mekhela chador/i });
    fireEvent.click(q2Correct);

    // Next to Q3
    fireEvent.click(screen.getByRole('button', { name: /Next Question →/i }));
    expect(screen.getByText(/Who helped Rupali put a flower in her hair/i)).toBeInTheDocument();
    expect(screen.getByText('Her granddaughter Priya')).toBeInTheDocument();

    // Q3: Select granddaughter
    fireEvent.click(screen.getByRole('button', { name: /Her granddaughter Priya/i }));

    // Next to Q4
    fireEvent.click(screen.getByRole('button', { name: /Next Question →/i }));
    expect(screen.getByText(/What was served at the village feast/i)).toBeInTheDocument();
    expect(screen.getByText('Rice, pithas and curd')).toBeInTheDocument();

    // Q4: Select feast
    fireEvent.click(screen.getByRole('button', { name: /Rice, pithas and curd/i }));

    // Finish
    fireEvent.click(screen.getByRole('button', { name: /See Results →/i }));

    await waitFor(() => {
      expect(handleComplete).toHaveBeenCalledTimes(1);
    });
    expect(handleComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        score: 100,
        maxScore: 100
      })
    );
  });

  it('renders Story 2 with corresponding options and icons', () => {
    render(<RememberTheStory onComplete={vi.fn()} />);

    // Switch to Story 2
    const teaStoryBtn = screen.getByRole('button', { name: /The Tea Picker of Jorhat/i });
    fireEvent.click(teaStoryBtn);

    expect(screen.getByText('The Tea Picker of Jorhat')).toBeInTheDocument();

    // Advance to questions
    fireEvent.click(screen.getByRole('button', { name: /Next →/i }));
    fireEvent.click(screen.getByRole('button', { name: /Answer Questions →/i }));

    // Q1 of Story 2
    expect(screen.getByText(/How far did Moina walk each morning/i)).toBeInTheDocument();
    expect(screen.getByText('Three kilometres')).toBeInTheDocument();
    const walkerIcons = screen.getAllByText('🚶');
    expect(walkerIcons.length).toBe(4);
  });

  it('maintains StoryQuiz backward compatibility with plain string options', () => {
    const dummyStory = {
      title: 'Simple Tale',
      paragraphs: ['A short sentence.'],
      icon: '📜'
    };
    const dummyQuestions = [
      {
        question: 'What is this?',
        options: ['An apple', 'A banana'],
        correctIndex: 0,
        explanation: 'It is an apple.'
      }
    ];

    render(
      <StoryQuiz
        story={dummyStory}
        questions={dummyQuestions}
        onComplete={vi.fn()}
      />
    );

    // Advance to questions
    fireEvent.click(screen.getByRole('button', { name: /Answer Questions →/i }));

    expect(screen.getByText('An apple')).toBeInTheDocument();
    expect(screen.getByText('A banana')).toBeInTheDocument();

    // Clicking plain string option works cleanly
    fireEvent.click(screen.getByRole('button', { name: /An apple/i }));
    expect(screen.getByText(/Correct!/i)).toBeInTheDocument();
  });
});
