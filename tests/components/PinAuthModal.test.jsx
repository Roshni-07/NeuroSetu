import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import PinAuthModal from '../../src/components/auth/PinAuthModal.jsx';
import { setProfilePin, resetAllAuthData } from '../../src/services/authService.js';

describe('Task 7: PinAuthModal UI Component Tests', () => {
  beforeEach(() => {
    resetAllAuthData();
    vi.restoreAllMocks();
  });

  it('1. Renders PIN modal with 12 keypad buttons and 6 empty dot indicators', () => {
    render(<PinAuthModal isOpen={true} onSuccess={vi.fn()} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/Profile PIN/i)).toBeInTheDocument();

    // Check keypad buttons
    ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'Clear'].forEach((btnText) => {
      expect(screen.getByRole('button', { name: btnText })).toBeInTheDocument();
    });

    // Check 6 dots
    for (let i = 0; i < 6; i++) {
      expect(screen.getByTestId(`pin-dot-${i}`)).toBeInTheDocument();
    }
  });

  it('2. Keypad taps fill dots in sequence and triggers onSuccess upon 6th digit', async () => {
    const handleSuccess = vi.fn();
    render(<PinAuthModal isOpen={true} onSuccess={handleSuccess} profileName="Arogya Patient" />);

    // Tap 1, 2, 3, 4, 5, 6
    fireEvent.click(screen.getByRole('button', { name: '1' }));
    fireEvent.click(screen.getByRole('button', { name: '2' }));
    fireEvent.click(screen.getByRole('button', { name: '3' }));
    fireEvent.click(screen.getByRole('button', { name: '4' }));
    fireEvent.click(screen.getByRole('button', { name: '5' }));
    fireEvent.click(screen.getByRole('button', { name: '6' }));

    await waitFor(() => {
      expect(handleSuccess).toHaveBeenCalledTimes(1);
    });
  });

  it('3. Clear and Backspace buttons correctly modify entered digits', () => {
    render(<PinAuthModal isOpen={true} onSuccess={vi.fn()} />);

    // Press 1 and 2
    fireEvent.click(screen.getByRole('button', { name: '1' }));
    fireEvent.click(screen.getByRole('button', { name: '2' }));

    // Press backspace
    const backspaceBtn = screen.getByRole('button', { name: /Delete last digit/i });
    fireEvent.click(backspaceBtn);

    // Press Clear
    const clearBtn = screen.getByRole('button', { name: 'Clear' });
    fireEvent.click(clearBtn);

    // Dots should be empty
    expect(screen.getByTestId('pin-dot-0')).not.toHaveClass('bg-patient-accent');
  });

  it('4. Entering incorrect PIN shows gentle retry prompt without red error state', async () => {
    await setProfilePin('999999');
    const handleSuccess = vi.fn();

    render(<PinAuthModal isOpen={true} onSuccess={handleSuccess} />);

    // Enter wrong PIN: 8, 8, 8, 8, 8, 8
    fireEvent.click(screen.getByRole('button', { name: '8' }));
    fireEvent.click(screen.getByRole('button', { name: '8' }));
    fireEvent.click(screen.getByRole('button', { name: '8' }));
    fireEvent.click(screen.getByRole('button', { name: '8' }));
    fireEvent.click(screen.getByRole('button', { name: '8' }));
    fireEvent.click(screen.getByRole('button', { name: '8' }));

    await waitFor(() => {
      expect(screen.getByText(/Let's try that again/i)).toBeInTheDocument();
      expect(handleSuccess).not.toHaveBeenCalled();
    });
  });

  it('5. Renders "Show Demo PINs" badge in DEV mode and toggles quick-fill buttons', () => {
    render(<PinAuthModal isOpen={true} role="patient" onSuccess={vi.fn()} />);

    const showDemoBtn = screen.getByTestId('show-demo-pins-btn');
    expect(showDemoBtn).toBeInTheDocument();
    expect(screen.queryByTestId('demo-pins-container')).not.toBeInTheDocument();

    // Click Show Demo PINs
    fireEvent.click(showDemoBtn);
    expect(screen.getByTestId('demo-pins-container')).toBeInTheDocument();
    expect(screen.getByTestId('quick-fill-100100')).toBeInTheDocument();
    expect(screen.getByTestId('quick-fill-200200')).toBeInTheDocument();
    expect(screen.getByTestId('quick-fill-300300')).toBeInTheDocument();
    expect(screen.getByTestId('quick-fill-000000')).toBeInTheDocument();

    // Toggle hide
    fireEvent.click(showDemoBtn);
    expect(screen.queryByTestId('demo-pins-container')).not.toBeInTheDocument();
  });

  it('6. Clicking a quick-fill demo PIN chip authenticates and triggers onSuccess', async () => {
    const handleSuccess = vi.fn();
    render(<PinAuthModal isOpen={true} role="patient" onSuccess={handleSuccess} />);

    // Open demo pins container
    fireEvent.click(screen.getByTestId('show-demo-pins-btn'));

    // Click quick fill 100100
    fireEvent.click(screen.getByTestId('quick-fill-100100'));

    await waitFor(() => {
      expect(handleSuccess).toHaveBeenCalledTimes(1);
    });
  });

  it('7. Logs demo PIN credentials to console on mount in dev mode', () => {
    const consoleSpy = vi.spyOn(console, 'group');
    render(<PinAuthModal isOpen={true} role="caregiver" onSuccess={vi.fn()} />);

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('[NeuroSetu Dev Auth]'));
  });
});
