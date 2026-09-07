import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import HomePage from '../../src/pages/HomePage';
import WelcomeLanding from '../../src/pages/WelcomeLanding';

describe('Copy, Content & Dynamic Copyright Year Audit', () => {
  it('renders dynamic current year in HomePage footer', () => {
    render(
      <HomePage
        onLaunchPatient={() => {}}
        onLaunchDashboard={() => {}}
        onLaunchHub={() => {}}
        onOpenRoleSelector={() => {}}
      />
    );

    const currentYear = new Date().getFullYear().toString();
    const copyrightText = screen.getByText(new RegExp(`©\\s*${currentYear}\\s*NeuroSetu`, 'i'));
    expect(copyrightText).toBeInTheDocument();
  });

  it('renders dynamic current year in WelcomeLanding footer', () => {
    render(
      <WelcomeLanding
        onLaunchPatient={() => {}}
        onOpenDashboard={() => {}}
      />
    );

    const currentYear = new Date().getFullYear().toString();
    const copyrightText = screen.getByText(new RegExp(`©\\s*${currentYear}\\s*NeuroSetu`, 'i'));
    expect(copyrightText).toBeInTheDocument();
  });

  it('contains no placeholder copy or lorem ipsum in rendered HomePage', () => {
    const { container } = render(
      <HomePage
        onLaunchPatient={() => {}}
        onLaunchDashboard={() => {}}
        onLaunchHub={() => {}}
      />
    );

    const pageContent = container.textContent.toLowerCase();
    expect(pageContent).not.toContain('lorem ipsum');
    expect(pageContent).not.toContain('placeholder');
    expect(pageContent).not.toContain('todo');
    expect(pageContent).not.toContain('undefined');
    expect(pageContent).not.toContain('nan');
  });
});
