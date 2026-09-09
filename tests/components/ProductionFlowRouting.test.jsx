import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import App from '../../src/App.jsx';
import { clearAllLocalData, closeDB } from '../../src/db/indexedDb.js';
import { createSession } from '../../src/services/authService.js';

describe('Production Flow Routing & Initial View (Home as Default)', () => {
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

  it('1. Default Landing: Initial entry view on "/" loads Home page with English default', () => {
    window.location.hash = '';
    render(<App />);

    // Must show Home elements with English default
    expect(screen.getByText(/Cognitive Games That Speak Your Language/i)).toBeInTheDocument();
    expect(screen.getByText(/Cultural games for memory, routine, and joyful recall/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Launch Patient Experience/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /View ASHA Triage Dashboard/i })).toBeInTheDocument();
  });

  it('2. In-page CTA: "ASHA Dashboard" routes to ASHA Dashboard and allows returning to Home', async () => {
    createSession('Caregiver Maya', 'caregiver');
    render(<App />);

    // Click the in-page ASHA Dashboard button
    const ashaBtn = screen.getByRole('button', { name: /View ASHA Triage Dashboard/i });
    fireEvent.click(ashaBtn);

    // Verifies routing to ASHA portal
    await waitFor(() => {
      expect(screen.getByText(/North East Dementia Triage & Telemetry Portal/i)).toBeInTheDocument();
      expect(screen.getByText(/ASHA Household Patient Triage/i)).toBeInTheDocument();
    });

    // In-page return button returns to Home
    const returnBtn = screen.getByRole('button', { name: /← Return to Home/i });
    fireEvent.click(returnBtn);

    await waitFor(() => {
      expect(screen.getByText(/Cognitive Games That Speak Your Language/i)).toBeInTheDocument();
    });
  });

  it('3. In-page CTA: "Profile Setup" opens Patient Onboarding Intake modal', async () => {
    render(<App />);

    const setupBtn = screen.getAllByRole('button', { name: /Profile Setup/i })[0];
    fireEvent.click(setupBtn);

    // Verifies onboarding modal is opened
    await waitFor(() => {
      expect(screen.getByText(/১\. আঞ্চলিক পৰিচয়/i)).toBeInTheDocument();
    });
  });

  it('4. In-page CTA: "Launch Patient Experience" initiates patient access via device check', async () => {
    render(<App />);

    const launchBtn = screen.getByRole('button', { name: /Launch Patient Experience/i });
    fireEvent.click(launchBtn);

    // Unauthenticated user is guided to ProfileCheckModal
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /ৰোগীৰ পৰিচয় পৰীক্ষা/i })).toBeInTheDocument();
    });
  });

  it('5. Language Switcher: Allows toggling between English default and Assamese copy', async () => {
    render(<App />);

    // Initially in English
    expect(screen.getByText(/Cognitive Games That Speak Your Language/i)).toBeInTheDocument();

    // Switch to Assamese
    const asBtn = screen.getByRole('button', { name: 'অসমীয়া' });
    fireEvent.click(asBtn);

    await waitFor(() => {
      expect(screen.getByText(/ঘৰুৱা চিনাকি পৰিৱেশত স্মৃতিৰ সেঁতু/i)).toBeInTheDocument();
      expect(screen.getByText(/ৰোগীৰ খেল আৰম্ভ কৰক/i)).toBeInTheDocument();
    });

    // Switch back to English
    const enBtn = screen.getByRole('button', { name: 'English' });
    fireEvent.click(enBtn);

    await waitFor(() => {
      expect(screen.getByText(/Cognitive Games That Speak Your Language/i)).toBeInTheDocument();
    });
  });
});
