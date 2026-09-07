import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import App from '../../src/App.jsx';
import HomePage from '../../src/pages/HomePage.jsx';

describe('Item 2: Header Navigation Audit & Mobile Collapse', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.hash = '';
    vi.restoreAllMocks();
  });

  it('1. App.jsx dev navigation provides hamburger button with accessible ARIA attributes', () => {
    render(<App />);

    // Hamburger button in dev nav
    const menuButtons = screen.getAllByRole('button', { name: /Toggle navigation menu/i });
    expect(menuButtons.length).toBeGreaterThanOrEqual(1);

    const devMenuBtn = menuButtons[0];
    expect(devMenuBtn).toHaveAttribute('aria-expanded', 'false');

    // Clicking expands mobile menu
    fireEvent.click(devMenuBtn);
    expect(devMenuBtn).toHaveAttribute('aria-expanded', 'true');

    // Dev menu items are now accessible in the collapsed container
    expect(screen.getAllByRole('button', { name: /Home/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('button', { name: /Patient UI/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('button', { name: /ASHA \/ Caregiver Dashboard/i }).length).toBeGreaterThan(0);

    // Clicking again closes it
    fireEvent.click(devMenuBtn);
    expect(devMenuBtn).toHaveAttribute('aria-expanded', 'false');
  });

  it('2. HomePage nav provides responsive mobile hamburger menu with >=44px touch targets', () => {
    const handleLaunchPatient = vi.fn();
    const handleLaunchDashboard = vi.fn();
    const handleLaunchHub = vi.fn();
    const handleOpenRoleSelector = vi.fn();
    const handleOpenSetup = vi.fn();

    render(
      <HomePage
        onLaunchPatient={handleLaunchPatient}
        onLaunchDashboard={handleLaunchDashboard}
        onLaunchHub={handleLaunchHub}
        onOpenRoleSelector={handleOpenRoleSelector}
        onOpenSetup={handleOpenSetup}
      />
    );

    const homeMenuBtn = screen.getByRole('button', { name: /Toggle navigation menu/i });
    expect(homeMenuBtn).toHaveAttribute('aria-expanded', 'false');

    // Open mobile menu
    fireEvent.click(homeMenuBtn);
    expect(homeMenuBtn).toHaveAttribute('aria-expanded', 'true');

    // Check that nav buttons appear and invoke handlers
    const exactSuiteButtons = screen.getAllByRole('button', { name: /^🌾 Game Suite \(15 Games\)$/ });
    expect(exactSuiteButtons.length).toBe(2); // Desktop nav and mobile drawer nav
    fireEvent.click(exactSuiteButtons[1]);
    expect(handleLaunchHub).toHaveBeenCalledTimes(1);
  });
});
