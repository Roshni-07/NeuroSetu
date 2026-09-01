import { Workbox } from 'workbox-window';

export function registerSW() {
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    const wb = new Workbox('/sw.js');

    wb.addEventListener('installed', (event) => {
      if (event.isUpdate) {
        console.log('[NeuroSetu PWA] New update available; please reload.');
      } else {
        console.log('[NeuroSetu PWA] App is cached and ready for offline use.');
      }
    });

    wb.addEventListener('activated', () => {
      console.log('[NeuroSetu PWA] Service Worker activated.');
    });

    wb.register().catch((error) => {
      console.error('[NeuroSetu PWA] Service Worker registration failed:', error);
    });

    return wb;
  }
  return null;
}
