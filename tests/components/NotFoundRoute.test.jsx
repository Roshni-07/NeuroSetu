import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import App from '../../src/App.jsx';

describe('Item 8: 404 / Unknown Route Handling', () => {
  beforeEach(() => {
    window.location.hash = '';
    vi.restoreAllMocks();
  });

  it('1. Navigating to invalid route #/xyz renders 404 Page Not Found view', async () => {
    window.location.hash = '#/xyz';
    render(<App />);

    expect(screen.getByTestId('not-found-view')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Page Not Found/i })).toBeInTheDocument();
    expect(screen.getByText(/404 Error/i)).toBeInTheDocument();

    // Clicking Return to Home Portal navigates back to Home
    const returnBtn = screen.getByRole('button', { name: /Return to Home Portal/i });
    fireEvent.click(returnBtn);

    await waitFor(() => {
      expect(screen.queryByTestId('not-found-view')).not.toBeInTheDocument();
      expect(screen.getByText(/Cognitive Games That Speak Your Language/i)).toBeInTheDocument();
    });
  });

  it('2. Navigating to invalid route #/non-existent-screen renders 404 Page Not Found view', () => {
    window.location.hash = '#/non-existent-screen';
    render(<App />);

    expect(screen.getByTestId('not-found-view')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Page Not Found/i })).toBeInTheDocument();
  });

  it('3. Navigating to invalid route #/deep/garbage/path/404 renders 404 Page Not Found view', () => {
    window.location.hash = '#/deep/garbage/path/404';
    render(<App />);

    expect(screen.getByTestId('not-found-view')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Page Not Found/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Launch Patient Games/i })).toBeInTheDocument();
  });
});
