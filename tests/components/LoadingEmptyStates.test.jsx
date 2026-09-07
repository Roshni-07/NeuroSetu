import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import CognitiveTrendChart from '../../src/components/dashboard/CognitiveTrendChart.jsx';
import PatientTriageList from '../../src/components/dashboard/PatientTriageList.jsx';
import Hub from '../../src/components2/Hub.jsx';

describe('Item 7: Loading & Empty States Audit', () => {
  it('1. CognitiveTrendChart renders skeleton on isLoading and empty state when data is empty', () => {
    const { rerender } = render(<CognitiveTrendChart isLoading={true} />);
    expect(screen.getByTestId('chart-loading')).toBeInTheDocument();

    rerender(<CognitiveTrendChart isLoading={false} data={[]} patientName="Bhaben Kalita" />);
    expect(screen.getByTestId('chart-empty')).toBeInTheDocument();
    expect(screen.getByText(/No sessions recorded yet/i)).toBeInTheDocument();
  });

  it('2. PatientTriageList renders skeleton on isLoading and empty state on zero matches', () => {
    const { rerender } = render(<PatientTriageList isLoading={true} />);
    expect(screen.getByTestId('triage-loading')).toBeInTheDocument();

    rerender(<PatientTriageList isLoading={false} />);
    const searchInput = screen.getByPlaceholderText(/Search by patient name/i);
    fireEvent.change(searchInput, { target: { value: 'NonexistentPatientName123' } });

    expect(screen.getByTestId('triage-empty')).toBeInTheDocument();
    expect(screen.getByText(/No patients found/i)).toBeInTheDocument();
  });

  it('3. Hub renders skeleton on isLoading and empty state when games list is empty', () => {
    const { rerender } = render(<Hub isLoading={true} games={[]} />);
    expect(screen.getByTestId('hub-loading')).toBeInTheDocument();

    rerender(<Hub isLoading={false} games={[]} />);
    expect(screen.getByTestId('hub-empty')).toBeInTheDocument();
    expect(screen.getByText(/No games found in the suite/i)).toBeInTheDocument();
  });
});
