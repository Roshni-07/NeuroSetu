import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import VoiceInputHandler from '../../src/components/voice/VoiceInputHandler.jsx';
import * as bhashiniService from '../../src/services/bhashiniService.js';

describe('Task 16 & 17: VoiceInputHandler Component Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('1. Renders large accessible microphone button and label', () => {
    render(<VoiceInputHandler label="কওক (Speak Now)" />);

    const micBtn = screen.getByRole('button', { name: /Start Voice Input/i });
    expect(micBtn).toBeInTheDocument();
    expect(screen.getByText('কওক (Speak Now)')).toBeInTheDocument();
  });

  it('2. Starts recording on click, changes button state, and stops recording', async () => {
    // Mock MediaStream and MediaRecorder
    const mockTrack = { stop: vi.fn() };
    const mockStream = {
      getTracks: () => [mockTrack]
    };

    Object.defineProperty(global.navigator, 'mediaDevices', {
      value: {
        getUserMedia: vi.fn().mockResolvedValue(mockStream)
      },
      configurable: true,
      writable: true
    });

    let ondataavailableHandler = null;
    let onstopHandler = null;

    class MockMediaRecorder {
      constructor(stream) {
        this.stream = stream;
        this.state = 'inactive';
      }
      start() {
        this.state = 'recording';
      }
      stop() {
        this.state = 'inactive';
        if (this.onstop) this.onstop();
      }
      set ondataavailable(fn) { ondataavailableHandler = fn; }
      set onstop(fn) { onstopHandler = fn; }
      get onstop() { return onstopHandler; }
    }

    global.MediaRecorder = MockMediaRecorder;

    const handleTranscript = vi.fn();
    render(<VoiceInputHandler onTranscriptReceived={handleTranscript} />);

    const micBtn = screen.getByRole('button', { name: /Start Voice Input/i });
    fireEvent.click(micBtn);

    await waitFor(() => {
      expect(screen.getByText(/Listening.../i)).toBeInTheDocument();
    });

    // Click stop
    const stopBtn = screen.getByRole('button', { name: /Stop Recording/i });
    fireEvent.click(stopBtn);

    await waitFor(() => {
      expect(mockTrack.stop).toHaveBeenCalled();
      expect(handleTranscript).toHaveBeenCalled();
    });
  });

  it('3. Displays friendly guidance when microphone permissions are denied', async () => {
    Object.defineProperty(global.navigator, 'mediaDevices', {
      value: {
        getUserMedia: vi.fn().mockRejectedValue(new Error('Permission denied'))
      },
      configurable: true,
      writable: true
    });

    render(<VoiceInputHandler />);

    const micBtn = screen.getByRole('button', { name: /Start Voice Input/i });
    fireEvent.click(micBtn);

    await waitFor(() => {
      expect(screen.getByText(/Microphone access unavailable/i)).toBeInTheDocument();
    });
  });
});
