import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import HomePage from '../../src/pages/HomePage.jsx';

describe('Part 1: Landing Page Visual Redesign & CTA Preservation Audit', () => {
  it('1. Renders asymmetric hero with North East cultural motifs and tapestry showcase card', () => {
    render(
      <HomePage
        onLaunchPatient={() => {}}
        onLaunchDashboard={() => {}}
        onLaunchHub={() => {}}
        onOpenRoleSelector={() => {}}
        onOpenSetup={() => {}}
      />
    );

    // Main Cultural Badge
    expect(screen.getByText(/Culturally Grounded Cognitive Healthcare for North East India/i)).toBeInTheDocument();

    // Primary Headline & Copy
    expect(screen.getByText(/Cognitive Games That Speak Your Language\./i)).toBeInTheDocument();
    expect(screen.getByText(/Culturally rooted reminiscence therapy/i)).toBeInTheDocument();

    // Right-Column Cultural Tapestry Showcase Card
    expect(screen.getByText(/North East Memory Tapestry/i)).toBeInTheDocument();
    expect(screen.getByText(/Bihu Rhythm/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Golden Muga/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Kopou Phool/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Majuli Riverway/i)).toBeInTheDocument();
    expect(screen.getByText(/Multilingual Voice Guidance/i)).toBeInTheDocument();
  });

  it('2. Strictly preserves all 3 Batch 2 consolidated Hero CTAs and callbacks', () => {
    const handleLaunchPatient = vi.fn();
    const handleOpenRoleSelector = vi.fn();
    const handleLaunchDashboard = vi.fn();

    render(
      <HomePage
        onLaunchPatient={handleLaunchPatient}
        onOpenRoleSelector={handleOpenRoleSelector}
        onLaunchDashboard={handleLaunchDashboard}
      />
    );

    // Primary 1: Launch Patient Experience
    const patientBtn = screen.getByRole('button', { name: /Launch Patient Experience/i });
    expect(patientBtn).toBeInTheDocument();
    fireEvent.click(patientBtn);
    expect(handleLaunchPatient).toHaveBeenCalledTimes(1);

    // Primary 2: Select Role & Log In
    const roleBtn = screen.getByRole('button', { name: /Select Role & Log In/i });
    expect(roleBtn).toBeInTheDocument();
    fireEvent.click(roleBtn);
    expect(handleOpenRoleSelector).toHaveBeenCalledTimes(1);

    // Primary 3: View ASHA Triage Dashboard
    const ashaBtn = screen.getByRole('button', { name: /View ASHA Triage Dashboard/i });
    expect(ashaBtn).toBeInTheDocument();
    fireEvent.click(ashaBtn);
    expect(handleLaunchDashboard).toHaveBeenCalledTimes(1);
  });

  it('3. Renders gerontology-tuned clinical certification badges and helpline routing', () => {
    render(<HomePage />);

    expect(screen.getByText(/WCAG 2.1 AA Gerontology-Tuned/i)).toBeInTheDocument();
    expect(screen.getByText(/Zero-Punitive Errorless Learning/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Elderline/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('14567').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/100% Offline Service Worker PWA/i)).toBeInTheDocument();
  });

  it('4. Language switcher toggles between English and Assamese copy in hero', () => {
    render(
      <HomePage
        onLaunchPatient={() => {}}
        onLaunchDashboard={() => {}}
        onLaunchHub={() => {}}
        onOpenRoleSelector={() => {}}
        onOpenSetup={() => {}}
      />
    );

    // Default English
    expect(screen.getByText(/Cognitive Games That Speak Your Language\./i)).toBeInTheDocument();

    // Toggle to Assamese
    const asBtn = screen.getByRole('button', { name: 'অসমীয়া' });
    fireEvent.click(asBtn);

    // Assamese copy
    expect(screen.getByText(/ঘৰুৱা চিনাকি পৰিৱেশত স্মৃতিৰ সেঁতু।/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ৰোগীৰ খেল আৰম্ভ কৰক/i })).toBeInTheDocument();
  });
});
