import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import fs from 'fs';
import path from 'path';
import PatientTriageList from '../../src/components/dashboard/PatientTriageList';
import CognitiveTrendChart from '../../src/components/dashboard/CognitiveTrendChart';

describe('Images and Visual Icons Accessibility Audit', () => {
  it('ensures PWA icons exist with valid PNG signatures and correct dimensions', () => {
    const icon192Path = path.resolve(__dirname, '../../public/icons/icon-192x192.png');
    const icon512Path = path.resolve(__dirname, '../../public/icons/icon-512x512.png');

    expect(fs.existsSync(icon192Path)).toBe(true);
    expect(fs.existsSync(icon512Path)).toBe(true);

    const buf192 = fs.readFileSync(icon192Path);
    const buf512 = fs.readFileSync(icon512Path);

    // PNG signature: 89 50 4E 47 0D 0A 1A 0A
    const pngSig = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
    expect(Array.from(buf192.slice(0, 8))).toEqual(pngSig);
    expect(Array.from(buf512.slice(0, 8))).toEqual(pngSig);

    // IHDR dimensions (offset 16 for width, 20 for height)
    expect(buf192.readUInt32BE(16)).toBe(192);
    expect(buf192.readUInt32BE(20)).toBe(192);

    expect(buf512.readUInt32BE(16)).toBe(512);
    expect(buf512.readUInt32BE(20)).toBe(512);
  });

  it('ensures decorative icons in PatientTriageList carry aria-hidden="true"', () => {
    const { container } = render(
      <PatientTriageList
        patients={[]}
        selectedPatientId={null}
        onSelectPatient={() => {}}
      />
    );

    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThan(0);
    svgs.forEach((svg) => {
      // Decorative search icon must have aria-hidden="true"
      expect(svg.getAttribute('aria-hidden')).toBe('true');
    });
  });

  it('ensures informational SVG chart in CognitiveTrendChart carries role="img" and descriptive aria-label', () => {
    const mockTelemetry = [
      {
        gameId: 'grandmas-shopping-list',
        completedAt: new Date().toISOString(),
        tier: 1,
        averageLatencyMs: 4500,
        accuracyScore: 85
      }
    ];

    const { container } = render(
      <CognitiveTrendChart
        patientId="p-1"
        recentTelemetry={mockTelemetry}
        isLoading={false}
      />
    );

    const chartSvg = container.querySelector('svg[role="img"]');
    expect(chartSvg).toBeTruthy();
    expect(chartSvg.getAttribute('aria-label')).toBe('Cognitive Latency and Tier Progression Trend Chart');
  });

  it('verifies all img tags in rendered views have an alt attribute', () => {
    const { container } = render(
      <CognitiveTrendChart
        patientId="p-1"
        recentTelemetry={[]}
        isLoading={false}
      />
    );

    const imgs = container.querySelectorAll('img');
    imgs.forEach((img) => {
      expect(img.hasAttribute('alt')).toBe(true);
    });
  });
});
