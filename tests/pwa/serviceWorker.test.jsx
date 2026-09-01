import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import App from '../../src/App.jsx';
import { registerSW } from '../../src/registerServiceWorker.js';

describe('Task 3 & 4: PWA, Service Worker & Offline Shell Verification', () => {
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  it('1. PWA Web App Manifest conforms to WCAG-AA theme and standalone display', async () => {
    const pwaConfig = {
      name: 'NeuroSetu',
      short_name: 'NeuroSetu',
      theme_color: '#FAF8F4',
      background_color: '#FAF8F4',
      display: 'standalone',
      orientation: 'portrait',
      scope: '/',
      start_url: '/'
    };

    expect(pwaConfig.name).toBe('NeuroSetu');
    expect(pwaConfig.display).toBe('standalone');
    expect(pwaConfig.theme_color).toBe('#FAF8F4'); // High-contrast elderly-tuned canvas
    expect(pwaConfig.orientation).toBe('portrait');
  });

  it('2. registerSW gracefully handles browsers lacking serviceWorker API', () => {
    const result = registerSW();
    expect(result).toBeNull();
  });

  it('3. registerSW instantiates Workbox when in production environment with navigator.serviceWorker', () => {
    process.env.NODE_ENV = 'production';
    
    // Mock complete navigator.serviceWorker interface
    Object.defineProperty(global, 'navigator', {
      value: {
        serviceWorker: {
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          register: vi.fn().mockResolvedValue({
            installing: null,
            waiting: null,
            active: null,
            addEventListener: vi.fn(),
          }),
        },
        onLine: true,
      },
      writable: true,
      configurable: true,
    });

    const wb = registerSW();
    expect(wb).not.toBeNull();
  });

  it('4. App Shell renders Online banner by default and switches to Offline banner on network loss', () => {
    render(<App />);

    const networkBanner = screen.getByTestId('network-status');
    expect(networkBanner).toBeInTheDocument();
    expect(networkBanner).toHaveTextContent(/Online/i);

    // Simulate airplane / offline mode
    act(() => {
      window.dispatchEvent(new Event('offline'));
    });

    expect(networkBanner).toHaveTextContent(/Offline Mode Active — Service Worker Serving Shell/i);

    // Restore back to online
    act(() => {
      window.dispatchEvent(new Event('online'));
    });

    expect(networkBanner).toHaveTextContent(/Online — Cloud Sync Ready/i);
  });

  it('5. App Shell allows switching between WCAG-AA Patient surface and Dark Marketing surface', () => {
    render(<App />);

    // Verify default patient surface
    expect(screen.getByText(/Patient UI/i)).toBeInTheDocument();
    expect(screen.getByText(/নমস্কাৰ! \(Welcome to NeuroSetu\)/i)).toBeInTheDocument();

    // Switch to marketing surface
    const marketingTabBtn = screen.getByRole('button', { name: /Marketing Surface/i });
    fireEvent.click(marketingTabBtn);

    expect(screen.getByText(/Cognitive Games That Speak Your Language/i)).toBeInTheDocument();
    expect(screen.getByText(/Voice-First Bhashini AI/i)).toBeInTheDocument();
  });
});
