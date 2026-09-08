import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import App from '../../src/App.jsx';
import { clearAllLocalData, closeDB, saveProfile } from '../../src/db/indexedDb.js';
import { resetAllAuthData, createSession, ROLES } from '../../src/services/authService.js';

describe('Clean Patient Roadmap View & Header Controls Suite', () => {
  beforeEach(async () => {
    await clearAllLocalData();
    resetAllAuthData();
    localStorage.clear();
    sessionStorage.clear();
    window.location.hash = '';
    vi.restoreAllMocks();
  });

  afterEach(async () => {
    await closeDB();
  });

  it('1. Authenticated patient session renders ONLY the roadmap and top patient header — no navbar, greeting card, or bottom tabs', async () => {
    // Seed profile and authenticate as patient
    await saveProfile({
      id: 'preset-1',
      name: 'Ramesh Patel',
      homeState: 'Assam',
      villageTown: 'Majuli',
      stage: 'Mild / Early Stage',
      language: 'en'
    });
    createSession('Ramesh Patel', ROLES.PATIENT, 'preset-1');

    window.location.hash = '#/patient';
    render(<App />);

    await waitFor(() => {
      expect(screen.getByTestId('roadmap-view-container')).toBeInTheDocument();
    });

    // 1. Global Navbar (with Home, Patient UI, Dashboard, Hub links) must NOT be rendered
    expect(screen.queryByRole('navigation', { name: /Main Navigation/i })).not.toBeInTheDocument();

    // 2. Duplicate outer greeting card buttons must NOT be rendered
    expect(screen.queryByRole('button', { name: /Play →/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /15-Game Suite →/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Edit Profile/i })).not.toBeInTheDocument();

    // 3. Bottom 4-tab bar must NOT be rendered
    expect(screen.queryByRole('navigation', { name: /Primary Navigation/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Games$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Progress$/i })).not.toBeInTheDocument();

    // 4. RoadmapView must be rendered cleanly with Welcome to NeuroSetu badge and culturally themed canvas
    expect(screen.getByText(/Welcome to NeuroSetu/i)).toBeInTheDocument();
    expect(screen.getByText('Ramesh Patel')).toBeInTheDocument();
    expect(screen.getByTestId('roadmap-path-canvas')).toBeInTheDocument();

    // 5. Essential accessible controls must be present in top header
    expect(screen.getByRole('button', { name: /Return to NeuroSetu Home/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Switch to Reminders and Routine/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Audio Guide/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Emergency Assistance SOS/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Lock \/ Logout/i })).toBeInTheDocument();
  });

  it('2. Reminders toggle in header switches between Roadmap and RemindersHub without losing state', async () => {
    await saveProfile({
      id: 'preset-1',
      name: 'Ramesh Patel',
      homeState: 'Assam',
      stage: 'Mild / Early Stage',
      language: 'en'
    });
    createSession('Ramesh Patel', ROLES.PATIENT, 'preset-1');

    window.location.hash = '#/patient';
    render(<App />);

    await waitFor(() => {
      expect(screen.getByTestId('roadmap-view-container')).toBeInTheDocument();
    });

    // Toggle to Reminders
    const remindersToggleBtn = screen.getByRole('button', { name: /Switch to Reminders and Routine/i });
    fireEvent.click(remindersToggleBtn);

    // RemindersHub is rendered
    await waitFor(() => {
      expect(screen.getByText(/Daily Health & Reminders/i)).toBeInTheDocument();
      expect(screen.queryByTestId('roadmap-view-container')).not.toBeInTheDocument();
    });

    // Toggle button now switches back to Roadmap
    const roadmapToggleBtn = screen.getByRole('button', { name: /Switch to Roadmap Games/i });
    fireEvent.click(roadmapToggleBtn);

    // RoadmapView is restored
    await waitFor(() => {
      expect(screen.getByTestId('roadmap-view-container')).toBeInTheDocument();
      expect(screen.queryByText(/Daily Health & Reminders/i)).not.toBeInTheDocument();
    });
  });

  it('3. Lock / Logout button in patient header successfully clears session and redirects to Home', async () => {
    await saveProfile({
      id: 'preset-1',
      name: 'Ramesh Patel',
      homeState: 'Assam',
      stage: 'Mild / Early Stage',
      language: 'en'
    });
    createSession('Ramesh Patel', ROLES.PATIENT, 'preset-1');

    window.location.hash = '#/patient';
    render(<App />);

    await waitFor(() => {
      expect(screen.getByTestId('roadmap-view-container')).toBeInTheDocument();
    });

    // Click Lock / Logout
    const logoutBtn = screen.getByRole('button', { name: /Lock \/ Logout/i });
    fireEvent.click(logoutBtn);

    // Returns to Home and Patient area is locked/gone
    await waitFor(() => {
      expect(screen.getByText(/Cognitive Games That Speak Your Language/i)).toBeInTheDocument();
      expect(screen.queryByTestId('roadmap-view-container')).not.toBeInTheDocument();
    });
  });
});
