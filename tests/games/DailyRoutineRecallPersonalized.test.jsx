import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import React from 'react';
import DailyRoutineRecall from '../../src/games/DailyRoutineRecall.jsx';

describe('DailyRoutineRecall Personalization & Dynamic Routine', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders generic fallback routine when no profile or custom routine is provided', () => {
    render(<DailyRoutineRecall onComplete={vi.fn()} />);

    // Check heading
    expect(screen.getByText("Arrange the Day's Routine in Order:")).toBeInTheDocument();

    // Check generic items from ROUTINE_ITEMS
    expect(screen.getByText('Morning Chai')).toBeInTheDocument();
    expect(screen.getByText('Tending Garden')).toBeInTheDocument();
    expect(screen.getByText('Taking Medicine')).toBeInTheDocument();
    expect(screen.getByText('Midday Meal')).toBeInTheDocument();
    expect(screen.getByText('Night Rest')).toBeInTheDocument();
  });

  it('renders personalized routine activities and custom heading when patientProfile is passed', () => {
    const customProfile = {
      id: 'patient_001',
      name: 'Kamala Devi',
      dailyRoutine: [
        { id: 'act_1', label: 'Wake up & Gayatri Mantra', time: '05:30 AM', icon: '🙏' },
        { id: 'act_2', label: 'Fresh Ginger Tea in Garden', time: '06:30 AM', icon: '☕' },
        { id: 'act_3', label: 'Warm Khichdi Lunch', time: '12:30 PM', icon: '🍲' },
        { id: 'act_4', label: 'Evening Bhajan with Radio', time: '06:00 PM', icon: '📻' },
        { id: 'act_5', label: 'Warm Milk & Sleep', time: '09:00 PM', icon: '🌙' }
      ]
    };

    render(<DailyRoutineRecall patientProfile={customProfile} onComplete={vi.fn()} />);

    // Check personalized heading
    expect(screen.getByText("Arrange Kamala Devi's Routine in Order:")).toBeInTheDocument();

    // Check personalized activities appear
    expect(screen.getByText('Wake up & Gayatri Mantra')).toBeInTheDocument();
    expect(screen.getByText('Fresh Ginger Tea in Garden')).toBeInTheDocument();
    expect(screen.getByText('Warm Khichdi Lunch')).toBeInTheDocument();
    expect(screen.getByText('Evening Bhajan with Radio')).toBeInTheDocument();
    expect(screen.getByText('Warm Milk & Sleep')).toBeInTheDocument();

    // Check slots appear for all 5 activities
    expect(screen.getByText(/1st • 05:30 AM/i)).toBeInTheDocument();
    expect(screen.getByText(/2nd • 06:30 AM/i)).toBeInTheDocument();
    expect(screen.getByText(/3rd • 12:30 PM/i)).toBeInTheDocument();
    expect(screen.getByText(/4th • 06:00 PM/i)).toBeInTheDocument();
    expect(screen.getByText(/5th • 09:00 PM/i)).toBeInTheDocument();
  });

  it('allows tapping activity and slot to assign, and triggers onComplete when all placed', () => {
    const onComplete = vi.fn();
    const customProfile = {
      id: 'patient_002',
      name: 'Biren Babu',
      dailyRoutine: [
        { id: 'r1', label: 'Morning Tea', time: '06:00 AM', icon: '☕' },
        { id: 'r2', label: 'Newspaper Reading', time: '07:30 AM', icon: '📰' },
        { id: 'r3', label: 'Lunch', time: '01:00 PM', icon: '🍛' }
      ]
    };

    render(<DailyRoutineRecall patientProfile={customProfile} onComplete={onComplete} />);

    // Tap each activity and its matching slot
    const morningTea = screen.getByText('Morning Tea');
    fireEvent.click(morningTea);
    const slot1 = screen.getByText(/1st • 06:00 AM/i).closest('.cursor-pointer') || screen.getByText(/1st • 06:00 AM/i);
    fireEvent.click(slot1);

    const newspaper = screen.getByText('Newspaper Reading');
    fireEvent.click(newspaper);
    const slot2 = screen.getByText(/2nd • 07:30 AM/i).closest('.cursor-pointer') || screen.getByText(/2nd • 07:30 AM/i);
    fireEvent.click(slot2);

    const lunch = screen.getByText('Lunch');
    fireEvent.click(lunch);
    const slot3 = screen.getByText(/3rd • 01:00 PM/i).closest('.cursor-pointer') || screen.getByText(/3rd • 01:00 PM/i);
    fireEvent.click(slot3);

    // Confirm button should be active
    const confirmBtn = screen.getByRole('button', { name: /Confirm Daily Order/i });
    expect(confirmBtn).not.toBeDisabled();
    fireEvent.click(confirmBtn);

    expect(onComplete).toHaveBeenCalledTimes(1);
    const result = onComplete.mock.calls[0][0];
    expect(result.accuracy).toBe(100);
    expect(result.message).toContain('Biren Babu');
  });
});
