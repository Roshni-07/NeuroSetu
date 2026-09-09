import { useEffect, useRef, useCallback } from 'react';
import { PATIENT_IDLE_TIMEOUT_MS } from '../services/authService.js';

const ACTIVITY_EVENTS = [
  'mousedown',
  'mousemove',
  'keydown',
  'touchstart',
  'scroll'
];

/**
 * useIdleTimer - Inactivity detection hook for dementia patient sessions
 * 
 * Tracks user interactions and invokes onIdle callback after timeoutMs of silence.
 * 
 * @param {Object} options
 * @param {number} [options.timeoutMs=PATIENT_IDLE_TIMEOUT_MS] - Timeout duration in ms
 * @param {Function} options.onIdle - Callback fired when idle timeout is reached
 * @param {boolean} [options.isEnabled=true] - Whether the timer is currently running
 * @returns {Object} { resetTimer }
 */
export default function useIdleTimer({
  timeoutMs = PATIENT_IDLE_TIMEOUT_MS,
  onIdle,
  isEnabled = true
} = {}) {
  const timerRef = useRef(null);
  const onIdleRef = useRef(onIdle);

  // Keep latest onIdle reference without reattaching listeners
  useEffect(() => {
    onIdleRef.current = onIdle;
  }, [onIdle]);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const resetTimer = useCallback(() => {
    clearTimer();
    if (isEnabled && typeof timeoutMs === 'number' && timeoutMs > 0) {
      timerRef.current = setTimeout(() => {
        if (onIdleRef.current) {
          onIdleRef.current();
        }
      }, timeoutMs);
    }
  }, [clearTimer, isEnabled, timeoutMs]);

  useEffect(() => {
    if (!isEnabled) {
      clearTimer();
      return undefined;
    }

    // Start initial timer
    resetTimer();

    // Throttled handler for high-frequency events (like mousemove / touchmove)
    let lastActivity = Date.now();
    const handleActivity = () => {
      const now = Date.now();
      if (now - lastActivity > 200) {
        lastActivity = now;
        resetTimer();
      }
    };

    ACTIVITY_EVENTS.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      clearTimer();
      ACTIVITY_EVENTS.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [clearTimer, isEnabled, resetTimer]);

  return { resetTimer };
}
