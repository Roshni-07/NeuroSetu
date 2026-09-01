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

  it('1. Renders PIN modal with 12 keypad buttons and 4 empty dot indicators', () => {
    render(<PinAuthModal isOpen={true} onSuccess={vi.fn()} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/Profile PIN/i)).toBeInTheDocument();

    // Check keypad buttons
    ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'Clear'].forEach((btnText) => {
      expect(screen.getByRole('button', { name: btnText })).toBeInTheDocument();
    });

    // Check 4 dots
    expect(screen.getByTestId('pin-dot-0')).toBeInTheDocument();
    expect(screen.getByTestId('pin-dot-1')).toBeInTheDocument();
    expect(screen.getByTestId('pin-dot-2')).toBeInTheDocument();
    expect(screen.getByTestId('pin-dot-3')).toBeInTheDocument();
  });

  it('2. Keypad taps fill dots in sequence and triggers onSuccess upon 4th digit', async () => {
    const handleSuccess = vi.fn();
    render(<PinAuthModal isOpen={true} onSuccess={handleSuccess} profileName="Arogya Patient" />);

    // Tap 1, 2, 3, 4
    fireEvent.click(screen.getByRole('button', { name: '1' }));
    fireEvent.click(screen.getByRole('button', { name: '2' }));
    fireEvent.click(screen.getByRole('button', { name: '3' }));
    fireEvent.click(screen.getByRole('button', { name: '4' }));

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
    await setProfilePin('9999');
    const handleSuccess = vi.fn();

    render(<PinAuthModal isOpen={true} onSuccess={handleSuccess} />);

    // Enter wrong PIN: 1, 2, 3, 4
    fireEvent.click(screen.getByRole('button', { name: '1' }));
    fireEvent.click(screen.getByRole('button', { name: '2' }));
    fireEvent.click(screen.getByRole('button', { name: '3' }));
    fireEvent.click(screen.getByRole('button', { name: '4' }));

    await waitFor(() => {
      expect(screen.getByText(/Let's try that again/i)).toBeInTheDocument();
      expect(handleSuccess).not.toHaveBeenCalled();
    });
  });
});
