import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import React from 'react';
import App from '../../src/App.jsx';
import { createSession } from '../../src/services/authService.js';
import { clearAllLocalData, closeDB } from '../../src/db/indexedDb.js';

describe('Dashboard and Hub Route Guards (Session Authentication Protection)', () => {
  beforeEach(async () => {
    await clearAllLocalData();
    localStorage.clear();
    sessionStorage.clear();
    window.location.hash = '';
    vi.restoreAllMocks();
  });

  afterEach(async () => {
    await closeDB();
  });

  it('1. Unauthenticated access to #/dashboard does NOT render clinical dashboard content', () => {
    window.location.hash = '#/dashboard';
    render(<App />);

    // Clinical dashboard titles must NOT be present
    expect(screen.queryByText(/North East Dementia Triage & Telemetry Portal/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/ASHA Household Patient Triage/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Primary Health Centre \(PHC\) & ASHA Portal/i)).not.toBeInTheDocument();

    // Authentication Required guard card MUST be rendered
    expect(screen.getByText(/Authentication Required/i)).toBeInTheDocument();
    expect(screen.getByText(/Please enter your 4-digit PIN or select your role to access the clinical dashboard/i)).toBeInTheDocument();

    const guardCard = screen.getByText(/Authentication Required/i).closest('div');
    expect(within(guardCard).getByRole('button', { name: /Enter Profile PIN/i })).toBeInTheDocument();
    expect(within(guardCard).getByRole('button', { name: /Switch \/ Select Role/i })).toBeInTheDocument();
    expect(within(guardCard).getByRole('button', { name: /Return to Home/i })).toBeInTheDocument();
  });

  it('2. Clicking "Return to Home" on dashboard guard card navigates to Home surface', async () => {
    window.location.hash = '#/dashboard';
    render(<App />);

    expect(screen.getByText(/Authentication Required/i)).toBeInTheDocument();

    const returnHomeBtn = screen.getByRole('button', { name: /Return to Home/i });
    fireEvent.click(returnHomeBtn);

    await waitFor(() => {
      expect(screen.getByText(/Cognitive Games That Speak Your Language/i)).toBeInTheDocument();
      expect(window.location.hash).toBe('#/home');
    });
  });

  it('3. Clicking "Enter Profile PIN" on dashboard guard card triggers Caregiver PIN auth modal', async () => {
    window.location.hash = '#/dashboard';
    render(<App />);

    const guardCard = screen.getByText(/Authentication Required/i).closest('div');
    const enterPinBtn = within(guardCard).getByRole('button', { name: /Enter Profile PIN/i });
    fireEvent.click(enterPinBtn);

    // PinAuthModal must open with Caregiver profile
    await waitFor(() => {
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
      expect(within(dialog).getByRole('heading', { name: /Caregiver PIN/i })).toBeInTheDocument();
    });
  });

  it('4. Authenticated caregiver session can access #/dashboard and see clinical portal', async () => {
    createSession('Caregiver Maya', 'caregiver');
    window.location.hash = '#/dashboard';
    render(<App />);

    // Renders full clinical portal
    await waitFor(() => {
      expect(screen.getByText(/North East Dementia Triage & Telemetry Portal/i)).toBeInTheDocument();
      expect(screen.getByText(/ASHA Household Patient Triage/i)).toBeInTheDocument();
    });
    expect(screen.queryByText(/Authentication Required/i)).not.toBeInTheDocument();
  });

  it('5. Unauthenticated access to #/hub does NOT render 15-game suite and displays Authentication Required', () => {
    window.location.hash = '#/hub';
    render(<App />);

    // Hub content must NOT be present
    expect(screen.queryByText(/North-East India Cultural Cognitive Training Suite/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Return to NeuroSetu Portal/i)).not.toBeInTheDocument();

    // Guard card is shown
    expect(screen.getByText(/Authentication Required/i)).toBeInTheDocument();
    const guardCard = screen.getByText(/Authentication Required/i).closest('div');
    expect(within(guardCard).getByRole('button', { name: /Enter Profile PIN/i })).toBeInTheDocument();
  });
});
