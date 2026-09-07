import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import PatientLayout from '../../src/layouts/PatientLayout.jsx';
import HomePage from '../../src/pages/HomePage.jsx';

describe('Item 4: Header Logo / App Title Navigation to Home', () => {
  beforeEach(() => {
    window.location.hash = '';
    vi.restoreAllMocks();
  });

  it('1. Clicking header logo in PatientLayout triggers onNavigate("home")', () => {
    const handleNavigate = vi.fn();
    render(
      <PatientLayout onNavigate={handleNavigate} profileName="Gauri Borah">
        <div>Child Content</div>
      </PatientLayout>
    );

    const logoBtn = screen.getByRole('button', { name: /Return to NeuroSetu Home/i });
    expect(logoBtn).toBeInTheDocument();
    fireEvent.click(logoBtn);

    expect(handleNavigate).toHaveBeenCalledWith('home');
  });

  it('2. Clicking logo/title in HomePage nav ensures home hash and resets scroll', () => {
    const scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    window.location.hash = '#/dashboard';

    render(<HomePage />);

    const homeLogoBtn = screen.getByRole('button', { name: /NeuroSetu Home/i });
    expect(homeLogoBtn).toBeInTheDocument();
    fireEvent.click(homeLogoBtn);

    expect(window.location.hash).toBe('#/home');
    expect(scrollToSpy).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });
});
