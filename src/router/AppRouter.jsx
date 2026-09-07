import React, { useState, useEffect } from 'react';

/**
 * AppRouter - Zero-dependency hash-based router for NeuroSetu's portals
 * 
 * Routes:
 * - '#/' or '#/home'      => Home Surface (Default Entry View, formerly Marketing)
 * - '#/patient'           => Patient Experience Surface (WCAG 2.1 AA)
 * - '#/dashboard'         => ASHA Worker & Caregiver Clinical Dashboard
 */
export function useAppRoute() {
  const getRouteFromHash = () => {
    const rawHash = window.location.hash || '';
    const hash = rawHash.toLowerCase().replace(/^#\/?/, '').trim();

    // Default route on first visit, root '/', or '#/home'
    if (!hash || hash === 'home') return 'home';
    if (hash === 'hub' || hash === 'suite' || hash === 'games') return 'hub';
    if (hash === 'dashboard') return 'dashboard';
    if (hash === 'patient') return 'patient';

    // Unrecognized route
    return 'not-found';
  };

  const [currentRoute, setCurrentRoute] = useState(getRouteFromHash());

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentRoute(getRouteFromHash());
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (route) => {
    if (route === 'hub' || route === 'games') window.location.hash = '#/hub';
    else if (route === 'dashboard') window.location.hash = '#/dashboard';
    else if (route === 'patient') window.location.hash = '#/patient';
    else if (route === 'not-found') window.location.hash = '#/404';
    else window.location.hash = '#/home';
    setCurrentRoute(route);
  };

  return { currentRoute, navigateTo };
}
